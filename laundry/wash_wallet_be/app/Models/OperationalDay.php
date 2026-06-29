<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Carbon\Carbon;

#[Table('operational_days')]
class OperationalDay extends Model
{
    use HasFactory;

    protected $fillable = [
        'outlet_id',
        'day_of_week',
        'open_time',
        'close_time',
        'is_open',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_open'    => 'boolean',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public const DAYS_OF_WEEK = [
        'monday'    => 'Senin',
        'tuesday'   => 'Selasa',
        'wednesday' => 'Rabu',
        'thursday'  => 'Kamis',
        'friday'    => 'Jumat',
        'saturday'  => 'Sabtu',
        'sunday'    => 'Minggu',
    ];

    public const DAY_ORDER = [
        'monday'    => 1,
        'tuesday'   => 2,
        'wednesday' => 3,
        'thursday'  => 4,
        'friday'    => 5,
        'saturday'  => 6,
        'sunday'    => 7,
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function outlet(): BelongsTo
    {
        return $this->belongsTo(Outlet::class);
    }

    public function courierSchedules(): HasMany
    {
        return $this->hasMany(CourierSchedule::class, 'operational_day_id');
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

    public function scopeById(Builder $query, int $id): Builder
    {
        return $query->where('id', $id);
    }

    public function scopeByDay(Builder $query, string $dayOfWeek): Builder
    {
        return $query->where('day_of_week', $dayOfWeek);
    }

    public function scopeOrderByDay(Builder $query): Builder
    {
        return $query->orderByRaw("
            CASE day_of_week
                WHEN 'monday' THEN 1
                WHEN 'tuesday' THEN 2
                WHEN 'wednesday' THEN 3
                WHEN 'thursday' THEN 4
                WHEN 'friday' THEN 5
                WHEN 'saturday' THEN 6
                WHEN 'sunday' THEN 7
                ELSE 8
            END
        ");
    }

    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->whereNested(function ($q) use ($search) {
            $q->where('day_of_week', 'like', "%{$search}%")
                ->orWhere('notes', 'like', "%{$search}%");
        });
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeNotActive(Builder $query): Builder
    {
        return $query->where('is_active', false);
    }

    public function scopeIsOpen(Builder $query): Builder
    {
        return $query->where('is_open', true);
    }

    public function scopeNotOpen(Builder $query): Builder
    {
        return $query->where('is_open', false);
    }

    public function scopeDayOfWeek(Builder $query, string $dayOfWeek): Builder
    {
        return $query->where('day_of_week', $dayOfWeek);
    }

    /*
    |--------------------------------------------------------------------------
    | Accessors & Mutators
    |--------------------------------------------------------------------------
    */

    /**
     * Get open_time and format it consistently.
     */
    protected function openTime(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                if (is_null($value)) {
                    return null;
                }
                try {
                    return Carbon::parse($value)->format('H:i:s');
                } catch (\Exception $e) {
                    return $value;
                }
            }
        );
    }

    /**
     * Get close_time and format it consistently.
     */
    protected function closeTime(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                if (is_null($value)) {
                    return null;
                }
                try {
                    return Carbon::parse($value)->format('H:i:s');
                } catch (\Exception $e) {
                    return $value;
                }
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function generateDaysForOutletId(int $outletId): void
    {
        foreach (array_keys(self::DAYS_OF_WEEK) as $day) {
            self::create([
                'outlet_id'   => $outletId,
                'day_of_week' => $day,
                'open_time'   => null,
                'close_time'  => null,
                'is_open'     => false,
            ]);
        }
    }

    public function getDayLabel(): string
    {
        return self::DAYS_OF_WEEK[strtolower($this->day_of_week)] ?? $this->day_of_week;
    }

    public function getDuration(): ?int
    {
        if (!$this->is_open || !$this->open_time || !$this->close_time) {
            return null;
        }

        try {
            $openTime  = Carbon::parse($this->open_time);
            $closeTime = Carbon::parse($this->close_time);
            return abs((int) $closeTime->diffInMinutes($openTime));
        } catch (\Exception $e) {
            return null;
        }
    }

    public function getStatus(): string
    {
        return $this->is_open ? 'Buka' : 'Tutup';
    }

    public function isConfigured(): bool
    {
        if ($this->is_open) {
            return !is_null($this->open_time) && !is_null($this->close_time);
        }
        return true;
    }

    public function isCurrentlyOpen(): bool
    {
        if (!$this->is_open || !$this->open_time || !$this->close_time) {
            return false;
        }
        $now = now()->format('H:i:s');
        return $now >= $this->open_time && $now <= $this->close_time;
    }
}
