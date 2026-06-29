<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Table('customer_addresses')]
class CustomerAddress extends Model
{
  use HasFactory;

  /*
    |--------------------------------------------------------------------------
    | TABLE & CONFIGURATION
    |--------------------------------------------------------------------------
    */

  protected $fillable = [
    'customer_account_id',
    'label',
    'recipient_name',
    'recipient_phone',
    'street',
    'province_id',
    'regency_id',
    'district_id',
    'village_id',
    'province_name',
    'regency_name',
    'district_name',
    'village_name',
    'notes',
    'latitude',
    'longitude',
    'is_primary',
  ];

  /**
   * Get the attributes that should be cast.
   *
   * @return array<string, string>
   */
  protected function casts(): array
  {
    return [
      'latitude'   => 'decimal:7',
      'longitude'  => 'decimal:7',
      'is_primary' => 'boolean',
      'created_at' => 'datetime',
      'updated_at' => 'datetime',
    ];
  }

  /*
    |--------------------------------------------------------------------------
    | RELATIONSHIPS
    |--------------------------------------------------------------------------
    */

  public function customerAccount(): BelongsTo
  {
    return $this->belongsTo(CustomerAccount::class);
  }

  /**
   * Get address snapshot string.
   */
  public function getSnapshotString(): string
  {
    return "{$this->recipient_name} ({$this->recipient_phone}) - {$this->street}";
  }

  /*
    |--------------------------------------------------------------------------
    | QUERY SCOPES
    |--------------------------------------------------------------------------
    */

  public function scopeByCustomerAccountId(Builder $query, int $customerAccountId): Builder
  {
    return $query->where('customer_account_id', $customerAccountId);
  }

  public function scopeById(Builder $query, int $id): Builder
  {
    return $query->where('id', $id);
  }

  public function scopeSearch(Builder $query, string $search): Builder
  {
    $likeSearch = "%$search%";

    return $query->whereNested(function (Builder $nestedQuery) use ($likeSearch) {
      $nestedQuery->where('label', 'LIKE', $likeSearch)
        ->orWhere('recipient_name', 'LIKE', $likeSearch)
        ->orWhere('recipient_phone', 'LIKE', $likeSearch)
        ->orWhere('street', 'LIKE', $likeSearch)
        ->orWhere('notes', 'LIKE', $likeSearch);
    });
  }

  public function scopePrimary(Builder $query): Builder
  {
    return $query->where('is_primary', true);
  }

  public function scopeSortBy(Builder $query, string $column = 'createdAt', string $direction = 'asc'): Builder
  {
    $allowedColumns = [
      'isPrimary',
      'createdAt',
      'updatedAt',
      'label',
    ];

    $columnMap = [
      'isPrimary' => 'is_primary',
      'createdAt' => 'created_at',
      'updatedAt' => 'updated_at',
    ];

    if (!in_array($column, $allowedColumns)) {
      $column = 'createdAt';
    }

    $column    = $columnMap[$column] ?? $column;
    $direction = strtolower($direction) === 'desc' ? 'desc' : 'asc';

    return $query->orderBy($column, $direction);
  }
}
