<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Table('work_logs')]
class WorkLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'process_id',
        'employee_process_id',
        'order_item_process_id',
        'employee_process_commission_id',
        'payroll_item_id',
        'commission_type',
        'commission_value',
        'qty',
        'base_amount',
        'has_bonus',
        'bonus_amount',
        'total_amount',
        'achieved_count',
        'period_year',
        'period_month',
        'worked_at',
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
            'qty'              => 'decimal:2',
            'base_amount'      => 'decimal:2',
            'has_bonus'        => 'boolean',
            'bonus_amount'     => 'decimal:2',
            'total_amount'     => 'decimal:2',
            'achieved_count'   => 'integer',
            'period_year'      => 'integer',
            'period_month'     => 'integer',
            'worked_at'        => 'datetime',
            'created_at'       => 'datetime',
            'updated_at'       => 'datetime',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function process(): BelongsTo
    {
        return $this->belongsTo(Process::class);
    }

    public function employeeProcess(): BelongsTo
    {
        return $this->belongsTo(EmployeeProcess::class);
    }

    public function orderItemProcess(): BelongsTo
    {
        return $this->belongsTo(OrderItemProcess::class);
    }

    public function employeeProcessCommission(): BelongsTo
    {
        return $this->belongsTo(EmployeeProcessCommission::class);
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

    public function scopeByEmployeeId(Builder $query, int $employeeId): Builder
    {
        return $query->where('employee_id', $employeeId);
    }

    public function scopeByPeriod(Builder $query, int $year, int $month): Builder
    {
        return $query->where('period_year', $year)->where('period_month', $month);
    }

    public function scopeByCommissionId(Builder $query, int $commissionId): Builder
    {
        return $query->where('employee_process_commission_id', $commissionId);
    }

    public function scopeUnpaid(Builder $query): Builder
    {
        return $query->whereNull('payroll_item_id');
    }

    public function scopePaid(Builder $query): Builder
    {
        return $query->whereNotNull('payroll_item_id');
    }

    public function scopeWithBonus(Builder $query): Builder
    {
        return $query->where('has_bonus', true);
    }
}
