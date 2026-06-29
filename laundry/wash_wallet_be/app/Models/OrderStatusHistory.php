<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

#[Table('order_status_histories')]
class OrderStatusHistory extends Model
{
    use HasFactory;

    const ACTOR_TYPE_EMPLOYEE = 'employee';
    const ACTOR_TYPE_SYSTEM = 'system';
    const ACTOR_LABEL_SYSTEM = 'Sistem otomatis';

    protected $fillable = [
        'order_id',
        'employee_id',
        'actor_type',
        'actor_label',
        'from_status',
        'to_status',
        'notes',
        'metadata',
    ];

    protected $hidden = [];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'metadata'   => 'array',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Lifecycle Hooks
    |--------------------------------------------------------------------------
    */

    protected static function booted(): void
    {
        static::creating(function ($history) {
            if (empty($history->created_at)) {
                $history->created_at = now();
            }
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function order(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function employee(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    protected function outlet(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->employee->outlet ?? null
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Query Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeById(Builder $query, int $id): Builder
    {
        return $query->where('id', $id);
    }

    public function scopeByIds(Builder $query, array $ids): Builder
    {
        return $query->whereIn('id', $ids);
    }

    public function scopeByOrderId(Builder $query, int $orderId): Builder
    {
        return $query->where('order_id', $orderId);
    }

    public function scopeByOrderIds(Builder $query, array $orderIds): Builder
    {
        return $query->whereIn('order_id', $orderIds);
    }

    public function scopeByEmployeeId(Builder $query, int $employeeId): Builder
    {
        return $query->where('employee_id', $employeeId);
    }

    public function scopeByActorType(Builder $query, string $actorType): Builder
    {
        return $query->where('actor_type', $actorType);
    }

    public function scopeByOutlet(Builder $query, int $outletId): Builder
    {
        return $query->where(function (Builder $query) use ($outletId) {
            $query
                ->whereHas('employee', function ($q) use ($outletId) {
                    $q->where('outlet_id', $outletId);
                })
                ->orWhereHas('order', function ($q) use ($outletId) {
                    $q->where('outlet_id', $outletId);
                });
        });
    }

    public function scopeByFromStatus(Builder $query, string $fromStatus): Builder
    {
        return $query->where('from_status', $fromStatus);
    }

    public function scopeByToStatus(Builder $query, string $toStatus): Builder
    {
        return $query->where('to_status', $toStatus);
    }

    public function scopeByStatusChange(Builder $query, string $fromStatus, string $toStatus): Builder
    {
        return $query->where('from_status', $fromStatus)
            ->where('to_status', $toStatus);
    }

    public function scopeByFromStatuses(Builder $query, array $fromStatuses): Builder
    {
        return $query->whereIn('from_status', $fromStatuses);
    }

    public function scopeByToStatuses(Builder $query, array $toStatuses): Builder
    {
        return $query->whereIn('to_status', $toStatuses);
    }

    public function scopeOrderCreated(Builder $query): Builder
    {
        return $query->whereNull('from_status')->where('to_status', Order::STATUS_REQUESTED);
    }

    public function scopeOrderStarted(Builder $query): Builder
    {
        return $query->where('to_status', Order::STATUS_IN_PROGRESS);
    }

    public function scopeOrderCompleted(Builder $query): Builder
    {
        return $query->where('to_status', Order::STATUS_COMPLETED);
    }

    public function scopeOrderCancelled(Builder $query): Builder
    {
        return $query->where('to_status', Order::STATUS_CANCELLED);
    }

    public function scopeOrderReady(Builder $query): Builder
    {
        return $query->where('to_status', Order::STATUS_READY);
    }

    public function scopeByDate(Builder $query, ?string $startDate = null, ?string $endDate = null): Builder
    {
        return $query->when($startDate, function ($q) use ($startDate) {
            return $q->whereDate('created_at', '>=', Carbon::parse($startDate));
        })->when($endDate, function ($q) use ($endDate) {
            return $q->whereDate('created_at', '<=', Carbon::parse($endDate));
        });
    }

    public function scopeCreatedBetween(Builder $query, string $startDate, string $endDate): Builder
    {
        return $query->whereBetween('created_at', [
            Carbon::parse($startDate)->startOfDay(),
            Carbon::parse($endDate)->endOfDay()
        ]);
    }

    public function scopeToday(Builder $query): Builder
    {
        return $query->whereDate('created_at', today());
    }

    public function scopeThisWeek(Builder $query): Builder
    {
        return $query->whereBetween('created_at', [
            now()->startOfWeek(),
            now()->endOfWeek()
        ]);
    }

    public function scopeThisMonth(Builder $query): Builder
    {
        return $query->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year);
    }

    public function scopeLastNDays(Builder $query, int $days): Builder
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->whereNested(function ($q) use ($search) {
            $q->where('from_status', 'like', "%{$search}%")
                ->orWhere('to_status', 'like', "%{$search}%")
                ->orWhere('notes', 'like', "%{$search}%")
                ->orWhereHas('order', function ($orderQuery) use ($search) {
                    $orderQuery->where('order_number', 'like', "%{$search}%");
                })
                ->orWhereHas('employee', function ($employeeQuery) use ($search) {
                    $employeeQuery->where('name', 'like', "%{$search}%");
                });
        });
    }

    public function scopeFilterBy(Builder $query, array $filters): Builder
    {
        return $query
            ->when(!empty($filters['search']), fn($q) => $q->search($filters['search']))
            ->when(!empty($filters['order_id']), fn($q) => $q->byOrderId($filters['order_id']))
            ->when(!empty($filters['employee_id']), fn($q) => $q->byEmployeeId($filters['employee_id']))
            ->when(!empty($filters['outlet_id']), fn($q) => $q->byOutlet($filters['outlet_id']))
            ->when(!empty($filters['from_status']), fn($q) => $q->byFromStatus($filters['from_status']))
            ->when(!empty($filters['to_status']), fn($q) => $q->byToStatus($filters['to_status']))
            ->when(!empty($filters['date_start']) || !empty($filters['date_end']), fn($q) => $q->byDate($filters['date_start'] ?? null, $filters['date_end'] ?? null))
            ->when(!empty($filters['today']), fn($q) => $q->today())
            ->when(!empty($filters['this_week']), fn($q) => $q->thisWeek())
            ->when(!empty($filters['this_month']), fn($q) => $q->thisMonth())
            ->when(!empty($filters['last_n_days']), fn($q) => $q->lastNDays($filters['last_n_days']));
    }

    public function scopeSortBy(Builder $query, string $column = 'created_at', string $direction = 'desc'): Builder
    {
        $allowedColumns = [
            'from_status',
            'to_status',
            'created_at',
            'updated_at'
        ];

        if (!in_array($column, $allowedColumns)) {
            $column = 'created_at';
        }

        $direction = strtolower($direction) === 'asc' ? 'asc' : 'desc';
        $query->orderBy($column, $direction);

        return $query;
    }

    public function scopeLatest(Builder $query): Builder
    {
        $query->orderBy('created_at', 'desc');

        return $query;
    }

    public function scopeOldest(Builder $query): Builder
    {
        $query->orderBy('created_at', 'asc');

        return $query;
    }

    public function scopeChronological(Builder $query): Builder
    {
        $query->orderBy('created_at', 'asc');

        return $query;
    }

    public function scopeWithMinimalData(Builder $query): Builder
    {
        return $query->select(['id', 'order_id', 'from_status', 'to_status', 'created_at']);
    }

    public function scopeWithFullData(Builder $query): Builder
    {
        return $query->with([
            'order:id,order_number,status',
            'employee:id,name'
        ]);
    }

    public function scopeCountByStatus(Builder $query): Collection
    {
        return $query->selectRaw('to_status, COUNT(*) as count')
            ->groupBy('to_status')
            ->get();
    }

    public function scopeCountByStatusTransition(Builder $query): Collection
    {
        return $query->selectRaw('from_status, to_status, COUNT(*) as count')
            ->groupBy('from_status', 'to_status')
            ->get();
    }

    public function scopeCountByEmployee(Builder $query): Collection
    {
        return $query->selectRaw('employee_id, COUNT(*) as count')
            ->with('employee:id,name')
            ->groupBy('employee_id')
            ->get();
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    protected function statusChangeDescription(): Attribute
    {
        return Attribute::make(
            get: function () {
                $toLabel = $this->getStatusLabel($this->to_status);

                if (!$this->from_status) {
                    return "Order dibuat dengan status: {$toLabel}";
                }

                $fromLabel = $this->getStatusLabel($this->from_status);

                if ($this->actor_type === self::ACTOR_TYPE_SYSTEM && $this->actor_label) {
                    return "Status diubah dari {$fromLabel} ke {$toLabel} oleh {$this->actor_label}";
                }

                return "Status diubah dari {$fromLabel} ke {$toLabel}";
            }
        );
    }

    protected function fromStatusLabel(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->from_status ? $this->getStatusLabel($this->from_status) : null
        );
    }

    protected function toStatusLabel(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->getStatusLabel($this->to_status)
        );
    }

    protected function formattedCreatedAt(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->created_at->format('d/m/Y H:i:s')
        );
    }

    protected function timeAgo(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->created_at->diffForHumans()
        );
    }

    public function isInitialStatus(): bool
    {
        return is_null($this->from_status);
    }

    public function isStatusUpgrade(): bool
    {
        $statusOrder = [
            Order::STATUS_REQUESTED        => 1,
            Order::STATUS_ACCEPTED         => 2,
            Order::STATUS_PICKING_UP       => 3,
            Order::STATUS_PICKED_UP        => 4,
            Order::STATUS_RECEIVED         => 5,
            Order::STATUS_WEIGHING         => 6,
            Order::STATUS_READY_TO_PROCESS => 7,
            Order::STATUS_IN_PROGRESS      => 8,
            Order::STATUS_READY            => 9,
            Order::STATUS_DELIVERING       => 10,
            Order::STATUS_DELIVERED        => 11,
            Order::STATUS_COMPLETED        => 12,
            Order::STATUS_CANCELLED        => 0,
            Order::STATUS_REJECTED         => 0
        ];

        $fromOrder = $statusOrder[$this->from_status] ?? 0;
        $toOrder   = $statusOrder[$this->to_status] ?? 0;

        return $toOrder > $fromOrder;
    }

    public function isStatusDowngrade(): bool
    {
        $statusOrder = [
            Order::STATUS_REQUESTED        => 1,
            Order::STATUS_ACCEPTED         => 2,
            Order::STATUS_PICKING_UP       => 3,
            Order::STATUS_PICKED_UP        => 4,
            Order::STATUS_RECEIVED         => 5,
            Order::STATUS_WEIGHING         => 6,
            Order::STATUS_READY_TO_PROCESS => 7,
            Order::STATUS_IN_PROGRESS      => 8,
            Order::STATUS_READY            => 9,
            Order::STATUS_DELIVERING       => 10,
            Order::STATUS_DELIVERED        => 11,
            Order::STATUS_COMPLETED        => 12,
            Order::STATUS_CANCELLED        => 0,
            Order::STATUS_REJECTED         => 0
        ];

        $fromOrder = $statusOrder[$this->from_status] ?? 0;
        $toOrder   = $statusOrder[$this->to_status] ?? 0;

        return $toOrder < $fromOrder && $fromOrder > 0;
    }

    public function isCancellation(): bool
    {
        return $this->to_status === 'cancelled';
    }

    public function isCompletion(): bool
    {
        return $this->to_status === 'delivered';
    }

    public function isOnHold(): bool
    {
        return $this->to_status === 'on_hold';
    }

    private function getStatusLabel(?string $status): string
    {
        if (!$status) {
            return 'Awal';
        }

        return match ($status) {
            Order::STATUS_REQUESTED        => 'Diajukan',
            Order::STATUS_CANCELLED        => 'Dibatalkan',
            Order::STATUS_ACCEPTED         => 'Diterima',
            Order::STATUS_REJECTED         => 'Ditolak',
            Order::STATUS_PICKING_UP       => 'Sedang Dijemput',
            Order::STATUS_PICKED_UP        => 'Sudah Diambil',
            Order::STATUS_RECEIVED         => 'Di Outlet',
            Order::STATUS_WEIGHING         => 'Ditimbang',
            Order::STATUS_READY_TO_PROCESS => 'Siap Dikerjakan',
            Order::STATUS_IN_PROGRESS      => 'Sedang Dikerjakan',
            Order::STATUS_READY            => 'Siap Diantar',
            Order::STATUS_DELIVERING       => 'Sedang Diantar',
            Order::STATUS_DELIVERED        => 'Terkirim',
            Order::STATUS_COMPLETED        => 'Selesai',
            default                        => ucfirst($status)
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Static Helpers
    |--------------------------------------------------------------------------
    */

    public static function logStatusChange(
        int $orderId,
        ?int $employeeId,
        ?string $fromStatus,
        string $toStatus,
        ?string $notes = null,
        ?array $metadata = null,
        string $actorType = self::ACTOR_TYPE_EMPLOYEE,
        ?string $actorLabel = null
    ): self {
        return static::create([
            'order_id'    => $orderId,
            'employee_id' => $employeeId,
            'actor_type'  => $actorType,
            'actor_label' => $actorLabel,
            'from_status' => $fromStatus,
            'to_status'   => $toStatus,
            'notes'       => $notes,
            'metadata'    => $metadata,
        ]);
    }

    public static function logSystemStatusChange(
        int $orderId,
        ?string $fromStatus,
        string $toStatus,
        ?string $notes = null,
        ?array $metadata = null
    ): self {
        return static::logStatusChange(
            $orderId,
            null,
            $fromStatus,
            $toStatus,
            $notes,
            $metadata,
            self::ACTOR_TYPE_SYSTEM,
            self::ACTOR_LABEL_SYSTEM
        );
    }

    public static function getOrderHistory(int $orderId): Collection
    {
        return static::where('order_id', $orderId)
            ->with('employee:id,name')
            ->chronological()
            ->get();
    }

    public static function getEmployeeActivity(int $employeeId, ?int $days = null): Collection
    {
        $query = static::where('employee_id', $employeeId)
            ->with('order:id,order_number');

        if ($days) {
            $query->lastNDays($days);
        }

        return $query->latest()->get();
    }

    public static function getOutletActivity(int $outletId, ?int $days = null): Collection
    {
        $query = static::byOutlet($outletId)
            ->with(['order:id,order_number', 'employee:id,name']);

        if ($days) {
            $query->lastNDays($days);
        }

        return $query->latest()->get();
    }

    public static function getMostActiveEmployees(?int $outletId = null, int $limit = 10): Collection
    {
        $query = static::query();

        if ($outletId) {
            $query->byOutlet($outletId);
        }

        return $query->selectRaw('employee_id, COUNT(*) as activity_count')
            ->with('employee:id,name')
            ->groupBy('employee_id')
            ->orderByDesc('activity_count')
            ->limit($limit)
            ->get();
    }

    public static function getRecentActivity(?int $outletId = null, int $limit = 50): Collection
    {
        $query = static::query();

        if ($outletId) {
            $query->byOutlet($outletId);
        }

        return $query->with(['order:id,order_number', 'employee:id,name'])
            ->latest()
            ->limit($limit)
            ->get();
    }
}
