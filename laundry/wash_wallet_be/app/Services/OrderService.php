<?php

namespace App\Services;

use App\Events\CashierNewOrderCreated;
use App\Events\CustomerOrderAccepted;
use App\Jobs\SendCourierNewPickupNotification;
use App\Jobs\SendCustomerOrderAcceptedFcm;
use App\Jobs\SendNewOrderFcmJob;
use App\Models\CourierSchedule;
use App\Models\CustomerQuota;
use App\Models\CustomerSubscription;
use App\Models\Employee;
use App\Models\Order;
use App\Models\OrderItemProcess;
use App\Models\QuotaUsageLog;
use App\Models\LaundryService;
use App\Models\OrderPaymentLog;
use Exception;
use InvalidArgumentException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Carbon\CarbonInterface;
use Illuminate\Support\Carbon;
use App\Models\Customer;
use App\Models\CustomerAccount;
use App\Models\CustomerAddress;
use App\Models\ServicePackage;
use App\Models\OrderItem;
use App\Models\OrderReview;
use App\Models\Outlet;

class OrderService extends BaseService
{
    public function __construct(
        protected CustomerAddress $customerAddress,
        protected CustomerAccount $customerAccount,
        protected CourierSchedule $courierSchedule,
        protected Order $order,
        protected OrderItem $orderItem,
        protected OrderItemProcess $orderItemProcess,
        protected OrderReview $orderReview,
        protected CustomerQuota $customerQuota,
        protected QuotaUsageLog $quotaUsageLog,
        protected AccountService $accountService,
        protected AccountingService $accountingService,
        protected CustomerAccountService $customerAccountService,
        protected CourierSettingService $courierSettingService,
        protected Customer $customer,
        protected Employee $employee,
        protected ServicePackage $servicePackage,
        protected LaundryService $laundryService,
        protected FcmNotificationService $fcmService,
        protected WaNotificationService $waNotificationService,
        protected OutletSettingService $outletSettingService
    ) {}

    /**
     * Get all orders with multi-tenant supportx`
     */
    /*
    |--------------------------------------------------------------------------
    | Read Methods
    |--------------------------------------------------------------------------
    */

    public function getAll(
        array $filters = [],
        ?int $page = null,
        ?int $perPage = null,
        array $relations = []
    ): LengthAwarePaginator | Collection {
        try {
            $query = $this->order->query();

            $this->applyTenantScope($query);
            $this->applyFilters($query, $filters);

            if (!empty($relations)) {
                $query->with($relations);
            }

            return $this->paginate($query, $perPage, $page);
        } catch (Exception $e) {
            Log::error('Failed to get all orders', [
                'filters' => $filters,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'order_service_error'
            ]);
            throw $e;
        }
    }

