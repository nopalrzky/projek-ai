<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Table('laundry_service_processes')]
class LaundryServiceProcess extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'laundry_service_id',
        'process_id',
        'sequence',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'laundry_service_id' => 'integer',
            'process_id'         => 'integer',
            'sequence'           => 'integer',
            'created_at'         => 'datetime',
            'updated_at'         => 'datetime',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function laundryService(): BelongsTo
    {
        return $this->belongsTo(LaundryService::class);
    }

    public function process(): BelongsTo
    {
        return $this->belongsTo(Process::class);
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

    public function scopeByLaundryServiceId(Builder $query, int $laundryServiceId): Builder
    {
        return $query->where('laundry_service_id', $laundryServiceId);
    }

    public function scopeByProcessId(Builder $query, int $processId): Builder
    {
        return $query->where('process_id', $processId);
    }

    public function scopeBySequence(Builder $query, int $sequence): Builder
    {
        return $query->where('sequence', $sequence);
    }

    public function scopeSortBy(Builder $query, string $column = 'sequence', string $direction = 'asc'): Builder
    {
        $allowedColumns = [
            'sequence',
            'createdAt',
            'updatedAt',
        ];

        $columnMap = [
            'createdAt' => 'created_at',
            'updatedAt' => 'updated_at',
        ];

        if (!in_array($column, $allowedColumns)) {
            $column = 'sequence';
        }

        $column = $columnMap[$column] ?? $column;

        $direction = strtolower($direction) === 'desc' ? 'desc' : 'asc';
        $query->orderBy($column, $direction);

        return $query;
    }
}
