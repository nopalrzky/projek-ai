<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Casts\Attribute;

#[Table('order_items')]
class OrderItem extends Model
{
    use HasFactory, SoftDeletes;

    public const STATUS_PENDING = 'pending';
    public const STATUS_PROCESSING = 'processing';
    public const STATUS_DONE = 'done';
    public const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'order_id',
        'laundry_service_id',
        'category_name',
        'laundry_service_name',
        'unit_name',
        'quantity',
        'unit_price',
        'discount_amount',
        'subtotal',
        'total_amount',
        'status',
        'is_package_usage',
        'customer_subscription_id',
        'quota_used',
        'paid_amount',
        'item_notes',
        'notes',
        'special_instructions',
        'started_at',
        'completed_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'quantity'        => 'decimal:2',
            'unit_price'      => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'subtotal'        => 'decimal:2',
            'total_amount'    => 'decimal:2',
            'started_at'      => 'datetime',
            'completed_at'    => 'datetime',
            'created_at'      => 'datetime',
            'updated_at'      => 'datetime',
            'deleted_at'      => 'datetime',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Accessors & Mutators
    |--------------------------------------------------------------------------
    */

    protected function specialInstructions(): Attribute
    {
        return Attribute::make(
            get: fn($value, $attributes) => isset($attributes['special_instructions'])
                ? json_decode($attributes['special_instructions'], true)
                : null,
            set: fn($value) => ['special_instructions' => $value ? json_encode($value) : null],
        );
    }

    /**
     * Get the completion percentage for this order item.
     */
    protected function completionPercentage(): Attribute
    {
        return Attribute::get(function () {
            $processes = $this->orderItemProcesses;
            $total = $processes->count();

            if ($total === 0) {
                return $this->status === self::STATUS_DONE ? 100 : 0;
            }

            $completed = $processes->filter(fn($p) => !is_null($p->completed_at))->count();

            return (int) round(($completed / $total) * 100);
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function laundryService(): BelongsTo
    {
        return $this->belongsTo(LaundryService::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function customerSubscription(): BelongsTo
    {
        return $this->belongsTo(CustomerSubscription::class);
    }

    public function servicePackage(): BelongsTo
    {
        return $this->belongsTo(ServicePackage::class);
    }

    public function orderItemProcesses(): HasMany
    {
        return $this->hasMany(OrderItemProcess::class);
    }

    public function quotaUsageLog(): HasOne
    {
        return $this->hasOne(QuotaUsageLog::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Query Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeByOrderId(Builder $query, int $orderId): Builder
    {
        return $query->where('order_id', $orderId);
    }

    public function scopeByOutletId(Builder $query, int $outletId): Builder
    {
        return $query->whereHas('order.employee', function (Builder $builder) use ($outletId) {
            $builder->where('outlet_id', $outletId);
        });
    }

    public function scopeByLaundryServiceId(Builder $query, int $laundryServiceId): Builder
    {
        return $query->where('laundry_service_id', $laundryServiceId);
    }

    public function scopeByOwnerId(Builder $query, int $ownerId): Builder
    {
        return $query->whereHas('order.employee.outlet', function (Builder $builder) use ($ownerId) {
            $builder->where('owner_id', $ownerId);
        });
    }

    public function scopeByStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', 'pending');
    }

    public function scopeInProgress(Builder $query): Builder
    {
        return $query->where('status', 'in_progress');
    }

    public function scopeCompleted(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_DONE);
    }

    public function scopeSortBy(Builder $query, string $column = 'created_at', string $direction = 'desc'): Builder
    {
        $allowedColumns = [
            'quantity',
            'unitPrice',
            'discountAmount',
            'subtotal',
            'status',
            'startedAt',
            'completedAt',
            'createdAt',
            'updatedAt',
        ];

        $columnMap = [
            'unitPrice'      => 'unit_price',
            'discountAmount' => 'discount_amount',
            'startedAt'      => 'started_at',
            'completedAt'    => 'completed_at',
            'createdAt'      => 'created_at',
            'updatedAt'      => 'updated_at',
        ];

        if (!in_array($column, $allowedColumns)) {
            $column = 'created_at';
        }

        $column    = $columnMap[$column] ?? $column;
        $direction = strtolower($direction) === 'asc' ? 'asc' : 'desc';
        $query->orderBy($column, $direction);

        return $query;
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

    public function getProcessProgress(): array
    {
        $processes = $this->orderItemProcesses;
        $total     = $processes->count();
        $completed = $processes->filter(fn($p) => !is_null($p->completed_at))->count();

        return [
            'total'     => $total,
            'completed' => $completed,
            'remaining' => $total - $completed,
            'percent'   => $total > 0 ? round(($completed / $total) * 100, 2) : 0,
        ];
    }

    public function getFormattedUnitPrice(): string
    {
        return 'Rp ' . number_format((float) $this->unit_price, 0, ',', '.');
    }

    public function getFormattedSubtotal(): string
    {
        return 'Rp ' . number_format((float) $this->subtotal, 0, ',', '.');
    }

    public function getFormattedDiscountAmount(): string
    {
        return 'Rp ' . number_format((float) $this->discount_amount, 0, ',', '.');
    }

    public function getStatusLabel(): string
    {
        return match ($this->status) {
            'pending'     => 'Menunggu',
            'in_progress' => 'Diproses',
            'completed'   => 'Selesai',
            'cancelled'   => 'Dibatalkan',
            default       => 'Unknown',
        };
    }

    public function usesSubscription(): bool
    {
        return !is_null($this->customer_subscription_id);
    }

    public function usesPackage(): bool
    {
        return !is_null($this->service_package_id);
    }
}
