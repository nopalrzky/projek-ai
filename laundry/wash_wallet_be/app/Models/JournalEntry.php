<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;

#[Table('journal_entries')]
class JournalEntry extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'outlet_id',
        'transaction_number',
        'date',
        'description',
        'reference_type',
        'reference_id',
        'is_manual',
        'total_amount',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date'         => 'date',
            'is_manual'    => 'boolean',
            'total_amount' => 'decimal:2',
            'created_at'   => 'datetime',
            'updated_at'   => 'datetime',
            'deleted_at'   => 'datetime',
        ];
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

    public function journalDetails(): HasMany
    {
        return $this->hasMany(JournalDetail::class);
    }

    public function reference(): MorphTo
    {
        return $this->morphTo();
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

    public function scopeByOutletId(Builder $query, int $outletId): Builder
    {
        return $query->where('outlet_id', $outletId);
    }

    public function scopeByOwnerId(Builder $query, int $ownerId): Builder
    {
        return $query->whereHas('outlet', function ($q) use ($ownerId) {
            $q->where('owner_id', $ownerId);
        });
    }

    public function scopeByTransactionNumber(Builder $query, string $transactionNumber): Builder
    {
        return $query->where('transaction_number', $transactionNumber);
    }

    public function scopeManual(Builder $query): Builder
    {
        return $query->where('is_manual', true);
    }

    public function scopeAutomatic(Builder $query): Builder
    {
        return $query->where('is_manual', false);
    }

    public function scopeByReferenceType(Builder $query, string $type): Builder
    {
        return $query->where('reference_type', $type);
    }

    public function scopeByReferenceId(Builder $query, int $id): Builder
    {
        return $query->where('reference_id', $id);
    }

    public function scopeByAccountId(Builder $query, int $accountId): Builder
    {
        return $query->whereHas('journalDetails', function ($q) use ($accountId) {
            $q->where('account_id', $accountId);
        });
    }

    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->whereNested(function (Builder $q) use ($search) {
            $q->where('transaction_number', 'LIKE', "%$search%")
                ->orWhere('description', 'LIKE', "%$search%");
        });
    }

    public function scopeBalanced(Builder $query): Builder
    {
        return $query->whereHas('journalDetails', function ($q) {
            $q->selectRaw('journal_entry_id, SUM(debit) as total_debit, SUM(credit) as total_credit')
                ->groupBy('journal_entry_id')
                ->havingRaw('ABS(SUM(debit) - SUM(credit)) < 0.01');
        });
    }

    public function scopeUnbalanced(Builder $query): Builder
    {
        return $query->whereHas('journalDetails', function ($q) {
            $q->selectRaw('journal_entry_id, SUM(debit) as total_debit, SUM(credit) as total_credit')
                ->groupBy('journal_entry_id')
                ->havingRaw('ABS(SUM(debit) - SUM(credit)) >= 0.01');
        });
    }

    public function scopeByDateFrom(Builder $query, string $dateFrom): Builder
    {
        return $query->whereDate('date', '>=', $dateFrom);
    }

    public function scopeByDateTo(Builder $query, string $dateTo): Builder
    {
        return $query->whereDate('date', '<=', $dateTo);
    }

    public function scopeMinAmount(Builder $query, int $amount): Builder
    {
        return $query->where('total_amount', '>=', $amount);
    }

    public function scopeMaxAmount(Builder $query, int $amount): Builder
    {
        return $query->where('total_amount', '<=', $amount);
    }

    public function scopeSortBy(Builder $query, string $field, string $direction): Builder
    {
        $allowedFields = [
            'date',
            'totalAmount',
            'createdAt',
            'updatedAt',
        ];

        $fieldMap = [
            'totalAmount' => 'total_amount',
            'createdAt'   => 'created_at',
            'updatedAt'   => 'updated_at',
        ];

        if (!in_array($field, $allowedFields)) {
            $field = 'createdAt';
        }

        $direction = in_array(strtolower($direction), ['asc', 'desc']) ? strtolower($direction) : 'desc';
        $field     = $fieldMap[$field] ?? $field;
        $query->orderBy($field, $direction);

        return $query;
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function canBeEdited(): bool
    {
        $period = $this->getAccountingPeriod();
        return !$period || !$period->is_closed;
    }

    public function canBeDeleted(): bool
    {
        return $this->canBeEdited() && $this->is_manual;
    }

    public function getAccountingPeriod(): ?AccountingPeriod
    {
        return AccountingPeriod::where('outlet_id', $this->outlet_id)
            ->whereDate('start_date', '<=', $this->date)
            ->whereDate('end_date', '>=', $this->date)
            ->first();
    }

    /*
    |--------------------------------------------------------------------------
    | Static Helpers
    |--------------------------------------------------------------------------
    */

    public static function generateTransactionNumber(int $outletId): string
    {
        $prefix   = 'JE';
        $date     = now()->format('Ymd');
        $sequence = self::where('outlet_id', $outletId)
            ->whereDate('created_at', now()->toDateString())
            ->count();

        return sprintf('%s-%s-%s-%04d', $prefix, $outletId, $date, $sequence);
    }
}
