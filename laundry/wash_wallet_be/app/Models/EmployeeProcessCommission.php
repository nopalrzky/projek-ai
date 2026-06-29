<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Table('employee_process_commissions')]
class EmployeeProcessCommission extends Model
{
    use HasFactory, SoftDeletes;

    /*
    |--------------------------------------------------------------------------
    | TABLE & CONFIGURATION
    |--------------------------------------------------------------------------
    */

    protected $fillable = [
        'employee_process_id',
        'commission_type',
        'commission_value',
        'has_target',
        'target_threshold',
        'bonus_amount',
        'rules',
        'effective_date',
        'is_active',
    ];

    protected $hidden = [
        'deleted_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'commission_value' => 'decimal:2',
            'has_target'       => 'boolean',
            'target_threshold' => 'integer',
            'bonus_amount'     => 'decimal:2',
            'rules'            => 'array',
            'effective_date'   => 'date',
            'is_active'        => 'boolean',
            'created_at'       => 'datetime',
            'updated_at'       => 'datetime',
            'deleted_at'       => 'datetime',
        ];
    }

    protected $appends = [
        'employee',
        'process',
    ];

    /*
    |--------------------------------------------------------------------------
    | ACCESSORS & MUTATORS
    |--------------------------------------------------------------------------
    */

    protected function employee(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (!$this->relationLoaded('employeeProcess')) {
                    return null;
                }

                if (!$this->employeeProcess?->relationLoaded('employee')) {
                    return null;
                }

                return $this->employeeProcess->employee;
            }
        );
    }

    protected function process(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (!$this->relationLoaded('employeeProcess')) {
                    return null;
                }

                if (!$this->employeeProcess?->relationLoaded('process')) {
                    return null;
                }

                return $this->employeeProcess->process;
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | RELATIONSHIPS
    |--------------------------------------------------------------------------
    */

    public function employeeProcess(): BelongsTo
    {
        return $this->belongsTo(EmployeeProcess::class, 'employee_process_id');
    }

    public function workLogs(): HasMany
    {
        return $this->hasMany(WorkLog::class, 'employee_process_commission_id');
    }

    /*
    |--------------------------------------------------------------------------
    | QUERY SCOPES
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

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeInactive(Builder $query): Builder
    {
        return $query->where('is_active', false);
    }

    public function scopeByEmployeeProcessId(Builder $query, int $employeeProcessId): Builder
    {
        return $query->where('employee_process_id', $employeeProcessId);
    }

    public function scopeByEmployeeId(Builder $query, int $employeeId): Builder
    {
        return $query->whereHas('employeeProcess', function ($q) use ($employeeId) {
            $q->where('employee_id', $employeeId);
        });
    }

    public function scopeByProcessId(Builder $query, int $processId): Builder
    {
        return $query->whereHas('employeeProcess', function ($q) use ($processId) {
            $q->where('process_id', $processId);
        });
    }

    public function scopeByCommissionType(Builder $query, string $type): Builder
    {
        return $query->where('commission_type', $type);
    }

    public function scopeWithTarget(Builder $query): Builder
    {
        return $query->where('has_target', true);
    }

    public function scopeWithoutTarget(Builder $query): Builder
    {
        return $query->where('has_target', false);
    }

    public function scopeEffectiveAsOf(Builder $query, string $date): Builder
    {
        return $query->where(function ($q) use ($date) {
            $q->where('effective_date', '<=', $date)
                ->orWhereNull('effective_date');
        });
    }

    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->whereNested(function ($q) use ($search) {
            $q->where('commission_type', 'like', "%{$search}%")
                ->orWhere('rules', 'like', "%{$search}%");
        });
    }

    public function scopeSortBy(Builder $query, string $column = 'createdAt', string $direction = 'desc'): Builder
    {
        $allowedColumns = [
            'commissionType',
            'commissionValue',
            'effectiveDate',
            'isActive',
            'createdAt',
            'updatedAt',
        ];

        if (!in_array($column, $allowedColumns)) {
            $column = 'createdAt';
        }

        $columnMap = [
            'commissionType'  => 'commission_type',
            'commissionValue' => 'commission_value',
            'effectiveDate'   => 'effective_date',
            'isActive'        => 'is_active',
            'createdAt'       => 'created_at',
            'updatedAt'       => 'updated_at',
        ];

        $column    = $columnMap[$column] ?? $column;
        $direction = strtolower($direction) === 'asc' ? 'asc' : 'desc';

        return $query->orderBy($column, $direction);
    }

    /*
    |--------------------------------------------------------------------------
    | HELPERS
    |--------------------------------------------------------------------------
    */

    public function calculateCommission(float $quantity, float $price = 0): float
    {
        return match ($this->commission_type) {
            'per_item'   => $quantity * (float) $this->commission_value,
            'per_kg'     => $quantity * (float) $this->commission_value,
            'percentage' => ($price * $quantity) * ((float) $this->commission_value / 100),
            'flat'       => (float) $this->commission_value,
            default      => 0.0,
        };
    }

    public function hasReachedTarget(int $achieved): bool
    {
        if (!$this->has_target || $this->target_threshold === null) {
            return false;
        }

        return $achieved >= $this->target_threshold;
    }

    public function isActive(): bool
    {
        return (bool) $this->is_active;
    }
}
