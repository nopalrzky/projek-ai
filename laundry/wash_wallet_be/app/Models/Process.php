<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Table('processes')]
class Process extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'description',
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
            'is_active'  => 'boolean',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function laundryServiceProcesses(): HasMany
    {
        return $this->hasMany(LaundryServiceProcess::class);
    }

    /**
     * Process -> EmployeeProcess -> EmployeeProcessCommission
     */
    public function employeeProcessCommissions(): HasManyThrough
    {
        return $this->hasManyThrough(
            EmployeeProcessCommission::class,
            EmployeeProcess::class,
            'process_id',
            'employee_process_id',
            'id',
            'id'
        );
    }

    public function employeeProcesses(): HasMany
    {
        return $this->hasMany(EmployeeProcess::class);
    }

    public function laundryServices(): BelongsToMany
    {
        return $this->belongsToMany(LaundryService::class, 'laundry_service_processes')
            ->withPivot(['sequence'])
            ->withTimestamps()
            ->orderByPivot('sequence');
    }

    public function employees(): BelongsToMany
    {
        return $this->belongsToMany(Employee::class, 'employee_processes')
            ->withPivot(['is_active', 'notes', 'assigned_at'])
            ->withTimestamps();
    }

    public function assignedEmployees(): BelongsToMany
    {
        return $this->belongsToMany(Employee::class, 'employee_processes')
            ->withPivot(['is_active', 'notes', 'assigned_at'])
            ->withTimestamps()
            ->wherePivot('is_active', true);
    }

    /*
    |--------------------------------------------------------------------------
    | Query Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeInactive(Builder $query): Builder
    {
        return $query->where('is_active', false);
    }

    public function scopeById(Builder $query, int $id): Builder
    {
        return $query->where('id', $id);
    }

    public function scopeByIds(Builder $query, array $ids): Builder
    {
        return $query->whereIn('id', $ids);
    }

    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->whereNested(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%");
        });
    }

    public function scopeSortBy(Builder $query, string $column = 'created_at', string $direction = 'desc'): Builder
    {
        $allowedColumns = [
            'name',
            'isActive',
            'createdAt',
            'updatedAt',
        ];

        $columnMap = [
            'isActive'  => 'is_active',
            'createdAt' => 'created_at',
            'updatedAt' => 'updated_at',
        ];

        if (!in_array($column, $allowedColumns)) {
            $column = 'createdAt';
        }

        $column = $columnMap[$column] ?? $column;

        $direction = strtolower($direction) === 'asc' ? 'asc' : 'desc';
        $query->orderBy($column, $direction);

        return $query;
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function canBeDeleted(): bool
    {
        return $this->laundryServiceProcesses()->count() === 0
            && $this->employeeProcessCommissions()->count() === 0;
    }
}
