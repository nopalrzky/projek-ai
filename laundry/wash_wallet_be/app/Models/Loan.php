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
use Illuminate\Support\Carbon;

#[Table('loans')]
class Loan extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'employee_id',
        'source_account_id',
        'amount',
        'remaining_amount',
        'installment_amount',
        'total_installments',
        'loan_date',
        'due_date',
        'status',
        'repayment_type',
        'installment_period',
        'note',
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
            'amount'             => 'decimal:2',
            'remaining_amount'   => 'decimal:2',
            'installment_amount' => 'decimal:2',
            'total_installments' => 'integer',
            'installment_period' => 'integer',
            'loan_date'          => 'date',
            'due_date'           => 'date',
            'created_at'         => 'datetime',
            'updated_at'         => 'datetime',
            'deleted_at'         => 'datetime',
        ];
    }

    protected $appends = [
        'paid_amount',
        'is_paid',
        'progress_percentage',
        'repayment_type_label',
        'status_label',
    ];

    /*
    |--------------------------------------------------------------------------
    | Accessors
    |--------------------------------------------------------------------------
    */

    protected function progressPercentage(): Attribute
    {
        return Attribute::make(
            get: fn(): float => (float) ($this->amount > 0
                ? (($this->amount - $this->remaining_amount) / $this->amount) * 100
                : 0)
        );
    }

    protected function paidAmount(): Attribute
    {
        return Attribute::make(
            get: fn(): float => (float) ($this->amount - $this->remaining_amount)
        );
    }

    protected function isPaid(): Attribute
    {
        return Attribute::make(
            get: fn(): bool => $this->status === 'paid' || (float) $this->remaining_amount <= 0
        );
    }

    protected function repaymentTypeLabel(): Attribute
    {
        return Attribute::make(
            get: fn(): ?string => match ($this->repayment_type) {
                'full' => 'Full',
                'installment' => 'Installment',
                default => null,
            }
        );
    }

    protected function statusLabel(): Attribute
    {
        return Attribute::make(
            get: fn(): ?string => match ($this->status) {
                'ongoing' => 'Ongoing',
                'paid' => 'Paid',
                'bad_debt' => 'Bad Debt',
                default => null,
            }
        );
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

    public function sourceAccount(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'source_account_id');
    }

    public function loanLogs(): HasMany
    {
        return $this->hasMany(LoanLog::class);
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

    public function scopeByEmployeeId(Builder $query, int $employeeId): Builder
    {
        return $query->where('employee_id', $employeeId);
    }

    public function scopeByOutletId(Builder $query, int $outletId): Builder
    {
        return $query->whereHas('employee', function (Builder $employeeQuery) use ($outletId) {
            $employeeQuery->where('outlet_id', $outletId);
        });
    }

    public function scopeByOwnerId(Builder $query, int $ownerId): Builder
    {
        return $query->whereHas('employee.outlet', function (Builder $outletQuery) use ($ownerId) {
            $outletQuery->where('owner_id', $ownerId);
        });
    }

    public function scopeBySourceAccountId(Builder $query, int $accountId): Builder
    {
        return $query->where('source_account_id', $accountId);
    }

    public function scopeByStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }

    public function scopeStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }

    public function scopeOngoing(Builder $query): Builder
    {
        return $query->where('status', 'ongoing');
    }

    public function scopePaid(Builder $query): Builder
    {
        return $query->where('status', 'paid');
    }

    public function scopeBadDebt(Builder $query): Builder
    {
        return $query->where('status', 'bad_debt');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'ongoing')
            ->where('remaining_amount', '>', 0);
    }

    public function scopeByRepaymentType(Builder $query, string $type): Builder
    {
        return $query->where('repayment_type', $type);
    }

    public function scopeRepaymentType(Builder $query, string $type): Builder
    {
        return $query->where('repayment_type', $type);
    }

    public function scopeLoanDateFrom(Builder $query, Carbon $date): Builder
    {
        return $query->whereDate('loan_date', '>=', $date);
    }

    public function scopeLoanDateTo(Builder $query, Carbon $date): Builder
    {
        return $query->whereDate('loan_date', '<=', $date);
    }

    public function scopeDueDateFrom(Builder $query, Carbon $date): Builder
    {
        return $query->whereDate('due_date', '>=', $date);
    }

    public function scopeDueDateTo(Builder $query, Carbon $date): Builder
    {
        return $query->whereDate('due_date', '<=', $date);
    }

    public function scopeMinAmount(Builder $query, float $amount): Builder
    {
        return $query->where('amount', '>=', $amount);
    }

    public function scopeMaxAmount(Builder $query, float $amount): Builder
    {
        return $query->where('amount', '<=', $amount);
    }

    public function scopeMinRemainingAmount(Builder $query, float $amount): Builder
    {
        return $query->where('remaining_amount', '>=', $amount);
    }

    public function scopeMaxRemainingAmount(Builder $query, float $amount): Builder
    {
        return $query->where('remaining_amount', '<=', $amount);
    }

    public function scopeMinInstallmentAmount(Builder $query, float $amount): Builder
    {
        return $query->where('installment_amount', '>=', $amount);
    }

    public function scopeMaxInstallmentAmount(Builder $query, float $amount): Builder
    {
        return $query->where('installment_amount', '<=', $amount);
    }

    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->whereNested(function ($q) use ($search) {
            $q->where('note', 'like', "%{$search}%")
                ->orWhere('amount', 'like', "%{$search}%")
                ->orWhere('remaining_amount', 'like', "%{$search}%")
                ->orWhereHas('employee', function ($employeeQuery) use ($search) {
                    $employeeQuery->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
        });
    }

    public function scopeSortBy(Builder $query, string $field = 'createdAt', string $direction = 'desc'): Builder
    {
        $allowedFields = [
            'loanDate',
            'dueDate',
            'status',
            'amount',
            'remainingAmount',
            'installmentAmount',
            'createdAt',
            'updatedAt',
        ];

        $columnMap = [
            'loanDate'          => 'loan_date',
            'dueDate'           => 'due_date',
            'status'            => 'status',
            'amount'            => 'amount',
            'remainingAmount'   => 'remaining_amount',
            'installmentAmount' => 'installment_amount',
            'createdAt'         => 'created_at',
            'updatedAt'         => 'updated_at',
        ];

        if (!in_array($field, $allowedFields)) {
            $field = 'createdAt';
        }

        $direction = in_array(strtolower($direction), ['asc', 'desc']) ? strtolower($direction) : 'desc';
        $query->orderBy($columnMap[$field], $direction);

        return $query;
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function canBeUpdated(): bool
    {
        return $this->loanLogs()
            ->where('type', 'repayment')
            ->where(function ($query) {
                $query->whereNotNull('payroll_item_id')
                    ->orWhere('source', '!=', 'payroll');
            })
            ->doesntExist();
    }

    public function canBeEdited(): bool
    {
        return $this->canBeUpdated();
    }

    public function canBeDeleted(): bool
    {
        return $this->loanLogs()
            ->where('type', 'repayment')
            ->where(function ($query) {
                $query->whereNotNull('payroll_item_id')
                    ->orWhere('source', '!=', 'payroll');
            })
            ->doesntExist();
    }

    public function calculateRemainingInstallments(): int
    {
        if ($this->repayment_type !== 'installment') {
            return 0;
        }

        $paidCount = $this->loanLogs()
            ->where('type', 'repayment')
            ->count();

        return max(0, $this->total_installments - $paidCount);
    }
}
