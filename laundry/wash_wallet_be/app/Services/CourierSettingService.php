<?php

namespace App\Services;

use App\Models\CourierSetting;
use App\Models\Outlet;
use App\Models\CustomerAddress;
use App\DTOs\CourierPricingResult;
use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CourierSettingService extends BaseService
{
    public function __construct(
        protected CourierSetting $courierSetting,
        protected GoogleMapsService $googleMapsService,
        protected CourierPricingEngine $pricingEngine,
        protected LocationService $locationService,
    ) {}

    /*
    |--------------------------------------------------------------------------
    | Read Methods
    |--------------------------------------------------------------------------
    */

    public function getAll(
        ?array $filters = [],
        ?int $page = null,
        ?int $perPage = null,
        array $relations = ['outlet', 'pricingTiers', 'pricingZones']
    ): LengthAwarePaginator | Collection {
        try {
            $query = $this->courierSetting->query();

            $this->applyTenantScope($query);
            $this->applyFilters($query, $filters);

            if (!empty($relations)) {
                $query->with($relations);
            }

            return $this->paginate($query, $perPage, $page);
        } catch (Exception $e) {
            Log::error('Failed to get courier settings', [
                'filters' => $filters,
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'courier_setting_service_error',
            ]);
            throw $e;
        }
    }

    public function getById(int $id, array $relations = ['outlet', 'pricingTiers', 'pricingZones']): CourierSetting
    {
        try {
            $query = $this->courierSetting->query();

            if (!empty($relations)) {
                $query->with($relations);
            }

            return $query->whereKey($id)->firstOrFail();
        } catch (Exception $e) {
            Log::error('Failed to get courier setting by ID', [
                'id'      => $id,
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'courier_setting_service_error',
            ]);
            throw $e;
        }
    }

    public function getByOutletId(int $outletId, array $relations = ['outlet', 'pricingTiers', 'pricingZones']): CourierSetting
    {
        try {
            $setting = $this->courierSetting->query()->firstOrCreate(
                ['outlet_id' => $outletId],
                ['is_courier_enabled' => false]
            );

            if (!empty($relations)) {
                $setting->loadMissing($relations);
            }

            return $setting;
        } catch (Exception $e) {
            Log::error('Failed to get courier setting by outlet ID', [
                'outlet_id' => $outletId,
                'error'     => $e->getMessage(),
                'user_id'   => Auth::id(),
                'type'      => 'courier_setting_service_error',
            ]);
            throw $e;
        }
    }


    public function syncPricingTiers(int $settingId, array $tiers): void
    {
        $existingIds = [];
        foreach ($tiers as $index => $tierData) {
            if (!empty($tierData['id'])) {
                DB::table('courier_pricing_tiers')
                    ->where('id', $tierData['id'])
                    ->update([
                        'min_km'     => $tierData['minKm'] ?? 0,
                        'max_km'     => $tierData['maxKm'] ?? null,
                        'fee'        => $tierData['fee'] ?? 0,
                        'per_km_fee' => $tierData['perKmFee'] ?? 0,
                        'sort_order' => $tierData['sortOrder'] ?? $index,
                        'updated_at' => now(),
                    ]);
                $existingIds[] = $tierData['id'];
            } else {
                $id = DB::table('courier_pricing_tiers')->insertGetId([
                    'courier_setting_id' => $settingId,
                    'min_km'             => $tierData['minKm'] ?? 0,
                    'max_km'             => $tierData['maxKm'] ?? null,
                    'fee'                => $tierData['fee'] ?? 0,
                    'per_km_fee'         => $tierData['perKmFee'] ?? 0,
                    'sort_order'         => $tierData['sortOrder'] ?? $index,
                    'created_at'         => now(),
                    'updated_at'         => now(),
                ]);
                $existingIds[] = $id;
            }
        }

        DB::table('courier_pricing_tiers')
            ->where('courier_setting_id', $settingId)
            ->whereNotIn('id', $existingIds)
            ->delete();
    }

    public function syncPricingZones(int $settingId, array $zones): void
    {
        $existingIds = [];
        foreach ($zones as $index => $zoneData) {
            if (!empty($zoneData['id'])) {
                DB::table('courier_pricing_zones')
                    ->where('id', $zoneData['id'])
                    ->update([
                        'location_type'      => $zoneData['locationType'] ?? 'district',
                        'location_id'        => $zoneData['locationId'] ?? '',
                        'location_name'      => $zoneData['locationName'] ?? '',
                        'fee'                => $zoneData['fee'] ?? 0,
                        'parent_district_id' => $zoneData['parentDistrictId'] ?? null,
                        'sort_order'         => $zoneData['sortOrder'] ?? $index,
                        'updated_at'         => now(),
                    ]);
                $existingIds[] = $zoneData['id'];
            } else {
                $id = DB::table('courier_pricing_zones')->insertGetId([
                    'courier_setting_id' => $settingId,
                    'location_type'      => $zoneData['locationType'] ?? 'district',
                    'location_id'        => $zoneData['locationId'] ?? '',
                    'location_name'      => $zoneData['locationName'] ?? '',
                    'fee'                => $zoneData['fee'] ?? 0,
                    'parent_district_id' => $zoneData['parentDistrictId'] ?? null,
                    'sort_order'         => $zoneData['sortOrder'] ?? $index,
                    'created_at'         => now(),
                    'updated_at'         => now(),
                ]);
                $existingIds[] = $id;
            }
        }

        DB::table('courier_pricing_zones')
            ->where('courier_setting_id', $settingId)
            ->whereNotIn('id', $existingIds)
            ->delete();
    }

    /*
    |--------------------------------------------------------------------------
    | Business Logic Methods
    |--------------------------------------------------------------------------
    */

    public function toggleCourierEnabled(int $outletId, bool $enabled): CourierSetting
    {
        try {
            $setting = $this->getByOutletId($outletId);
            $setting->update([
                'is_courier_enabled' => $enabled,
            ]);
            return $setting;
        } catch (Exception $e) {
            Log::error('Failed to toggle courier enabled status', [
                'outlet_id' => $outletId,
                'enabled'   => $enabled,
                'error'     => $e->getMessage(),
                'user_id'   => Auth::id(),
                'type'      => 'courier_setting_service_error',
            ]);
            throw $e;
        }
    }

    public function calculateDeliveryFee(
        int $outletId,
        array $data
    ): CourierPricingResult {
        try {
            $outlet = Outlet::with([
                'courierSetting',
                'courierSetting.pricingTiers',
                'courierSetting.pricingZones'
            ])->findOrFail($outletId);

            $setting = $outlet->courierSetting;

            if (!$setting) {
                throw new Exception('Layanan kurir belum diatur untuk outlet ini.');
            }

            $distanceKm = $this->googleMapsService->getDistance(
                (float) $outlet->latitude,
                (float) $outlet->longitude,
                $data['latitude'],
                $data['longitude']
            );

            $address = null;
            if (!empty($data['customerAddressId'])) {
                $address = CustomerAddress::find($data['customerAddressId']);
            }

            return $this->pricingEngine->calculate(
                $setting,
                $distanceKm,
                $data['orderTotal'] ?? null,
                $data['customerId'] ?? null,
                $address
            );
        } catch (Exception $e) {
            Log::error('Failed to calculate delivery fee', [
                'outlet_id' => $outletId,
                'dest'      => "{$data['latitude']},{$data['longitude']}",
                'error'     => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Get region options for zone editor 
     */
    public function getZoneLocationOptions(int $outletId): array
    {
        try {
            $outlet = Outlet::findOrFail($outletId);
            $cityId = (int) $outlet->city_id;

            if (!$cityId) return ['districts' => []];

            $districts = $this->locationService->getDistricts($cityId);

            return [
                'districts' => collect($districts)
                    ->map(fn($d) => array_merge($d, ['type' => 'district']))
                    ->toArray(),
            ];
        } catch (Exception $e) {
            Log::error('Failed to get zone location options', [
                'outlet_id' => $outletId,
                'error'     => $e->getMessage(),
            ]);
            return ['districts' => []];
        }
    }

    public function getZoneVillageOptions(int $districtId): array
    {
        try {
            $villages = $this->locationService->getVillages($districtId);

            return collect($villages)
                ->map(fn($v) => array_merge($v, ['type' => 'village']))
                ->toArray();
        } catch (Exception $e) {
            Log::error('Failed to get zone village options', [
                'district_id' => $districtId,
                'error'       => $e->getMessage(),
            ]);
            return [];
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Protected Methods
    |--------------------------------------------------------------------------
    */

    protected function applyFilters(Builder $query, array $filters = []): void
    {
        if (isset($filters['id'])) {
            $query->whereKey($filters['id']);
        }

        if (isset($filters['outletId'])) {
            $query->byOutletId($filters['outletId']);
        }

        if (isset($filters['pricingMethod'])) {
            $query->byPricingMethod($filters['pricingMethod']);
        }

        if (isset($filters['orderBy'])) {
            $direction = $filters['orderDirection'] ?? 'desc';
            $this->applySort(
                $query,
                $filters['orderBy'],
                $direction,
                ['pricing_method', 'created_at'],
                [],
                'created_at'
            );
        }
    }
}
