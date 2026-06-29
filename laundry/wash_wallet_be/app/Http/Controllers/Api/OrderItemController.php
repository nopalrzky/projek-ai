<?php

namespace App\Http\Controllers\Api;

use App\Helpers\PaginationHelper;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderItem\OrderItemResource;
use App\Services\OrderItemService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Throwable;

use Illuminate\Routing\Attributes\Controllers\Middleware;

#[Middleware('auth:sanctum')]
class OrderItemController extends Controller
{
    public function __construct(
        private readonly OrderItemService $orderItemService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $this->getFiltersFromRequest($request);

            $orderItems = $this->orderItemService->getAll(
                $filters,
                $filters['page'],
                $filters['perPage'],
                [
                    'orderItemProcesses.laundryServiceProcess.process',
                    'orderItemProcesses.employee',
                    'laundryService',
                    'order',
                ]
            );

            if ($orderItems instanceof LengthAwarePaginator) {
                return $this->successResponse(
                    OrderItemResource::collection($orderItems)->resolve(),
                    'Daftar order item berhasil diambil',
                    200,
                    PaginationHelper::format($orderItems, $request)
                );
            }

            return $this->successResponse(
                OrderItemResource::collection($orderItems)->resolve(),
                'Daftar order item berhasil diambil',
            );
        } catch (Throwable $e) {
            Log::error('[OrderItemController] Failed to fetch order items', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'order_item',
            ]);

            return $this->errorResponse('Gagal mengambil daftar order item', 500, $e);
        }
    }

    /**
     * Get order item by ID
     */
    public function show(int $id): JsonResponse
    {
        try {
            $orderItem = $this->orderItemService->getById($id);

            return $this->successResponse(
                new OrderItemResource($orderItem),
                'Order item berhasil diambil'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[OrderItemController] Failed to retrieve order item', [
                'error'         => $e->getMessage(),
                'user_id'       => Auth::id(),
                'type'          => 'order_item',
                'order_item_id' => $id,
            ]);

            return $this->errorResponse('Gagal memuat data order item', 500, $e);
        }
    }

    /**
     * Start processing an order item
     */
    public function start(int $id): JsonResponse
    {
        try {
            $orderItem = $this->orderItemService->startOrderItem($id);

            return $this->successResponse(
                new OrderItemResource($orderItem),
                'Order item berhasil dimulai'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[OrderItemController] Failed to start order item', [
                'error'         => $e->getMessage(),
                'user_id'       => Auth::id(),
                'type'          => 'order_item',
                'order_item_id' => $id,
            ]);

            return $this->errorResponse('Gagal memulai order item', 500, $e);
        }
    }

    /**
     * Complete an order item
     */
    public function complete(Request $request, int $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'notes' => 'nullable|string|max:1000',
            ]);

            $orderItem = $this->orderItemService->completeOrderItem($id, $validated);

            return $this->successResponse(
                new OrderItemResource($orderItem),
                'Order item berhasil diselesaikan'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[OrderItemController] Failed to complete order item', [
                'error'         => $e->getMessage(),
                'user_id'       => Auth::id(),
                'type'          => 'order_item',
                'order_item_id' => $id,
            ]);

            return $this->errorResponse('Gagal menyelesaikan order item', 500, $e);
        }
    }

    private function getFiltersFromRequest(Request $request): array
    {
        return [
            'search'            => $request->string('search')->toString(),
            'status'            => $request->string('status')->toString(),
            'orderId'           => $request->has('orderId') && $request->filled('orderId')
                ? $request->integer('orderId')
                : null,
            'laundryServiceId'  => $request->has('laundryServiceId') && $request->filled('laundryServiceId')
                ? $request->integer('laundryServiceId')
                : null,
            'customerId'        => $request->has('customerId') && $request->filled('customerId')
                ? $request->integer('customerId')
                : null,
            'startedAtFrom'     => $request->has('startedAt.from') && $request->filled('startedAt.from')
                ? $request->date('startedAt.from')->format('Y-m-d')
                : null,
            'startedAtTo'       => $request->has('startedAt.to') && $request->filled('startedAt.to')
                ? $request->date('startedAt.to')->format('Y-m-d')
                : null,
            'completedAtFrom'   => $request->has('completedAt.from') && $request->filled('completedAt.from')
                ? $request->date('completedAt.from')->format('Y-m-d')
                : null,
            'completedAtTo'     => $request->has('completedAt.to') && $request->filled('completedAt.to')
                ? $request->date('completedAt.to')->format('Y-m-d')
                : null,
            'createdAtFrom'     => $request->has('createdAt.from') && $request->filled('createdAt.from')
                ? $request->date('createdAt.from')->format('Y-m-d')
                : null,
            'createdAtTo'       => $request->has('createdAt.to') && $request->filled('createdAt.to')
                ? $request->date('createdAt.to')->format('Y-m-d')
                : null,
            'sortBy'            => $request->string('sortBy', 'createdAt')->toString(),
            'sortDirection'     => $request->string('sortDirection', 'desc')->toString(),
            'page'              => $request->integer('page', 1),
            'perPage'           => $request->integer('perPage', 15),
        ];
    }
}
