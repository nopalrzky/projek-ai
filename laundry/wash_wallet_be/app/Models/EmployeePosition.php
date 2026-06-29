<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Table('employee_positions')]
class EmployeePosition extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'employee_id',
        'position_id',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     */
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'deleted_at',
    ];

    /**
     * Default values for attributes.
     */
    protected $attributes = [
        'is_active' => true,
    ];

    /**
     * Relationships
     */

    /**
     * Get the employee that owns this position assignment.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Get the position for this assignment.
     */
    public function position(): BelongsTo
    {
        return $this->belongsTo(Position::class);
    }

    /**
     * Get the outlet for this assignment through the position.
     */
    public function outlet()
    {
        return $this->hasOneThrough(Outlet::class, Position::class, 'id', 'id', 'position_id', 'outlet_id');
    }

    /**
     * Auto-convert snake_case database columns to camelCase attributes
     */
    protected function employeeId(): Attribute
    {
        return Attribute::make(
            get: fn($value, $attributes) => $attributes['employee_id'] ?? null,
            set: fn($value) => ['employee_id' => $value],
        );
    }

    protected function positionId(): Attribute
    {
        return Attribute::make(
            get: fn($value, $attributes) => $attributes['position_id'] ?? null,
            set: fn($value) => ['position_id' => $value],
        );
    }

    protected function isActive(): Attribute
    {
        return Attribute::make(
            get: fn($value, $attributes) => (bool) ($attributes['is_active'] ?? false),
            set: fn($value) => ['is_active' => (bool) $value],
        );
    }

    /**
     * Scope a query to only include active position assignments.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include inactive position assignments.
     */
    public function scopeInactive(Builder $query): Builder
    {
        return $query->where('is_active', false);
    }

    public function scopeById(Builder $query, int $id): Builder
    {
        return $query->where('id', $id);
    }

    /**
     * Scope a query to filter by employee.
     */
    public function scopeByEmployeeId(Builder $query, int $employeeId): Builder
    {
        return $query->where('employee_id', $employeeId);
    }

    /**
     * Scope a query to filter by position.
     */
    public function scopeByPositionId(Builder $query, int $positionId): Builder
    {
        return $query->where('position_id', $positionId);
    }

    /**
     * Scope a query to filter by outlet through position relationship.
     */
    public function scopeByOutletId(Builder $query, int $outletId): Builder
    {
        return $query->whereHas('position', function ($query) use ($outletId) {
            $query->where('outlet_id', $outletId);
        });
    }

    public function scopeByIds(Builder $query, array $ids): Builder
    {
        return $query->whereIn('id', $ids);
    }

    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->whereHas('employee', function (Builder $q) use ($search) {
            $q->where('name', 'like', '%' . $search . '%')
                ->orWhere('username', 'like', '%' . $search . '%');
        })->orWhereHas('position', function (Builder $q) use ($search) {
            $q->where('name', 'like', '%' . $search . '%');
        });
    }

    public function scopeSortBy(Builder $query, string $column = 'created_at', string $direction = 'desc'): Builder
    {
        $allowedColumns = [
            'employeeId',
            'positionId',
            'isActive',
            'createdAt',
            'updatedAt',
        ];

        if (!in_array($column, $allowedColumns)) {
            $column = 'createdAt';
        }

        $columnMap = [
            'employeeId' => 'employee_id',
            'positionId' => 'position_id',
            'isActive' => 'is_active',
            'createdAt' => 'created_at',
            'updatedAt' => 'updated_at',
        ];

        $column = $columnMap[$column] ?? $column;

        $direction = strtolower($direction) === 'asc' ? 'asc' : 'desc';
        $query->orderBy($column, $direction);

        return $query;
    }
}
