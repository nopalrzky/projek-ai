<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

#[Table('journal_details')]
class JournalDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'journal_entry_id',
        'account_id',
        'debit',
        'credit',
        'memo',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'debit'      => 'decimal:2',
            'credit'     => 'decimal:2',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function journalEntry(): BelongsTo
    {
        return $this->belongsTo(JournalEntry::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
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

    public function scopeByJournalEntryId(Builder $query, int $journalEntryId): Builder
    {
        return $query->where('journal_entry_id', $journalEntryId);
    }

    public function scopeByAccountId(Builder $query, int $accountId): Builder
    {
        return $query->where('account_id', $accountId);
    }

    public function scopeDebit(Builder $query): Builder
    {
        return $query->where('debit', '>', 0);
    }

    public function scopeCredit(Builder $query): Builder
    {
        return $query->where('credit', '>', 0);
    }

    public function scopeByOutletId(Builder $query, int $outletId): Builder
    {
        return $query->whereHas('journalEntry', function ($q) use ($outletId) {
            $q->where('outlet_id', $outletId);
        });
    }

    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->whereNested(function ($q) use ($search) {
            $q->whereHas('account', function ($q2) use ($search) {
                $q2->where('name', 'like', '%' . $search . '%');
            });
        });
    }

    public function scopeSortBy(Builder $query, string $column = 'created_at', string $direction = 'desc'): Builder
    {
        $allowedColumns = [
            'journalEntryId',
            'accountId',
            'debit',
            'credit',
            'createdAt',
            'updatedAt',
        ];

        $columnMap = [
            'journalEntryId' => 'journal_entry_id',
            'accountId'      => 'account_id',
            'createdAt'      => 'created_at',
            'updatedAt'      => 'updated_at',
        ];

        if (!in_array($column, $allowedColumns)) {
            $column = 'createdAt';
        }

        $column    = $columnMap[$column] ?? $column;
        $direction = strtolower($direction) === 'asc' ? 'asc' : 'desc';
        $query->orderBy($column, $direction);

        return $query;
    }
}
