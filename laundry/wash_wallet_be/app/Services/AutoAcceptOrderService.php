<?php

namespace App\Services;

use App\Events\CustomerOrderAccepted;
use App\Jobs\SendCourierNewPickupNotification;
use App\Jobs\SendCustomerOrderAcceptedFcm;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Outlet;
use App\Models\OutletSetting;
use Exception;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AutoAcceptOrderService
{
    public function __construct(
        protected WaNotificationService $waNotificationService,
        protected OutletSettingService $outletSettingService,
        protected DistanceCalculatorService $distanceCalculatorService
    ) {}

    /**
     * @return array{processed: int, skipped: int, failed: int}
     */
    public function run(?Carbon $now = null): array
    {
        $now = $now ?? now();
        $summary = [
            'processed' => 0,
            'skipped' => 0,
            'failed' => 0,
        ];

        $outletIds = OutletSetting::query()
            ->where('value', 'true')
            ->whereHas('setting', fn($query) => $query->where('key', 'auto_accept_order'))
            ->pluck('outlet_id')
            ->unique()
            ->values();

        foreach ($outletIds as $outletId) {
            $outlet = Outlet::with(['operationalDays'])->find($outletId);

            if (!$outlet) {
                continue;
            }

            $leadTimeMinutes = $this->outletSettingService->getAutoAcceptLeadTimeMinutes($outletId);
            $maxDistanceKm = $this->outletSettingService->getAutoAcceptMaxDistanceKm($outletId);

            if ($leadTimeMinutes > 0) {
                $this->evaluateByPickupLeadTime($outlet, $leadTimeMinutes, $maxDistanceKm, $summary);
                $this->evaluateBy24Hours($outlet, $maxDistanceKm, true, $summary);
            } else {
                $this->evaluateBy24Hours($outlet, $maxDistanceKm, false, $summary);
            }
        }

        Log::info('Auto accept order run completed', $summary);

        return $summary;
    }

    private function evaluateByPickupLeadTime(Outlet $outlet, int $leadTimeMinutes, float $maxDistanceKm, array &$summary): void
    {
        $pickupThreshold = now()->addMinutes($leadTimeMinutes);

        Order::query()
            ->where('outlet_id', $outlet->id)
            ->where('source', Order::SOURCE_CUSTOMER_APP)
            ->where('status', Order::STATUS_REQUESTED)
            ->whereNotNull('pickup_schedule')
            ->where('pickup_schedule', '<=', $pickupThreshold)
            ->with(['customerAddress', 'outlet'])
            ->orderBy('id')
            ->chunkById(100, function ($orders) use ($outlet, $maxDistanceKm, &$summary) {
                foreach ($orders as $order) {
                    $this->processOrderIfEligible($order, $outlet, $maxDistanceKm, $summary);
                }
            });
    }

    private function evaluateBy24Hours(Outlet $outlet, float $maxDistanceKm, bool $withoutPickupScheduleOnly, array &$summary): void
    {
        $cutoff = now()->subHours(24);

        $query = Order::query()
            ->where('outlet_id', $outlet->id)
            ->where('source', Order::SOURCE_CUSTOMER_APP)
            ->where('status', Order::STATUS_REQUESTED)
            ->where('created_at', '<=', $cutoff)
            ->with(['customerAddress', 'outlet'])
            ->orderBy('id');

        if ($withoutPickupScheduleOnly) {
            $query->whereNull('pickup_schedule');
        }

        $query->chunkById(100, function ($orders) use ($outlet, $maxDistanceKm, &$summary) {
            foreach ($orders as $order) {
                $this->processOrderIfEligible($order, $outlet, $maxDistanceKm, $summary);
            }
        });
    }

    private function processOrderIfEligible(Order $order, Outlet $outlet, float $maxDistanceKm, array &$summary): void
    {
        try {
            if ($maxDistanceKm > 0) {
                $distance = $this->distanceCalculatorService->calculateFromOrderToOutlet($order, $outlet);

                if ($distance === null) {
                    Log::warning('Auto accept skipped: distance unavailable', [
                        'order_id' => $order->id,
                        'outlet_id' => $outlet->id,
                    ]);
                    $summary['skipped']++;
                    return;
                }

                if ($distance > $maxDistanceKm) {
                    Log::info('Auto accept skipped: order exceeds max distance', [
                        'order_id' => $order->id,
                        'outlet_id' => $outlet->id,
                        'distance' => round($distance, 2),
                        'max_distance_km' => $maxDistanceKm,
                    ]);
                    $summary['skipped']++;
                    return;
                }
            }

            if ($this->acceptOrder($order)) {
                $summary['processed']++;
            } else {
                $summary['skipped']++;
            }
        } catch (Exception $e) {
            $summary['failed']++;

            Log::error('Auto accept order failed', [
                'order_id' => $order->id,
                'outlet_id' => $order->outlet_id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function acceptOrder(Order $order): bool
    {
        return DB::transaction(function () use ($order) {
            $lockedOrder = Order::query()
                ->whereKey($order->id)
                ->lockForUpdate()
                ->firstOrFail();

            if (
                $lockedOrder->status !== Order::STATUS_REQUESTED
                || $lockedOrder->source !== Order::SOURCE_CUSTOMER_APP
            ) {
                return false;
            }

            $lockedOrder->wasAutoAccepted = true;
            $lockedOrder->update([
                'status' => Order::STATUS_ACCEPTED,
                'employee_id' => null,
                'updated_by' => null,
            ]);

            $lockedOrder->orderItems()->update([
                'status' => OrderItem::STATUS_PENDING,
            ]);

            Log::info('Order auto accepted successfully', [
                'order_id' => $lockedOrder->id,
                'outlet_id' => $lockedOrder->outlet_id,
                'type' => 'auto_accept_order',
            ]);

            try {
                $this->waNotificationService->sendStatusChangeNotification(
                    $lockedOrder,
                    $lockedOrder->outlet,
                    Order::STATUS_ACCEPTED
                );
            } catch (Exception $e) {
                Log::warning('Auto WA notification failed in auto accept', [
                    'order_id' => $lockedOrder->id,
                    'error' => $e->getMessage(),
                ]);
            }

            $freshOrder = $lockedOrder->fresh([
                'customer',
                'customerAccount',
                'employee',
                'outlet',
                'orderItems.laundryService',
            ]);

            if ($this->shouldNotifyCustomerOrderAccepted($freshOrder)) {
                CustomerOrderAccepted::dispatch($freshOrder);
                SendCustomerOrderAcceptedFcm::dispatch($freshOrder->id)->afterCommit();
                SendCourierNewPickupNotification::dispatch($freshOrder->id)->afterCommit();
            }

            return true;
        });
    }

    private function shouldNotifyCustomerOrderAccepted(Order $order): bool
    {
        return $order->status === Order::STATUS_ACCEPTED
            && $order->source === Order::SOURCE_CUSTOMER_APP
            && $order->pickup_schedule !== null
            && $order->customer_account_id !== null
            && $order->outlet_id !== null;
    }
}