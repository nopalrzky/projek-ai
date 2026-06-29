<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CustomerAccount\CustomerAccountResource;
use App\Http\Resources\CustomerAddress\CustomerAddressResource;
use App\Http\Resources\Outlet\OutletResource;
use App\Models\CustomerAccount;
use App\Models\Outlet;
use App\Models\Order;
use App\Services\AccountService;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

use Illuminate\Routing\Attributes\Controllers\Middleware;

#[Middleware('auth:sanctum', only: ['indexCashier', 'indexProduction'])]
#[Middleware('auth:customer_sanctum', only: ['indexCustomer'])]
class DashboardController extends Controller
{
    public function __construct(
        private readonly AccountService $accountService,
    ) {}

    public function indexCashier(): JsonResponse
    {
        try {
            $employee = Auth::guard('sanctum')->user();

            if (!$employee) {
                return $this->errorResponse('Unauthenticated', 401);
            }


            $cashAccounts = $this->accountService->getAll([
                'slug' => 'cash_outlet_' . $employee->outlet_id,
                'ownerId' => $employee->outlet->owner_id,
            ]);

            $cashAccount = $cashAccounts->first();

            $cashBalance = $cashAccount ? (float) $cashAccount->getCurrentBalance() : 0;

            $ordersInProduction = (int) Order::byOutletId($employee->outlet_id)
                ->whereIn('status', [Order::STATUS_IN_PROGRESS])
                ->count();

            $ordersNotPickedUp = (int) Order::byOutletId($employee->outlet_id)
                ->where('status', Order::STATUS_READY)
                ->count();

            $ordersPickedUp = (int) Order::byOutletId($employee->outlet_id)
                ->whereIn('status', [Order::STATUS_DELIVERED, Order::STATUS_COMPLETED])
                ->count();

            return $this->successResponse(
                [
                    'employeeName'      => (string) $employee->name,
                    'employeePhone'     => (string) ($employee->phone ?? ''),
                    'cashBalance'       => $cashBalance,
                    'ordersInProduction' => $ordersInProduction,
                    'ordersNotPickedUp' => $ordersNotPickedUp,
                    'ordersPickedUp'    => $ordersPickedUp,
                ],
                'Dashboard data retrieved successfully'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[DashboardController] Failed to load cashier dashboard', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'dashboard',
            ]);

            return $this->errorResponse('Gagal memuat data dashboard', 500, $e);
        }
    }

    public function indexProduction(): JsonResponse
    {
        try {
            $employee = Auth::guard('sanctum')->user();

            if (!$employee) {
                return $this->errorResponse('Unauthenticated', 401);
            }

            $today = Carbon::today();
            $outlet = $employee->outlet;

            $ordersToday = (int) Order::byOutletId($employee->outlet_id)
                ->whereDate('order_date', $today)
                ->count();

            $ordersInProgress = (int) Order::byOutletId($employee->outlet_id)
                ->whereIn('status', [Order::STATUS_IN_PROGRESS])
                ->count();

            $ordersReadyForPickup = (int) Order::byOutletId($employee->outlet_id)
                ->where('status', Order::STATUS_READY)
                ->count();

            $ordersCompleted = (int) Order::byOutletId($employee->outlet_id)
                ->whereIn('status', [Order::STATUS_DELIVERED, Order::STATUS_COMPLETED])
                ->whereDate('actual_completion', $today)
                ->count();

            $processQueue = DB::table('order_item_processes')
                ->join('order_items', 'order_item_processes.order_item_id', '=', 'order_items.id')
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->join('employees', 'orders.employee_id', '=', 'employees.id')
                ->join('laundry_service_processes', 'order_item_processes.laundry_service_process_id', '=', 'laundry_service_processes.id')
                ->join('processes', 'laundry_service_processes.process_id', '=', 'processes.id')
                ->where('employees.outlet_id', $employee->outlet_id)
                ->whereIn('orders.status', [Order::STATUS_IN_PROGRESS])
                ->whereNotNull('order_item_processes.started_at')
                ->whereNull('order_item_processes.completed_at')
                ->select(
                    'processes.id as processId',
                    'processes.name as processName',
                    DB::raw('COUNT(DISTINCT order_items.id) as totalOrders')
                )
                ->groupBy('processes.id', 'processes.name')
                ->orderBy('processes.id')
                ->get()
                ->map(function ($item) {
                    return [
                        'processId'   => (int) $item->processId,
                        'processName' => (string) $item->processName,
                        'totalOrders' => (int) $item->totalOrders,
                    ];
                })
                ->toArray();

            $activeOrders = Order::byOutletId($employee->outlet_id)
                ->whereIn('status', [Order::STATUS_READY_TO_PROCESS, Order::STATUS_IN_PROGRESS])
                ->with([
                    'customer:id,name',
                    'orderItems.orderItemProcesses' => function ($query) {
                        $query->whereNotNull('started_at')
                            ->whereNull('completed_at')
                            ->with('laundryServiceProcess.process:id,name')
                            ->orderBy('started_at', 'desc');
                    },
                    'orderItems.laundryService:id,name',
                ])
                ->orderBy('order_date', 'asc')
                ->limit(20)
                ->get()
                ->map(function ($order) {
                    $activeOrderItem = $order->orderItems->first(function ($orderItem) {
                        return $orderItem->orderItemProcesses->isNotEmpty();
                    });

                    if (!$activeOrderItem) {
                        return null;
                    }

                    $activeProcess = $activeOrderItem->orderItemProcesses->first();
                    $currentProcess = $activeProcess && $activeProcess->laundryServiceProcess
                        ? $activeProcess->laundryServiceProcess->process->name
                        : 'Pending';

                    return [
                        'orderId'      => (int) $order->id,
                        'invoice'      => (string) $order->order_number,
                        'customerName' => (string) $order->customer->name,
                        'serviceName'  => (string) ($activeOrderItem->laundry_service_name ?? 'N/A'),
                        'quantity'     => (string) number_format($activeOrderItem->quantity, 2) . ' ' . ($activeOrderItem->unit_name ?? ''),
                        'currentProcess' => (string) $currentProcess,
                        'startedAt'    => $activeProcess && $activeProcess->started_at
                            ? $activeProcess->started_at->format('Y-m-d H:i')
                            : null,
                    ];
                })
                ->filter()
                ->values()
                ->toArray();

            $priorityOrders = Order::byOutletId($employee->outlet_id)
                ->whereIn('status', [Order::STATUS_READY_TO_PROCESS, Order::STATUS_IN_PROGRESS])
                ->with('customer:id,name')
                ->where(function ($query) use ($today) {
                    $query->whereRaw("JSON_SEARCH(LOWER(special_instructions), 'one', '%express%') IS NOT NULL")
                        ->orWhere(function ($q) use ($today) {
                            $q->whereNotNull('estimated_completion')
                                ->where('estimated_completion', '<=', Carbon::now()->addHours(6));
                        });
                })
                ->orderBy('estimated_completion', 'asc')
                ->limit(10)
                ->get()
                ->map(function ($order) {
                    $isExpress = false;
                    if (is_array($order->special_instructions)) {
                        foreach ($order->special_instructions as $instruction) {
                            if (stripos($instruction, 'express') !== false) {
                                $isExpress = true;
                                break;
                            }
                        }
                    }

                    return [
                        'orderId'      => (int) $order->id,
                        'invoice'      => (string) $order->order_number,
                        'customerName' => (string) $order->customer->name,
                        'status'       => $isExpress ? 'express' : 'urgent',
                        'deadline'     => $order->estimated_completion
                            ? $order->estimated_completion->format('Y-m-d H:i')
                            : null,
                    ];
                })
                ->toArray();

            return $this->successResponse(
                [
                    'employeeName' => (string) $employee->name,
                    'outletName'   => (string) $outlet->name,
                    'summary'      => [
                        'ordersToday'         => $ordersToday,
                        'ordersInProgress'    => $ordersInProgress,
                        'ordersReadyForPickup' => $ordersReadyForPickup,
                        'ordersCompleted'     => $ordersCompleted,
                    ],
                    'processQueue'  => $processQueue,
                    'activeOrders'  => $activeOrders,
                    'priorityOrders' => $priorityOrders,
                ],
                'Production dashboard data retrieved successfully'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[DashboardController] Failed to load production dashboard', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'dashboard',
            ]);

            return $this->errorResponse('Gagal memuat data dashboard produksi', 500, $e);
        }
    }

    public function indexCustomer(): JsonResponse
    {
        try {
            $customer = Auth::guard('customer_sanctum')->user();

            if (!$customer instanceof CustomerAccount) {
                return $this->errorResponse('Unauthenticated', 401);
            }

            $customer->load('primaryAddress');

            $activeStatuses = [
                Order::STATUS_REQUESTED,
                Order::STATUS_ACCEPTED,
                Order::STATUS_PICKING_UP,
                Order::STATUS_PICKED_UP,
                Order::STATUS_RECEIVED,
                Order::STATUS_WEIGHING,
                Order::STATUS_READY_TO_PROCESS,
                Order::STATUS_IN_PROGRESS,
                Order::STATUS_READY,
            ];

            $orderBaseQuery = Order::query()->where('customer_account_id', $customer->id);

            $orderSummary = [
                'totalOrders'   => (int) (clone $orderBaseQuery)->count(),
                'activeOrders'  => (int) (clone $orderBaseQuery)->whereIn('status', $activeStatuses)->count(),
                'readyToPickup' => (int) (clone $orderBaseQuery)->where('status', Order::STATUS_READY)->count(),
                'completedOrders' => (int) (clone $orderBaseQuery)
                    ->whereIn('status', [Order::STATUS_COMPLETED, Order::STATUS_DELIVERED])
                    ->count(),
            ];

            $recentOrders = Order::query()
                ->where('customer_account_id', $customer->id)
                ->with(['employee.outlet:id,name'])
                ->latest('order_date')
                ->limit(5)
                ->get()
                ->map(function (Order $order): array {
                    return [
                        'id'                  => (int) $order->id,
                        'orderNumber'         => (string) $order->order_number,
                        'status'              => (string) $order->status,
                        'paymentStatus'       => (string) $order->payment_status,
                        'totalAmount'         => (float) $order->total_amount,
                        'remainingAmount'     => (float) $order->remaining_amount,
                        'orderDate'           => $order->order_date?->toISOString(),
                        'estimatedCompletion' => $order->estimated_completion?->toISOString(),
                        'outletName'          => $order->employee?->outlet?->name,
                    ];
                })
                ->values()
                ->toArray();

            $featuredOutlets = Outlet::query()
                ->where('status', 'active')
                ->exposure()
                ->orderByDesc('updated_at')
                ->limit(5)
                ->get();

            return $this->successResponse(
                [
                    'customer'       => (new CustomerAccountResource($customer))->resolve(),
                    'primaryAddress' => $customer->primaryAddress
                        ? (new CustomerAddressResource($customer->primaryAddress))->resolve()
                        : null,
                    'orderSummary'   => $orderSummary,
                    'recentOrders'   => $recentOrders,
                    'featuredOutlets' => OutletResource::collection($featuredOutlets)->resolve(),
                ],
                'Customer home dashboard retrieved successfully'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[DashboardController] Failed to load customer home dashboard', [
                'error'               => $e->getMessage(),
                'user_id'             => Auth::id(),
                'customer_account_id' => Auth::guard('customer_sanctum')->id(),
                'type'                => 'customer_dashboard',
            ]);

            return $this->errorResponse('Gagal memuat data home customer', 500, $e);
        }
    }
}
