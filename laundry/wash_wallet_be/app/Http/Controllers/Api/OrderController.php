<?php

namespace App\Http\Controllers\Api;

use App\Helpers\PaginationHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\Order\StoreCustomerOrderRequest;
use App\Http\Requests\Order\StoreOrderRequest;
use App\Http\Requests\Order\UpdateOrderRequest;
use App\Http\Requests\Order\WeightOrderRequest;
use App\Http\Requests\Order\AcceptOrderRequest;
use App\Http\Requests\Order\ConfirmArrivedRequest;
use App\Http\Requests\Order\ConfirmPickupRequest;
use App\Http\Requests\Order\PickupOrderRequest;
use App\Http\Requests\Order\RejectOrderRequest;
use App\Http\Requests\Order\ScheduleDeliveryRequest;
use App\Http\Requests\Order\StartOrderRequest;
use App\Http\Requests\OrderReview\StoreOrderReviewRequest;
use App\Http\Resources\Order\OrderResource;
use App\Http\Resources\OrderReview\OrderReviewResource;
use App\Models\CustomerAccount;
use App\Models\Order;
use App\Services\OrderService;
use App\Services\CustomerOrderService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

use Illuminate\Routing\Attributes\Controllers\Middleware;

#[Middleware('auth:sanctum,customer_sanctum', only: [
    'index',
    'show',
    'store',
    'storeByCustomer',
    'update',
    'destroy',
    'start',
    'complete',
    'userComplete',
    'accept',
    'reject',
    'weight',
    'pickup',
    'confirmPickup',
    'confirmArrived',
    'markCodPaid',
    'cancel',
    'pay',
    'scheduleDelivery',
    'review',
    'newCount'
])]
class OrderController extends Controller
{
    public function __construct(
        private readonly OrderService $orderService,
        private readonly CustomerOrderService $customerOrderService,
    ) {}

