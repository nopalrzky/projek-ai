<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\Auth;
use App\Models\Feature;
use App\Models\OutletFeature;

#[Table('outlets')]
class Outlet extends Model
{
    use HasFactory, Notifiable, HasApiTokens, SoftDeletes;

    protected $fillable = [
        'owner_id',
        'name',
        'code',
        'email',
        'coin_balance',
        'province_id',
        'province_name',
        'city_id',
        'city_name',
        'district_id',
        'district_name',
        'village_id',
        'village_name',
        'street',
        'phone',
        'status',
        'latitude',
        'longitude',
        'balance',
        'timezone',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'owner_id'     => 'integer',
            'status'       => 'string',
            'coin_balance' => 'integer',
            'latitude'     => 'double',
            'longitude'    => 'double',
            'balance'      => 'decimal:2',
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

    public function accounts(): HasMany
    {
        return $this->hasMany(Account::class);
    }

    public function cashAccount(): HasOne
    {
        return $this->hasOne(Account::class)->where('account_role', 'cash');
    }

    public function receivableAccount(): HasOne
    {
        return $this->hasOne(Account::class)->where('account_role', 'receivable');
    }

    public function revenueAccount(): HasOne
    {
        return $this->hasOne(Account::class)->where('account_role', 'revenue');
    }

    public function expenseAccount(): HasOne
    {
        return $this->hasOne(Account::class)->where('account_role', 'expense');
    }

    public function fineAccount(): HasOne
    {
        return $this->hasOne(Account::class)->where('account_role', 'fine');
    }

    public function accountingPeriods(): HasMany
    {
        return $this->hasMany(AccountingPeriod::class);
    }

    public function categories(): HasMany
    {
        return $this->hasMany(Category::class);
    }

    public function customers(): HasMany
    {
        return $this->hasMany(Customer::class);
    }

    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class, 'outlet_id');
    }

    public function fines(): HasMany
    {
        return $this->hasMany(Fine::class);
    }

    public function fineLogs(): HasMany
    {
        return $this->hasMany(FineLog::class);
    }

    public function journalEntries(): HasMany
    {
        return $this->hasMany(JournalEntry::class);
    }

    public function laundryServices(): HasManyThrough
    {
        return $this->hasManyThrough(LaundryService::class, Category::class);
    }

    public function membershipPlans(): HasMany
    {
        return $this->hasMany(MembershipPlan::class);
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function operationalDays(): HasMany
    {
        return $this->hasMany(OperationalDay::class)->orderByDay();
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function positions(): HasMany
    {
        return $this->hasMany(Position::class);
    }

    public function servicePackages(): HasMany
    {
        return $this->hasMany(ServicePackage::class);
    }

    public function topups(): HasMany
    {
        return $this->hasMany(Topup::class);
    }

    public function outletFeatures(): HasMany
    {
        return $this->hasMany(OutletFeature::class);
    }

    public function courierSetting(): HasOne
    {
        return $this->hasOne(CourierSetting::class);
    }

    public function courierSchedules(): HasMany
    {
        return $this->hasMany(CourierSchedule::class);
    }

    public function outletSettings(): HasMany
    {
        return $this->hasMany(OutletSetting::class);
    }

    public function orderReviews(): HasMany
    {
        return $this->hasMany(OrderReview::class);
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

    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->whereNested(function ($q) use ($search) {
            $likeSearch = "%$search%";
            $q->where('name', 'LIKE', $likeSearch)
                ->orWhere('code', 'LIKE', $likeSearch)
                ->orWhere('email', 'LIKE', $likeSearch)
                ->orWhere('phone', 'LIKE', $likeSearch)
                ->orWhere('province_name', 'LIKE', $likeSearch)
                ->orWhere('city_name', 'LIKE', $likeSearch)
                ->orWhere('district_name', 'LIKE', $likeSearch)
                ->orWhere('village_name', 'LIKE', $likeSearch);
        });
    }

    public function scopeByOwnerId(Builder $query, int $ownerId): Builder
    {
        return $query->where('owner_id', $ownerId);
    }

    public function scopeByStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }

    public function scopeExposure(Builder $query): Builder
    {
        return $query->whereHas('outletFeatures', function ($q) {
            $q->whereHas('feature', function ($f) {
                $f->where('key', 'outlet_exposure');
            })
                ->where('status', 'active')
                ->where(function ($q) {
                    $q->whereNull('expires_at')
                        ->orWhere('expires_at', '>', now());
                });
        });
    }

    public function scopeByProvinceId(Builder $query, int $provinceId): Builder
    {
        return $query->where('province_id', $provinceId);
    }

    public function scopeByProvinceName(Builder $query, string $provinceName): Builder
    {
        return $query->where('province_name', 'LIKE', "%$provinceName%");
    }

    public function scopeByCityId(Builder $query, int $cityId): Builder
    {
        return $query->where('city_id', $cityId);
    }

    public function scopeByCityName(Builder $query, string $cityName): Builder
    {
        return $query->where('city_name', 'LIKE', "%$cityName%");
    }

    public function scopeByDistrictId(Builder $query, int $districtId): Builder
    {
        return $query->where('district_id', $districtId);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    public function scopeByDistrictName(Builder $query, string $districtName): Builder
    {
        return $query->where('district_name', 'LIKE', "%$districtName%");
    }

    public function scopeByVillageId(Builder $query, int $villageId): Builder
    {
        return $query->where('village_id', $villageId);
    }

    public function scopeByVillageName(Builder $query, string $villageName): Builder
    {
        return $query->where('village_name', 'LIKE', "%$villageName%");
    }

    public function scopeSortBy(Builder $query, ?string $sortBy = 'created_at', ?string $sortDirection = 'desc'): Builder
    {
        $allowedSorts = [
            'name',
            'code',
            'email',
            'phone',
            'status',
            'created_at',
            'updated_at',
            'province_name',
            'city_name',
            'district_name',
        ];

        $sortBy = in_array($sortBy, $allowedSorts) ? $sortBy : 'created_at';
        $sortDirection = strtolower($sortDirection) === 'asc' ? 'asc' : 'desc';

        $query->orderBy($sortBy, $sortDirection);

        return $query;
    }

    public function scopeNearby(Builder $query, float $latitude, float $longitude, float $radius = 10): Builder
    {
        $haversine = "(6371 * acos(cos(radians($latitude)) 
                     * cos(radians(latitude)) 
                     * cos(radians(longitude) - radians($longitude)) 
                     + sin(radians($latitude)) 
                     * sin(radians(latitude))))";

        return $query->select('outlets.*')
            ->selectRaw("$haversine AS distance")
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->whereRaw("$haversine <= ?", [$radius])
            ->orderBy('distance');
    }

    public function scopeHasExposure(Builder $query): Builder
    {
        return $query->whereHas('outletFeatures', function ($q) {
            $q->whereHas('feature', function ($f) {
                $f->where('key', 'outlet_exposure');
            })
                ->where('status', 'active')
                ->where(function ($q) {
                    $q->whereNull('expires_at')
                        ->orWhere('expires_at', '>', now());
                });
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    |*/

    /** Check if outlet has active access to a feature */
    public function hasFeature(string $featureKey): bool
    {
        $feature = Feature::where('key', $featureKey)->first();

        if (!$feature) {
            return false;
        }

        if (!$feature->is_paid) {
            return true;
        }

        $outletFeature = $this->outletFeatures()->where('feature_id', $feature->id)->first();

        if (!$outletFeature) {
            return false;
        }

        return $outletFeature->hasActiveAccess();
    }

    public function isActivated(): bool
    {
        return $this->status === 'active';
    }

    public function getActivationFeature(): ?OutletFeature
    {
        $feature = Feature::where('key', 'outlet_activation')->first();
        if (!$feature) {
            return null;
        }
        return $this->outletFeatures()->where('feature_id', $feature->id)->first();
    }

    public function isOwner(User $user): bool
    {
        return (int) $this->owner_id === (int) $user->id;
    }

    /** Get account by role */
    public function getAccountByRole(string $role): ?Account
    {
        return $this->accounts()->where('account_role', $role)->first();
    }

    public function getFullAddress(): string
    {
        $parts = [];

        if ($this->street) {
            $parts[] = $this->street;
        }

        $addPart = function ($part) use (&$parts) {
            if ($part) {
                $street = $parts[0] ?? '';
                $normalizedPart = preg_replace('/^(KOTA|KABUPATEN|PROVINSI|KECAMATAN|KELURAHAN|KEC\.|KEL\.)\s+/i', '', $part);

                if (mb_stripos($street, $normalizedPart) === false) {
                    $parts[] = $part;
                }
            }
        };

        $addPart($this->village_name);
        $addPart($this->district_name);
        $addPart($this->city_name);
        $addPart($this->province_name);

        return implode(', ', $parts);
    }

    public function authorizeOutletAccess(): bool
    {
        /** @var User $user */
        $user = Auth::user();
        if ($user->hasRole('admin')) {
            return true;
        }

        if ($user->hasRole('owner') && $this->isOwner($user)) {
            return true;
        }

        return false;
    }

    public function generateUniqueCode(): string
    {
        do {
            $code = 'OUT' . strtoupper(bin2hex(random_bytes(3)));
        } while (self::where('code', $code)->exists());

        return $code;
    }

    /**
     * Get a setting value for this outlet by setting key
     */
    public function getSetting(string $key, ?string $default = null): ?string
    {
        return OutletSetting::getValueByKey($this->id, $key, $default);
    }

    /*
    |--------------------------------------------------------------------------
    | New Helpers
    |--------------------------------------------------------------------------
    |*/

    /**
     * Check if the outlet has an active outlet_exposure feature.
     * Trial yang masih berlaku juga dianggap aktif.
     */
    public function hasActiveExposure(): bool
    {
        return $this->hasFeature('outlet_exposure');
    }

    /**
     * Check if the outlet's exposure feature is expired.
     * Berguna untuk menampilkan notifikasi/banner ke user.
     */
    public function isExposureExpired(): bool
    {
        $feature = Feature::where('key', 'outlet_exposure')->first();
        if (!$feature) {
            return false;
        }

        $outletFeature = $this->outletFeatures()->where('feature_id', $feature->id)->first();
        if (!$outletFeature) {
            return false;
        }

        return $outletFeature->isExpired()
            || ($outletFeature->expires_at && $outletFeature->expires_at->isPast())
            || ($outletFeature->isTrial() && $outletFeature->trial_expires_at && $outletFeature->trial_expires_at->isPast());
    }

    public function isCurrentlyOpen(): bool
    {
        $opDay = $this->getTodayOperationalDay();
        if (!$opDay || !$opDay->is_open || !$opDay->open_time || !$opDay->close_time) {
            return false;
        }
        $now = now()->setTimezone($this->timezone ?? 'Asia/Jakarta')->format('H:i:s');
        
        // Handle jam operasional lewat tengah malam
        if ($opDay->close_time < $opDay->open_time) {
            return $now >= $opDay->open_time || $now <= $opDay->close_time;
        }

        return $now >= $opDay->open_time && $now <= $opDay->close_time;
    }

    public function getTodayOperationalDay(): ?OperationalDay
    {
        $today = strtolower(now()->setTimezone($this->timezone ?? 'Asia/Jakarta')->format('l'));
        if ($this->relationLoaded('operationalDays')) {
            return $this->operationalDays->firstWhere('day_of_week', $today);
        }
        return $this->operationalDays()->where('day_of_week', $today)->first();
    }

    public function getNextOpenDay(): ?OperationalDay
    {
        $today = strtolower(now()->setTimezone($this->timezone ?? 'Asia/Jakarta')->format('l'));
        $todayOrder = OperationalDay::DAY_ORDER[$today] ?? 1;

        if ($this->relationLoaded('operationalDays')) {
            $days = $this->operationalDays;
        } else {
            $days = $this->operationalDays()->get();
        }

        if ($days->isEmpty()) {
            return null;
        }

        $sortedDays = $days->sortBy(function ($day) {
            return OperationalDay::DAY_ORDER[strtolower($day->day_of_week)] ?? 8;
        });

        foreach ($sortedDays as $day) {
            $dayOrder = OperationalDay::DAY_ORDER[strtolower($day->day_of_week)] ?? 8;
            if ($dayOrder > $todayOrder && $day->is_open) {
                return $day;
            }
        }

        foreach ($sortedDays as $day) {
            $dayOrder = OperationalDay::DAY_ORDER[strtolower($day->day_of_week)] ?? 8;
            if ($dayOrder <= $todayOrder && $day->is_open) {
                return $day;
            }
        }

        return null;
    }
}
