<?php

namespace App\Http\Controllers\Web;

use Illuminate\Routing\Attributes\Controllers\Middleware;

use App\Helpers\PaginationHelper;
use App\Http\Controllers\Controller;
use App\Http\Resources\Order\OrderResource;
use App\Http\Resources\Outlet\OutletResource;
use App\Http\Resources\Customer\CustomerResource;
use App\Http\Resources\Employee\EmployeeResource;
use App\Services\OrderService;
use App\Services\OutletService;
use App\Services\CustomerService;
use App\Services\EmployeeService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

#[Middleware('auth')]
class OrderController extends Controller
{
    public function __construct(private readonly OrderService $orderService, private readonly OutletService $outletService, private readonly CustomerService $customerService, private readonly EmployeeService $employeeService) {}

    /**
     * Display a listing of the orders
     */
    public function index(Request $request): Response
    {
        try {
            $filters = $this->getFiltersFromRequest($request);

            $orders = $this->orderService->getAll(
                $filters,
                $filters['page'],
                $filters['perPage'],
                ['customer', 'employee']
            );

            $outlets = $this->outletService->getAll();

            $dependentFilters = [];
            if (!is_null($filters['outletId'])) {
                $dependentFilters['outletId'] = $filters['outletId'];
            }

            $customers = $this->customerService->getAll(
                $dependentFilters,
                null,
                null,
                []
            );

            $employees = $this->employeeService->getAll(
                $dependentFilters,
                null,
                null,
                ['outlet']
            );

            return Inertia::render('Dashboard/Orders/Index', [
                'orders' => [
                    'data' => OrderResource::collection($orders->items())->resolve(),
                    'meta' => PaginationHelper::format($orders, $request),
                ],
                'filters' => $filters,
                'stats'   => $this->orderService->getStats(),
                'filterOptions' => [
                    'statusOptions' => [
                        ['value' => 'requested', 'label' => 'Diajukan'],
                        ['value' => 'accepted', 'label' => 'Diterima'],
                        ['value' => 'picking_up', 'label' => 'Dijemput'],
                        ['value' => 'received', 'label' => 'Di Outlet'],
                        ['value' => 'weighing', 'label' => 'Ditimbang'],
                        ['value' => 'ready_to_process', 'label' => 'Siap Kerja'],
                        ['value' => 'in_progress', 'label' => 'Dikerjakan'],
                        ['value' => 'ready', 'label' => 'Siap Antar'],
                        ['value' => 'delivering', 'label' => 'Diantar'],
                        ['value' => 'delivered', 'label' => 'Terkirim'],
                        ['value' => 'completed', 'label' => 'Selesai'],
                        ['value' => 'cancelled', 'label' => 'Batal'],
                        ['value' => 'rejected', 'label' => 'Ditolak'],
                    ],
                    'paymentStatusOptions' => [
                        ['value' => 'not_yet_priced', 'label' => 'Belum Harga'],
                        ['value' => 'unpaid', 'label' => 'Belum Bayar'],
                        ['value' => 'partial', 'label' => 'Sebagian'],
                        ['value' => 'paid', 'label' => 'Lunas'],
                        ['value' => 'refunded', 'label' => 'Refund'],
                        ['value' => 'paid_by_package', 'label' => 'Paket'],
                        ['value' => 'cod', 'label' => 'COD'],
                    ],
                    'outlets'   => $outlets->map(fn($o) => [
                        'id'   => $o->id,
                        'name' => $o->name,
                        'code' => $o->code,
                    ])->toArray(),
                    'customers' => $customers->map(fn($c) => [
                        'id'    => $c->id,
                        'name'  => $c->name,
                        'phone' => $c->phone,
                    ])->toArray(),
                    'employees' => $employees->map(fn($e) => [
                        'id'     => $e->id,
                        'name'   => $e->name,
                        'outlet' => $e->outlet ? [
                            'id'   => $e->outlet->id,
                            'name' => $e->outlet->name,
                        ] : null,
                    ])->toArray(),
                ],
                'flash' => [
                    'success' => session('success'),
                    'error'   => session('error'),
                ],
            ]);
        } catch (Throwable $e) {
            Log::error('[OrderController] Failed to load orders index', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'order_controller_error',
            ]);

            return Inertia::render('Dashboard/Orders/Index', [
                'orders' => [
                    'data' => [],
                    'meta' => [
                        'currentPage' => 1,
                        'from'        => 1,
                        'lastPage'    => 1,
                        'perPage'     => 15,
                        'to'          => 1,
                        'total'       => 0,
                    ],
                ],
                'stats'   => [],
                'filters' => $filters ?? [],
                'filterOptions' => [
                    'statusOptions'        => [],
                    'paymentStatusOptions' => [],
                    'outlets'              => [],
                    'customers'            => [],
                    'employees'            => [],
                ],
                'flash' => [
                    'error' => 'Gagal memuat data pesanan. Silakan coba lagi.',
                ],
            ]);
        }
    }

    /**
     * Display the specified order
     */
    public function show(int $id): Response|RedirectResponse
    {
        try {
            $order = $this->orderService->getById($id, [
                'customer.customerSubscriptions',
                'employee.employeePositions.position',
                'employee.outlet',
                'outlet',
                'customerAddress',
                'orderItems.laundryService',
                'orderItems.orderItemProcesses.laundryServiceProcess.process',
                'orderItems.orderItemProcesses.employee',
                'orderItems.quotaUsageLog.customerSubscription.servicePackage',
                'orderStatusHistories.employee',
                'orderPaymentLogs.employee',
            ]);

            return Inertia::render('Dashboard/Orders/Show', [
                'order' => (new OrderResource($order))->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[OrderController] Failed to show order', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'order_controller_error',
            ]);

            return redirect()->route('orders.index')
                ->with('error', 'Pesanan tidak ditemukan atau akses ditolak');
        }
    }

    public function destroy(int $id): RedirectResponse
    {
        try {
            $this->orderService->destroy($id);
            return redirect()->route('orders.index')
                ->with('success', 'Pesanan berhasil dihapus');
        } catch (Throwable $e) {
            Log::error('[OrderController] Failed to delete order', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'order_controller_error',
            ]);

            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Store a new payment for the order
     */
    public function storePayment(Request $request, int $id): RedirectResponse
    {
        $validated = $request->validate([
            'amount'           => 'required|numeric|min:1',
            'payment_method'   => 'required|in:cash,transfer,qris,debit',
            'reference_number' => 'nullable|string|max:100',
            'notes'            => 'nullable|string|max:500',
        ]);

        try {
            $this->orderService->recordOrderPayment($id, array_merge($validated, [
                'employee_id' => Auth::id(),
            ]));

            return back()->with('success', 'Pembayaran berhasil dicatat');
        } catch (Throwable $e) {
            Log::error('[OrderController] Failed to store payment', [
                'order_id' => $id,
                'error'    => $e->getMessage(),
                'user_id'  => Auth::id(),
                'type'     => 'order_controller_error',
            ]);

            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Delete a payment log
     */
    public function destroyPayment(int $id, int $paymentLogId): RedirectResponse
    {
        try {
            $this->orderService->deleteOrderPaymentLog($id, $paymentLogId);

            return back()->with('success', 'Log pembayaran berhasil dihapus');
        } catch (Throwable $e) {
            Log::error('[OrderController] Failed to delete payment log', [
                'order_id'       => $id,
                'payment_log_id' => $paymentLogId,
                'error'          => $e->getMessage(),
                'user_id'        => Auth::id(),
                'type'           => 'order_controller_error',
            ]);

            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Get filters from request
     */
    private function getFiltersFromRequest(Request $request): array
    {
        return [
            'search'        => $request->string('search')->toString(),
            'status'        => $request->string('status')->toString(),
            'paymentStatus' => $request->string('paymentStatus')->toString(),
            'outletId'      => $request->has('outletId') && $request->filled('outletId')
                ? $request->integer('outletId')
                : null,
            'customerId' => $request->has('customerId') && $request->filled('customerId')
                ? $request->integer('customerId')
                : null,
            'employeeId' => $request->has('employeeId') && $request->filled('employeeId')
                ? $request->integer('employeeId')
                : null,
            'orderDateFrom' => $request->has('orderDate.from') && $request->filled('orderDate.from')
                ? $request->date('orderDate.from')->format('Y-m-d')
                : null,
            'orderDateTo' => $request->has('orderDate.to') && $request->filled('orderDate.to')
                ? $request->date('orderDate.to')->format('Y-m-d')
                : null,
            'estimatedCompletionFrom' => $request->has('estimatedCompletion.from') && $request->filled('estimatedCompletion.from')
                ? $request->date('estimatedCompletion.from')->format('Y-m-d')
                : null,
            'estimatedCompletionTo' => $request->has('estimatedCompletion.to') && $request->filled('estimatedCompletion.to')
                ? $request->date('estimatedCompletion.to')->format('Y-m-d')
                : null,
            'totalAmountMin' => $request->has('totalAmount.min') && $request->filled('totalAmount.min')
                ? $request->float('totalAmount.min')
                : null,
            'totalAmountMax' => $request->has('totalAmount.max') && $request->filled('totalAmount.max')
                ? $request->float('totalAmount.max')
                : null,
            'overdue' => $request->has('overdue') && $request->filled('overdue')
                ? $request->boolean('overdue')
                : null,
            'dueToday' => $request->has('dueToday') && $request->filled('dueToday')
                ? $request->boolean('dueToday')
                : null,
            'sortBy'        => $request->string('sortBy', 'order_date')->toString(),
            'sortDirection' => $request->string('sortDirection', 'desc')->toString(),
            'page'          => $request->integer('page', 1),
            'perPage'       => $request->integer('perPage', 15),
        ];
    }
}
