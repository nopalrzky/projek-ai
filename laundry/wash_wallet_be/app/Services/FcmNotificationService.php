<?php

namespace App\Services;

use App\Models\CustomerAccount;
use App\Models\Employee;
use App\Models\EmployeeDeviceToken;
use App\Models\Order;
use Illuminate\Support\Facades\Log;
use Kreait\Firebase\Contract\Messaging;
use Kreait\Firebase\Exception\Messaging\InvalidArgument;
use Kreait\Firebase\Exception\Messaging\NotFound;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification;

class FcmNotificationService
{
    public function __construct(
        protected Messaging $messaging
    ) {}

    /**
     * Send push notification to a specific customer account.
     */
    public function sendToCustomer(CustomerAccount $customerAccount, string $title, string $body, array $data = []): bool
    {
        if (!$customerAccount->fcm_token) {
            Log::info("Push skipped: No FCM token for customer #{$customerAccount->id}");
            return false;
        }

        return $this->send($customerAccount->fcm_token, $title, $body, $data);
    }

    /**
     * Send push notification to all active devices of an employee.
     */
    public function sendToEmployeeDevices(Employee $employee, string $title, string $body, array $data = []): void
    {
        $tokens = $employee->deviceTokens()->pluck('token');
        $successCount = 0;
        $failedCount = 0;

        foreach ($tokens as $token) {
            try {
                $isPermanentlyInvalid = $this->sendAndCheckPermanentFailure($token, $title, $body, $data);

                if ($isPermanentlyInvalid) {
                    EmployeeDeviceToken::query()->where('token', $token)->delete();
                    $failedCount++;
                    Log::info("Removed permanently invalid FCM token for employee #{$employee->id}");
                    continue;
                }

                $successCount++;
            } catch (\Throwable $e) {
                $failedCount++;
                Log::warning("Temporary FCM send failure for employee #{$employee->id}", [
                    'error' => $e->getMessage(),
                ]);
            }
        }

        Log::info("FCM send summary for employee #{$employee->id}", [
            'success' => $successCount,
            'failed' => $failedCount,
        ]);
    }

    /**
     * Send push notification to cashier employees in a specific outlet.
     */
    public function sendToOutletCashiers(int $outletId, string $title, string $body, array $data = []): void
    {
        $employees = Employee::query()
            ->where('is_active', true)
            ->whereHas('positions', function ($query) use ($outletId) {
                $query->where('positions.outlet_id', $outletId)
                    ->where('positions.is_active', true)
                    ->where('employee_positions.is_active', true)
                    ->whereHas('permissions', function ($permissionQuery) {
                        $permissionQuery->where('permission_key', 'order.view');
                    });
            })
            ->with('deviceTokens')
            ->get();

        foreach ($employees as $employee) {
            $this->sendToEmployeeDevices($employee, $title, $body, $data);
        }
    }

