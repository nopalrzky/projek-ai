<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Table('service_package_items')]
class ServicePackageItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_package_id',
        'laundry_service_id',
        'quantity',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'quantity'   => 'decimal:2',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function servicePackage(): BelongsTo
    {
        return $this->belongsTo(ServicePackage::class);
    }

    public function laundryService(): BelongsTo
    {
        return $this->belongsTo(LaundryService::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Query Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeByLaundryServiceId(Builder $query, int $laundryServiceId): Builder
    {
        return $query->where('laundry_service_id', $laundryServiceId);
    }

    public function scopeByServicePackageId(Builder $query, int $servicePackageId): Builder
    {
        return $query->where('service_package_id', $servicePackageId);
    }

    public function scopeById(Builder $query, int $id): Builder
    {
        return $query->where('id', $id);
    }
}
