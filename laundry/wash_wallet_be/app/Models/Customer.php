<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Table('customers')]
class Customer extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'outlet_id',
        'customer_account_id',
        'name',
        'email',
        'phone',
        'address',
        'gender',
        'is_active',
    ];

    protected $hidden = [
        'deleted_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active'  => 'boolean',
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

    public function customerSubscriptions(): HasMany
    {
        return $this->hasMany(CustomerSubscription::class);
    }

    public function membershipContracts(): HasMany
    {
        return $this->hasMany(MembershipContract::class);
    }

    public function outlet(): BelongsTo
    {
        return $this->belongsTo(Outlet::class);
    }

    public function customerAccount(): BelongsTo
    {
        return $this->belongsTo(CustomerAccount::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function completedOrders(): HasMany
    {
        return $this->hasMany(Order::class)->where('status', 'delivered');
    }

    /*
    |--------------------------------------------------------------------------
    | Query Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeInactive(Builder $query): Builder
    {
        return $query->where('is_active', false);
    }

    public function scopeById(Builder $query, int $id): Builder
    {
        return $query->where('id', $id);
    }

    public function scopeByIds(Builder $query, array $ids): Builder
    {
        return $query->whereIn('id', $ids);
    }

    public function scopeByOutletId(Builder $query, int $outletId): Builder
    {
        return $query->where('outlet_id', $outletId);
    }

    public function scopeByOwnerId(Builder $query, int $ownerId): Builder
    {
        return $query->whereHas('outlet', function (Builder $q) use ($ownerId) {
            $q->where('owner_id', $ownerId);
        });
    }

    public function scopeByGender(Builder $query, string $gender): Builder
    {
        return $query->where('gender', $gender);
    }

    public function scopeByPhone(Builder $query, string $phone): Builder
    {
        return $query->where('phone', 'like', "%{$phone}%");
    }

    public function scopeByRangeDate(Builder $query, ?string $startDate, ?string $endDate, string $column = 'created_at'): Builder
    {
        if (!empty($startDate)) {
            $query->whereDate($column, '>=', $startDate);
        }

        if (!empty($endDate)) {
            $query->whereDate($column, '<=', $endDate);
        }

        return $query;
    }

    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->whereNested(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
                ->orWhere('phone', 'like', "%{$search}%")
                ->orWhere('address', 'like', "%{$search}%");
        });
    }

    public function scopeSortBy(Builder $query, string $column = 'createdAt', string $direction = 'desc'): Builder
    {
        $allowedColumns = [
            'name',
            'phone',
            'address',
            'gender',
            'isActive',
            'createdAt',
            'updatedAt',
            'ordersCount',
            'totalSpent',
        ];

        $columnMap = [
            'isActive'    => 'is_active',
            'createdAt'   => 'created_at',
            'updatedAt'   => 'updated_at',
            'ordersCount' => 'orders_count',
        ];

        if (!in_array($column, $allowedColumns)) {
            $column = 'createdAt';
        }

        $column    = $columnMap[$column] ?? $column;
        $direction = strtolower($direction) === 'asc' ? 'asc' : 'desc';

        if ($column === 'ordersCount') {
            $query->withCount('orders')->orderBy('orders_count', $direction);

            return $query;
        }

        if ($column === 'totalSpent') {
            $query->withSum(['completedOrders as totalSpent'], 'total_amount')
                ->orderBy('totalSpent', $direction);

            return $query;
        }

        $query->orderBy($column, $direction);

        return $query;
    }

    public function scopeTotalCustomers(Builder $query): int
    {
        return $query->count();
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function getStatusLabel(): string
    {
        return $this->is_active ? 'Aktif' : 'Tidak Aktif';
    }

    public function getActiveSubscriptionForService(int $laundryServiceId): ?CustomerSubscription
    {
        return $this->customerSubscriptions()
            ->active()
            ->whereHas('customerQuotas', function ($q) use ($laundryServiceId) {
                $q->where('laundry_service_id', $laundryServiceId)
                    ->whereRaw('(total_quantity - used_quantity) > 0');
            })
            ->first();
    }
}
