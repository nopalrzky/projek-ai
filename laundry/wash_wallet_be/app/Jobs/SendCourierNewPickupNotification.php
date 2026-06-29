<?php

namespace App\Jobs;

use App\Enums\Permission;
use App\Events\CourierNewPickupBroadcast;
use App\Models\Employee;
use App\Models\Order;
use App\Services\FcmNotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendCourierNewPickupNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $backoff = 30;

    public function __construct(public readonly int $orderId) {}

    public function handle(FcmNotificationService $fcmService): void
    {
        $order = Order::query()
            ->with(['customerAccount', 'customer', 'outlet'])
            ->find($this->orderId);

        if (!$order) {
            Log::warning("SendCourierNewPickupNotification: order #{$this->orderId} not found.");
            return;
        }

        if (!$this->matchesCriteria($order)) {
            Log::info("SendCourierNewPickupNotification: order #{$this->orderId} does not match criteria.", [
                'source' => $order->source,
                'delivery_type' => $order->delivery_type,
                'status' => $order->status,
                'outlet_id' => $order->outlet_id,
            ]);
            return;
        }

        $eventId = 'pickup-' . $order->id;

        broadcast(new CourierNewPickupBroadcast($order, $eventId));

        foreach ($this->queryCourierEmployees((int) $order->outlet_id) as $employee) {
            $fcmService->sendToCourierDevices($employee, $order, $eventId);
        }
    }

    private function matchesCriteria(Order $order): bool
    {
        return $order->source === Order::SOURCE_CUSTOMER_APP
            && $order->pickup_schedule !== null
            && $order->status === Order::STATUS_ACCEPTED
            && $order->outlet_id !== null;
    }

    /**
     * @return Collection<int, Employee>
     */
    private function queryCourierEmployees(int $outletId): Collection
    {
        return Employee::query()
            ->where('is_active', true)
            ->whereHas('positions', function ($query) use ($outletId) {
                $query->where('positions.outlet_id', $outletId)
                    ->where('positions.is_active', true)
                    ->where('employee_positions.is_active', true)
                    ->whereHas('permissions', function ($permissionQuery) {
                        $permissionQuery->whereIn('permission_key', [
                            Permission::CourierView->value,
                            Permission::CourierManage->value,
                        ]);
                    });
            })
            ->with('deviceTokens')
            ->get();
    }
}