    /**
     * Send order accepted notification to the customer who owns the order.
     */
    public function sendOrderAcceptedToCustomer(CustomerAccount $customerAccount, Order $order, string $eventId): void
    {
        if (!$customerAccount->fcm_token) {
            Log::info("Order accepted push skipped: No FCM token for customer #{$customerAccount->id}");
            return;
        }

        $formattedSchedule = $order->getFormattedPickupSchedule();
        $body = $formattedSchedule
            ? "Pesanan Anda sudah diterima. Kurir akan menjemput pada {$formattedSchedule}."
            : 'Pesanan Anda sudah diterima. Kurir akan segera menjemput sesuai jadwal pickup.';

        try {
            $isPermanentlyInvalid = $this->sendAndCheckPermanentFailure(
                $customerAccount->fcm_token,
                'Pesanan Anda Diterima',
                $body,
                $this->customerOrderAcceptedPayload($order, $eventId),
            );

            if ($isPermanentlyInvalid) {
                $customerAccount->forceFill(['fcm_token' => null])->save();
                Log::info("Removed permanently invalid FCM token for customer #{$customerAccount->id}");
            }
        } catch (\Throwable $e) {
            Log::warning("Temporary FCM send failure for customer #{$customerAccount->id}", [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send new pickup notification to all active devices of a courier employee.
     */
    public function sendToCourierDevices(Employee $employee, Order $order, string $eventId): void
    {
        $customerName = $order->customerAccount?->name
            ?? $order->customer?->name
            ?? 'Pelanggan';
        $formattedSchedule = $order->getFormattedPickupSchedule() ?? 'jadwal pickup';
        $location = $order->pickup_address ?: ($order->outlet?->name ?? 'outlet');

        $this->sendToEmployeeDevices(
            $employee,
            'Pesanan Pickup Baru',
            "Pesanan pickup baru dari {$customerName} untuk {$formattedSchedule} di {$location}.",
            $this->courierNewPickupPayload($order, $eventId),
        );
    }

    /**
     * Generic send method using FCM v1 (HTTP v1 API).
     */
    public function send(string $token, string $title, string $body, array $data = []): bool
    {
        try {
            $this->sendMessage($token, $title, $body, $data);

            return true;
        } catch (\Exception $e) {
            Log::error('FCM v1 Send Error', [
                'token' => $token,
                'title' => $title,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * @return bool true when the token is permanently invalid and should be removed.
     */
    protected function sendAndCheckPermanentFailure(string $token, string $title, string $body, array $data = []): bool
    {
        try {
            $this->sendMessage($token, $title, $body, $data);

            return false;
        } catch (NotFound|InvalidArgument $e) {
            Log::warning('Permanent FCM token failure', [
                'token' => $token,
                'title' => $title,
                'error' => $e->getMessage(),
            ]);

            return true;
        } catch (\Throwable $e) {
            if ($this->isPermanentTokenFailureMessage($e->getMessage())) {
                Log::warning('Permanent FCM token failure detected from message', [
                    'token' => $token,
                    'title' => $title,
                    'error' => $e->getMessage(),
                ]);

                return true;
            }

            throw $e;
        }
    }

    protected function sendMessage(string $token, string $title, string $body, array $data = []): void
    {
        $message = CloudMessage::new()
            ->withToken($token)
            ->withNotification(Notification::create($title, $body))
            ->withData($this->normalizeDataPayload($data))
            ->withHighestPossiblePriority();

        $this->messaging->send($message);
    }

    protected function normalizeDataPayload(array $data): array
    {
        return collect($data)
            ->map(fn($value) => $value === null ? '' : (string) $value)
            ->all();
    }

    protected function customerOrderAcceptedPayload(Order $order, string $eventId): array
    {
        return [
            'type' => 'customer_order_accepted',
            'eventId' => $eventId,
            'orderId' => (string) $order->id,
            'orderNumber' => $order->order_number ?? '#' . $order->id,
            'outletId' => (string) $order->outlet_id,
            'outletName' => $order->outlet?->name ?? '',
            'status' => $order->status,
            'pickupSchedule' => $order->pickup_schedule?->toIso8601String(),
            'formattedPickupSchedule' => $order->getFormattedPickupSchedule(),
            'createdAt' => now()->toIso8601String(),
        ];
    }

    protected function courierNewPickupPayload(Order $order, string $eventId): array
    {
        $customerName = $order->customerAccount?->name
            ?? $order->customer?->name
            ?? 'Pelanggan';

        return [
            'type' => 'courier_new_pickup',
            'eventId' => $eventId,
            'orderId' => (string) $order->id,
            'orderNumber' => $order->order_number ?? '#' . $order->id,
            'outletId' => (string) $order->outlet_id,
            'outletName' => $order->outlet?->name ?? '',
            'customerName' => $customerName,
            'pickupAddress' => $order->pickup_address ?? '',
            'pickupSchedule' => $order->pickup_schedule?->toIso8601String(),
            'formattedPickupSchedule' => $order->getFormattedPickupSchedule(),
            'status' => $order->status,
            'createdAt' => now()->toIso8601String(),
        ];
    }

    protected function isPermanentTokenFailureMessage(string $message): bool
    {
        $message = strtolower($message);

        return str_contains($message, 'registration-token-not-registered')
            || str_contains($message, 'requested entity was not found')
            || str_contains($message, 'not a valid fcm registration token')
            || str_contains($message, 'invalid registration token')
            || str_contains($message, 'unregistered');
    }
}
