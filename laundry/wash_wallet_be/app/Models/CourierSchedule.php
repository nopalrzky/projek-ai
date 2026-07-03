<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;

#[Table('courier_schedules')]
class CourierSchedule extends Model
{
    use HasFactory;

    /*
    |--------------------------------------------------------------------------
    | TABLE & CONFIGURATION
    |--------------------------------------------------------------------------
    */

    protected $fillable = [
        'outlet_id',
        'operational_day_id',
        'day_of_week',
        'type',
        'start_time',
        'end_time',
        'is_active',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'outlet_id'           => 'integer',
            'operational_day_id'  => 'integer',
            'is_active'           => 'boolean',
            'start_time'          => 'datetime:H:i',
            'end_time'            => 'datetime:H:i',
            'created_at'          => 'datetime',
            'updated_at'          => 'datetime',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | RELATIONSHIPS
    |--------------------------------------------------------------------------
    */

    public function outlet(): BelongsTo
    {
        return $this->belongsTo(Outlet::class);
    }

    public function operationalDay(): BelongsTo
    {
        return $this->belongsTo(OperationalDay::class);
    }

    /*
    |--------------------------------------------------------------------------
    | QUERY SCOPES
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

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeInactive(Builder $query): Builder
    {
        return $query->where('is_active', false);
    }

    public function scopeByDayOfWeek(Builder $query, string $day): Builder
    {
        return $query->where('day_of_week', $day);
    }

    public function scopeByType(Builder $query, string $type): Builder
    {
        return $query->where('type', $type);
    }

    public function scopePickup(Builder $query): Builder
    {
        return $query->where('type', 'pickup');
    }

    public function scopeDelivery(Builder $query): Builder
    {
        return $query->where('type', 'delivery');
    }

    /*
    |--------------------------------------------------------------------------
    | HELPERS
    |--------------------------------------------------------------------------
    */

    public function getTypeLabel(): string
    {
        return match ($this->type) {
            'pickup'   => 'Ambil',
            'delivery' => 'Antar',
            default    => 'Unknown',
        };
    }

    public function getDayLabel(): string
    {
        return match ($this->day_of_week) {
            'monday'    => 'Senin',
            'tuesday'   => 'Selasa',
            'wednesday' => 'Rabu',
            'thursday'  => 'Kamis',
            'friday'    => 'Jumat',
            'saturday'  => 'Sabtu',
            'sunday'    => 'Minggu',
            default     => 'Unknown',
        };
    }
}
