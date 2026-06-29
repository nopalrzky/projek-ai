<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Enums\UserStatus;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

#[Table('users')]
class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles, SoftDeletes;

    /** @deprecated Use UserRole enum instead */
    const ROLE_OWNER       = 'owner';
    /** @deprecated Use UserRole enum instead */
    const ROLE_SUPER_ADMIN = 'super_admin';

    /** @deprecated Use UserStatus enum instead */
    const STATUS_ACTIVE    = 'active';
    /** @deprecated Use UserStatus enum instead */
    const STATUS_INACTIVE  = 'inactive';
    /** @deprecated Use UserStatus enum instead */
    const STATUS_SUSPENDED = 'suspended';
    /** @deprecated Use UserStatus enum instead */
    const STATUS_PENDING   = 'pending';

    protected $fillable = [
        'username',
        'name',
        'email',
        'phone',
        'address',
        'status',
        'password',
        'avatar',
        'last_login_at',
        'referral_code',
        'referred_by',
        'bank_account_name',
        'bank_account_number',
        'bank_name',
        'coin_balance',
        'wallet_balance',
        'reward_balance',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'password'      => 'hashed',
            'status'        => UserStatus::class,
            'last_login_at' => 'datetime',
            'deleted_at'    => 'datetime',
            'created_at'    => 'datetime',
            'updated_at'    => 'datetime',
            'coin_balance'  => 'integer',
            'wallet_balance' => 'decimal:2',
            'reward_balance' => 'integer',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Accessors & Mutators
    |--------------------------------------------------------------------------
    */

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function outlets(): HasMany
    {
        return $this->hasMany(Outlet::class, 'owner_id');
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class);
    }

    public function referrer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referred_by');
    }

    public function referrals(): HasMany
    {
        return $this->hasMany(User::class, 'referred_by');
    }

    public function referralLogs(): HasMany
    {
        return $this->hasMany(ReferralLog::class, 'referrer_id');
    }

    public function walletTransactions(): HasMany
    {
        return $this->hasMany(WalletTransaction::class);
    }

    public function ownerBankAccounts(): HasMany
    {
        return $this->hasMany(OwnerBankAccount::class);
    }

    public function walletWithdrawals(): HasMany
    {
        return $this->hasMany(WalletWithdrawal::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Query Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', UserStatus::Active);
    }

    public function scopeInactive(Builder $query): Builder
    {
        return $query->where('status', UserStatus::Inactive);
    }

    public function scopeSuspended(Builder $query): Builder
    {
        return $query->where('status', UserStatus::Suspended);
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', UserStatus::Pending);
    }

    public function scopeByReferralCode(Builder $query, string $code): Builder
    {
        return $query->where('referral_code', $code);
    }

    public function scopeReferredBy(Builder $query, int $referrerId): Builder
    {
        return $query->where('referred_by', $referrerId);
    }

    public function scopeById(Builder $query, int $id): Builder
    {
        return $query->where('id', $id);
    }

    public function scopeRole(Builder $query, string $role): Builder
    {
        return $query->whereHas('roles', function ($q) use ($role) {
            $q->where('name', $role);
        });
    }

    public function scopeOwners(Builder $query): Builder
    {
        return $query->role(self::ROLE_OWNER);
    }

    public function scopeSuperAdmins(Builder $query): Builder
    {
        return $query->role(self::ROLE_SUPER_ADMIN);
    }

    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->whereNested(function ($q) use ($search) {
            $q->where('name', 'LIKE', "%$search%")
                ->orWhere('email', 'LIKE', "%$search%")
                ->orWhere('phone', 'LIKE', "%$search%")
                ->orWhere('username', 'LIKE', "%$search%")
                ->orWhere('referral_code', 'LIKE', "%$search%");
        });
    }

    public function scopeSort(Builder $query, ?string $sortBy, ?string $direction): Builder
    {
        $allowed   = ['name', 'email', 'phone', 'created_at', 'totalCommission'];
        $sortBy    = in_array($sortBy, $allowed) ? $sortBy : 'created_at';
        $direction = in_array(strtolower($direction), ['asc', 'desc']) ? $direction : 'desc';
        $query->orderBy($sortBy, $direction);

        return $query;
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public static function getRoles(): array
    {
        return [
            self::ROLE_OWNER,
            self::ROLE_SUPER_ADMIN,
        ];
    }

    public static function getRoleLabels(): array
    {
        return [
            self::ROLE_OWNER       => 'Owner',
            self::ROLE_SUPER_ADMIN => 'Super Admin',
        ];
    }

    public static function getStatusOptions(): array
    {
        return [
            self::STATUS_ACTIVE    => 'Active',
            self::STATUS_INACTIVE  => 'Inactive',
            self::STATUS_SUSPENDED => 'Suspended',
            self::STATUS_PENDING   => 'Pending',
        ];
    }

    public function isOwner(): bool
    {
        return $this->hasRole(self::ROLE_OWNER);
    }

    public function isSuperAdmin(): bool
    {
        return $this->hasRole(self::ROLE_SUPER_ADMIN);
    }

    public function isActive(): bool
    {
        return $this->status === UserStatus::Active;
    }

    public function isInactive(): bool
    {
        return $this->status === UserStatus::Inactive;
    }

    public function isSuspended(): bool
    {
        return $this->status === UserStatus::Suspended;
    }

    public function isPending(): bool
    {
        return $this->status === UserStatus::Pending;
    }

    public function availableWalletBalance(): float
    {
        return (float) $this->wallet_balance;
    }

    protected function outletIds(): Attribute
    {
        return Attribute::make(
            get: function () {
                if ($this->isSuperAdmin()) {
                    return Outlet::pluck('id')->toArray();
                }

                if ($this->isOwner()) {
                    return $this->outlets()->pluck('id')->toArray();
                }

                return [];
            }
        );
    }

    public function getTotalCommission(): int
    {
        return $this->referralLogs()->sum('commission_coin');
    }

    /*
    |--------------------------------------------------------------------------
    | Static Business Methods
    |--------------------------------------------------------------------------
    */

    public static function generateReferralCode(): string
    {
        do {
            $code = \Illuminate\Support\Str::upper(\Illuminate\Support\Str::random(8));
        } while (static::byReferralCode($code)->exists());

        return $code;
    }

    public static function totalRevenue(?int $ownerId): float
    {
        if (!$ownerId) {
            return Order::query()->completed()->sum('total_amount');
        }

        return (float) Order::query()
            ->completed()
            ->byOwnerId($ownerId)
            ->sum('total_amount');
    }

    public static function totalOrders(?int $ownerId): int
    {
        if (!$ownerId) {
            return Order::query()->count();
        }

        return (int) Order::query()->byOwnerId($ownerId)->count();
    }

    public static function totalCustomers(?int $ownerId): int
    {
        if (!$ownerId) {
            return Customer::query()->count();
        }

        return (int) Customer::query()
            ->byOwnerId($ownerId)
            ->active()
            ->count();
    }

    public static function totalOutlets(?int $ownerId): int
    {
        if (!$ownerId) {
            return Outlet::query()->count();
        }

        return (int) Outlet::query()->byOwnerId($ownerId)->count();
    }

    public static function recentOrders(?int $ownerId)
    {
        if (!$ownerId) {
            return Order::query()
                ->with(['customer', 'employee.outlet'])
                ->orderByDesc('order_date')
                ->orderByDesc('created_at')
                ->limit(5)
                ->get();
        }

        return Order::query()
            ->with(['customer', 'employee.outlet'])
            ->byOwnerId($ownerId)
            ->limit(5)
            ->orderByDesc('order_date')
            ->orderByDesc('created_at')
            ->get();
    }

    public static function revenueOvertime(?int $ownerId, string $interval = 'day', int $limit = 30): array
    {
        $query = Order::query()->completed();

        if ($ownerId) {
            $query->byOwnerId($ownerId);
        }

        [$dateFormat, $days] = match ($interval) {
            'week'  => ['%Y-%U', $limit * 7],
            'month' => ['%Y-%m', $limit * 30],
            'year'  => ['%Y', $limit * 365],
            default => ['%Y-%m-%d', $limit],
        };

        $driver = \Illuminate\Support\Facades\DB::connection()->getDriverName();

        if ($driver === 'sqlite') {
            $dateFormatSQLite = match ($interval) {
                'week'  => '%Y-%W',
                'month' => '%Y-%m',
                'year'  => '%Y',
                default => '%Y-%m-%d',
            };
            $selectDate = "strftime('$dateFormatSQLite', order_date) as date";
        } else {
            $selectDate = "DATE_FORMAT(order_date, '$dateFormat') as date";
        }

        return $query
            ->selectRaw($selectDate)
            ->selectRaw('SUM(total_amount) as revenue')
            ->where('order_date', '>=', now()->subDays($days))
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get()
            ->map(fn($item) => [
                'date'             => $item->date,
                'revenue'          => (float) $item->revenue,
                'formattedRevenue' => 'Rp ' . number_format((float) $item->revenue, 0, ',', '.'),
            ])
            ->toArray();
    }
}
