<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Carbon\Carbon;

#[Table('salaries')]
class Salary extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'type',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function employeeSalaries(): HasMany
    {
        return $this->hasMany(EmployeeSalary::class);
    }

    public function fines(): HasMany
    {
        return $this->hasMany(Fine::class);
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

    public function scopeByType(Builder $query, string $type): Builder
    {
        return $query->where('type', $type);
    }

    public function scopeDaily(Builder $query): Builder
    {
        return $query->where('type', 'daily');
    }

    public function scopeMonthly(Builder $query): Builder
    {
        return $query->where('type', 'monthly');
    }

    public function scopeHourly(Builder $query): Builder
    {
        return $query->where('type', 'hourly');
    }

    public function scopeOnce(Builder $query): Builder
    {
        return $query->where('type', 'once');
    }

    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->whereNested(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%")
                ->orWhere('type', 'like', "%{$search}%");
        });
    }

    public function scopeSortBy(Builder $query, string $column = 'createdAt', string $direction = 'asc'): Builder
    {
        $allowedColumns = [
            'name',
            'description',
            'type',
            'createdAt',
            'updatedAt',
            'employeeSalariesCount',
        ];

        $columnMap = [
            'createdAt'            => 'created_at',
            'updatedAt'            => 'updated_at',
            'employeeSalariesCount' => 'employee_salaries_count',
        ];

        if (!in_array($column, $allowedColumns)) {
            $column = 'createdAt';
        }

        $column = $columnMap[$column] ?? $column;

        $direction = strtolower($direction) === 'desc' ? 'desc' : 'asc';

        if ($column === 'employeeSalariesCount') {
            $query->withCount('employeeSalaries')->orderBy('employee_salaries_count', $direction);

            return $query;
        }

        $query->orderBy($column, $direction);

        return $query;
    }
}