    /**
     * Get all orders with filters
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $this->getFiltersFromRequest($request);

            $orders = $this->orderService->getAll(
                $filters,
                $filters['page'],
                $filters['perPage'],
                ['customer', 'employee', 'outlet', 'customerAddress', 'orderItems']
            );

            return $this->successResponse(
                OrderResource::collection($orders)->resolve(),
                'Order list retrieved successfully',
                200,
                PaginationHelper::format($orders, $request)
            );
        } catch (Throwable $e) {
            Log::error('[OrderController] Failed to retrieve orders', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'order',
            ]);

            return $this->errorResponse('Gagal memuat data order', 500, $e);
        }
    }

    /**
     * Get single order by ID
     */
    public function show(int $id): JsonResponse
    {
        try {
            if (Auth::guard('customer_sanctum')->check()) {
                /** @var CustomerAccount $account */
                $account = Auth::guard('customer_sanctum')->user();
                $order = $this->customerOrderService->getById($account, $id);
            } else {
                $order = $this->orderService->getById(
                    $id,
                    [
                        'customer',
                        'employee',
                        'outlet',
                        'customerAddress',
                        'orderItems.laundryService',
                    ]
                );
            }

            return $this->successResponse(
                new OrderResource($order),
                'Order retrieved successfully'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[OrderController] Failed to retrieve order', [
                'error'    => $e->getMessage(),
                'user_id'  => Auth::id(),
                'type'     => 'order',
                'order_id' => $id,
            ]);

            return $this->errorResponse('Gagal memuat data order', 500, $e);
        }
    }

    public function newCount(Request $request): JsonResponse
    {
        $employee = $request->user();
        $outletId = $request->header('X-Outlet-ID')
            ?? $request->input('outlet_id')
            ?? $request->input('outletId')
            ?? $employee?->outlet_id;

        if ($outletId === null || !is_numeric($outletId)) {
            return $this->errorResponse('Outlet context is required.', 422);
        }

        $outletId = (int) $outletId;

        if (!$employee || !$employee->hasPermissionOnOutlet('order.view', $outletId)) {
            return $this->errorResponse('Employee does not have permission to access this outlet.', 403);
        }

        $count = Order::query()
            ->where('outlet_id', $outletId)
            ->where('source', Order::SOURCE_CUSTOMER_APP)
            ->whereIn('status', [
                Order::STATUS_REQUESTED,
                Order::STATUS_PENDING_DROPOFF,
            ])
            ->count();

        return $this->successResponse(['count' => $count], 'Success');
    }

    /**
     * Create new order
     */
    public function store(StoreOrderRequest $request): JsonResponse
    {
        DB::beginTransaction();

        try {
            $order = $this->orderService->store($request->validated());

            DB::commit();

            return $this->successResponse(
                new OrderResource($order),
                'Order created successfully',
                201
            );
        } catch (ModelNotFoundException $e) {
            DB::rollBack();

            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            DB::rollBack();

            Log::error('[OrderController] Failed to create order', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'order',
            ]);

            return $this->errorResponse('Gagal membuat order', 500, $e);
        }
    }

    public function storeByCustomer(StoreCustomerOrderRequest $request): JsonResponse
    {
        DB::beginTransaction();

        try {
            $order = $this->orderService->storeCustomer($request->validated());

            DB::commit();

            return $this->successResponse(
                new OrderResource($order),
                'Order created successfully',
                201
            );
        } catch (ModelNotFoundException $e) {
            DB::rollBack();

            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            DB::rollBack();

            Log::error('[OrderController] Failed to create order by customer', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'order',
            ]);

            return $this->errorResponse('Gagal membuat order', 500, $e);
        }
    }

    /**
     * Update existing order
     */
    public function update(UpdateOrderRequest $request, int $orderId): JsonResponse
    {
        DB::beginTransaction();

        try {
            $order = $this->orderService->update($orderId, $request->validated());

            DB::commit();

            return $this->successResponse(
                new OrderResource($order),
                'Order updated successfully'
            );
        } catch (ModelNotFoundException $e) {
            DB::rollBack();

            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            DB::rollBack();

            Log::error('[OrderController] Failed to update order', [
                'error'    => $e->getMessage(),
                'user_id'  => Auth::id(),
                'type'     => 'order',
                'order_id' => $orderId,
            ]);

            return $this->errorResponse('Gagal memperbarui order', 500, $e);
        }
    }

    /**
     * Delete order
     */
    public function destroy(int $orderId): JsonResponse
    {
        DB::beginTransaction();

        try {
            $deleted = $this->orderService->destroy($orderId);

            DB::commit();

            return $this->successResponse(
                ['deleted' => $deleted],
                'Order deleted successfully'
            );
        } catch (ModelNotFoundException $e) {
            DB::rollBack();

            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            DB::rollBack();

            Log::error('[OrderController] Failed to delete order', [
                'error'    => $e->getMessage(),
                'user_id'  => Auth::id(),
                'type'     => 'order',
                'order_id' => $orderId,
            ]);

            return $this->errorResponse('Gagal menghapus order', 500, $e);
        }
    }

    /**
     * Cancel order
     */
    public function cancel(int $id): JsonResponse
    {
        DB::beginTransaction();

        try {
            $order = $this->orderService->cancel($id);

            DB::commit();

            return $this->successResponse(
                new OrderResource($order),
                'Order berhasil dibatalkan'
            );
        } catch (ModelNotFoundException $e) {
            DB::rollBack();

            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            DB::rollBack();

            Log::error('[OrderController] Failed to cancel order', [
                'error'    => $e->getMessage(),
                'user_id'  => Auth::id(),
                'type'     => 'order',
                'order_id' => $id,
            ]);

            return $this->errorResponse($e->getMessage(), 500, $e);
        }
    }

    /**
     * Start order processing
     */
    public function start(StartOrderRequest $request, int $id): JsonResponse
    {
        try {
            $validated = $request->validated();

            $order = $this->orderService->start(
                $id,
                $validated['employeeId'] ?? null
            );

            return $this->successResponse(
                new OrderResource($order),
                'Order berhasil dimulai'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[OrderController] Failed to start order', [
                'error'    => $e->getMessage(),
                'user_id'  => Auth::id(),
                'type'     => 'order',
                'order_id' => $id,
            ]);

            return $this->errorResponse('Gagal memulai order', 500, $e);
        }
    }

    /**
     * Complete order
     */
    public function complete(int $id): JsonResponse
    {
        try {
            $order = $this->orderService->complete($id);

            return $this->successResponse(
                new OrderResource($order),
                'Order berhasil diselesaikan'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[OrderController] Failed to complete order', [
                'error'    => $e->getMessage(),
                'user_id'  => Auth::id(),
                'type'     => 'order',
                'order_id' => $id,
            ]);

            return $this->errorResponse($e->getMessage(), 500, $e);
        }
    }

    /**
     * User complete order (delivered -> completed)
     */
    public function userComplete(int $id): JsonResponse
    {
        try {
            $order = $this->orderService->userComplete($id);

            return $this->successResponse(
                new OrderResource($order),
                'Pesanan telah diselesaikan. Terima kasih!'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[OrderController] Failed to user complete order', [
                'error'    => $e->getMessage(),
                'user_id'  => Auth::id(),
                'type'     => 'order',
                'order_id' => $id,
            ]);

            return $this->errorResponse($e->getMessage(), 500, $e);
        }
    }

    /**
     * Accept requested order
     */
    public function accept(AcceptOrderRequest $request, int $id): JsonResponse
    {
        try {
            $employeeId = $request->validated()['employeeId'] ?? Auth::id();
            $order = $this->orderService->accept($id, $employeeId);

            return $this->successResponse(
                new OrderResource($order),
                'Order berhasil diterima'
            );
        } catch (Throwable $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    /**
     * Reject requested order
     */
    public function reject(RejectOrderRequest $request, int $id): JsonResponse
    {
        try {
            $validated = $request->validated();
            $employeeId = $validated['employeeId'] ?? Auth::id();
            $reason = $validated['reason'] ?? null;
            $order = $this->orderService->reject($id, $employeeId, $reason);

            return $this->successResponse(
                new OrderResource($order),
                'Order berhasil ditolak'
            );
        } catch (Throwable $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    /**
     * Weigh and price an accepted order
     */
    public function weight(WeightOrderRequest $request, int $id): JsonResponse
    {
        try {
            $data = $request->all();
            if ($request->hasFile('photo')) {
                $data['photo'] = $request->file('photo');
            }
            $order = $this->orderService->weight($id, $data);

            return $this->successResponse(
                new OrderResource($order),
                'Order berhasil ditimbang dan diberi harga'
            );
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors(),
            ], 422);
        } catch (Throwable $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    /**
     * Start order pickup by courier
     */
    public function pickup(PickupOrderRequest $request, int $id): JsonResponse
    {
        try {
            $employeeId = $request->validated()['employeeId'] ?? Auth::id();
            $order = $this->orderService->pickup($id, $employeeId);

            return $this->successResponse(
                new OrderResource($order),
                'Penjemputan dimulai'
            );
        } catch (Throwable $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    /**
     * Store a new order review.
     */
    public function review(StoreOrderReviewRequest $request, int $orderId)
    {
        $orderReview = $this->orderService->review($orderId, $request->validated());

        return $this->successResponse(
            (new OrderReviewResource($orderReview))->resolve(),
            'Ulasan berhasil dikirim.',
            201
        );
    }


    /**
     * Confirm order pickup with photo evidence
     */
    public function confirmPickup(ConfirmPickupRequest $request, int $id): JsonResponse
    {
        try {

            $order = $this->orderService->confirmPickup($id, $request->file('photo'));

            return $this->successResponse(
                new OrderResource($order),
                'Pengambilan cucian dikonfirmasi'
            );
        } catch (Throwable $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    /**
     * Confirm picked up order has arrived at outlet
     */
    public function confirmArrived(ConfirmArrivedRequest $request, int $id): JsonResponse
    {
        try {
            $order = $this->orderService->confirmArrived($id, $request->file('photo'));

            return $this->successResponse(
                new OrderResource($order),
                'Kedatangan cucian di outlet dikonfirmasi'
            );
        } catch (Throwable $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    public function markCodPaid(int $id): JsonResponse
    {
        try {
            $employeeId = Auth::id();
            $order = $this->orderService->markCodPaid($id, $employeeId);

            return $this->successResponse(
                new OrderResource($order),
                'Pembayaran COD berhasil dikonfirmasi'
            );
        } catch (Throwable $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    public function pay(Request $request, int $id): JsonResponse
    {
        try {
            /** @var CustomerAccount $account */
            $account = Auth::user();
            $order = $this->customerOrderService->getById($account, $id);

            $paymentMethod = $request->input('paymentMethod')
                ?? $request->input('payment_method')
                ?? $order->payment_method
                ?? 'wallet_balance';

            if (!in_array($paymentMethod, ['cod', 'transfer', 'wallet_balance'])) {
                return $this->errorResponse('Invalid payment method', 400);
            }

            if ($paymentMethod === 'wallet_balance') {
                $order = $this->customerOrderService->pay($account, $id);
            } else {
                $result = $this->orderService->pay($id, $paymentMethod);
                $order = $result['order'];
            }

            return $this->successResponse(
                new OrderResource($order),
                'Pembayaran berhasil dikonfirmasi'
            );
        } catch (Throwable $e) {
            return $this->errorResponse($e->getMessage(), 500, $e);
        }
    }

    public function scheduleDelivery(ScheduleDeliveryRequest $request, int $id): JsonResponse
    {
        try {
            $validated = $request->validated();

            /** @var CustomerAccount $account */
            $account = Auth::user();
            $order = $this->customerOrderService->scheduleDelivery($account, $id, $validated);

            return $this->successResponse(
                new OrderResource($order),
                'Jadwal pengiriman berhasil disimpan'
            );
        } catch (Throwable $e) {
            return $this->errorResponse($e->getMessage(), 500, $e);
        }
    }

    private function getFiltersFromRequest(Request $request): array
    {
        return [
            'search'                  => $request->string('search')->toString(),
            'status'                  => $request->string('status')->toString(),
            'paymentStatus'           => $request->string('paymentStatus')->toString(),
            'outletId'                => $request->has('outletId') && $request->filled('outletId')
                ? $request->integer('outletId')
                : null,
            'outletIds'               => $request->has('outletIds') && $request->filled('outletIds')
                ? $this->parseOutletIds($request->input('outletIds'))
                : null,
            'customerId'              => $request->has('customerId') && $request->filled('customerId')
                ? $request->integer('customerId')
                : null,
            'customerAccountId'       => $request->has('customerAccountId') && $request->filled('customerAccountId')
                ? $request->integer('customerAccountId')
                : null,
            'employeeId'              => $request->has('employeeId') && $request->filled('employeeId')
                ? $request->integer('employeeId')
                : null,
            'orderDateFrom'           => $request->has('orderDate.from') && $request->filled('orderDate.from')
                ? $request->date('orderDate.from')->format('Y-m-d')
                : null,
            'orderDateTo'             => $request->has('orderDate.to') && $request->filled('orderDate.to')
                ? $request->date('orderDate.to')->format('Y-m-d')
                : null,
            'estimatedCompletionFrom' => $request->has('estimatedCompletion.from') && $request->filled('estimatedCompletion.from')
                ? $request->date('estimatedCompletion.from')->format('Y-m-d')
                : null,
            'estimatedCompletionTo'   => $request->has('estimatedCompletion.to') && $request->filled('estimatedCompletion.to')
                ? $request->date('estimatedCompletion.to')->format('Y-m-d')
                : null,
            'pickupScheduleFrom'      => $request->has('pickupSchedule.from') && $request->filled('pickupSchedule.from')
                ? $request->date('pickupSchedule.from')->format('Y-m-d H:i:s')
                : null,
            'pickupScheduleTo'        => $request->has('pickupSchedule.to') && $request->filled('pickupSchedule.to')
                ? $request->date('pickupSchedule.to')->format('Y-m-d H:i:s')
                : null,
            'forCourierPickupDate'    => $request->has('forCourierPickupDate') && $request->filled('forCourierPickupDate')
                ? $request->string('forCourierPickupDate')->toString()
                : null,
            'totalAmountMin'          => $request->has('totalAmount.min') && $request->filled('totalAmount.min')
                ? $request->float('totalAmount.min')
                : null,
            'totalAmountMax'          => $request->has('totalAmount.max') && $request->filled('totalAmount.max')
                ? $request->float('totalAmount.max')
                : null,
            'sortBy'                  => $request->string('sortBy', 'order_date')->toString(),
            'sortDirection'           => $request->string('sortDirection', 'desc')->toString(),
            'page'                    => $request->integer('page', 1),
            'perPage'                 => $request->integer('perPage', 15),
        ];
    }

    private function parseOutletIds(mixed $outletIds): ?array
    {
        if (is_array($outletIds)) {
            $normalized = $outletIds;
        } elseif (is_string($outletIds)) {
            $decoded = json_decode($outletIds, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $normalized = $decoded;
            } else {
                $normalized = array_map('trim', explode(',', $outletIds));
            }
        } elseif (is_int($outletIds)) {
            $normalized = [$outletIds];
        } else {
            return null;
        }

        $normalized = array_values(array_unique(array_filter(array_map(
            static fn($value) => is_numeric($value) ? (int) $value : null,
            $normalized
        ), static fn($value) => $value !== null && $value > 0)));

        return $normalized === [] ? null : $normalized;
    }
}
