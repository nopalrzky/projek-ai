<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Table('order_item_processes')]
class OrderItemProcess extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_item_id',
        'laundry_service_process_id',
        'employee_id',
        'qty_processed',
        'started_at',
        'completed_at',
        'evidence_attachment',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'order_item_id'               => 'integer',
            'laundry_service_process_id'  => 'integer',
            'employee_id'                 => 'integer',
            'qty_processed'               => 'decimal:2',
            'started_at'                  => 'datetime',
            'completed_at'                => 'datetime',
            'created_at'                  => 'datetime',
            'updated_at'                  => 'datetime',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Lifecycle Hooks
    |--------------------------------------------------------------------------
    */

    protected static function booted(): void
    {
        static::deleting(function ($orderItemProcess) {
            if ($orderItemProcess->isForceDeleting()) {
                $orderItemProcess->deleteEvidence();
            }
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }

    public function laundryServiceProcess(): BelongsTo
    {
        return $this->belongsTo(LaundryServiceProcess::class);
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function workLog(): HasOne
    {
        return $this->hasOne(WorkLog::class, 'order_item_process_id');
    }

    /*
    |--------------------------------------------------------------------------
    | Query Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeByOrderItemId(Builder $query, int $orderItemId): Builder
    {
        return $query->where('order_item_id', $orderItemId);
    }

    public function scopeByServiceProcessId(Builder $query, int $serviceProcessId): Builder
    {
        return $query->where('laundry_service_process_id', $serviceProcessId);
    }

    public function scopeByEmployeeId(Builder $query, int $employeeId): Builder
    {
        return $query->where('employee_id', $employeeId);
    }

    public function scopeCompleted(Builder $query): Builder
    {
        return $query->whereNotNull('completed_at');
    }

    public function scopeInProgress(Builder $query): Builder
    {
        return $query->whereNotNull('started_at')
            ->whereNull('completed_at');
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->whereNull('started_at');
    }

    public function scopeStartedBetween(Builder $query, string $startDate, string $endDate): Builder
    {
        return $query->whereBetween('started_at', [$startDate, $endDate]);
    }

    public function scopeCompletedBetween(Builder $query, string $startDate, string $endDate): Builder
    {
        return $query->whereBetween('completed_at', [$startDate, $endDate]);
    }

    public function scopeHasEvidence(Builder $query): Builder
    {
        return $query->whereNotNull('evidence_attachment');
    }

    public function scopeNoEvidence(Builder $query): Builder
    {
        return $query->whereNull('evidence_attachment');
    }

    public function scopeWithAll(Builder $query): Builder
    {
        return $query->with(['orderItem', 'laundryServiceProcess', 'employee']);
    }

    public function scopeOrderedBySequence(Builder $query): Builder
    {
        return $query->orderByRaw('(SELECT sequence FROM laundry_service_processes WHERE laundry_service_processes.id = order_item_processes.laundry_service_process_id) ASC');
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function isCompleted(): bool
    {
        return !is_null($this->completed_at);
    }

    public function isInProgress(): bool
    {
        return !is_null($this->started_at) && is_null($this->completed_at);
    }

    public function isPending(): bool
    {
        return is_null($this->started_at);
    }

    /** @throws \Exception */
    public function start(?int $employeeId = null): bool
    {
        if (!$this->isPending()) {
            return false;
        }

        if ($employeeId) {
            $employee = Employee::find($employeeId);
            $outletId = $this->orderItem?->order?->outlet_id;
            if (!$employee || ($outletId && !$employee->isEligibleForProduction($outletId))) {
                throw new \Exception("Employee tidak memiliki posisi produksi aktif.");
            }

            $processId = $this->laundryServiceProcess?->process_id;
            if ($processId && !EmployeeProcess::canEmployeeWorkOn($employeeId, $processId)) {
                throw new \Exception("Employee tidak memiliki akses untuk mengerjakan proses ini.");
            }
        }

        $data = ['started_at' => now()];
        if ($employeeId) {
            $data['employee_id'] = $employeeId;
        }

        return $this->update($data);
    }

    /** @throws \Exception */
    public function complete(?float $qtyProcessed = null, ?int $employeeId = null): bool
    {
        if ($this->isCompleted()) {
            return false;
        }

        if ($employeeId) {
            $employee = Employee::find($employeeId);
            $outletId = $this->orderItem?->order?->outlet_id;
            if (!$employee || ($outletId && !$employee->isEligibleForProduction($outletId))) {
                throw new \Exception("Employee tidak memiliki posisi produksi aktif.");
            }

            $processId = $this->laundryServiceProcess?->process_id;
            if ($processId && !EmployeeProcess::canEmployeeWorkOn($employeeId, $processId)) {
                throw new \Exception("Employee tidak memiliki akses untuk mengerjakan proses ini.");
            }
        }

        $data = ['completed_at' => now()];

        if ($qtyProcessed !== null) {
            $data['qty_processed'] = $qtyProcessed;
        }

        if ($employeeId) {
            $data['employee_id'] = $employeeId;
        }

        return $this->update($data);
    }

    public function getProcessingDuration(): ?int
    {
        if (!$this->started_at || !$this->completed_at) {
            return null;
        }

        return $this->started_at->diffInMinutes($this->completed_at);
    }

    public function uploadEvidence($file): ?string
    {
        if (!$file) {
            return null;
        }

        $this->deleteEvidence();

        $path = $file->store('evidence/order-processes', 'public');
        $this->update(['evidence_attachment' => $path]);

        return $path;
    }

    public function deleteEvidence(): bool
    {
        if ($this->evidence_attachment && \Illuminate\Support\Facades\Storage::exists($this->evidence_attachment)) {
            return \Illuminate\Support\Facades\Storage::delete($this->evidence_attachment);
        }

        return true;
    }

    public function hasEvidence(): bool
    {
        return !empty($this->evidence_attachment);
    }

    public function getCommissionAmount(): ?float
    {
        if (!$this->employee_id) {
            return null;
        }

        $processId = $this->laundryServiceProcess?->process_id;
        if (!$processId) {
            return null;
        }

        $employeeProcess = EmployeeProcess::where('employee_id', $this->employee_id)
            ->where('process_id', $processId)
            ->where('is_active', true)
            ->first();

        return $employeeProcess?->commission?->commission_value;
    }

    public function calculateCommission(): ?float
    {
        if (!$this->employee_id || !$this->qty_processed) {
            return null;
        }

        $processId = $this->laundryServiceProcess?->process_id;
        if (!$processId) {
            return null;
        }

        $employeeProcess = EmployeeProcess::where('employee_id', $this->employee_id)
            ->where('process_id', $processId)
            ->where('is_active', true)
            ->first();

        $commission = $employeeProcess?->commission;
        if (!$commission) {
            return null;
        }

        return $commission->calculateCommission(
            (float) $this->qty_processed,
            (float) ($this->orderItem?->unit_price ?? 0)
        );
    }

    public function hasCommission(): bool
    {
        if (!$this->employee_id) {
            return false;
        }

        $processId = $this->laundryServiceProcess?->process_id;
        if (!$processId) {
            return false;
        }

        return EmployeeProcess::where('employee_id', $this->employee_id)
            ->where('process_id', $processId)
            ->where('is_active', true)
            ->whereHas('commission', fn($q) => $q->where('is_active', true))
            ->exists();
    }

    /** @throws \Exception */
    public function assignEmployee(int $employeeId): bool
    {
        $employee = Employee::find($employeeId);
        $outletId = $this->orderItem?->order?->outlet_id;
        if (!$employee || ($outletId && !$employee->isEligibleForProduction($outletId))) {
            throw new \Exception("Employee tidak memiliki posisi produksi aktif.");
        }

        $processId = $this->laundryServiceProcess?->process_id;

        if (!$processId) {
            throw new \Exception("Process tidak ditemukan.");
        }

        if (!EmployeeProcess::canEmployeeWorkOn($employeeId, $processId)) {
            throw new \Exception("Employee tidak memiliki akses untuk mengerjakan proses ini.");
        }

        return $this->update(['employee_id' => $employeeId]);
    }

    public function getCompletionPercentage(): float
    {
        $totalQty = $this->orderItem?->quantity ?? 0;

        if ($totalQty <= 0) {
            return 0;
        }

        return min(100, ($this->qty_processed / $totalQty) * 100);
    }

    /*
    |--------------------------------------------------------------------------
    | Static Helpers
    |--------------------------------------------------------------------------
    */

    public static function getByOrderItem(int $orderItemId): \Illuminate\Database\Eloquent\Collection
    {
        return static::byOrderItemId($orderItemId)
            ->orderedBySequence()
            ->withAll()
            ->get();
    }

    public static function getCompletedByEmployee(int $employeeId, ?string $startDate = null, ?string $endDate = null): \Illuminate\Database\Eloquent\Collection
    {
        $query = static::byEmployeeId($employeeId)->completed();

        if ($startDate && $endDate) {
            $query->completedBetween($startDate, $endDate);
        }

        return $query->withAll()->get();
    }

    public static function getTotalCommissionByEmployee(int $employeeId, ?string $startDate = null, ?string $endDate = null): float
    {
        $processes = static::getCompletedByEmployee($employeeId, $startDate, $endDate);

        return $processes->sum(function ($process) {
            return $process->calculateCommission() ?? 0;
        });
    }
}
