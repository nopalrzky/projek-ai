<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Table('payrolls')]
class Payroll extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'employee_id',
        'bank_account_id',
        'month',
        'year',
        'payment_date',
        'transaction_number',
        'payment_method',
        'type',
        'base_salary',
        'total_allowance',
        'total_commission',
        'total_overtime',
        'total_loan_deduction',
        'total_fine',
        'net_salary',
        'status',
        'note',
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
            'month'               => 'integer',
            'year'                => 'integer',
            'payment_date'        => 'date',
            'base_salary'          => 'decimal:2',
            'total_allowance'     => 'decimal:2',
            'total_commission'    => 'decimal:2',
            'total_overtime'      => 'decimal:2',
            'total_loan_deduction' => 'decimal:2',
            'total_fine'          => 'decimal:2',
            'net_salary'          => 'float',
            'created_at'          => 'datetime',
            'updated_at'          => 'datetime',
            'deleted_at'          => 'datetime',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Lifecycle Hooks
    |--------------------------------------------------------------------------
    */

    protected static function booted(): void
    {
        static::creating(function ($payroll) {
            if (empty($payroll->transaction_number)) {
                $outletId = $payroll->getAttribute('outlet_id')
                    ?? ($payroll->employee ? $payroll->employee->outlet_id : null);

                if ($outletId) {
                    $payroll->transaction_number = self::generateTransactionNumber($outletId);
                }
            }

            if (empty($payroll->net_salary)) {
                $payroll->setAttribute('net_salary', $payroll->calculateNetSalary());
            }
        });

        static::updating(function ($payroll) {
            if ($payroll->isDirty(['base_salary', 'total_allowance', 'total_commission', 'total_overtime', 'total_loan_deduction', 'total_fine'])) {
                $payroll->setAttribute('net_salary', $payroll->calculateNetSalary());
            }
        });
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

    public function bankAccount(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'bank_account_id');
    }

    public function payrollItems(): HasMany
    {
        return $this->hasMany(PayrollItem::class);
    }

    public function workLogs(): HasManyThrough
    {
        return $this->hasManyThrough(WorkLog::class, PayrollItem::class);
    }

    public function fineLogs(): HasManyThrough
    {
        return $this->hasManyThrough(FineLog::class, PayrollItem::class, 'payroll_id', 'payroll_item_id');
    }

    /*
    |--------------------------------------------------------------------------
    | Query Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeById(Builder $query, string $field, mixed $value): Builder
    {
        return $query->where($field, $value);
    }

    public function scopeByOutletId(Builder $query, int $outletId): Builder
    {
        return $query->whereHas('employee', function ($q) use ($outletId) {
            $q->where('outlet_id', $outletId);
        });
    }

    public function scopeByEmployeeId(Builder $query, int $employeeId): Builder
    {
        return $query->where('employee_id', $employeeId);
    }

    public function scopeByBankAccountId(Builder $query, int $bankAccountId): Builder
    {
        return $query->where('bank_account_id', $bankAccountId);
    }

    public function scopeByOwnerId(Builder $query, int $ownerId): Builder
    {
        return $query->whereHas('outlet', function ($q) use ($ownerId) {
            $q->where('owner_id', $ownerId);
        });
    }

    public function scopeByStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }

    public function scopeDraft(Builder $query): Builder
    {
        return $query->where('status', 'draft');
    }

    public function scopePaid(Builder $query): Builder
    {
        return $query->where('status', 'paid');
    }

    public function scopeCancelled(Builder $query): Builder
    {
        return $query->where('status', 'cancelled');
    }

    public function scopeByPaymentMethod(Builder $query, string $method): Builder
    {
        return $query->where('payment_method', $method);
    }

    public function scopeByMonth(Builder $query, int $month): Builder
    {
        return $query->where('month', $month);
    }

    public function scopeByYear(Builder $query, int $year): Builder
    {
        return $query->where('year', $year);
    }

    public function scopeByPeriod(Builder $query, int $year, int $month): Builder
    {
        return $query->where('year', $year)->where('month', $month);
    }

    public function scopePaymentDateFrom(Builder $query, string $date): Builder
    {
        return $query->whereDate('payment_date', '>=', $date);
    }

    public function scopePaymentDateTo(Builder $query, string $date): Builder
    {
        return $query->whereDate('payment_date', '<=', $date);
    }

    public function scopeByMonthFilter(Builder $query, int $year, int $month): Builder
    {
        return $query->where('year', $year)
            ->where('month', $month);
    }

    public function scopeThisMonth(Builder $query): Builder
    {
        return $query->where('year', now()->year)
            ->where('month', now()->month);
    }

    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->whereNested(function ($q) use ($search) {
            $q->where('transaction_number', 'like', "%{$search}%")
                ->orWhereHas('employee', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                });
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Business Logic
    |--------------------------------------------------------------------------
    */

    public function calculateNetSalary(): float
    {
        $grossSalary = $this->base_salary
            + $this->total_allowance
            + $this->total_commission
            + $this->total_overtime;

        $totalDeduction = $this->total_loan_deduction
            + $this->total_fine;

        return $grossSalary - $totalDeduction;
    }

    public function updateNetSalary(): bool
    {
        $this->setAttribute('net_salary', $this->calculateNetSalary());
        return $this->save();
    }

    public function markAsPaid(): bool
    {
        if ($this->status !== 'draft') {
            return false;
        }

        $this->status = 'paid';
        return $this->save();
    }

    public function cancel(): bool
    {
        if ($this->status === 'paid') {
            return false;
        }

        $this->status = 'cancelled';
        return $this->save();
    }

    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    public function isPaid(): bool
    {
        return $this->status === 'paid';
    }

    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    public function getGrossSalary(): float
    {
        return $this->base_salary
            + $this->total_allowance
            + $this->total_commission
            + $this->total_overtime;
    }

    public function getTotalDeduction(): float
    {
        return $this->total_loan_deduction + $this->total_fine;
    }

    public function getStatusLabel(): string
    {
        return match ($this->status) {
            'draft'     => 'Draft',
            'paid'      => 'Lunas',
            'cancelled' => 'Dibatalkan',
            default     => 'Unknown',
        };
    }

    public function getStatusColor(): string
    {
        return match ($this->status) {
            'draft'     => 'warning',
            'paid'      => 'success',
            'cancelled' => 'error',
            default     => 'default',
        };
    }

    public function getPaymentMethodLabel(): string
    {
        return match ($this->payment_method) {
            'transfer' => 'Transfer Bank',
            'cash'     => 'Tunai',
            'check'    => 'Cek',
            default    => ucfirst($this->payment_method),
        };
    }

    public function getPeriodLabel(): string
    {
        return \Illuminate\Support\Carbon::createFromDate($this->year, $this->month, 1)->translatedFormat('F Y');
    }

    /*
    |--------------------------------------------------------------------------
    | Static Methods
    |--------------------------------------------------------------------------
    */

    public static function generateTransactionNumber(int $outletId): string
    {
        $prefix     = 'PAY';
        $date       = now()->format('Ymd');
        $outletCode = str_pad((string) $outletId, 3, '0', STR_PAD_LEFT);

        $lastPayroll = self::where('transaction_number', 'like', "{$prefix}-{$date}-{$outletCode}-%")
            ->latest('id')
            ->first();

        if ($lastPayroll) {
            $lastNumber = (int) substr($lastPayroll->transaction_number, -4);
            $newNumber  = str_pad((string) ($lastNumber + 1), 4, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '0001';
        }

        return "{$prefix}-{$date}-{$outletCode}-{$newNumber}";
    }
}
