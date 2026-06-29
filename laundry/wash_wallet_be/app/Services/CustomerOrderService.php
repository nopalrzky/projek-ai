<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\CustomerAccount;
use App\Models\LaundryService;
use App\Models\CourierSchedule;
use App\Models\CustomerAddress;
use App\Models\Customer;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Carbon\Carbon;

class CustomerOrderService extends BaseService
{
    public function __construct(
        protected Order $order,
        protected OrderItem $orderItem,
        protected LaundryService $laundryService,
        protected CourierSchedule $courierSchedule,
        protected CourierSettingService $courierSettingService,
        protected CustomerAddress $customerAddress,
        protected Customer $customer,
    ) {}

    /**
     * Store order from customer app.
     */


    /**
     * Get orders for customer account.
     */
    public function getAll(CustomerAccount $account, array $filters = []): LengthAwarePaginator | Collection
    {
        try {
            $query = $this->order->query()
                ->byCustomerAccountId($account->id)
                ->with(['outlet', 'orderItems', 'review'])
                ->orderBy('created_at', 'desc');

            $perPage = $filters['perPage'] ?? 15;
            $page = $filters['page'] ?? null;

            return $this->paginate($query, $perPage, $page);
        } catch (Exception $e) {
            Log::error('Failed to get customer orders', [
                'account_id' => $account->id,
                'filters'    => $filters,
                'error'      => $e->getMessage(),
                'type'       => 'customer_order_service_error',
            ]);
            throw $e;
        }
    }

    /**
     * Get single order for customer account.
     */
    public function getById(CustomerAccount $account, int $orderId): Order
    {
        try {
            return $this->order->query()
                ->byCustomerAccountId($account->id)
                ->with(['outlet', 'orderItems', 'customerAddress', 'review'])
                ->whereKey($orderId)
                ->firstOrFail();
        } catch (Exception $e) {
            Log::error('Failed to get customer order by ID', [
                'account_id' => $account->id,
                'order_id'   => $orderId,
                'error'      => $e->getMessage(),
                'type'       => 'customer_order_service_error',
            ]);
            throw $e;
        }
    }

    /**
     * Pay order by customer.
     */
    public function pay(CustomerAccount $account, int $orderId): Order
    {
        return DB::transaction(function () use ($account, $orderId) {
            $order = $this->order->query()
                ->byCustomerAccountId($account->id)
                ->with(['outlet'])
                ->whereKey($orderId)
                ->lockForUpdate()
                ->firstOrFail();

            if (!in_array($order->payment_status, [Order::PAYMENT_STATUS_UNPAID, Order::PAYMENT_STATUS_PARTIAL])) {
                throw new Exception("Order belum memiliki tagihan atau sudah dibayar. Status: {$order->payment_status}");
            }

            $totalAmount = $order->total_amount;
            if ($account->deposit_balance < $totalAmount) {
                throw new Exception("Saldo tidak mencukupi. Saldo Anda: Rp " .
                    number_format($account->deposit_balance) .
                    ", Dibutuhkan: Rp " . number_format($totalAmount));
            }

            $account->decrement('deposit_balance', $totalAmount);

            $order->outlet->increment('balance', $totalAmount);

            $order->update([
                'payment_status'   => Order::PAYMENT_STATUS_PAID,
                'payment_method'   => 'wallet_balance',
                'paid_amount'      => $totalAmount,
                'remaining_amount' => 0,
            ]);

            $owner = $order->outlet?->owner;
            if ($owner) {
                app(\App\Services\WalletBalanceService::class)->creditFromOrder(
                    $owner,
                    $order,
                    \App\Models\WalletTransaction::TYPE_ORDER_WALLET_INCOME
                );
            }

            return $order->fresh(['outlet', 'orderItems']);
        });
    }

    /**
     * Schedule delivery for order.
     */
    public function scheduleDelivery(CustomerAccount $account, int $orderId, array $data): Order
    {
        return DB::transaction(function () use ($account, $orderId, $data) {
            $order = $this->order->query()
                ->byCustomerAccountId($account->id)
                ->whereKey($orderId)
                ->lockForUpdate()
                ->firstOrFail();

            if ($order->status !== Order::STATUS_COMPLETED) {
                throw new Exception("Pesanan belum selesai diproduksi.");
            }

            if ($order->payment_method !== 'cod' && $order->payment_status !== Order::PAYMENT_STATUS_PAID) {
                throw new Exception("Selesaikan pembayaran terlebih dahulu sebelum menjadwalkan pengantaran.");
            }

            $deliveryDate = Carbon::parse($data['deliveryDate']);
            $dayOfWeek = strtolower($deliveryDate->format('l'));

            $opDay = $order->outlet->operationalDays()->where('day_of_week', $dayOfWeek)->first();
            if (!$opDay || !$opDay->is_open) {
                throw new Exception("Outlet tutup pada hari " . ($opDay ? $opDay->getDayLabel() : $dayOfWeek) . ". Silakan pilih hari lain.");
            }

            $schedule = $this->courierSchedule
                ->byId($data['courierScheduleId'])
                ->byOutletId($order->outlet_id)
                ->active()
                ->firstOrFail();

            app(\App\Services\CourierScheduleAvailabilityService::class)->ensureBookable(
                $schedule,
                $data['deliveryDate'],
                'delivery',
                'courierScheduleId'
            );

            $deliverySchedule = $data['deliveryDate'] . ' ' . $schedule->start_time->format('H:i:s');

            $order->update([
                'delivery_date'     => Carbon::parse($data['deliveryDate']),
                'delivery_schedule' => Carbon::parse($deliverySchedule),
                'delivery_address'  => $data['deliveryAddress'] ?? $order->pickup_address,
            ]);

            return $order->fresh(['outlet', 'orderItems', 'customerAddress']);
        });
    }
}