    public function getStats(): array
    {
        try {
            $query = $this->order->query();

            $this->applyTenantScope($query);

            $today = Carbon::today();

            $todayOrders = (clone $query)
                ->whereDate('order_date', $today)
                ->count();

            $todayRevenue = (clone $query)
                ->whereDate('order_date', $today)
                ->sum('paid_amount');

            $activeOrders = (clone $query)
                ->whereNotIn('status', [
                    Order::STATUS_DELIVERED,
                    Order::STATUS_COMPLETED,
                    Order::STATUS_CANCELLED,
                    Order::STATUS_REJECTED
                ])
                ->count();

            $unpaidOrders = (clone $query)
                ->whereIn('payment_status', ['unpaid', 'partial'])
                ->count();

            $outstandingAmount = (clone $query)
                ->whereIn('payment_status', ['unpaid', 'partial'])
                ->sum('remaining_amount');

            return [
                [
                    'label' => 'Order Hari Ini',
                    'value' => $todayOrders,
                    'subValue' => null,
                    'icon' => 'ShoppingBag',
                    'variant' => 'primary',
                ],
                [
                    'label' => 'Pendapatan Hari Ini',
                    'value' => 'Rp ' . number_format($todayRevenue, 0, ',', '.'),
                    'subValue' => null,
                    'icon' => 'DollarSign',
                    'variant' => 'success',
                ],
                [
                    'label' => 'Order Aktif',
                    'value' => $activeOrders,
                    'subValue' => null,
                    'icon' => 'Clock',
                    'variant' => 'info',
                ],
                [
                    'label' => 'Belum Dibayar',
                    'value' => $unpaidOrders,
                    'subValue' => 'Rp ' . number_format($outstandingAmount, 0, ',', '.'),
                    'icon' => 'AlertCircle',
                    'variant' => 'warning',
                ],
            ];
        } catch (Exception $e) {
            Log::error('Failed to get order stats', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'order_service_error'
            ]);
            throw $e;
        }
    }

    /**
     * Get order by ID
     */
    public function getById(
        int $id,
        array $relations = ['customer', 'employee', 'orderItems.laundryService']
    ): Order {
        try {
            $query = $this->order->byId($id);

            if (!empty($relations)) {
                $query->with($relations);
            }

            return $query->firstOrFail();
        } catch (Exception $e) {
            Log::error('Failed to get order by ID', [
                'order_id' => $id,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'order_service_error'
            ]);
            throw $e;
        }
    }

    /**
     * Create new order with accounting journal
     */
    /*
    |--------------------------------------------------------------------------
    | Write Methods
    |--------------------------------------------------------------------------
    */

    public function store(array $data): Order
    {
        return DB::transaction(function () use ($data) {
            try {
                $orderNumber = $this->generateOrderNumber($data['customerId']);
                $orderItemsData = $data['orderItems'];

                $subtotal = 0;
                $itemSnapshots = [];

                $outletId = null;
                $ownerId = null;

                foreach ($orderItemsData as $orderItem) {
                    $laundryService = LaundryService::with(['category', 'unit', 'outlet'])
                        ->findOrFail($orderItem['laundryServiceId']);

                    if (!$laundryService->is_active) {
                        throw new Exception("Laundry service '{$laundryService->name}' is not active");
                    }

                    if (!$laundryService->outlet) {
                        throw new Exception("Laundry service '{$laundryService->name}' does not have an associated outlet");
                    }

                    $unitPrice = $laundryService->price;
                    $quantity = $orderItem['quantity'];
                    $discountAmount = $orderItem['discountAmount'] ?? 0;
                    $itemSubtotal = $unitPrice * $quantity;
                    $totalAmount = $itemSubtotal - $discountAmount;

                    $subtotal += $totalAmount;

                    $itemSnapshots[] = [
                        'laundry_service_id' => $laundryService->id,
                        'category_name' => $laundryService->category->name,
                        'laundry_service_name' => $laundryService->name,
                        'unit_name' => $laundryService->unit->name,
                        'quantity' => $quantity,
                        'unit_price' => $unitPrice,
                        'subtotal' => $itemSubtotal,
                        'discount_amount' => $discountAmount,
                        'total_amount' => $totalAmount,
                        'status' => 'pending',
                        'is_package_usage' => $orderItem['isPackageUsage'] ?? false,
                        'customer_subscription_id' => $orderItem['customerSubscriptionId'] ?? null,
                        'quota_used' => $orderItem['quotaUsed'] ?? null,
                        'paid_amount' => $orderItem['paidAmount'] ?? 0,
                        'item_notes' => $orderItem['itemNotes'] ?? null,
                    ];

                    if ($outletId === null) {
                        $outletId = $laundryService->outlet->id;
                        $ownerId = $laundryService->outlet->owner_id;

                        Log::debug('Resolved outlet and owner from laundry service', [
                            'laundry_service_id' => $laundryService->id,
                            'outlet_id' => $outletId,
                            'owner_id' => $ownerId,
                        ]);
                    }

                    if ($laundryService->outlet->id !== $outletId) {
                        throw new Exception("All order items must belong to the same outlet");
                    }
                }

                if ($outletId === null) {
                    throw new Exception("Unable to determine outlet from order items");
                }

                if ($ownerId === null) {
                    throw new Exception("Unable to determine owner from outlet");
                }

                $discountAmount = $data['discountAmount'] ?? 0;
                $taxAmount = $data['taxAmount'] ?? 0;
                $totalAmount = $subtotal - $discountAmount + $taxAmount;
                $paidAmount = $data['paidAmount'] ?? 0;

                $hasPackageUsage = false;
                $hasNonPackageItems = false;
                foreach ($itemSnapshots as $itemSnapshot) {
                    if (!empty($itemSnapshot['is_package_usage'])) {
                        $hasPackageUsage = true;
                        continue;
                    }

                    $hasNonPackageItems = true;
                }

                $isFullyCoveredByPackage = $hasPackageUsage && !$hasNonPackageItems;
                $effectivePaymentStatus = $isFullyCoveredByPackage
                    ? 'paid_by_package'
                    : $data['paymentStatus'];
                $effectivePaymentMethod = $isFullyCoveredByPackage
                    ? null
                    : ($data['paymentMethod'] ?? null);

                if ($isFullyCoveredByPackage) {
                    $paidAmount = 0;
                }

                $packageUsageAmount = 0;
                foreach ($itemSnapshots as $itemSnapshot) {
                    if (!empty($itemSnapshot['is_package_usage'])) {
                        $packageUsageAmount += $itemSnapshot['total_amount'];
                    }
                }

                $remainingAmount = $isFullyCoveredByPackage
                    ? 0
                    : ($totalAmount - $paidAmount - $packageUsageAmount);

                if ($remainingAmount < 0) {
                    $remainingAmount = 0;
                }

                $estimatedCompletion = isset($data['estimatedCompletion'])
                    ? Carbon::parse($data['estimatedCompletion'])
                    : $this->calculateEstimatedCompletion($orderItemsData);

                $order = $this->order->create([
                    'customer_id' => $data['customerId'],
                    'employee_id' => $data['employeeId'],
                    'order_number' => $orderNumber,
                    'payment_method' => $effectivePaymentMethod,
                    'payment_status' => $effectivePaymentStatus,
                    'status' => Order::STATUS_READY_TO_PROCESS,
                    'subtotal' => $subtotal,
                    'discount_amount' => $discountAmount,
                    'tax_amount' => $taxAmount,
                    'total_amount' => $totalAmount,
                    'paid_amount' => $paidAmount,
                    'remaining_amount' => $remainingAmount,
                    'notes' => $data['notes'] ?? null,
                    'internal_notes' => $data['internalNotes'] ?? null,
                    'special_instructions' => isset($data['specialInstructions'])
                        ? json_encode($data['specialInstructions'])
                        : null,
                    'order_date' => isset($data['orderDate'])
                        ? Carbon::parse($data['orderDate'])
                        : Carbon::now(),
                    'estimated_completion' => $estimatedCompletion,
                    'pickup_date' => isset($data['pickupDate'])
                        ? Carbon::parse($data['pickupDate'])
                        : null,
                    'outlet_id' => $outletId,
                ]);

                foreach ($itemSnapshots as $itemSnapshot) {
                    $order->orderItems()->create($itemSnapshot);
                }

                $order->remaining_amount = $remainingAmount;
                $order->save();

                $packageUsageJournalItems = [];

                foreach ($order->orderItems as $savedItem) {
                    if (!$savedItem->is_package_usage || !$savedItem->customer_subscription_id) {
                        continue;
                    }

                    $subscriptionId = (int) $savedItem->customer_subscription_id;
                    $laundryServiceId = (int) $savedItem->laundry_service_id;
                    $quotaToDeduct = (float) ($savedItem->quota_used ?? $savedItem->quantity);

                    /** @var CustomerQuota|null $quota */
                    $quota = CustomerQuota::query()
                        ->byCustomerSubscriptionId($subscriptionId)
                        ->byLaundryServiceId($laundryServiceId)
                        ->lockForUpdate()
                        ->first();

                    if (!$quota) {
                        throw new Exception(
                            "Quota not found for subscription #{$subscriptionId} and service #{$laundryServiceId}"
                        );
                    }

                    if ((float) $quota->remaining_quota < $quotaToDeduct) {
                        throw new Exception(
                            "Insufficient quota for service '{$savedItem->laundry_service_name}'. " .
                                "Available: {$quota->remaining_quota}, requested: {$quotaToDeduct}"
                        );
                    }

                    $quota->decrement('remaining_quota', $quotaToDeduct);

                    QuotaUsageLog::create([
                        'customer_subscription_id' => $subscriptionId,
                        'order_item_id' => $savedItem->id,
                        'amount_used' => $quotaToDeduct,
                    ]);

                    $packageUsageJournalItems[] = [
                        'subscriptionId' => $subscriptionId,
                        'laundryServiceId' => $laundryServiceId,
                        'quotaUsed' => $quotaToDeduct,
                        'unitPrice' => (float) $savedItem->unit_price,
                    ];

                    $hasAnyRemaining = CustomerQuota::query()
                        ->byCustomerSubscriptionId($subscriptionId)
                        ->where('remaining_quota', '>', 0)
                        ->exists();

                    if (!$hasAnyRemaining) {
                        CustomerSubscription::query()
                            ->byId($subscriptionId)
                            ->update(['status' => 'exhausted']);
                    }
                }

                $this->accountingService->recordPackageUsage(
                    $order,
                    $ownerId,
                    $outletId,
                    $packageUsageJournalItems
                );

                $this->accountingService->recordOrderPayment(
                    $order,
                    $ownerId,
                    $outletId,
                    $effectivePaymentStatus,
                    $effectivePaymentMethod,
                    $data['sourceAccountId'] ?? null,
                    $totalAmount - $packageUsageAmount,
                    $paidAmount,
                    $remainingAmount
                );

                Log::info('Order created successfully with journal', [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'customer_id' => $order->customer_id,
                    'employee_id' => $order->employee_id,
                    'outlet_id' => $outletId,
                    'owner_id' => $ownerId,
                    'total_amount' => $order->total_amount,
                    'paid_amount' => $order->paid_amount,
                    'payment_status' => $order->payment_status,
                    'payment_method' => $order->payment_method,
                    'items_count' => count($itemSnapshots),
                    'user_id' => Auth::id(),
                    'type' => 'order_management'
                ]);

                return $order->load(['customer', 'employee', 'orderItems.laundryService']);
            } catch (Exception $e) {
                Log::error('Failed to create order', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'data' => $data,
                    'user_id' => Auth::id(),
                    'type' => 'order_service_error'
                ]);
                throw $e;
            }
        });
    }


    public function storeCustomer(array $data): Order
    {
        return DB::transaction(function () use ($data) {
            try {
                $serviceIds = collect($data['orderItems'])->pluck('laundryServiceId')->toArray();
                $services = $this->laundryService->with(['category', 'unit'])->whereIn('id', $serviceIds)->get();

                if (($data['pickupType'] ?? null) === 'courier') {
                    $this->validateCourierEligibility($serviceIds);
                }

                if ($services->count() !== count($serviceIds)) {
                    throw new Exception("Beberapa layanan tidak ditemukan.");
                }

                $customerAccount = $this->customerAccountService->getById($data['customerAccountId']);

                $pickupType = $data['pickupType'];
                $pickupAddress = null;
                $pickupSchedule = null;
                $pickupFee = 0;
                $customerAddressId = null;
                $outletId = $data['outletId'];

                $outlet = Outlet::findOrFail($outletId);
                $statusService = app(OperationalStatusService::class);
                $status = $statusService->resolve($outlet);
                if (!$status['canCreateOrderNow']) {
                    throw ValidationException::withMessages([
                        'outletId' => $status['orderDisabledReason'] ?? 'Outlet sedang tutup.',
                    ]);
                }

                $this->validateOutletCourierStatus($outletId, $pickupType, $data['deliveryType'] ?? 'pickup');

                if ($pickupType === 'courier') {
                    $address = $this->customerAddress->byId($data['customerAddressId'])
                        ->byCustomerAccountId($customerAccount->id)
                        ->firstOrFail();

                    $pickupAddress = $address->getSnapshotString();

                    $scheduleId = $data['pickupScheduleId'];
                    $schedule = $this->courierSchedule->byId($scheduleId)
                        ->byOutletId($outletId)
                        ->active()
                        ->firstOrFail();

                    app(CourierScheduleAvailabilityService::class)->ensureBookable(
                        $schedule,
                        $data['pickupDate'],
                        'pickup',
                        'pickupScheduleId'
                    );

                    $pickupSchedule = $data['pickupDate'] . ' ' . $schedule->start_time->format('H:i:s');

                    $courierSetting = $this->courierSettingService->getByOutletId($outletId);
                    $pickupFee = $courierSetting->pickup_fee;
                }

                $customerProfile = $this->customer->firstOrCreate(
                    [
                        'customer_account_id' => $customerAccount->id,
                        'outlet_id'           => $outletId,
                    ],
                    [
                        'name'      => $customerAccount->name,
                        'phone'     => $customerAccount->phone,
                        'email'     => $customerAccount->email,
                        'gender'    => $customerAccount->gender,
                        'is_active' => true,
                    ]
                );

                $orderStatus = Order::STATUS_REQUESTED;
                $paymentMethod = $data['paymentMethod'] ?? null;
                if ($pickupType === 'self_dropoff') {
                    $orderStatus = Order::STATUS_PENDING_DROPOFF;
                    $paymentMethod = null;
                }

                $order = $this->order->create([
                    'customer_id'         => $customerProfile->id,
                    'customer_account_id' => $customerAccount->id,
                    'outlet_id'           => $outletId,
                    'customer_address_id' => $customerAddressId,
                    'source'              => Order::SOURCE_CUSTOMER_APP,
                    'status'              => $orderStatus,
                    'payment_method'      => $paymentMethod,
                    'delivery_type'       => $data['deliveryType'] ?? 'delivery',
                    'payment_status'      => Order::PAYMENT_STATUS_NOT_YET_PRICED,
                    'pickup_address'      => $pickupAddress,
                    'pickup_schedule'     => $pickupSchedule,
                    'pickup_fee'          => $pickupFee,
                    'delivery_fee'        => $pickupFee,
                    'subtotal'            => 0,
                    'total_amount'        => 0,
                    'paid_amount'         => 0,
                    'notes'               => $data['notes'] ?? null,
                    'order_date'          => now(),
                ]);

                foreach ($services as $service) {
                    $this->orderItem->create([
                        'order_id'             => $order->id,
                        'laundry_service_id'   => $service->id,
                        'laundry_service_name' => $service->name,
                        'category_name'        => $service->category->name,
                        'unit_name'            => $service->unit->name,
                        'quantity'             => 0,
                        'unit_price'           => 0,
                        'subtotal'             => 0,
                        'total_amount'         => 0,
                        'status'               => OrderItem::STATUS_PENDING,
                    ]);
                }

                $order = $order->load(['orderItems', 'outlet', 'customer']);

                $isCustomerOrder = $order->source === Order::SOURCE_CUSTOMER_APP;
                $hasOutlet = $order->outlet_id !== null;
                $isNewStatus = in_array($order->status, [
                    Order::STATUS_REQUESTED,
                    Order::STATUS_PENDING_DROPOFF,
                ], true);

                if ($isCustomerOrder && $hasOutlet && $isNewStatus) {
                    CashierNewOrderCreated::dispatch($order);
                    SendNewOrderFcmJob::dispatch($order->id)->afterCommit();
                }

                return $order;
            } catch (Exception $e) {
                Log::error('Failed to store customer order', [
                    'data'       => $data,
                    'error'      => $e->getMessage(),
                    'type'       => 'customer_order_service_error',
                ]);
                throw $e;
            }
        });
    }

    /**
     * Validate that given service IDs all support courier
     */
    private function validateCourierEligibility(array $serviceIds): void
    {
        if (empty($serviceIds)) {
            return;
        }

        $ineligibleServices = LaundryService::whereIn('id', $serviceIds)
            ->where('supports_courier', false)
            ->pluck('name')
            ->toArray();

        if (!empty($ineligibleServices)) {
            $names = implode(', ', $ineligibleServices);
            throw new InvalidArgumentException(
                "Layanan berikut tidak mendukung kurir: {$names}. Ubah metode pengiriman atau hapus layanan tersebut dari order."
            );
        }
    }

    private function validateOutletCourierStatus(int $outletId, string $pickupType, string $deliveryType = 'pickup'): void
    {
        $outlet = Outlet::with(['courierSetting', 'outletFeatures.feature'])->findOrFail($outletId);

        $featureActive = $outlet->outletFeatures->contains(
            fn($f) => $f->feature?->key === 'courier_schedule' && ($f->status === 'active' || $f->status === 'trial')
        );
        $settingEnabled = $outlet->courierSetting ? (bool) $outlet->courierSetting->is_courier_enabled : false;
        $isCourierEnabled = $featureActive && $settingEnabled;

        if ($pickupType === 'courier' && !$isCourierEnabled) {
            throw new InvalidArgumentException("Outlet ini tidak memiliki layanan kurir.");
        }

        if ($deliveryType === 'delivery' && !$isCourierEnabled) {
            throw new InvalidArgumentException("Outlet ini tidak memiliki layanan antar kurir.");
        }
    }

    /**
     * Store a new order review.
     */
    public function review(int $orderId, array $data): OrderReview
    {
        $order = $this->order->findOrFail($orderId);
        $customerAccount = $this->customerAccount->findOrFail($data['customerAccountId']);

        if (!in_array($order->status, [Order::STATUS_COMPLETED, 'user_completed'])) {
            abort(422, 'Hanya pesanan yang sudah selesai yang dapat diulas.');
        }

        if ($order->review()->exists()) {
            abort(422, 'Pesanan ini sudah diulas.');
        }

        return $this->orderReview->create([
            'order_id' => $order->id,
            'outlet_id' => $order->outlet_id,
            'customer_account_id' => $customerAccount->id,
            'customer_name' => $customerAccount->customer?->name ?? $customerAccount->user?->name ?? 'Pelanggan',
            'rating' => $data['rating'],
            'comment' => $data['comment'] ?? null,
        ]);
    }


    /**
     * Update existing order
     */
    public function update(int $orderId, array $data): Order
    {
        return DB::transaction(function () use ($orderId, $data) {
            try {
                $order = $this->order->byId($orderId)
                    ->firstOrFail();

                $updateData = [];

                if (isset($data['customerId'])) {
                    $updateData['customer_id'] = $data['customerId'];
                }

                if (isset($data['employeeId'])) {
                    $updateData['employee_id'] = $data['employeeId'];
                }

                if (isset($data['orderStatus'])) {
                    $updateData['status'] = $data['orderStatus'];
                }

                if (isset($data['paymentMethod'])) {
                    $updateData['payment_method'] = $data['paymentMethod'];
                }

                if (isset($data['paymentStatus'])) {
                    $updateData['payment_status'] = $data['paymentStatus'];
                }

                if (isset($data['notes'])) {
                    $updateData['notes'] = $data['notes'];
                }

                if (isset($data['internalNotes'])) {
                    $updateData['internal_notes'] = $data['internalNotes'];
                }

                if (isset($data['specialInstructions'])) {
                    $updateData['special_instructions'] = json_encode($data['specialInstructions']);
                }

                if (isset($data['orderDate'])) {
                    $updateData['order_date'] = Carbon::parse($data['orderDate']);
                }

                if (isset($data['estimatedCompletion'])) {
                    $updateData['estimated_completion'] = Carbon::parse($data['estimatedCompletion']);
                }

                if (isset($data['pickupDate'])) {
                    $updateData['pickup_date'] = Carbon::parse($data['pickupDate']);
                }

                if (isset($data['paidAmount'])) {
                    $updateData['paid_amount'] = $data['paidAmount'];
                }

                if (isset($data['orderItems'])) {
                    $orderItemsData = $data['orderItems'];

                    $order->orderItems()->delete();

                    $subtotal = 0;
                    $itemSnapshots = [];

                    foreach ($orderItemsData as $orderItem) {
                        $laundryService = LaundryService::with(['category', 'unit'])
                            ->findOrFail($orderItem['laundryServiceId']);

                        if (!$laundryService->is_active) {
                            throw new Exception("Laundry service '{$laundryService->name}' is not active");
                        }

                        if ($orderItem['quantity'] < $laundryService->min_quantity) {
                            throw new Exception("Quantity for '{$laundryService->name}' must be at least {$laundryService->min_quantity}");
                        }

                        $unitPrice = $laundryService->price;
                        $quantity = $orderItem['quantity'];
                        $discountAmount = $orderItem['discountAmount'] ?? 0;
                        $itemSubtotal = $unitPrice * $quantity;
                        $totalAmount = $itemSubtotal - $discountAmount;

                        $subtotal += $totalAmount;

                        $itemSnapshots[] = [
                            'laundry_service_id' => $laundryService->id,
                            'category_name' => $laundryService->category->name,
                            'laundry_service_name' => $laundryService->name,
                            'unit_name' => $laundryService->unit->name,
                            'quantity' => $quantity,
                            'unit_price' => $unitPrice,
                            'subtotal' => $itemSubtotal,
                            'discount_amount' => $discountAmount,
                            'total_amount' => $totalAmount,
                            'status' => $orderItem['productionStatus'] ?? 'pending',
                            'is_package_usage' => $orderItem['isPackageUsage'] ?? false,
                            'customer_subscription_id' => $orderItem['customerSubscriptionId'] ?? null,
                            'quota_used' => $orderItem['quotaUsed'] ?? null,
                            'paid_amount' => $orderItem['paidAmount'] ?? 0,
                            'item_notes' => $orderItem['itemNotes'] ?? null,
                        ];
                    }

                    $discountAmount = $data['discountAmount'] ?? $order->discount_amount;
                    $taxAmount = $data['taxAmount'] ?? $order->tax_amount;
                    $totalAmount = $subtotal - $discountAmount + $taxAmount;

                    $updateData['subtotal'] = $subtotal;
                    $updateData['discount_amount'] = $discountAmount;
                    $updateData['tax_amount'] = $taxAmount;
                    $updateData['total_amount'] = $totalAmount;

                    if (!isset($data['estimatedCompletion'])) {
                        $estimatedCompletion = $this->calculateEstimatedCompletion($orderItemsData);
                        $updateData['estimated_completion'] = $estimatedCompletion;
                    }

                    $order->update($updateData);

                    foreach ($itemSnapshots as $itemSnapshot) {
                        $order->orderItems()->create($itemSnapshot);
                    }
                } else {
                    if (isset($data['discountAmount']) || isset($data['taxAmount'])) {
                        $subtotal = $order->subtotal;
                        $discountAmount = $data['discountAmount'] ?? $order->discount_amount;
                        $taxAmount = $data['taxAmount'] ?? $order->tax_amount;

                        $updateData['discount_amount'] = $discountAmount;
                        $updateData['tax_amount'] = $taxAmount;
                        $updateData['total_amount'] = $subtotal - $discountAmount + $taxAmount;
                    }

                    $order->update($updateData);
                }

                Log::info('Order updated successfully', [
                    'order_id' => $orderId,
                    'order_number' => $order->order_number,
                    'changes' => array_keys($updateData),
                    'user_id' => Auth::id(),
                    'type' => 'order_management'
                ]);

                return $order->fresh(['customer', 'employee', 'orderItems.laundryService']);
            } catch (Exception $e) {
                Log::error('Failed to update order', [
                    'order_id' => $orderId,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'user_id' => Auth::id(),
                    'type' => 'order_service_error'
                ]);
                throw $e;
            }
        });
    }

    /**
     * Record a new payment for an order.
     */
    public function recordOrderPayment(int $orderId, array $data): Order
    {
        return DB::transaction(function () use ($orderId, $data) {
            try {
                $order = $this->order->with('orderPaymentLogs')->findOrFail($orderId);

                if (!$order->canAcceptPayment()) {
                    throw new InvalidArgumentException('Order tidak dapat menerima pembayaran pada status saat ini.');
                }

                $amount = (float) $data['amount'];
                if (round($amount, 2) > round((float) $order->remaining_amount, 2)) {
                    throw new InvalidArgumentException('Jumlah pembayaran melebihi sisa tagihan.');
                }

                OrderPaymentLog::create([
                    'order_id' => $order->id,
                    'employee_id' => $data['employee_id'] ?? Auth::id(),
                    'amount' => $amount,
                    'payment_method' => $data['payment_method'],
                    'reference_number' => $data['reference_number'] ?? null,
                    'notes' => $data['notes'] ?? null,
                ]);

                $order->paid_amount += $amount;
                $order->save();

                Log::info('Order payment recorded successfully', [
                    'order_id' => $order->id,
                    'amount' => $amount,
                    'user_id' => Auth::id(),
                    'type' => 'order_payment'
                ]);

                return $order->fresh(['customer', 'employee', 'orderItems.laundryService', 'orderPaymentLogs.employee']);
            } catch (Exception $e) {
                Log::error('Failed to record order payment', [
                    'order_id' => $orderId,
                    'error' => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type' => 'order_service_error'
                ]);
                throw $e;
            }
        });
    }

    /**
     * Delete an order payment log.
     */
    public function deleteOrderPaymentLog(int $orderId, int $paymentLogId): void
    {
        DB::transaction(function () use ($orderId, $paymentLogId) {
            try {
                $log = OrderPaymentLog::where('id', $paymentLogId)
                    ->where('order_id', $orderId)
                    ->firstOrFail();

                if (!$log->canBeDeletedByPeriod()) {
                    throw new InvalidArgumentException('Log pembayaran tidak dapat dihapus karena periode akuntansi sudah ditutup.');
                }

                $order = $this->order->findOrFail($orderId);
                $order->paid_amount -= (float) $log->amount;
                $order->save();

                $log->delete();

                Log::info('Order payment log deleted successfully', [
                    'order_id' => $orderId,
                    'payment_log_id' => $paymentLogId,
                    'user_id' => Auth::id(),
                    'type' => 'order_payment'
                ]);
            } catch (Exception $e) {
                Log::error('Failed to delete order payment log', [
                    'order_id' => $orderId,
                    'payment_log_id' => $paymentLogId,
                    'error' => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type' => 'order_service_error'
                ]);
                throw $e;
            }
        });
    }

    /**
     * Cancel order
     */
    public function cancel(int $orderId): Order
    {
        return DB::transaction(function () use ($orderId) {
            try {
                $order = $this->order->byId($orderId)
                    ->firstOrFail();

                if (!in_array($order->status, ['requested', Order::STATUS_READY_TO_PROCESS])) {
                    throw new Exception("Order tidak dapat dibatalkan karena sudah diproses.");
                }

                $order->update([
                    'status' => 'cancelled',
                ]);

                Log::info('Order cancelled successfully', [
                    'order_id' => $orderId,
                    'order_number' => $order->order_number,
                    'user_id' => Auth::id(),
                    'type' => 'order_management'
                ]);

                try {
                    $this->waNotificationService->sendStatusChangeNotification(
                        $order,
                        $order->outlet,
                        Order::STATUS_CANCELLED
                    );
                } catch (Exception $e) {
                    Log::warning('Auto WA notification failed in cancel', [
                        'order_id' => $order->id,
                        'error' => $e->getMessage(),
                    ]);
                }

                return $order->fresh(['customer', 'employee', 'orderItems.laundryService']);
            } catch (Exception $e) {
                Log::error('Failed to cancel order', [
                    'order_id' => $orderId,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'user_id' => Auth::id(),
                    'type' => 'order_service_error'
                ]);
                throw $e;
            }
        });
    }

    /**
     * Delete order (soft delete)
     */
    public function destroy(int $orderId): bool
    {
        return DB::transaction(function () use ($orderId) {
            try {
                $order = $this->order->byId($orderId)
                    ->firstOrFail();

                if (in_array($order->status, ['processing', 'ready'])) {
                    throw new Exception('Cannot delete order that is being processed or ready');
                }

                $orderNumber = $order->order_number;
                $deleted = $order->delete();

                if ($deleted) {
                    Log::info('Order deleted successfully', [
                        'order_id' => $orderId,
                        'order_number' => $orderNumber,
                        'user_id' => Auth::id(),
                        'type' => 'order_management'
                    ]);
                }

                return $deleted;
            } catch (Exception $e) {
                Log::error('Failed to delete order', [
                    'order_id' => $orderId,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'user_id' => Auth::id(),
                    'type' => 'order_service_error'
                ]);
                throw $e;
            }
        });
    }

    /**
     * Accept requested order
     */
    public function accept(int $orderId, int $employeeId): Order
    {
        return DB::transaction(function () use ($orderId, $employeeId) {
            try {
                $order = $this->order->byId($orderId)->firstOrFail();

                if (!in_array($order->status, [Order::STATUS_REQUESTED, Order::STATUS_PENDING_DROPOFF])) {
                    throw new Exception("Order tidak dapat diterima pada status ini.");
                }

                $previousStatus = $order->status;
                $newStatus = $order->status === Order::STATUS_PENDING_DROPOFF
                    ? Order::STATUS_RECEIVED
                    : Order::STATUS_ACCEPTED;

                $order->update([
                    'status' => $newStatus,
                    'employee_id' => $employeeId,
                ]);

                $order->orderItems()->update([
                    'status' => OrderItem::STATUS_PENDING
                ]);

                Log::info('Order accepted successfully', [
                    'order_id' => $orderId,
                    'employee_id' => $employeeId,
                    'user_id' => Auth::id(),
                ]);

                try {
                    $this->waNotificationService->sendStatusChangeNotification(
                        $order,
                        $order->outlet,
                        $newStatus
                    );
                } catch (Exception $e) {
                    Log::warning('Auto WA notification failed in accept', [
                        'order_id' => $order->id,
                        'error' => $e->getMessage(),
                    ]);
                }

                $freshOrder = $order->fresh(['customer', 'customerAccount', 'employee', 'outlet', 'orderItems.laundryService']);

                if ($this->shouldNotifyCustomerOrderAccepted($freshOrder, $previousStatus)) {
                    CustomerOrderAccepted::dispatch($freshOrder);
                    SendCustomerOrderAcceptedFcm::dispatch($freshOrder->id)->afterCommit();
                    SendCourierNewPickupNotification::dispatch($freshOrder->id)->afterCommit();
                }

                return $freshOrder;
            } catch (Exception $e) {
                Log::error('Failed to accept order', [
                    'order_id' => $orderId,
                    'error' => $e->getMessage(),
                ]);
                throw $e;
            }
        });
    }

    private function shouldNotifyCustomerOrderAccepted(Order $order, string $previousStatus): bool
    {
        return $previousStatus === Order::STATUS_REQUESTED
            && $order->status === Order::STATUS_ACCEPTED
            && $order->source === Order::SOURCE_CUSTOMER_APP
            && $order->pickup_schedule !== null
            && $order->customer_account_id !== null
            && $order->outlet_id !== null;
    }

    /**
     * Reject requested order
     */
    public function reject(int $orderId, int $employeeId, ?string $reason = null): Order
    {
        return DB::transaction(function () use ($orderId, $employeeId, $reason) {
            try {
                $order = $this->order->byId($orderId)->firstOrFail();

                if ($order->status !== Order::STATUS_REQUESTED) {
                    throw new Exception("Order tidak dapat ditolak pada status ini.");
                }

                $order->update([
                    'status' => Order::STATUS_CANCELLED,
                    'employee_id' => $employeeId,
                    'internal_notes' => $reason
                ]);

                $order->orderItems()->update([
                    'status' => OrderItem::STATUS_CANCELLED
                ]);

                Log::info('Order rejected successfully', [
                    'order_id' => $orderId,
                    'employee_id' => $employeeId,
                    'reason' => $reason,
                ]);

                return $order->fresh(['customer', 'employee', 'orderItems.laundryService']);
            } catch (Exception $e) {
                Log::error('Failed to reject order', [
                    'order_id' => $orderId,
                    'error' => $e->getMessage(),
                ]);
                throw $e;
            }
        });
    }

    /**
     * Weight order
     */
    public function weight(int $orderId, array $data): Order
    {
        return DB::transaction(function () use ($orderId, $data) {
            try {
                $order = $this->order->byId($orderId)
                    ->with(['customerAccount', 'outlet', 'orderItems.quotaUsageLog'])
                    ->firstOrFail();

                if (!in_array($order->status, [Order::STATUS_RECEIVED, Order::STATUS_READY_TO_PROCESS], true)) {
                    throw ValidationException::withMessages([
                        'order' => 'Order tidak dapat ditimbang pada status ini.',
                    ]);
                }

                if (!empty($data['customerId'])) {
                    $order->customer_id = $data['customerId'];
                }

                $order->employee_id = $data['employeeId'];

                if (array_key_exists('notes', $data)) {
                    $order->notes = $data['notes'];
                }

                if (array_key_exists('internalNotes', $data)) {
                    $order->internal_notes = $data['internalNotes'];
                }

                if (array_key_exists('specialInstructions', $data)) {
                    $order->special_instructions = json_encode($data['specialInstructions']);
                }

                if (isset($data['photo']) && $data['photo']) {
                    $path = $data['photo']->store('orders/weigh_evidence', 'public');
                    $order->internal_notes = ($order->internal_notes ? $order->internal_notes . "\n" : "") . "Weigh evidence: " . $path;
                }

                $services = [];
                foreach ($data['orderItems'] as $index => $itemData) {
                    $laundryService = LaundryService::with(['category', 'unit'])
                        ->byId((int) $itemData['laundryServiceId'])
                        ->first();

                    if (!$laundryService) {
                        throw ValidationException::withMessages([
                            "orderItems.$index.laundryServiceId" => 'Layanan laundry tidak valid.',
                        ]);
                    }

                    if (!$laundryService->is_active) {
                        throw ValidationException::withMessages([
                            "orderItems.$index.laundryServiceId" => "Layanan '{$laundryService->name}' tidak aktif.",
                        ]);
                    }

                    $isOutletService = LaundryService::query()
                        ->byId($laundryService->id)
                        ->byOutletId((int) $order->outlet_id)
                        ->exists();

                    if (!$isOutletService) {
                        throw ValidationException::withMessages([
                            "orderItems.$index.laundryServiceId" => "Layanan '{$laundryService->name}' bukan milik outlet order.",
                        ]);
                    }

                    $quantity = (float) $itemData['quantity'];
                    if ($quantity < (float) $laundryService->min_quantity) {
                        throw ValidationException::withMessages([
                            "orderItems.$index.quantity" => "Jumlah minimal untuk layanan '{$laundryService->name}' adalah {$laundryService->min_quantity}.",
                        ]);
                    }

                    $services[$index] = $laundryService;
                }

                foreach ($order->orderItems as $oldItem) {
                    $subscriptionId = $oldItem->customer_subscription_id ? (int) $oldItem->customer_subscription_id : null;
                    $quotaUsed = $oldItem->quota_used !== null ? (float) $oldItem->quota_used : 0;

                    if (!$subscriptionId || $quotaUsed <= 0) {
                        continue;
                    }

                    $quota = CustomerQuota::query()
                        ->byCustomerSubscriptionId($subscriptionId)
                        ->byLaundryServiceId((int) $oldItem->laundry_service_id)
                        ->lockForUpdate()
                        ->first();

                    if ($quota) {
                        $quota->increment('remaining_quota', $quotaUsed);
                    }

                    QuotaUsageLog::query()->byOrderItemId($oldItem->id)->delete();

                    CustomerSubscription::query()
                        ->byId($subscriptionId)
                        ->where('status', 'exhausted')
                        ->update(['status' => 'active']);
                }

                $order->orderItems()->delete();

                $subtotal = 0;
                $createdItems = [];

                foreach ($data['orderItems'] as $index => $itemData) {
                    $laundryService = $services[$index];
                    $quantity = (float) $itemData['quantity'];
                    $unitPrice = (float) $laundryService->price;
                    $itemSubtotal = $unitPrice * $quantity;
                    $discountAmount = (float) ($itemData['discountAmount'] ?? 0);
                    $totalAmount = $itemSubtotal - $discountAmount;

                    $createdItems[] = $order->orderItems()->create([
                        'laundry_service_id' => $laundryService->id,
                        'category_name' => $laundryService->category?->name,
                        'laundry_service_name' => $laundryService->name,
                        'unit_name' => $laundryService->unit?->name,
                        'quantity' => $quantity,
                        'unit_price' => $unitPrice,
                        'subtotal' => $itemSubtotal,
                        'discount_amount' => $discountAmount,
                        'total_amount' => $totalAmount,
                        'status' => OrderItem::STATUS_PENDING,
                        'is_package_usage' => filter_var($itemData['isPackageUsage'] ?? false, FILTER_VALIDATE_BOOLEAN),
                        'customer_subscription_id' => $itemData['customerSubscriptionId'] ?? null,
                        'quota_used' => $itemData['quotaUsed'] ?? null,
                        'item_notes' => $itemData['itemNotes'] ?? null,
                    ]);

                    $subtotal += $totalAmount;
                }

                foreach ($createdItems as $createdItem) {
                    if (!$createdItem->is_package_usage || !$createdItem->customer_subscription_id) {
                        continue;
                    }

                    $subscriptionId = (int) $createdItem->customer_subscription_id;
                    $laundryServiceId = (int) $createdItem->laundry_service_id;
                    $quotaToDeduct = (float) ($createdItem->quota_used ?? $createdItem->quantity);

                    if ($quotaToDeduct <= 0) {
                        continue;
                    }

                    $quota = CustomerQuota::query()
                        ->byCustomerSubscriptionId($subscriptionId)
                        ->byLaundryServiceId($laundryServiceId)
                        ->lockForUpdate()
                        ->first();

                    if (!$quota) {
                        throw ValidationException::withMessages([
                            'orderItems' => "Quota tidak ditemukan untuk layanan '{$createdItem->laundry_service_name}'.",
                        ]);
                    }

                    if ((float) $quota->remaining_quota < $quotaToDeduct) {
                        throw ValidationException::withMessages([
                            'orderItems' => "Quota tidak cukup untuk layanan '{$createdItem->laundry_service_name}'. Tersedia: {$quota->remaining_quota}, diminta: {$quotaToDeduct}.",
                        ]);
                    }

                    $quota->decrement('remaining_quota', $quotaToDeduct);

                    QuotaUsageLog::create([
                        'customer_subscription_id' => $subscriptionId,
                        'order_item_id' => $createdItem->id,
                        'amount_used' => $quotaToDeduct,
                    ]);

                    $hasAnyRemaining = CustomerQuota::query()
                        ->byCustomerSubscriptionId($subscriptionId)
                        ->where('remaining_quota', '>', 0)
                        ->exists();

                    if (!$hasAnyRemaining) {
                        CustomerSubscription::query()
                            ->byId($subscriptionId)
                            ->update(['status' => 'exhausted']);
                    }
                }

                $finalTotalAmount = $subtotal + (float) $order->pickup_fee + (float) $order->delivery_fee - (float) $order->discount_amount + (float) $order->tax_amount;
                $remainingAmount = max(0, $finalTotalAmount - (float) $order->paid_amount);
                $paymentStatus = $remainingAmount <= 0
                    ? Order::PAYMENT_STATUS_PAID
                    : ((float) $order->paid_amount > 0
                        ? Order::PAYMENT_STATUS_PARTIAL
                        : Order::PAYMENT_STATUS_UNPAID);

                $order->forceFill([
                    'subtotal' => $subtotal,
                    'total_amount' => $finalTotalAmount,
                    'remaining_amount' => $remainingAmount,
                    'status' => Order::STATUS_READY_TO_PROCESS,
                    'payment_status' => $paymentStatus,
                    'last_status_update' => now(),
                ])->saveQuietly();

                if ($order->customerAccount) {
                    if ($order->payment_method === 'cod') {
                        $this->fcmService->sendToCustomer(
                            $order->customerAccount,
                            'Pesanan Sedang Diproses',
                            "Pesanan {$order->order_number} Anda sudah selesai ditimbang dan siap dikerjakan.",
                            [
                                'type' => 'order_priced',
                                'order_id' => (string) $order->id,
                            ]
                        );
                    } else {
                        if ($order->delivery_type === Order::DELIVERY_TYPE_PICKUP) {
                            $message = "Pesanan {$order->order_number} Anda sudah selesai ditimbang. Silakan lakukan pembayaran. Total: Rp " . number_format($finalTotalAmount, 0, ',', '.');
                        } else {
                            $message = "Pesanan {$order->order_number} Anda sudah selesai ditimbang. Silakan lakukan pembayaran untuk menjadwalkan pengantaran. Total: Rp " . number_format($finalTotalAmount, 0, ',', '.');
                        }

                        $this->fcmService->sendToCustomer(
                            $order->customerAccount,
                            'Pesanan Siap Dibayar',
                            $message,
                            [
                                'type' => 'order_priced',
                                'order_id' => (string) $order->id,
                            ]
                        );
                    }
                }

                try {
                    $this->waNotificationService->sendStatusChangeNotification(
                        $order,
                        $order->outlet,
                        Order::STATUS_READY_TO_PROCESS
                    );
                } catch (Exception $e) {
                    Log::warning('Auto WA notification failed in weight', [
                        'order_id' => $order->id,
                        'error' => $e->getMessage(),
                    ]);
                }

                return $order->fresh(['customer', 'employee', 'orderItems.laundryService.category', 'orderItems.laundryService.unit']);
            } catch (Exception $e) {
                Log::error('Failed to weight order', [
                    'order_id' => $orderId,
                    'error' => $e->getMessage(),
                ]);
                throw $e;
            }
        });
    }

    /**
     * Start order processing and create process records
     *
     * @param int $orderId
     * @param int|null $employeeId 
     * @return Order
     * @throws Exception
     */
    public function start(int $orderId, ?int $employeeId = null): Order
    {
        return DB::transaction(function () use ($orderId, $employeeId) {
            try {
                $order = $this->order->byId($orderId)
                    ->with(['orderItems.laundryService.laundryServiceProcesses.process'])
                    ->firstOrFail();

                $allowedStatuses = [Order::STATUS_READY_TO_PROCESS, 'priced']; 
                if (!in_array($order->status, $allowedStatuses)) {
                    throw new Exception("Order hanya dapat dimulai dari status queued (siap dikerjakan). Status saat ini: {$order->status}");
                }

                $order->update([
                    'status' => Order::STATUS_IN_PROGRESS,
                ]);

                foreach ($order->orderItems as $orderItem) {
                    $orderItem->update(['status' => OrderItem::STATUS_PENDING]);

                    $laundryService = $orderItem->laundryService;

                    if (!$laundryService) {
                        Log::warning('Order item has no laundry service', [
                            'order_item_id' => $orderItem->id,
                            'order_id' => $orderId,
                        ]);
                        continue;
                    }

                    $serviceProcesses = $laundryService->laundryServiceProcesses()
                        ->with('process')
                        ->orderBy('sequence', 'asc')
                        ->get();

                    if ($serviceProcesses->isEmpty()) {
                        Log::warning('Laundry service has no processes defined', [
                            'laundry_service_id' => $laundryService->id,
                            'laundry_service_name' => $laundryService->name,
                            'order_item_id' => $orderItem->id,
                        ]);
                        continue;
                    }

                    foreach ($serviceProcesses as $serviceProcess) {
                        OrderItemProcess::create([
                            'order_item_id' => $orderItem->id,
                            'laundry_service_process_id' => $serviceProcess->id,
                            'employee_id' => null,
                            'qty_processed' => 0,
                            'started_at' => null,
                            'completed_at' => null,
                            'evidence_attachment' => null,
                        ]);
                    }

                    Log::info('Created process records for order item', [
                        'order_item_id' => $orderItem->id,
                        'laundry_service_id' => $laundryService->id,
                        'processes_count' => $serviceProcesses->count(),
                    ]);
                }

                Log::info('Order started successfully', [
                    'order_id' => $orderId,
                    'order_number' => $order->order_number,
                    'employee_id' => $employeeId,
                    'items_count' => $order->orderItems->count(),
                    'user_id' => Auth::id(),
                    'type' => 'order_management'
                ]);

                try {
                    $this->waNotificationService->sendStatusChangeNotification(
                        $order,
                        $order->outlet,
                        Order::STATUS_IN_PROGRESS
                    );
                } catch (Exception $e) {
                    Log::warning('Auto WA notification failed in start', [
                        'order_id' => $order->id,
                        'error' => $e->getMessage(),
                    ]);
                }

                return $order->fresh([
                    'customer',
                    'employee',
                    'orderItems.laundryService',
                    'orderItems.orderItemProcesses.laundryServiceProcess.process'
                ]);
            } catch (Exception $e) {
                Log::error('Failed to start order', [
                    'order_id' => $orderId,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'user_id' => Auth::id(),
                    'type' => 'order_service_error'
                ]);
                throw $e;
            }
        });
    }
    /**
     * Complete order with status validation and special handling for pending status
     *
     * @param int $orderId
     * @return Order
     * @throws Exception
     */
    public function complete(int $orderId): Order
    {
        return DB::transaction(function () use ($orderId) {
            try {
                $order = $this->order->findOrFail($orderId);

                $order->load(['orderItems.orderItemProcesses', 'orderItems.laundryService']);

                if ($order->status === Order::STATUS_READY_TO_PROCESS) {
                    foreach ($order->orderItems as $orderItem) {
                        $orderItem->update([
                            'status' => OrderItem::STATUS_DONE,
                        ]);

                        if ($orderItem->orderItemProcesses->isEmpty()) {
                            $laundryService = $orderItem->laundryService;
                            if ($laundryService) {
                                $serviceProcesses = $laundryService->laundryServiceProcesses()
                                    ->with('process')
                                    ->orderBy('sequence', 'asc')
                                    ->get();

                                foreach ($serviceProcesses as $serviceProcess) {
                                    OrderItemProcess::create([
                                        'order_item_id' => $orderItem->id,
                                        'laundry_service_process_id' => $serviceProcess->id,
                                        'employee_id' => null,
                                        'qty_processed' => 0,
                                        'started_at' => null,
                                        'completed_at' => null,
                                        'evidence_attachment' => null,
                                    ]);
                                }
                            }
                        }
                    }

                    $order->update([
                        'status' => Order::STATUS_READY,
                        'actual_completion' => now()
                    ]);
                } elseif (in_array($order->status, [Order::STATUS_IN_PROGRESS, 'processing', Order::STATUS_READY])) {
                    $itemsNotDone = $order->orderItems()->where('status', '!=', OrderItem::STATUS_DONE)->count();

                    if ($itemsNotDone > 0) {
                        throw new Exception("Seluruh item harus diselesaikan terlebih dahulu (Status: Selesai) sebelum order dapat diselesaikan.");
                    }

                    $order->update([
                        'status' => Order::STATUS_READY,
                        'actual_completion' => now()
                    ]);
                } else {
                    throw new Exception("Order dengan status '{$order->getStatusLabel()}' tidak dapat diselesaikan.");
                }

                Log::info('Order completed successfully', [
                    'order_id' => $orderId,
                    'order_number' => $order->order_number,
                    'user_id' => Auth::id(),
                    'type' => 'order_management'
                ]);

                try {
                    $this->waNotificationService->sendStatusChangeNotification(
                        $order,
                        $order->outlet,
                        Order::STATUS_READY
                    );
                } catch (Exception $e) {
                    Log::warning('Auto WA notification failed in complete', [
                        'order_id' => $order->id,
                        'error' => $e->getMessage(),
                    ]);
                }

                return $order->fresh([
                    'customer',
                    'employee',
                    'orderItems.laundryService',
                    'orderItems.orderItemProcesses.laundryServiceProcess.process'
                ]);
            } catch (Exception $e) {
                Log::error('Failed to complete order', [
                    'order_id' => $orderId,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'user_id' => Auth::id(),
                    'type' => 'order_service_error'
                ]);
                throw $e;
            }
        });
    }


    public function pay(int $orderId, string $paymentMethod): array
    {
        return DB::transaction(function () use ($orderId, $paymentMethod) {
            $order = $this->order->with('customer')->findOrFail($orderId);

            if ($order->status !== Order::STATUS_READY_TO_PROCESS) {
                throw new Exception("Pembayaran hanya dapat dilakukan jika pesanan sudah dihitung harganya (Status: Dihitung).");
            }

            if ($paymentMethod === 'cod') {
                $order->update([
                    'status' => Order::STATUS_READY_TO_PROCESS,
                    'payment_method' => 'cod',
                    'payment_status' => Order::PAYMENT_STATUS_UNPAID,
                ]);

                Log::info('Order confirmed with COD', ['order_id' => $order->id]);

                return [
                    'status' => 'success',
                    'message' => 'Pesanan dikonfirmasi dengan metode COD.',
                    'order' => $order->fresh(['customer', 'orderItems.laundryService']),
                ];
            }

            $midtrans = app(MidtransService::class);
            $payload = [
                'payment_type' => $paymentMethod,
                'transaction_details' => [
                    'order_id' => $order->order_number . '-' . time(),
                    'gross_amount' => (int) $order->total_amount,
                ],
                'customer_details' => [
                    'first_name' => $order->customer->name,
                    'phone' => $order->customer->phone,
                ],
            ];

            $response = $midtrans->charge($payload);

            $order->update([
                'payment_method' => $paymentMethod,
                'midtrans_order_id' => $response['order_id'],
                'midtrans_transaction_id' => $response['transaction_id'] ?? null,
                'qr_url' => $response['qr_url'] ?? null,
                'payment_status' => Order::PAYMENT_STATUS_UNPAID,
            ]);

            Log::info('Midtrans payment intent created', [
                'order_id' => $order->id,
                'midtrans_order_id' => $response['order_id']
            ]);

            return [
                'status' => 'success',
                'message' => 'Instruksi pembayaran berhasil dibuat.',
                'payment_data' => $response,
                'order' => $order->fresh(['customer', 'orderItems.laundryService']),
            ];
        });
    }

    public function handlePaymentWebhook(string $midtransOrderId, string $midtransStatus): bool
    {
        return DB::transaction(function () use ($midtransOrderId, $midtransStatus) {
            $order = $this->order->byMidtransOrderId($midtransOrderId)->first();

            if (!$order) {
                return false;
            }

            $statusMap = [
                'settlement' => ['status' => Order::STATUS_READY_TO_PROCESS, 'payment' => Order::PAYMENT_STATUS_PAID],
                'capture'    => ['status' => Order::STATUS_READY_TO_PROCESS, 'payment' => Order::PAYMENT_STATUS_PAID],
                'pending'    => ['status' => $order->status,        'payment' => Order::PAYMENT_STATUS_UNPAID],
                'expire'     => ['status' => Order::STATUS_CANCELLED, 'payment' => Order::PAYMENT_STATUS_UNPAID],
                'cancel'     => ['status' => Order::STATUS_CANCELLED, 'payment' => Order::PAYMENT_STATUS_UNPAID],
                'deny'       => ['status' => Order::STATUS_CANCELLED, 'payment' => Order::PAYMENT_STATUS_UNPAID],
            ];

            $mapped = $statusMap[$midtransStatus] ?? null;
            if (!$mapped) return false;

            if ($mapped['payment'] === Order::PAYMENT_STATUS_PAID && $order->payment_status !== Order::PAYMENT_STATUS_PAID) {
                $order->update(['paid_amount' => $order->total_amount, 'remaining_amount' => 0]);

                if ($order->payment_method === 'transfer') {
                    $owner = $order->outlet?->owner;
                    if ($owner) {
                        app(\App\Services\WalletBalanceService::class)->creditFromOrder(
                            $owner,
                            $order,
                            \App\Models\WalletTransaction::TYPE_ORDER_TRANSFER_INCOME
                        );
                    }
                }
            }

            return $order->update([
                'status'         => $mapped['status'],
                'payment_status' => $mapped['payment'],
            ]);
        });
    }

    /**
     * Start order pickup by courier
     */
    public function pickup(int $orderId, int $employeeId): Order
    {
        return DB::transaction(function () use ($orderId, $employeeId) {
            $order = $this->order->findOrFail($orderId);

            if ($order->status !== Order::STATUS_ACCEPTED) {
                throw new Exception("Order cannot be picked up from current status: {$order->status}");
            }

            $order->update([
                'status' => Order::STATUS_PICKING_UP,
                'employee_id' => $employeeId,
                'updated_by' => $employeeId,
            ]);

            Log::info('Order pickup started by courier', [
                'order_id' => $orderId,
                'employee_id' => $employeeId,
            ]);

            return $order->fresh(['customer', 'employee', 'orderItems']);
        });
    }

    /**
     * Confirm order pickup
     */
    public function confirmPickup(int $orderId, $photo): Order
    {
        return DB::transaction(function () use ($orderId, $photo) {
            $order = $this->order->findOrFail($orderId);

            if ($order->status !== Order::STATUS_PICKING_UP) {
                throw new Exception("Order pickup cannot be confirmed from current status: {$order->status}");
            }

            $path = $photo->store('orders/pickup_evidence', 'public');

            $order->update([
                'status' => Order::STATUS_PICKED_UP,
                'internal_notes' => ($order->internal_notes ? $order->internal_notes . "\n" : "") . "Pickup evidence: " . $path,
            ]);

            Log::info('Order pickup confirmed by courier', [
                'order_id' => $orderId,
                'photo_path' => $path,
            ]);

            return $order->fresh(['customer', 'employee', 'orderItems']);
        });
    }

    /**
     * Confirm picked up order has arrived at outlet
     */
    public function confirmArrived(int $orderId, $photo = null): Order
    {
        return DB::transaction(function () use ($orderId, $photo) {
            $order = $this->order->findOrFail($orderId);

            if ($order->status !== Order::STATUS_PICKED_UP) {
                throw new Exception("Order arrival cannot be confirmed from current status: {$order->status}");
            }

            $notes = $order->internal_notes ?: '';
            $photoPath = null;

            if ($photo) {
                $photoPath = $photo->store('orders/arrival_evidence', 'public');
                $notes = ($notes ? $notes . "\n" : "") . "Arrival evidence: " . $photoPath;
            }

            $order->update([
                'status' => Order::STATUS_RECEIVED,
                'internal_notes' => $notes ?: $order->internal_notes,
            ]);

            Log::info('Order arrival confirmed at outlet by courier', [
                'order_id' => $orderId,
                'photo_path' => $photoPath,
            ]);

            return $order->fresh(['customer', 'employee', 'orderItems']);
        });
    }

    /**
     * Start delivery by courier
     */
    public function startDelivery(int $orderId, int $employeeId): Order
    {
        return DB::transaction(function () use ($orderId, $employeeId) {
            $order = $this->order->findOrFail($orderId);

            if ($order->status !== Order::STATUS_READY_TO_PROCESS) {
                throw new Exception("Order tidak dapat diantar dari status saat ini: {$order->status}");
            }

            $order->update([
                'status' => Order::STATUS_DELIVERING,
                'updated_by' => $employeeId,
            ]);

            try {
                $this->waNotificationService->sendStatusChangeNotification(
                    $order,
                    $order->outlet,
                    Order::STATUS_DELIVERING
                );
            } catch (Exception $e) {
                Log::warning('Auto WA notification failed in startDelivery', [
                    'order_id' => $order->id,
                    'error' => $e->getMessage(),
                ]);
            }

            return $order->fresh(['customer', 'employee', 'orderItems']);
        });
    }

    /**
     * Finish delivery by courier 
     */
    public function finishDelivery(int $orderId, int $employeeId): Order
    {
        return DB::transaction(function () use ($orderId, $employeeId) {
            $order = $this->order->findOrFail($orderId);

            if ($order->status !== Order::STATUS_DELIVERING) {
                throw new Exception("Status pengantaran tidak dapat diselesaikan dari status saat ini: {$order->status}");
            }

            $order->update([
                'status' => Order::STATUS_DELIVERED,
                'updated_by' => $employeeId,
            ]);

            try {
                $this->waNotificationService->sendStatusChangeNotification(
                    $order,
                    $order->outlet,
                    Order::STATUS_DELIVERED
                );
            } catch (Exception $e) {
                Log::warning('Auto WA notification failed in finishDelivery', [
                    'order_id' => $order->id,
                    'error' => $e->getMessage(),
                ]);
            }

            return $order->fresh(['customer', 'employee', 'orderItems']);
        });
    }

    /**
     * Mark order as completed by user 
     */
    public function userComplete(int $orderId): Order
    {
        return DB::transaction(function () use ($orderId) {
            $order = $this->order->findOrFail($orderId);

            if ($order->status !== Order::STATUS_DELIVERED) {
                throw new Exception("Pesanan tidak dapat ditandai selesai karena belum terkirim.");
            }

            $order->update([
                'status' => Order::STATUS_COMPLETED,
            ]);

            Log::info('Order marked as completed by customer', [
                'order_id' => $orderId,
            ]);

            return $order->fresh(['customer', 'employee', 'orderItems']);
        });
    }

    /**
     * Mark a COD order as paid
     */
    public function markCodPaid(int $orderId, int $employeeId): Order
    {
        return DB::transaction(function () use ($orderId, $employeeId) {
            try {
                $order = $this->order->findOrFail($orderId);

                if ($order->payment_method !== 'cod') {
                    throw new Exception("Metode pembayaran order ini bukan COD.");
                }

                if ($order->payment_status === Order::PAYMENT_STATUS_PAID) {
                    throw new Exception("Order ini sudah lunas.");
                }

                $totalAmount = (float) $order->total_amount;

                $order->update([
                    'payment_status' => Order::PAYMENT_STATUS_PAID,
                    'paid_amount' => $totalAmount,
                    'remaining_amount' => 0,
                    'updated_by' => $employeeId,
                ]);

                $this->accountingService->recordOrderPayment(
                    $order,
                    $order->outlet?->owner_id ?? 1,
                    $order->outlet_id,
                    Order::PAYMENT_STATUS_PAID,
                    'cash',
                    null,
                    $totalAmount,
                    $totalAmount,
                    0
                );

                Log::info('Order COD marked as paid', [
                    'order_id' => $orderId,
                    'order_number' => $order->order_number,
                    'employee_id' => $employeeId,
                    'amount' => $totalAmount,
                    'user_id' => Auth::id(),
                    'type' => 'order_management'
                ]);

                return $order->fresh(['customer', 'employee', 'orderItems']);
            } catch (Exception $e) {
                Log::error('Failed to mark COD as paid', [
                    'order_id' => $orderId,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'user_id' => Auth::id(),
                    'type' => 'order_service_error'
                ]);
                throw $e;
            }
        });
    }

    /**
     * Apply filters to query
     */
    /*
    |--------------------------------------------------------------------------
    | Private — Filters
    |--------------------------------------------------------------------------
    */

    private function applyFilters(Builder &$query, array $filters = []): void
    {
        if (!empty($filters['search'])) {
            $query->search($filters['search']);
        }

        if (!empty($filters['orderNumber'])) {
            $query->byOrderNumber($filters['orderNumber']);
        }

        if (!empty($filters['customerId'])) {
            $query->byCustomerId($filters['customerId']);
        }

        if (!empty($filters['customerAccountId'])) {
            $query->byCustomerAccountId($filters['customerAccountId']);
        }

        if (!empty($filters['employeeId'])) {
            $query->byEmployeeId($filters['employeeId']);
        }

        if (!empty($filters['outletId'])) {
            $query->byOutletId($filters['outletId']);
        }

        if (!empty($filters['outletIds'])) {
            $query->byOutletIds($filters['outletIds']);
        }

        if (!empty($filters['status'])) {
            $query->status($filters['status']);
        }

        if (!empty($filters['paymentStatus'])) {
            $query->byPaymentStatus($filters['paymentStatus']);
        }

        if (isset($filters['minTotalAmount'])) {
            $query->minTotalAmount($filters['minTotalAmount']);
        }

        if (isset($filters['maxTotalAmount'])) {
            $query->maxTotalAmount($filters['maxTotalAmount']);
        }

        if (isset($filters['minPaidAmount'])) {
            $query->minPaidAmount($filters['minPaidAmount']);
        }

        if (isset($filters['maxPaidAmount'])) {
            $query->maxPaidAmount($filters['maxPaidAmount']);
        }

        if (isset($filters['minRemainingAmount'])) {
            $query->minRemainingAmount($filters['minRemainingAmount']);
        }

        if (isset($filters['maxRemainingAmount'])) {
            $query->maxRemainingAmount($filters['maxRemainingAmount']);
        }

        if (!empty($filters['orderDateFrom'])) {
            $query->orderDateFrom(Carbon::parse($filters['orderDateFrom']));
        }

        if (!empty($filters['orderDateTo'])) {
            $query->orderDateTo(Carbon::parse($filters['orderDateTo']));
        }

        if (!empty($filters['pickupDateFrom'])) {
            $query->pickupDateFrom(Carbon::parse($filters['pickupDateFrom']));
        }

        if (!empty($filters['pickupDateTo'])) {
            $query->pickupDateTo(Carbon::parse($filters['pickupDateTo']));
        }

        if (!empty($filters['pickupScheduleFrom'])) {
            $query->pickupScheduleFrom(Carbon::parse($filters['pickupScheduleFrom']));
        }

        if (!empty($filters['pickupScheduleTo'])) {
            $query->pickupScheduleTo(Carbon::parse($filters['pickupScheduleTo']));
        }

        if (!empty($filters['forCourierPickupDate'])) {
            $query->forCourierPickupDate(Carbon::parse($filters['forCourierPickupDate']));
        }

        if (!empty($filters['startDate']) && !empty($filters['endDate'])) {
            $query->orderDateFrom(Carbon::parse($filters['startDate']))
                ->orderDateTo(Carbon::parse($filters['endDate']));
        } elseif (!empty($filters['startDate'])) {
            $query->orderDateFrom(Carbon::parse($filters['startDate']));
        } elseif (!empty($filters['endDate'])) {
            $query->orderDateTo(Carbon::parse($filters['endDate']));
        }

        $sortBy = $filters['sortBy'] ?? 'orderDate';
        $sortDirection = $filters['sortDirection'] ?? 'desc';
        $query->sortBy($sortBy, $sortDirection);
    }



    /**
     * Generate unique order number
     */
    protected function generateOrderNumber(int $customerId): string
    {
        $prefix = 'ORD';
        $date = Carbon::now()->format('Ymd');
        $outletCode = str_pad($customerId, 3, '0', STR_PAD_LEFT);
        $lastOrder = $this->order
            ->byCustomerId($customerId)
            ->whereDate('created_at', Carbon::today())
            ->orderBy('id', 'desc')
            ->first();

        $sequence = $lastOrder ? (int) substr($lastOrder->order_number, -4) + 1 : 1;
        $sequenceStr = str_pad($sequence, 4, '0', STR_PAD_LEFT);

        return "{$prefix}{$date}{$outletCode}{$sequenceStr}";
    }

    /**
     * Calculate estimated completion based on max duration
     */
    protected function calculateEstimatedCompletion(array $orderItemsData): CarbonInterface
    {
        $maxDuration = 0;

        foreach ($orderItemsData as $orderItem) {
            $laundryService = LaundryService::find($orderItem['laundryServiceId']);
            if ($laundryService && $laundryService->duration_hours > $maxDuration) {
                $maxDuration = $laundryService->duration_hours;
            }
        }

        return Carbon::now()->addHours($maxDuration ?: 24);
    }
}
