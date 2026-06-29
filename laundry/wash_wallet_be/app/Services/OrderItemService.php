<?php

namespace App\Services;

use App\Models\EmployeeProcess;
use App\Models\Employee;
use App\Models\OrderItem;
use App\Models\OrderItemProcess;
use App\Models\WorkLog;
use Carbon\Carbon;
use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderItemService extends BaseService
{
    protected array $orderItemDetailRelations = [
        'orderItemProcesses.laundryServiceProcess.process',
        'orderItemProcesses.employee',
        'laundryService',
        'order',
    ];

    public function __construct(protected OrderItem $orderItem) {}

    /**
     * Start processing an order item
     *
     * @throws Exception
     */
    public function startOrderItem(int $orderItemId): OrderItem
    {
        DB::beginTransaction();

        try {
            $orderItem = $this->orderItem->with($this->orderItemDetailRelations)->findOrFail($orderItemId);

            if ($orderItem->status !== OrderItem::STATUS_PENDING) {
                throw new Exception('Order item tidak bisa dimulai dari status saat ini');
            }

            $orderItem->update([
                'status' => OrderItem::STATUS_PROCESSING,
            ]);

            $orderItem->load($this->orderItemDetailRelations);

            DB::commit();

            Log::info('Order item berhasil dimulai', [
                'order_item_id' => $orderItemId,
                'status' => $orderItem->status,
            ]);

            return $orderItem;
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Gagal memulai order item', [
                'order_item_id' => $orderItemId,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Complete an order item
     *
     * @throws Exception
     */
    public function completeOrderItem(int $orderItemId, array $data = []): OrderItem
    {
        DB::beginTransaction();

        try {
            $orderItem = $this->orderItem->with($this->orderItemDetailRelations)->findOrFail($orderItemId);

            if ($orderItem->status === OrderItem::STATUS_DONE) {
                throw new Exception('Order item sudah diselesaikan');
            }

            if ($orderItem->status === OrderItem::STATUS_PROCESSING) {
                $hasIncompleteProcesses = $orderItem->orderItemProcesses()
                    ->whereNull('completed_at')
                    ->exists();

                if ($hasIncompleteProcesses) {
                    throw new Exception('Masih ada proses yang belum selesai');
                }
            }

            $updateData = [
                'status' => OrderItem::STATUS_DONE,
            ];

            if (isset($data['notes'])) {
                $updateData['item_notes'] = $data['notes'];
            }

            $orderItem->update($updateData);

            $orderItem->load($this->orderItemDetailRelations);

            DB::commit();

            Log::info('Order item berhasil diselesaikan', [
                'order_item_id' => $orderItemId,
                'status' => $orderItem->status,
                'notes' => $data['notes'] ?? null,
            ]);

            return $orderItem;
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Gagal menyelesaikan order item', [
                'order_item_id' => $orderItemId,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Start processing on a specific order item process
     *
     * @return array{process: OrderItemProcess, orderItem: OrderItem}
     */
    public function startOrderItemProcess(int $orderItemProcessId, int $employeeId): array
    {
        DB::beginTransaction();

        try {
            $orderItemProcess = $this->findOrderItemProcess($orderItemProcessId);

            $this->ensureEmployeeCanWorkOnProcess($employeeId, $orderItemProcess);
            // Guard: employee must be eligible for production on the order's outlet
            $outletId = $orderItemProcess->orderItem->order->outlet_id ?? null;
            $employee = Employee::find($employeeId);
            if ($outletId && (!$employee || !$employee->isEligibleForProduction($outletId))) {
                throw new AuthorizationException('Employee tidak eligible untuk produksi pada outlet ini');
            }
            $this->ensureSequenceIsReady($orderItemProcess);

            if ($this->resolveProcessStatus($orderItemProcess) !== 'pending') {
                throw new Exception('Proses tidak dapat dimulai dari status saat ini');
            }

            $orderItemProcess->update([
                'started_at' => now(),
                'employee_id' => $employeeId,
            ]);

            $orderItem = $this->orderItem->with($this->orderItemDetailRelations)
                ->findOrFail($orderItemProcess->order_item_id);

            $orderItemProcess->load(['employee', 'laundryServiceProcess.process']);

            DB::commit();

            Log::info('Proses berhasil dimulai', [
                'order_item_process_id' => $orderItemProcessId,
                'order_item_id' => $orderItem->id,
                'employee_id' => $employeeId,
            ]);

            return [
                'process' => $orderItemProcess,
                'orderItem' => $orderItem,
            ];
        } catch (Exception | AuthorizationException $e) {
            DB::rollBack();

            Log::error('Gagal memulai proses', [
                'order_item_process_id' => $orderItemProcessId,
                'employee_id' => $employeeId,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Complete a specific order item process
     *
     * @return array{process: OrderItemProcess, orderItem: OrderItem}
     */
    public function completeOrderItemProcess(int $orderItemProcessId, int $employeeId): array
    {
        DB::beginTransaction();

        try {
            $orderItemProcess = $this->findOrderItemProcess($orderItemProcessId);

            $this->ensureEmployeeCanWorkOnProcess($employeeId, $orderItemProcess);
            // Guard: employee must be eligible for production on the order's outlet
            $outletId = $orderItemProcess->orderItem->order->outlet_id ?? null;
            $employee = Employee::find($employeeId);
            if ($outletId && (!$employee || !$employee->isEligibleForProduction($outletId))) {
                throw new AuthorizationException('Employee tidak eligible untuk produksi pada outlet ini');
            }

            $status = $this->resolveProcessStatus($orderItemProcess);

            if ($status === 'pending') {
                throw new Exception('Proses belum dimulai');
            }

            if ($status === 'done') {
                throw new Exception('Proses sudah diselesaikan');
            }

            $orderItemProcess->update([
                'completed_at' => now(),
                'employee_id' => $employeeId,
            ]);

            $this->recordCommission($orderItemProcess);

            $orderItem = $this->orderItem->with($this->orderItemDetailRelations)
                ->findOrFail($orderItemProcess->order_item_id);

            $orderItemProcess->load(['employee', 'laundryServiceProcess.process']);

            DB::commit();

            Log::info('Proses berhasil diselesaikan', [
                'order_item_process_id' => $orderItemProcessId,
                'order_item_id' => $orderItem->id,
                'employee_id' => $employeeId,
            ]);

            return [
                'process' => $orderItemProcess,
                'orderItem' => $orderItem,
            ];
        } catch (Exception | AuthorizationException $e) {
            DB::rollBack();

            Log::error('Gagal menyelesaikan proses', [
                'order_item_process_id' => $orderItemProcessId,
                'employee_id' => $employeeId,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Read Methods
    |--------------------------------------------------------------------------
    */

    /**
     * Get all order items with filters and pagination
     *
     * @param array<string, mixed> $filters Filter criteria
     * @param int $page Page number for pagination
     * @param int $perPage Items per page
     * @param array<int, string> $relations Relations to eager load
     * @return \Illuminate\Pagination\LengthAwarePaginator|\Illuminate\Support\Collection
     */
    public function getAll(
        array $filters = [],
        int $page = 1,
        int $perPage = 15,
        array $relations = [],
    ) {
        try {
            $query = $this->orderItem->query();

            $this->applyTenantScope($query);

            $this->applyFilters($query, $filters);

            if (!empty($relations)) {
                $query->with($relations);
            }

            return $this->paginate($query, $perPage, $page);
        } catch (Exception $e) {
            Log::error('Failed to get all order items', [
                'error' => $e->getMessage(),
                'filters' => $filters,
            ]);
            throw $e;
        }
    }

    private function applyFilters(Builder $query, array $filters = []): void
    {
        if (!empty($filters['search'])) {
            $search = $filters['search'];

            // Keep search predicates grouped to avoid bypassing existing tenant/status filters.
            $query->where(function (Builder $builder) use ($search) {
                $builder->where('laundry_service_name', 'like', "%{$search}%")
                    ->orWhere('item_notes', 'like', "%{$search}%")
                    ->orWhere('notes', 'like', "%{$search}%")
                    ->orWhereHas('order', function (Builder $orderQuery) use ($search) {
                        $orderQuery->where('order_number', 'like', "%{$search}%");
                    });
            });
        }

        if (!empty($filters['orderId'])) {
            $query->where('order_id', $filters['orderId']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['laundryServiceId'])) {
            $query->where('laundry_service_id', $filters['laundryServiceId']);
        }

        if (!empty($filters['customerId'])) {
            $query->whereHas('order', function (Builder $orderQuery) use ($filters) {
                $orderQuery->where('customer_id', $filters['customerId']);
            });
        }

        if (!empty($filters['startedAtFrom'])) {
            $query->whereDate('started_at', '>=', Carbon::parse($filters['startedAtFrom']));
        }

        if (!empty($filters['startedAtTo'])) {
            $query->whereDate('started_at', '<=', Carbon::parse($filters['startedAtTo']));
        }

        if (!empty($filters['completedAtFrom'])) {
            $query->whereDate('completed_at', '>=', Carbon::parse($filters['completedAtFrom']));
        }

        if (!empty($filters['completedAtTo'])) {
            $query->whereDate('completed_at', '<=', Carbon::parse($filters['completedAtTo']));
        }

        if (!empty($filters['createdAtFrom'])) {
            $query->whereDate('created_at', '>=', Carbon::parse($filters['createdAtFrom']));
        }

        if (!empty($filters['createdAtTo'])) {
            $query->whereDate('created_at', '<=', Carbon::parse($filters['createdAtTo']));
        }

        $this->applySort(
            $query,
            $filters['sortBy'] ?? 'createdAt',
            $filters['sortDirection'] ?? 'desc',
            [
                'quantity',
                'unitPrice',
                'discountAmount',
                'subtotal',
                'totalAmount',
                'status',
                'startedAt',
                'completedAt',
                'createdAt',
                'updatedAt',
            ],
            [
                'unitPrice' => 'unit_price',
                'discountAmount' => 'discount_amount',
                'totalAmount' => 'total_amount',
                'startedAt' => 'started_at',
                'completedAt' => 'completed_at',
                'createdAt' => 'created_at',
                'updatedAt' => 'updated_at',
            ],
            'createdAt'
        );
    }

    /**
     * Get order item by ID with relationships
     */
    public function getById(int $orderItemId): OrderItem
    {
        return $this->orderItem->with($this->orderItemDetailRelations)
            ->findOrFail($orderItemId);
    }

    private function findOrderItemProcess(int $orderItemProcessId): OrderItemProcess
    {
        return OrderItemProcess::with([
            'orderItem.orderItemProcesses.laundryServiceProcess.process',
            'orderItem.orderItemProcesses.employee',
            'orderItem.laundryService',
            'orderItem.order',
            'laundryServiceProcess.process',
            'employee',
        ])->findOrFail($orderItemProcessId);
    }

    private function ensureEmployeeCanWorkOnProcess(int $employeeId, OrderItemProcess $orderItemProcess): void
    {
        $processId = $orderItemProcess->laundryServiceProcess?->process_id;

        if (! $processId || ! EmployeeProcess::canEmployeeWorkOn($employeeId, $processId)) {
            throw new AuthorizationException('Employee tidak memiliki akses untuk mengerjakan proses ini');
        }
    }

    private function ensureSequenceIsReady(OrderItemProcess $orderItemProcess): void
    {
        $currentSequence = (int) ($orderItemProcess->laundryServiceProcess?->sequence ?? 0);

        if ($currentSequence <= 0) {
            throw new Exception('Data tidak ditemukan');
        }

        $hasPreviousIncompleteProcess = $orderItemProcess->orderItem->orderItemProcesses
            ->filter(function (OrderItemProcess $process) use ($orderItemProcess, $currentSequence) {
                if ($process->id === $orderItemProcess->id) {
                    return false;
                }

                $sequence = (int) ($process->laundryServiceProcess?->sequence ?? 0);

                return $sequence > 0
                    && $sequence < $currentSequence
                    && is_null($process->completed_at);
            })
            ->isNotEmpty();

        if ($hasPreviousIncompleteProcess) {
            throw new Exception('Selesaikan proses sebelumnya terlebih dahulu');
        }
    }

    private function resolveProcessStatus(OrderItemProcess $orderItemProcess): string
    {
        if ($orderItemProcess->completed_at) {
            return 'done';
        }

        if ($orderItemProcess->started_at) {
            return 'processing';
        }

        return 'pending';
    }

    /**
     * Record commission earned when an employee completes a process.
     * Checks if the employee has an active commission rule, calculates the amount,
     * and checks whether the target threshold bonus is triggered this period.
     */
    private function recordCommission(OrderItemProcess $orderItemProcess): void
    {
        $employeeId = $orderItemProcess->employee_id;
        if (! $employeeId) {
            return;
        }

        $processId = $orderItemProcess->laundryServiceProcess?->process_id;
        if (! $processId) {
            return;
        }

        $employeeProcess = EmployeeProcess::where('employee_id', $employeeId)
            ->where('process_id', $processId)
            ->where('is_active', true)
            ->with(['commission' => fn($q) => $q->where('is_active', true)])
            ->first();

        if (! $employeeProcess || ! $employeeProcess->commission) {
            return;
        }

        $commission = $employeeProcess->commission;
        $qty = (float) $orderItemProcess->qty_processed ?: 1;
        $price = (float) ($orderItemProcess->orderItem?->unit_price ?? 0);

        $baseAmount = $commission->calculateCommission($qty, $price);

        $periodYear = now()->year;
        $periodMonth = now()->month;

        $previousCount = WorkLog::where('employee_process_commission_id', $commission->id)
            ->where('period_year', $periodYear)
            ->where('period_month', $periodMonth)
            ->count();

        $achievedCount = $previousCount + 1;

        $hasBonus = $commission->has_target
            && $commission->target_threshold
            && $achievedCount === (int) $commission->target_threshold;

        $bonusAmount = $hasBonus ? (float) ($commission->bonus_amount ?? 0) : null;
        $totalAmount = $baseAmount + ($bonusAmount ?? 0);

        WorkLog::create([
            'employee_id' => $employeeId,
            'process_id' => $processId,
            'employee_process_id' => $employeeProcess->id,
            'order_item_process_id' => $orderItemProcess->id,
            'employee_process_commission_id' => $commission->id,
            'commission_type' => $commission->commission_type,
            'commission_value' => $commission->commission_value,
            'qty' => $qty,
            'base_amount' => $baseAmount,
            'has_bonus' => $hasBonus,
            'bonus_amount' => $bonusAmount,
            'total_amount' => $totalAmount,
            'achieved_count' => $achievedCount,
            'period_year' => $periodYear,
            'period_month' => $periodMonth,
            'worked_at' => now(),
        ]);

        Log::info('Komisi proses berhasil dicatat', [
            'employee_id' => $employeeId,
            'order_item_process_id' => $orderItemProcess->id,
            'commission_type' => $commission->commission_type,
            'base_amount' => $baseAmount,
            'has_bonus' => $hasBonus,
            'bonus_amount' => $bonusAmount,
            'total_amount' => $totalAmount,
            'achieved_count' => $achievedCount,
            'target_threshold' => $commission->target_threshold,
        ]);
    }
}
