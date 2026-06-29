<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Table('loan_logs')]
class LoanLog extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'loan_id',
        'type',
        'source',
        'payroll_item_id',
        'deposit_account_id',
        'amount',
        'payment_date',
        'scheduled_month',
        'scheduled_year',
        'note',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount'          => 'decimal:2',
            'payment_date'    => 'date',
            'scheduled_month' => 'integer',
            'scheduled_year'  => 'integer',
            'created_at'      => 'datetime',
            'updated_at'   => 'datetime',
            'deleted_at'   => 'datetime',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function loan(): BelongsTo
    {
        return $this->belongsTo(Loan::class);
    }

    public function depositAccount(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'deposit_account_id');
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

    public function scopeByLoanId(Builder $query, int $loanId): Builder
    {
        return $query->where('loan_id', $loanId);
    }

    public function scopeByType(Builder $query, string $type): Builder
    {
        return $query->where('type', $type);
    }

    public function scopeBySource(Builder $query, string $source): Builder
    {
        return $query->where('source', $source);
    }

    public function scopeManualPayments(Builder $query): Builder
    {
        return $query->whereIn('source', ['cash', 'transfer']);
    }

    public function scopeSalaryDeductions(Builder $query): Builder
    {
        return $query->where('source', 'payroll');
    }

    public function scopeByPayrollId(Builder $query, int $payrollId): Builder
    {
        return $query->whereHas('payrollItem', function (Builder $q) use ($payrollId) {
            $q->where('payroll_id', $payrollId);
        });
    }

    public function scopeByPayrollItemId(Builder $query, int $payrollItemId): Builder
    {
        return $query->where('payroll_item_id', $payrollItemId);
    }

    public function scopeByDepositAccountId(Builder $query, int $accountId): Builder
    {
        return $query->where('deposit_account_id', $accountId);
    }

    public function scopePaymentDateFrom(Builder $query, string $date): Builder
    {
        return $query->whereDate('payment_date', '>=', $date);
    }

    public function scopePaymentDateTo(Builder $query, string $date): Builder
    {
        return $query->whereDate('payment_date', '<=', $date);
    }

    public function scopeMinAmount(Builder $query, float $amount): Builder
    {
        return $query->where('amount', '>=', $amount);
    }

    public function scopeMaxAmount(Builder $query, float $amount): Builder
    {
        return $query->where('amount', '<=', $amount);
    }

    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->whereNested(function ($q) use ($search) {
            $q->whereHas('loan', function (Builder $q2) use ($search) {
                $q2->whereHas('employee', function (Builder $q3) use ($search) {
                    $q3->where('name', 'like', '%' . $search . '%');
                });
            });
        });
    }

    public function scopeSortBy(Builder $query, string $field, string $direction): Builder
    {
        $allowedFields = [
            'paymentDate',
            'amount',
            'createdAt',
            'updatedAt',
        ];

        $fieldMap = [
            'paymentDate' => 'payment_date',
            'createdAt'   => 'created_at',
            'updatedAt'   => 'updated_at',
        ];

        if (!in_array($field, $allowedFields)) {
            $field = 'createdAt';
        }

        $direction = in_array(strtolower($direction), ['asc', 'desc']) ? strtolower($direction) : 'desc';
        $field = $fieldMap[$field] ?? $field;
        $query->orderBy($field, $direction);

        return $query;
    }
}
