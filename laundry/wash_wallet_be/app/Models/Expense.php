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
use Illuminate\Support\Facades\Storage;

#[Table('expenses')]
class Expense extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code',
        'outlet_id',
        'user_id',
        'employee_id',
        'expense_account_id',
        'source_account_id',
        'amount',
        'date',
        'description',
        'attachment',
        'status',
        'approved_by',
        'approved_at',
        'rejection_reason',
        'journal_entry_id',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount'      => 'decimal:2',
            'date'        => 'date',
            'approved_at' => 'datetime',
            'created_at'  => 'datetime',
            'updated_at'  => 'datetime',
            'deleted_at'  => 'datetime',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Lifecycle Hooks
    |--------------------------------------------------------------------------
    */

    protected static function booted(): void
    {
        // Delete attachment file when expense is hard-deleted
        static::deleting(function ($expense) {
            if ($expense->isForceDeleting()) {
                $expense->deleteAttachment();
            }
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Accessors & Mutators
    |--------------------------------------------------------------------------
    */

    /** Read-only computed accessor for attachment URL. */
    protected function attachmentUrl(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (!$this->attachment) {
                    return null;
                }

                return Storage::url($this->attachment);
            }
        );
    }

    /** Read-only computed accessor. */
    protected function hasAttachment(): Attribute
    {
        return Attribute::make(
            get: fn() => !empty($this->attachment)
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function outlet(): BelongsTo
    {
        return $this->belongsTo(Outlet::class);
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function expenseAccount(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'expense_account_id');
    }

    public function sourceAccount(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'source_account_id');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function journalEntry(): BelongsTo
    {
        return $this->belongsTo(JournalEntry::class, 'journal_entry_id');
    }

    /*
    |--------------------------------------------------------------------------
    | Query Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeByOutletId(Builder $query, int $outletId): Builder
    {
        return $query->where('outlet_id', $outletId);
    }

    public function scopeByUserId(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByEmployeeId(Builder $query, int $employeeId): Builder
    {
        return $query->where('employee_id', $employeeId);
    }

    public function scopeByOwnerId(Builder $query, int $ownerId): Builder
    {
        return $query->whereHas('outlet', function (Builder $q) use ($ownerId) {
            $q->where('owner_id', $ownerId);
        });
    }

    public function scopeByExpenseAccountId(Builder $query, int $accountId): Builder
    {
        return $query->where('expense_account_id', $accountId);
    }

    public function scopeBySourceAccountId(Builder $query, int $accountId): Builder
    {
        return $query->where('source_account_id', $accountId);
    }

    public function scopeByStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved(Builder $query): Builder
    {
        return $query->where('status', 'approved');
    }

    public function scopeRejected(Builder $query): Builder
    {
        return $query->where('status', 'rejected');
    }

    public function scopeStartDate(Builder $query, string $startDate): Builder
    {
        return $query->where('date', '>=', $startDate);
    }

    public function scopeEndDate(Builder $query, string $endDate): Builder
    {
        return $query->where('date', '<=', $endDate);
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
            $q->where('code', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%")
                ->orWhereHas('employee', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                })
                ->orWhereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                });
        });
    }

    public function scopeHasAttachment(Builder $query): Builder
    {
        return $query->whereNotNull('attachment')->where('attachment', '!=', '');
    }

    public function scopeNoAttachment(Builder $query): Builder
    {
        return $query->where(function (Builder $q) {
            $q->whereNull('attachment')->orWhere('attachment', '');
        });
    }

    public function scopeLatestFirst(Builder $query): Builder
    {
        $query->orderBy('created_at', 'desc');

        return $query;
    }

    public function scopeSortBy(Builder $query, string $field, string $direction = 'desc'): Builder
    {
        $allowedFields = ['date', 'amount', 'createdAt', 'updatedAt'];

        $columnMap = [
            'createdAt' => 'created_at',
            'updatedAt' => 'updated_at',
        ];

        if (!in_array($field, $allowedFields)) {
            $field = 'createdAt';
        }

        $column    = $columnMap[$field] ?? $field;
        $direction = strtolower($direction) === 'asc' ? 'asc' : 'desc';
        $query->orderBy($column, $direction);

        return $query;
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    public function canBeApproved(): bool
    {
        return $this->isPending();
    }

    public function canBeRejected(): bool
    {
        return $this->isPending();
    }

    public function canBeCancelled(): bool
    {
        return $this->isPending();
    }

    public function isCreatedByOwner(): bool
    {
        return !empty($this->user_id);
    }

    public function isCreatedByEmployee(): bool
    {
        return !empty($this->employee_id);
    }

    public function getStatusLabel(): string
    {
        return match ($this->status) {
            'pending'  => 'Menunggu Persetujuan',
            'approved' => 'Disetujui',
            'rejected' => 'Ditolak',
            default    => 'Unknown',
        };
    }

    public function getStatusColor(): string
    {
        return match ($this->status) {
            'pending'  => 'warning',
            'approved' => 'success',
            'rejected' => 'danger',
            default    => 'secondary',
        };
    }

    public function deleteAttachment(): bool
    {
        if ($this->attachment && Storage::exists($this->attachment)) {
            return Storage::delete($this->attachment);
        }

        return true;
    }

    /*
    |--------------------------------------------------------------------------
    | Static Helpers
    |--------------------------------------------------------------------------
    */

    /** Generate unique expense code: EXP-YYYYMMDD-XXXX */
    public static function generateCode(): string
    {
        $date   = now()->format('Ymd');
        $prefix = "EXP-{$date}-";

        $lastExpense = self::where('code', 'like', "{$prefix}%")
            ->orderBy('code', 'desc')
            ->first();

        $newNumber = $lastExpense
            ? (int) substr($lastExpense->code, -4) + 1
            : 1;

        return $prefix . str_pad((string) $newNumber, 4, '0', STR_PAD_LEFT);
    }

    public static function getTotalByOutlet(int $outletId, ?string $startDate = null, ?string $endDate = null): float
    {
        $query = self::byOutletId($outletId);

        if ($startDate && $endDate) {
            $query->whereBetween('date', [$startDate, $endDate]);
        }

        return $query->sum('amount');
    }

    public static function getTotalByExpenseAccount(int $accountId, ?string $startDate = null, ?string $endDate = null): float
    {
        $query = self::byExpenseAccountId($accountId);

        if ($startDate && $endDate) {
            $query->whereBetween('date', [$startDate, $endDate]);
        }

        return $query->sum('amount');
    }

    public static function getGroupedByAccount(int $outletId, ?string $startDate = null, ?string $endDate = null): array
    {
        $query = self::byOutletId($outletId)->with('expenseAccount');

        if ($startDate && $endDate) {
            $query->whereBetween('date', [$startDate, $endDate]);
        }

        return $query->get()
            ->groupBy('expense_account_id')
            ->map(function ($expenses) {
                return [
                    'account' => $expenses->first()->expenseAccount,
                    'total'   => $expenses->sum('amount'),
                    'count'   => $expenses->count(),
                ];
            })
            ->values()
            ->toArray();
    }

    public static function getDailySummary(int $outletId, string $date): array
    {
        $expenses = self::byOutletId($outletId)
            ->whereDate('date', $date)
            ->with(['expenseAccount', 'sourceAccount', 'employee', 'user'])
            ->get();

        return [
            'date'         => $date,
            'total_amount' => $expenses->sum('amount'),
            'total_count'  => $expenses->count(),
            'expenses'     => $expenses,
        ];
    }

    public static function getMonthlySummary(int $outletId, int $year, int $month): array
    {
        $expenses = self::byOutletId($outletId)
            ->whereYear('date', $year)
            ->whereMonth('date', $month)
            ->with(['expenseAccount', 'sourceAccount', 'employee', 'user'])
            ->get();

        return [
            'year'           => $year,
            'month'          => $month,
            'total_amount'   => $expenses->sum('amount'),
            'total_count'    => $expenses->count(),
            'average_per_day' => $expenses->avg('amount'),
            'expenses'       => $expenses,
        ];
    }
}
