<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

#[Table('import_errors')]
class ImportError extends Model
{
    use HasFactory;

    protected $fillable = [
        'import_log_id',
        'row_number',
        'data',
        'errors',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'data'       => 'array',
            'errors'     => 'array',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function importLog(): BelongsTo
    {
        return $this->belongsTo(ImportLog::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Query Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeByImportLogId(Builder $query, int $importLogId): Builder
    {
        return $query->where('import_log_id', $importLogId);
    }

    public function scopeByRowNumber(Builder $query, int $rowNumber): Builder
    {
        return $query->where('row_number', $rowNumber);
    }

    public function scopeSortByRowNumber(Builder $query, string $direction = 'asc'): Builder
    {
        $query->orderBy('row_number', $direction);

        return $query;
    }

    public function scopeRecent(Builder $query, int $limit = 10): Builder
    {
        $query->latest()->limit($limit);

        return $query;
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function getFormattedErrors(): string
    {
        if (empty($this->errors)) {
            return '';
        }

        return implode(', ', $this->errors);
    }

    public function hasMultipleErrors(): bool
    {
        return is_array($this->errors) && count($this->errors) > 1;
    }

    public function getErrorCount(): int
    {
        return is_array($this->errors) ? count($this->errors) : 0;
    }
}
