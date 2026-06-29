<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;
use Carbon\Carbon;

/**
 * @property \Carbon\Carbon $start_date
 * @property \Carbon\Carbon $end_date
 * @property \Carbon\Carbon|null $closed_at
 */
#[Table('accounting_periods')]
class AccountingPeriod extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'outlet_id',
        'start_date',
        'end_date',
        'is_closed',
        'closed_at',
        'closed_by',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date'   => 'date',
            'is_closed'  => 'boolean',
            'closed_at'  => 'datetime',
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

    public function outlet(): BelongsTo
    {
        return $this->belongsTo(Outlet::class);
    }

    public function closedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'closed_by');
    }

    /**
     * Get journal entries for this period.
     * NOTE: This relationship depends on the start_date and end_date of the model instance.
     * It will NOT work correctly during eager loading (e.g. AccountingPeriod::with('journalEntries')->get())
     * because the date range filters will be null when building the eager load query.
     */
    public function journalEntries(): HasMany
    {
        return $this->hasMany(JournalEntry::class, 'outlet_id', 'outlet_id')
            ->whereBetween('date', [$this->start_date, $this->end_date]);
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

    public function scopeByOutletId(Builder $query, ?int $outletId): Builder
    {
        if (is_null($outletId)) {
            return $query->whereRaw('1 = 0');
        }
        return $query->where('outlet_id', $outletId);
    }

    public function scopeClosed(Builder $query): Builder
    {
        return $query->where('is_closed', true);
    }

    public function scopeOpen(Builder $query): Builder
    {
        return $query->where('is_closed', false);
    }

    public function scopeContainingDate(Builder $query, Carbon $date): Builder
    {
        return $query->where('start_date', '<=', $date)
            ->where('end_date', '>=', $date);
    }

    public function scopeByDateRange(Builder $query, Carbon $startDate, Carbon $endDate): Builder
    {
        return $query->whereNested(function ($q) use ($startDate, $endDate) {
            $q->whereBetween('start_date', [$startDate, $endDate])
                ->orWhereBetween('end_date', [$startDate, $endDate])
                ->orWhere(function ($q2) use ($startDate, $endDate) {
                    $q2->where('start_date', '<=', $startDate)
                        ->where('end_date', '>=', $endDate);
                });
        });
    }

    public function scopeStartDate(Builder $query, Carbon $date): Builder
    {
        return $query->where('start_date', '<=', $date);
    }

    public function scopeEndDate(Builder $query, Carbon $date): Builder
    {
        return $query->where('end_date', '>=', $date);
    }

    public function scopeCurrentPeriod(Builder $query, int $outletId): Builder
    {
        return $query->byOutletId($outletId)
            ->containingDate(now())
            ->open();
    }

    public function scopeOrderByPeriod(Builder $query, string $direction = 'desc'): Builder
    {
        $query->orderBy('start_date', $direction);

        return $query;
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function containsDate(Carbon $date): bool
    {
        return $date->between($this->start_date, $this->end_date);
    }

    public function canBeReopened(): bool
    {
        return $this->is_closed;
    }

    public function getPeriodName(): string
    {
        return $this->start_date->format('F Y');
    }

    public function getDuration(): int
    {
        return (int) $this->start_date->diffInDays($this->end_date) + 1;
    }

    public function canBeClosed(): bool
    {
        return ! $this->is_closed && ($this->end_date->isToday() || $this->end_date->isPast());
    }
}
