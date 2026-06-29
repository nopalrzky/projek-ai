<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Table('fine_logs')]
class FineLog extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'employee_id',
        'fine_id',
        'payroll_item_id',
        'date',
        'amount',
        'reason',
        'attachment',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date'       => 'date',
            'amount'     => 'decimal:2',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    protected $hidden = [
        'deleted_at',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function fine(): BelongsTo
    {
        return $this->belongsTo(Fine::class);
    }

    public function outlet(): HasOneThrough
    {
        return $this->hasOneThrough(
            Outlet::class,
            Employee::class,
            'id',
            'id',
            'employee_id',
            'outlet_id'
        );
    }

    public function payrollItem(): BelongsTo
    {
        return $this->belongsTo(PayrollItem::class);
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

    public function scopeByEmployeeId(Builder $query, int $employeeId): Builder
    {
        return $query->where('employee_id', $employeeId);
    }

    public function scopeByFineId(Builder $query, int $fineId): Builder
    {
        return $query->where('fine_id', $fineId);
    }

    public function scopeByOutletId(Builder $query, int $outletId): Builder
    {
        return $query->whereHas('employee', function (Builder $q) use ($outletId) {
            $q->where('outlet_id', $outletId);
        });
    }

    public function scopeByOwnerId(Builder $query, int $ownerId): Builder
    {
        return $query->whereHas('employee.outlet', function (Builder $q) use ($ownerId) {
            $q->where('owner_id', $ownerId);
        });
    }

    public function scopeUnpaid(Builder $query): Builder
    {
        return $query->whereNull('payroll_item_id');
    }

    public function scopePaid(Builder $query): Builder
    {
        return $query->whereNotNull('payroll_item_id');
    }

    public function scopeByPayrollItemId(Builder $query, int $payrollItemId): Builder
    {
        return $query->where('payroll_item_id', $payrollItemId);
    }

    public function scopeBetween(Builder $query, string $column, array $range): Builder
    {
        return $query->whereBetween($column, $range);
    }

    public function scopeSearch(Builder $query, string $term): Builder
    {
        $like = '%' . $term . '%';

        return $query->whereNested(function (Builder $q) use ($like) {
            $q->whereHas('employee', function (Builder $q2) use ($like) {
                $q2->where('name', 'like', $like)
                    ->orWhere('username', 'like', $like)
                    ->orWhereHas('outlet', function (Builder $q3) use ($like) {
                        $q3->where('name', 'like', $like);
                    });
            })->orWhereHas('fine', function (Builder $q2) use ($like) {
                $q2->where('name', 'like', $like);
            })->orWhere('reason', 'like', $like);
        });
    }

    public function scopeSortBy(Builder $query, string $column = 'date', string $direction = 'desc'): Builder
    {
        $allowedColumns = [
            'id',
            'employeeId',
            'fineId',
            'outletId',
            'date',
            'amount',
            'createdAt',
            'updatedAt',
        ];

        $columnMap = [
            'employeeId' => 'employee_id',
            'fineId'     => 'fine_id',
            'outletId'   => 'outlet_id',
            'createdAt'  => 'created_at',
            'updatedAt'  => 'updated_at',
        ];

        if (!in_array($column, $allowedColumns)) {
            $column = 'date';
        }

        $column    = $columnMap[$column] ?? $column;
        $direction = strtolower($direction) === 'asc' ? 'asc' : 'desc';
        $query->orderBy($column, $direction);

        return $query;
    }
}
