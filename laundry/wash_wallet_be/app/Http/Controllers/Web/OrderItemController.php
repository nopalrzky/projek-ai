<?php

namespace App\Http\Controllers\Web;

use Illuminate\Routing\Attributes\Controllers\Middleware;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderItem\OrderItemResource;
use App\Services\OrderItemService;
use App\Helpers\PaginationHelper;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Throwable;

#[Middleware('auth')]
class OrderItemController extends Controller
{
    public function __construct(private readonly OrderItemService $orderItemService) {}

    /*
    |--------------------------------------------------------------------------
    | Read Methods
    |--------------------------------------------------------------------------
    */

    /**
     * Display all order items with filters and pagination
     */
    public function index(Request $request): Response
    {
        try {
            $filters = [
                'orderId' => $request->input('orderId'),
                'status' => $request->input('status'),
                'search' => $request->input('search'),
            ];

            $page = (int) $request->input('page', 1);
            $perPage = (int) $request->input('perPage', 15);

            $orderItems = $this->orderItemService->getAll(
                filters: $filters,
                page: $page,
                perPage: $perPage,
                relations: [
                    'order',
                    'laundryService',
                    'orderItemProcesses.laundryServiceProcess.process',
                    'orderItemProcesses.employee',
                ]
            );

            return Inertia::render('Dashboard/OrderItems/Index', [
                'orderItems' => [
                    'data' => OrderItemResource::collection($orderItems->items())->resolve(),
                    'meta' => PaginationHelper::format($orderItems, $request),
                ],
                'filters' => [
                    'orderId' => $filters['orderId'],
                    'status' => $filters['status'],
                    'search' => $filters['search'],
                ],
                'flash' => [
                    'success' => $request->session()->get('success'),
                    'error' => $request->session()->get('error'),
                ],
            ]);
        } catch (Throwable $e) {
            Log::error('[OrderItemController] Failed to load order items index', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'order_item_controller_error',
            ]);

            return Inertia::render('Dashboard/OrderItems/Index', [
                'orderItems' => ['data' => [], 'meta' => []],
                'filters' => [],
                'error' => 'Gagal memuat data order items. Silakan coba lagi.',
            ]);
        }
    }

    /**
     * Display a single order item with all details
     */
    public function show(int $id): Response|RedirectResponse
    {
        try {
            $orderItem = $this->orderItemService->getOrderItemById($id);

            return Inertia::render('Dashboard/OrderItems/Show', [
                'orderItem' => (new OrderItemResource($orderItem))->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[OrderItemController] Failed to show order item', [
                'order_item_id' => $id,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'order_item_controller_error',
            ]);

            return redirect()->route('orderItems.index')
                ->with('error', 'Data tidak ditemukan atau akses ditolak');
        }
    }
}
