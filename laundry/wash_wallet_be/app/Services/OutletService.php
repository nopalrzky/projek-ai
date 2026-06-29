<?php

namespace App\Services;

use App\Events\OutletCreated;
use App\Events\OutletDeleted;
use App\Events\OutletRenamed;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Employee;
use App\Models\EmployeeSalary;
use App\Models\EmployeeProcessCommission;
use App\Models\EmployeeProcess;
use App\Models\Feature;
use App\Models\Fine;
use App\Models\LaundryService;
use App\Models\LaundryServiceProcess;
use App\Models\MembershipPlan;
use App\Models\OperationalDay;
use App\Models\Order;
use App\Models\Outlet;
use App\Models\OutletFeature;
use App\Models\Position;
use App\Models\ServicePackage;
use App\Models\User;
use App\Models\CourierSchedule;
use App\Models\CourierSetting;
use App\Services\AccountService;
use App\Services\ImageService;
use Exception;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class OutletService extends BaseService
{
    public function __construct(
        protected Category $category,
        protected Customer $customer,
        protected CourierSetting $courierSetting,
        protected CourierSchedule $courierSchedule,
        protected Employee $employee,
        protected EmployeeSalary $employeeSalary,
        protected EmployeeProcessCommission $employeeProcessCommission,
        protected Fine $fine,
        protected Feature $feature,
        protected LaundryService $laundryService,
        protected LaundryServiceProcess $laundryServiceProcess,
        protected MembershipPlan $membershipPlan,
        protected OperationalDay $operationalDay,
        protected Order $order,
        protected Outlet $outlet,
        protected OutletFeature $outletFeature,
        protected Position $position,
        protected AccountService $accountService,
        protected CourierSettingService $courierSettingService,
        protected ImageService $imageService,
        protected OutletFeatureService $outletFeatureService,
        protected ServicePackage $servicePackage,
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
        array $relations = []
    ): LengthAwarePaginator | Collection {
        try {
            $query = $this->outlet->query();

            if (($filters['latitude'] ?? null) !== null && ($filters['longitude'] ?? null) !== null) {
                $this->applyDistanceSelect(
                    $query,
                    (float) $filters['latitude'],
                    (float) $filters['longitude']
                );
            }

            $this->applyTenantScope($query);
            $this->applyFilters($query, $filters);

            if (!empty($relations)) {
                $query->with($relations);
            }

            return $this->paginate($query, $perPage, $page);
        } catch (Exception $e) {
            Log::error('Failed to get outlets', [
                'filters' => $filters,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'outlet_service_error'
            ]);
            throw $e;
        }
    }

    public function getNearby(
        float $latitude,
        float $longitude,
        float $radius = 10.0,
        ?array $filters = [],
        ?int $page = null,
        ?int $perPage = null,
        array $relations = []
    ): LengthAwarePaginator | Collection {
        try {
            $query = $this->outlet->query()
                ->nearby($latitude, $longitude, 1000000)
                ->hasExposure()
                ->active();

            $this->applyTenantScope($query);
            $this->applyFilters($query, $filters);

            if (!empty($relations)) {
                $query->with($relations);
            }

            return $this->paginate($query, $perPage, $page);
        } catch (Exception $e) {
            Log::error('Failed to get nearby outlets', [
                'latitude' => $latitude,
                'longitude' => $longitude,
                'radius' => $radius,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'outlet_service_error'
            ]);
            throw $e;
        }
    }

    public function customerDiscoveryRelations(array $filters = []): array
    {
        $relations = ['operationalDays', 'courierSetting', 'outletFeatures.feature'];

        if (($filters['sortBy'] ?? null) === 'best' || ($filters['sortBy'] ?? null) === 'popular') {
            $relations[] = 'orderReviews';
        }

        if (($filters['includeServices'] ?? false) !== true) {
            return $relations;
        }

        $relations[] = 'orderReviews';
        $relations['categories'] = function (Relation $query) use ($filters) {
            $includeServiceSearch = true;

            $query->where('is_active', true);

            if (!empty($filters['categoryId'])) {
                $query->where('id', (int) $filters['categoryId']);
            }

            $query->whereHas('laundryServices', function (Builder $serviceQuery) use ($filters, $includeServiceSearch) {
                $this->applyDiscoveryServiceQuery($serviceQuery, $filters, $includeServiceSearch);
            });

            $query->with(['laundryServices' => function (Relation $serviceQuery) use ($filters, $includeServiceSearch) {
                $this->applyDiscoveryServiceQuery($serviceQuery, $filters, $includeServiceSearch);
                $serviceQuery->with('unit');
                $this->applyDiscoveryServiceSort($serviceQuery, $filters['serviceSortBy'] ?? 'relevant');
            }]);
        };

        return $relations;
    }

    public function getById(
        int $id,
        array $relations = ['owner'],
        ?float $latitude = null,
        ?float $longitude = null
    ): Outlet
    {
        try {
            $query = $this->outlet->byId($id);

            if ($latitude !== null && $longitude !== null) {
                $this->applyDistanceSelect($query, $latitude, $longitude);
            }

            if (!empty($relations)) {
                $query->with($relations);
            }

            $outlet = $query->firstOrFail();

            return $outlet;
        } catch (Exception $e) {
            Log::error('Failed to get outlet by ID', [
                'outlet_id' => $id,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'outlet_service_error'
            ]);
            throw $e;
        }
    }

    public function resolveDiscoveryCorrectedQuery(?string $search, array $filters = []): ?string
    {
        $rawSearch = trim((string) $search);
        if ($rawSearch === '' || ($filters['includeServices'] ?? false) !== true) {
            return null;
        }

        $normalizedSearch = $this->normalizeDiscoveryTerm($rawSearch);
        if ($normalizedSearch === '') {
            return null;
        }

        $query = $this->buildDiscoveryServiceCandidateQuery($filters);
        $query->where(function (Builder $q) use ($rawSearch, $normalizedSearch) {
            $q->where('name', 'LIKE', "%{$rawSearch}%")
                ->orWhereRaw("REPLACE(LOWER(name), ' ', '') LIKE ?", ["%{$normalizedSearch}%"]);
        });

        if ($query->exists()) {
            return null;
        }

        $candidates = $this->buildDiscoveryServiceCandidateQuery($filters)
            ->orderBy('name')
            ->limit(250)
            ->pluck('name')
            ->filter(fn($name) => is_string($name) && trim($name) !== '')
            ->unique()
            ->values();

        if ($candidates->isEmpty()) {
            return null;
        }

        $bestCandidate = null;
        $bestScore = 0.0;

        foreach ($candidates as $candidate) {
            $score = $this->scoreDiscoveryCandidate($normalizedSearch, (string) $candidate);
            if ($score > $bestScore) {
                $bestScore = $score;
                $bestCandidate = (string) $candidate;
            }
        }

        $queryLen = strlen($normalizedSearch);
        $dynamicThreshold = match (true) {
            $queryLen <= 3 => 75.0,
            $queryLen <= 5 => 65.0,
            default => 62.0,
        };

        if ($bestCandidate === null || $bestScore < $dynamicThreshold) {
            return null;
        }

        return trim($bestCandidate);
    }

    /*
    |--------------------------------------------------------------------------
    | Write Methods
    |--------------------------------------------------------------------------
    */


    public function store(array $data): Outlet
    {
        return DB::transaction(function () use ($data) {
            try {
                /** @var User $user */
                $user = Auth::user();

                /** @var Outlet $outlet */
                $outlet = $user->outlets()->create([
                    'name' => $data['name'],
                    'code' => $this->outlet->generateUniqueCode(),
                    'email' => $data['email'],
                    'province_id' => $data['provinceId'] ?? null,
                    'province_name' => $data['provinceName'] ?? null,
                    'city_id' => $data['cityId'] ?? null,
                    'city_name' => $data['cityName'] ?? null,
                    'district_id' => $data['districtId'] ?? null,
                    'district_name' => $data['districtName'] ?? null,
                    'village_id' => $data['villageId'] ?? null,
                    'village_name' => $data['villageName'] ?? null,
                    'street' => $data['street'] ?? null,
                    'phone' => $data['phone'] ?? null,
                    'latitude' => $data['latitude'] ?? null,
                    'longitude' => $data['longitude'] ?? null,
                    'status' => 'inactive',
                ]);

                $this->operationalDay->generateDaysForOutletId($outlet->id);

                $activationFeature = Feature::where('key', 'outlet_activation')->first();
                if ($activationFeature) {
                    OutletFeature::create([
                        'outlet_id'  => $outlet->id,
                        'feature_id' => $activationFeature->id,
                        'status'     => OutletFeature::STATUS_INACTIVE,
                        'coin_spent' => 0,
                    ]);
                }

                Log::info('Outlet created successfully', [
                    'outlet_id' => $outlet->id,
                    'outlet_name' => $outlet->name,
                    'created_by' => $user->id,
                    'type' => 'outlet_management'
                ]);

                OutletCreated::dispatch($outlet);
                return $outlet;
            } catch (Exception $e) {
                Log::error('Failed to create outlet', [
                    'error' => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type' => 'outlet_service_error'
                ]);
                throw $e;
            }
        });
    }

    public function update(int $id, array $data): Outlet
    {
        return DB::transaction(function () use ($id, $data) {
            try {
                $outlet = $this->outlet->byId($id)->firstOrFail();
                $this->authorizeOutletAccess($outlet);
                $oldName = $outlet->name;

                if (isset($data['name'])) {
                    $data['name'] = trim($data['name']);
                }

                if (isset($data['email'])) {
                    $data['email'] = trim($data['email']);
                }

                if (isset($data['phone'])) {
                    $data['phone'] = trim($data['phone']);
                }

                if (isset($data['provinceId'])) {
                    $data['province_id'] = $data['provinceId'];
                }

                if (isset($data['provinceName'])) {
                    $data['province_name'] = trim($data['provinceName']);
                }

                if (isset($data['cityId'])) {
                    $data['city_id'] = $data['cityId'];
                }

                if (isset($data['cityName'])) {
                    $data['city_name'] = trim($data['cityName']);
                }

                if (isset($data['districtId'])) {
                    $data['district_id'] = $data['districtId'];
                }

                if (isset($data['districtName'])) {
                    $data['district_name'] = trim($data['districtName']);
                }

                if (isset($data['villageId'])) {
                    $data['village_id'] = $data['villageId'];
                }

                if (isset($data['villageName'])) {
                    $data['village_name'] = trim($data['villageName']);
                }

                if (isset($data['street'])) {
                    $data['street'] = trim($data['street']);
                }

                if (isset($data['isActive'])) {
                    $data['status'] = $data['isActive'] ? 'active' : 'inactive';
                    unset($data['isActive']);
                }

                $outlet->update($data);

                $newName = $outlet->fresh()->name;
                if ($oldName !== $newName) {
                    Log::info('Outlet name changed, dispatching rename event', [
                        'outlet_id' => $id,
                        'old_name' => $oldName,
                        'new_name' => $newName,
                        'owner_id' => $outlet->owner_id,
                        'type' => 'outlet_name_change'
                    ]);

                    OutletRenamed::dispatch($id, $oldName, $newName, $outlet->owner_id);
                }

                Log::info('Outlet updated successfully', [
                    'outlet_id' => $id,
                    'updated_by' => Auth::id(),
                    'changes' => array_keys($data),
                    'type' => 'outlet_management'
                ]);

                return $outlet->fresh();
            } catch (Exception $e) {
                Log::error('Failed to update outlet', [
                    'outlet_id' => $id,
                    'updated_by' => Auth::id(),
                    'error' => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type' => 'outlet_service_error'
                ]);
                throw $e;
            }
        });
    }

    public function destroy(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            try {
                $outlet = $this->outlet->findOrFail($id);

                /** @var User $user */
                $user = Auth::user();

                if (!$user->hasRole('super_admin') && $outlet->owner_id !== $user->id) {
                    throw new AccessDeniedHttpException('You do not have permission to delete this outlet');
                }

                $deleted = $outlet->delete();

                if ($deleted) {
                    OutletDeleted::dispatch(
                        $outlet->id,
                        $outlet->owner_id,
                        $outlet->name
                    );

                    Log::info('Outlet deleted successfully', [
                        'outlet_id' => $id,
                        'outlet_name' => $outlet->name,
                        'outlet_code' => $outlet->code,
                        'deleted_by' => $user->id,
                        'type' => 'outlet_management'
                    ]);
                }

                return $deleted;
            } catch (Exception $e) {
                Log::error('Failed to delete outlet', [
                    'outlet_id' => $id,
                    'error' => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type' => 'outlet_service_error'
                ]);
                throw $e;
            }
        });
    }

    public function forceDestroy(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            try {
                $outlet = $this->outlet->withTrashed()->findOrFail($id);
                $this->authorizeOutletAccess($outlet);

                $deleted = $outlet->forceDelete();

                if ($deleted) {
                    Log::info('Outlet permanently deleted', [
                        'outlet_id' => $id,
                        'name' => $outlet->name,
                        'code' => $outlet->code,
                        'deleted_by' => Auth::id(),
                        'type' => 'outlet_management'
                    ]);
                }

                return $deleted;
            } catch (Exception $e) {
                Log::error('Failed to force delete outlet', [
                    'outlet_id' => $id,
                    'error' => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type' => 'outlet_service_error'
                ]);
                throw $e;
            }
        });
    }

    public function restore(int $id): Outlet
    {
        return DB::transaction(function () use ($id) {
            try {
                $outlet = $this->outlet->withTrashed()->findOrFail($id);
                $this->authorizeOutletAccess($outlet);

                $outlet->restore();

                Log::info('Outlet restored successfully', [
                    'outlet_id' => $id,
                    'name' => $outlet->name,
                    'code' => $outlet->code,
                    'restored_by' => Auth::id(),
                    'type' => 'outlet_management'
                ]);

                return $outlet->fresh();
            } catch (Exception $e) {
                Log::error('Failed to restore outlet', [
                    'outlet_id' => $id,
                    'error' => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type' => 'outlet_service_error'
                ]);
                throw $e;
            }
        });
    }

    public function storeCategory(int $outletId, array $data): Category
    {
        return DB::transaction(function () use ($outletId, $data) {
            try {
                $outlet = $this->outlet->byId($outletId)->firstOrFail();

                $this->authorizeOutletAccess($outlet);

                $category = $outlet->categories()->create([
                    'name' => $data['name'],
                    'description' => $data['description'] ?? null,
                    'is_active' => $data['isActive'] ?? true,
                ]);

                Log::info('Category created successfully', [
                    'category_id' => $category->id,
                    'outlet_id' => $outletId,
                    'category_name' => $category->name,
                    'created_by' => Auth::id(),
                    'type' => 'category_management'
                ]);

                return $category;
            } catch (Exception $e) {
                Log::error('Failed to create category', [
                    'outlet_id' => $outletId,
                    'error' => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type' => 'category_service_error'
                ]);
                throw $e;
            }
        });
    }

    public function updateCategory(int $outletId, int $categoryId, array $data): Category
    {
        return DB::transaction(function () use ($outletId, $categoryId, $data) {
            try {

                $category = $this->category->byId($categoryId)->firstOrFail();
                $this->authorizeCategoryAccess($category);

                if (isset($data['name'])) {
                    $category->name = $data['name'];
                }
                if (isset($data['description'])) {
                    $category->description = $data['description'];
                }

                if (isset($data['isActive'])) {
                    $category->is_active = $data['isActive'];
                }

                $category->save();

                Log::info('Category updated successfully', [
                    'category_id' => $categoryId,
                    'outlet_id' => $outletId,
                    'changes' => array_keys($data),
                    'updated_by' => Auth::id(),
                    'type' => 'category_management'
                ]);

                return $category->fresh();
            } catch (Exception $e) {
                Log::error('Failed to update category', [
                    'category_id' => $categoryId,
                    'outlet_id' => $outletId,
                    'error' => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type' => 'category_service_error'
                ]);
                throw $e;
            }
        });
    }

    public function destroyCategory(int $outletId, int $categoryId): bool
    {
        return DB::transaction(function () use ($outletId, $categoryId) {
            try {
                $category = $this->category->byId($categoryId)->firstOrFail();
                $this->authorizeCategoryAccess($category);
                $deleted = $category->delete();

                if ($deleted) {
                    Log::info('Category deleted successfully', [
                        'category_id' => $categoryId,
                        'outlet_id' => $outletId,
                        'deleted_by' => Auth::id(),
                        'type' => 'category_management'
                    ]);
                }

                return $deleted;
            } catch (Exception $e) {
                Log::error('Failed to delete category', [
                    'category_id' => $categoryId,
                    'outlet_id' => $outletId,
                    'error' => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type' => 'category_service_error'
                ]);
                throw $e;
            }
        });
    }

    public function storeOutletFeature(int $outletId, int $featureId, string $type = 'outlet'): OutletFeature
    {
        return $this->outletFeatureService->unlockFeature($outletId, $featureId, $type);
    }

    public function activateCourierFeature(int $outletId): OutletFeature
    {
        $outlet = $this->getById($outletId, ['outletFeatures.feature']);

        if (!$outlet->hasActiveExposure()) {
            throw new Exception('Fitur kurir hanya dapat diaktifkan setelah mengaktifkan Ekspos Outlet.');
        }

        $feature = $this->outletFeatureService->unlockFreeFeature($outletId, 'courier_schedule');

        $outlet->courierSetting()->firstOrCreate(
            ['outlet_id' => $outletId],
            [
                'pricing_method' => 'flat_rate',
                'surge_enabled' => false,
                'free_shipping_enabled' => false,
                'unconditional_free_shipping_enabled' => false,
            ]
        );

        return $feature;
    }

    public function storeCourierSchedule(int $outletId, array $data): CourierSchedule
    {
        return DB::transaction(function () use ($outletId, $data) {
            try {
                $outlet = $this->outlet->byId($outletId)->firstOrFail();
                $this->authorizeOutletAccess($outlet);

                $dayOfWeek = strtolower($data['dayOfWeek']);
                $opDay = $outlet->operationalDays()->where('day_of_week', $dayOfWeek)->first();

                if (!$opDay) {
                    $opDay = $outlet->operationalDays()->create([
                        'day_of_week' => $dayOfWeek,
                        'is_open' => false,
                        'open_time' => null,
                        'close_time' => null,
                    ]);
                }

                if (!$opDay->is_open) {
                    throw new Exception('Tidak dapat membuat jadwal kurir pada hari libur operasional outlet.');
                }

                $startTime = $data['startTime'];
                $endTime = $data['endTime'];

                $opOpen = $opDay->open_time;
                $opClose = $opDay->close_time;

                if (!$opOpen || !$opClose) {
                    throw new Exception('Jam operasional outlet belum dikonfigurasi.');
                }

                $startCheck = preg_match('/^\d{4}-\d{2}-\d{2}\s+(.*)$/', (string)$startTime, $matches) ? $matches[1] : (string)$startTime;
                $endCheck = preg_match('/^\d{4}-\d{2}-\d{2}\s+(.*)$/', (string)$endTime, $matches) ? $matches[1] : (string)$endTime;

                $startCheck = date('H:i:s', strtotime($startCheck));
                $endCheck = date('H:i:s', strtotime($endCheck));

                if ($startCheck < $opOpen || $endCheck > $opClose) {
                    throw new Exception('Jadwal kurir harus berada dalam rentang jam operasional outlet (' . date('H:i', strtotime($opOpen)) . ' - ' . date('H:i', strtotime($opClose)) . ').');
                }

                $schedule = $outlet->courierSchedules()->create([
                    'operational_day_id' => $opDay->id,
                    'day_of_week'        => $dayOfWeek,
                    'type'               => $data['type'],
                    'start_time'         => $data['startTime'],
                    'end_time'           => $data['endTime'],
                    'is_active'          => $data['isActive'] ?? true,
                ]);

                Log::info('Courier schedule created successfully', [
                    'schedule_id' => $schedule->id,
                    'outlet_id' => $outletId,
                    'type' => 'courier_management'
                ]);

                return $schedule;
            } catch (Exception $e) {
                Log::error('Failed to create courier schedule', [
                    'outlet_id' => $outletId,
                    'error' => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type' => 'outlet_service_error'
                ]);
                throw $e;
            }
        });
    }

    public function updateCourierSchedule(int $outletId, int $scheduleId, array $data): CourierSchedule
    {
        return DB::transaction(function () use ($outletId, $scheduleId, $data) {
            try {
                $schedule = $this->courierSchedule->byId($scheduleId)->firstOrFail();

                $dayOfWeek = strtolower($data['dayOfWeek'] ?? $schedule->day_of_week);
                $startTime = $data['startTime'] ?? ($schedule->start_time instanceof \Carbon\Carbon ? $schedule->start_time->format('H:i:s') : $schedule->start_time);
                $endTime = $data['endTime'] ?? ($schedule->end_time instanceof \Carbon\Carbon ? $schedule->end_time->format('H:i:s') : $schedule->end_time);

                $opDay = $schedule->outlet->operationalDays()->where('day_of_week', $dayOfWeek)->first();

                if (!$opDay) {
                    $opDay = $schedule->outlet->operationalDays()->create([
                        'day_of_week' => $dayOfWeek,
                        'is_open' => false,
                        'open_time' => null,
                        'close_time' => null,
                    ]);
                }

                if (!$opDay->is_open) {
                    throw new Exception('Tidak dapat mengubah jadwal kurir pada hari libur operasional outlet.');
                }

                $opOpen = $opDay->open_time;
                $opClose = $opDay->close_time;

                if (!$opOpen || !$opClose) {
                    throw new Exception('Jam operasional outlet belum dikonfigurasi.');
                }

                $startCheck = preg_match('/^\d{4}-\d{2}-\d{2}\s+(.*)$/', (string)$startTime, $matches) ? $matches[1] : (string)$startTime;
                $endCheck = preg_match('/^\d{4}-\d{2}-\d{2}\s+(.*)$/', (string)$endTime, $matches) ? $matches[1] : (string)$endTime;

                $startCheck = date('H:i:s', strtotime($startCheck));
                $endCheck = date('H:i:s', strtotime($endCheck));

                if ($startCheck < $opOpen || $endCheck > $opClose) {
                    throw new Exception('Jadwal kurir harus berada dalam rentang jam operasional outlet (' . date('H:i', strtotime($opOpen)) . ' - ' . date('H:i', strtotime($opClose)) . ').');
                }

                $schedule->update([
                    'operational_day_id' => $opDay->id,
                    'day_of_week'        => $dayOfWeek,
                    'type'               => $data['type'] ?? $schedule->type,
                    'start_time'         => $data['startTime'] ?? $schedule->start_time,
                    'end_time'           => $data['endTime'] ?? $schedule->end_time,
                    'is_active'          => $data['isActive'] ?? $schedule->is_active,
                ]);

                Log::info('Courier schedule updated successfully', [
                    'schedule_id' => $scheduleId,
                    'outlet_id' => $outletId,
                    'type' => 'courier_management'
                ]);

                return $schedule;
            } catch (Exception $e) {
                Log::error('Failed to update courier schedule', [
                    'outlet_id' => $outletId,
                    'schedule_id' => $scheduleId,
                    'error' => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type' => 'outlet_service_error'
                ]);
                throw $e;
            }
        });
    }

    public function destroyCourierSchedule(int $outletId, int $scheduleId): bool
    {
        return DB::transaction(function () use ($outletId, $scheduleId) {
            try {
                $schedule = $this->courierSchedule->byId($scheduleId)->firstOrFail();

                $deleted = $schedule->delete();

                Log::info('Courier schedule deleted successfully', [
                    'schedule_id' => $scheduleId,
                    'outlet_id' => $outletId,
                    'type' => 'courier_management'
                ]);

                return $deleted;
            } catch (Exception $e) {
                Log::error('Failed to delete courier schedule', [
                    'outlet_id' => $outletId,
                    'schedule_id' => $scheduleId,
                    'error' => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type' => 'outlet_service_error'
                ]);
                throw $e;
            }
        });
    }


    public function updateCourierSetting(int $outletId, int $courierSettingId, array $data): CourierSetting
    {
        return DB::transaction(function () use ($outletId, $courierSettingId, $data) {
            try {
                $outlet = Outlet::findOrFail($outletId);

                if (!$outlet->hasActiveExposure()) {
                    throw new Exception('Pengaturan kurir hanya dapat diubah jika fitur Ekspos Outlet aktif.');
                }

                $setting = $this->courierSetting->byId($courierSettingId)->first();

                if (!$setting) {
                    throw new Exception('Pengaturan kurir tidak ditemukan.');
                }

                if ($setting->outlet_id !== $outletId) {
                    throw new Exception('Pengaturan kurir tidak dimiliki oleh outlet ini.');
                }

                if (isset($data['pricingMethod'])) {
                    $setting->pricing_method = $data['pricingMethod'];
                }

                if (isset($data['flatFee'])) {
                    $setting->flat_fee = $data['flatFee'];
                }

                if (isset($data['baseFee'])) {
                    $setting->base_fee = $data['baseFee'];
                }

                if (isset($data['perKmFee'])) {
                    $setting->per_km_fee = $data['perKmFee'];
                }

                if (isset($data['defaultPrice'])) {
                    $setting->default_price = $data['defaultPrice'];
                }

                if (isset($data['freeRadiusKm'])) {
                    $setting->free_radius_km = $data['freeRadiusKm'];
                }

                if (isset($data['minFee'])) {
                    $setting->min_fee = $data['minFee'];
                }

                if (isset($data['maxFee'])) {
                    $setting->max_fee = $data['maxFee'];
                }

                if (isset($data['maxDistanceKm'])) {
                    $setting->max_distance_km = $data['maxDistanceKm'];
                }

                if (isset($data['surgeEnabled'])) {
                    $setting->surge_enabled = $data['surgeEnabled'];
                }

                if (isset($data['surgeMultiplier'])) {
                    $setting->surge_multiplier = $data['surgeMultiplier'];
                }

                if (isset($data['nightSurcharge'])) {
                    $setting->night_surcharge = $data['nightSurcharge'];
                }

                if (isset($data['nightStartTime'])) {
                    $setting->night_start_time = $data['nightStartTime'];
                }

                if (isset($data['nightEndTime'])) {
                    $setting->night_end_time = $data['nightEndTime'];
                }

                if (isset($data['weekendSurcharge'])) {
                    $setting->weekend_surcharge = $data['weekendSurcharge'];
                }

                if (isset($data['merchantSubsidy'])) {
                    $setting->merchant_subsidy = $data['merchantSubsidy'];
                }

                if (isset($data['merchantSubsidyType'])) {
                    $setting->merchant_subsidy_type = $data['merchantSubsidyType'];
                }

                if (isset($data['freeShippingMode'])) {
                    $mode = $data['freeShippingMode'];
                    $setting->unconditional_free_shipping_enabled = $mode === 'all';
                    $setting->free_shipping_enabled = $mode === 'min_order';
                } elseif (isset($data['unconditionalFreeShippingEnabled'])) {
                    $setting->unconditional_free_shipping_enabled = (bool) $data['unconditionalFreeShippingEnabled'];
                }

                if (isset($data['freeShippingEnabled']) && !isset($data['freeShippingMode'])) {
                    $setting->free_shipping_enabled = $data['freeShippingEnabled'];
                }

                if (isset($data['minOrderFreeShipping'])) {
                    $setting->min_order_free_shipping = $data['minOrderFreeShipping'];
                }

                $setting->save();


                if (isset($data['tiers'])) {
                    $this->courierSettingService->syncPricingTiers($courierSettingId, $data['tiers']);
                }

                if (isset($data['zones'])) {
                    $this->courierSettingService->syncPricingZones($courierSettingId, $data['zones']);
                }

                return $setting->fresh(['pricingTiers', 'pricingZones']);
            } catch (Exception $e) {
                Log::error('Failed to update courier settings', [
                    'outlet_id' => $outletId,
                    'data'      => $data,
                    'error'     => $e->getMessage(),
                ]);
                throw $e;
            }
        });
    }



    public function storeCustomer(int $outletId, array $data): Customer
    {
        return DB::transaction(function () use ($outletId, $data) {
            try {
                $outlet = $this->outlet->byId($outletId)->firstOrFail();
                $this->authorizeOutletAccess($outlet);

                $customer = $outlet->customers()->create([
                    'name' => $data['name'],
                    'email' => $data['email'] ?? null,
                    'phone' => $data['phone'],
                    'address' => $data['address'] ?? null,
                    'gender' => $data['gender'] ?? null,
                    'is_active' => $data['isActive'] ?? true,
                ]);

                Log::info('Customer created successfully', [
                    'customer_id' => $customer->id,
                    'outlet_id' => $outletId,
                    'customer_name' => $customer->name,
                    'customer_phone' => $customer->phone,
                    'created_by' => Auth::id(),
                    'type' => 'customer_management'
                ]);

                return $customer;
            } catch (Exception $e) {
                Log::error('Failed to create customer', [
                    'outlet_id' => $outletId,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'user_id' => Auth::id(),
                    'type' => 'customer_service_error'
                ]);
                throw $e;
            }
        });
    }

    public function updateCustomer(int $outletId, int $customerId, array $data): Customer
    {
        return DB::transaction(function () use ($outletId, $customerId, $data) {
            try {
                $customer = $this->customer->byId($customerId)->firstOrFail();
                $this->authorizeCustomerAccess($customer);

                if (isset($data['name'])) {
                    $customer->name = $data['name'];
                }

                if (isset($data['email'])) {
                    $customer->email = $data['email'];
                }

                if (isset($data['phone'])) {
                    $customer->phone = $data['phone'];
                }

                if (isset($data['address'])) {
                    $customer->address = $data['address'];
                }

                if (isset($data['gender'])) {
                    $customer->gender = $data['gender'];
                }

                if (isset($data['isActive'])) {
                    $customer->is_active = $data['isActive'];
                }

                $customer->save();

                Log::info('Customer updated successfully', [
                    'customer_id' => $customerId,
                    'outlet_id' => $outletId,
                    'changes' => array_keys($data),
                    'updated_by' => Auth::id(),
                    'type' => 'customer_management'
                ]);

                return $customer->fresh();
            } catch (Exception $e) {
                Log::error('Failed to update customer', [
                    'customer_id' => $customerId,
                    'outlet_id' => $outletId,
                    'error' => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type' => 'customer_service_error'
                ]);
                throw $e;
            }
        });
    }

    public function destroyCustomer(int $outletId, int $customerId): bool
    {
        return DB::transaction(function () use ($outletId, $customerId) {
            try {
                $customer = $this->customer->byId($customerId)->firstOrFail();
                $this->authorizeCustomerAccess($customer);
                $deleted = $customer->delete();

                if ($deleted) {
                    Log::info('Customer deleted successfully', [
                        'customer_id' => $customerId,
                        'outlet_id' => $outletId,
                        'deleted_by' => Auth::id(),
                        'type' => 'customer_management'
                    ]);
                }

                return $deleted;
            } catch (Exception $e) {
                Log::error('Failed to delete customer', [
                    'customer_id' => $customerId,
                    'outlet_id' => $outletId,
                    'error' => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type' => 'customer_service_error'
                ]);
                throw $e;
            }
        });
    }

    public function storeEmployee(int $outletId, array $data): Employee
    {
        return DB::transaction(function () use ($outletId, $data) {
            try {
                $outlet = $this->outlet->byId($outletId)->firstOrFail();
                $this->authorizeOutletAccess($outlet);

                $avatarPath = null;
                if (isset($data['avatar']) && $data['avatar']) {
                    $avatarPath = $this->imageService->store($data['avatar'], "employees/{$outletId}");
                }

                $employee = $outlet->employees()->create([
                    'name' => $data['name'],
                    'username' => $data['username'],
                    'password' => Hash::make($data['password']),
                    'avatar' => $avatarPath,
                    'phone' => $data['phone'] ?? null,
                    'address' => $data['address'] ?? null,
                    'gender' => $data['gender'] ?? null,
                    'start_date' => $data['startDate'],
                    'is_active' => $data['isActive'] ?? true,
                    'cutoff_days' => $data['cutoffDays'] ?? 30,
                ]);

                $positionIds = $data['positionIds'] ?? [];
                if (!empty($positionIds)) {
                    $employee->syncPositions($positionIds);
                }

                if (!empty($data['employeeSalaries']) && is_array($data['employeeSalaries'])) {
                    foreach ($data['employeeSalaries'] as $salaryData) {
                        if (isset($salaryData['salaryId']) && $salaryData['salaryId']) {
                            $this->employeeSalary->create([
                                'employee_id' => $employee->id,
                                'salary_id' => $salaryData['salaryId'],
                                'type' => $salaryData['type'],
                                'status' => $salaryData['status'],
                                'amount' => $salaryData['amount'],
                            ]);
                        }
                    }
                }

                if (!empty($data['employeeProcessCommissions']) && is_array($data['employeeProcessCommissions'])) {
                    foreach ($data['employeeProcessCommissions'] as $commissionData) {
                        if (isset($commissionData['processId']) && $commissionData['processId']) {
                            $employeeProcess = EmployeeProcess::assignToEmployee(
                                $employee->id,
                                $commissionData['processId']
                            );
                            $this->employeeProcessCommission->create([
                                'employee_process_id' => $employeeProcess->id,
                                'commission_type' => $commissionData['commissionType'],
                                'commission_value' => $commissionData['commissionValue'],
                                'has_target' => $commissionData['hasTarget'] ?? false,
                                'target_threshold' => $commissionData['hasTarget'] ? ($commissionData['targetThreshold'] ?? 0) : 0,
                                'bonus_amount' => $commissionData['hasTarget'] ? ($commissionData['bonusAmount'] ?? 0) : 0,
                                'effective_date' => $commissionData['effectiveDate'] ?? now(),
                                'is_active' => $commissionData['isActive'] ?? true,
                            ]);
                        }
                    }
                }

                Log::info('Employee created successfully', [
                    'employee_id' => $employee->id,
                    'outlet_id' => $outletId,
                    'employee_name' => $employee->name,
                    'employee_username' => $employee->username,
                    'has_avatar' => !is_null($avatarPath),
                    'type' => 'employee_management'
                ]);

                return $employee;
            } catch (Exception $e) {
                if (isset($avatarPath) && $avatarPath) {
                    Storage::disk('public')->delete($avatarPath);
                }

                Log::error('Failed to create employee', [
                    'outlet_id' => $outletId,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'user_id' => Auth::id(),
                    'type' => 'employee_service_error'
                ]);
                throw $e;
            }
        });
    }

    public function updateEmployee(int $outletId, int $employeeId, array $data): Employee
    {
        return DB::transaction(function () use ($outletId, $employeeId, $data) {
            try {
                $employee = $this->employee->byId($employeeId)->firstOrFail();

                if (isset($data['name'])) {
                    $employee->name = $data['name'];
                }

                if (isset($data['username'])) {
                    $employee->username = $data['username'];
                }

                if (isset($data['phone'])) {
                    $employee->phone = $data['phone'];
                }

                if (isset($data['address'])) {
                    $employee->address = $data['address'];
                }

                if (isset($data['gender'])) {
                    $employee->gender = $data['gender'];
                }

                if (isset($data['isActive'])) {
                    $employee->is_active = $data['isActive'];
                }

                if (isset($data['startDate'])) {
                    $employee->start_date = $data['startDate'];
                }

                if (isset($data['cutoffDays'])) {
                    $employee->cutoff_days = $data['cutoffDays'];
                }

                $employee->save();

                if (isset($data['password']) && $data['password']) {
                    $employee->password = Hash::make($data['password']);
                    $employee->save();
                }

                if (isset($data['avatar'])) {
                    if ($data['avatar']) {
                        $avatarPath = $this->imageService->store($data['avatar'], "employees/{$outletId}");
                        $employee->avatar = $avatarPath;
                    } else {
                        if ($employee->avatar) {
                            Storage::disk('public')->delete($employee->avatar);
                        }
                        $employee->avatar = null;
                    }
                    $employee->save();
                }


                Log::info('Employee updated successfully', [
                    'employee_id' => $employeeId,
                    'outlet_id' => $outletId,
                    'changes' => array_keys($data),
                    'updated_by' => Auth::id(),
                    'type' => 'employee_management'
                ]);

                return $employee->fresh();
            } catch (Exception $e) {
                Log::error('Failed to update employee', [
                    'employee_id' => $employeeId,
                    'outlet_id' => $outletId,
                    'error' => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type' => 'employee_service_error'
                ]);
                throw $e;
            }
        });
    }

    public function destroyEmployee(int $outletId, int $employeeId): bool
    {
        return DB::transaction(function () use ($outletId, $employeeId) {
            try {

                $employee = $this->employee
                    ->byId($employeeId)
                    ->firstOrFail();

                $this->authorizeEmployeeAccess($employee);

                $deleted = $employee->delete();

                if ($deleted) {
                    Log::info('Employee deleted successfully', [
                        'employee_id' => $employeeId,
                        'outlet_id' => $outletId,
                        'deleted_by' => Auth::id(),
                        'type' => 'employee_management'
                    ]);
                }

                return $deleted;
            } catch (Exception $e) {
                Log::error('Failed to delete employee', [
                    'employee_id' => $employeeId,
                    'outlet_id' => $outletId,
                    'error' => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type' => 'employee_service_error'
                ]);
                throw $e;
            }
        });
    }

    public function storeFine(int $outletId, array $data): Fine
    {
        return DB::transaction(function () use ($outletId, $data) {
            try {
                $fine = $this->fine->create([
                    'outlet_id' => $outletId,
                    'name' => $data['name'],
                    'amount' => $data['amount'],
                    'description' => $data['description'] ?? null,
                ]);

                Log::info('Fine created successfully', [
                    'fine_id' => $fine->id,
                    'outlet_id' => $outletId,
                    'fine_name' => $fine->name,
                    'created_by' => Auth::id(),
                    'type' => 'fine_management'
                ]);

                return $fine;
            } catch (Exception $e) {
                Log::error('Failed to create fine', [
                    'outlet_id' => $outletId,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'user_id' => Auth::id(),
                    'type' => 'fine_service_error'
                ]);
                throw $e;
            }
        });
    }

    public function updateFine(int $outletId, int $fineId, array $data): Fine
    {
        return DB::transaction(function () use ($outletId, $fineId, $data) {
            try {
                $fine = $this->fine->byId($fineId)->firstOrFail();

                if (isset($data['name'])) {
                    $fine->name = $data['name'];
                }

                if (isset($data['amount'])) {
                    $fine->amount = $data['amount'];
                }

                if (isset($data['description'])) {
                    $fine->description = $data['description'];
                }

                $fine->save();
                Log::info('Fine updated successfully', [
                    'fine_id' => $fineId,
                    'outlet_id' => $outletId,
                    'changes' => array_keys($data),
                    'updated_by' => Auth::id(),
                    'type' => 'fine_management'
                ]);

                return $fine->fresh();
            } catch (Exception $e) {
                Log::error('Failed to update fine', [
                    'fine_id' => $fineId,
                    'outlet_id' => $outletId,
                    'error' => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type' => 'fine_service_error'
                ]);
                throw $e;
            }
        });
    }

    public function destroyFine(int $outletId, int $fineId): bool
    {
        return DB::transaction(function () use ($outletId, $fineId) {
            try {
                $fine = $this->fine->byId($fineId)->firstOrFail();
                $this->authorizeFineAccess($fine);

                $deleted = $fine->delete();

                if ($deleted) {
                    Log::info('Fine deleted successfully', [
                        'fine_id' => $fineId,
                        'outlet_id' => $outletId,
                        'deleted_by' => Auth::id(),
                        'type' => 'fine_management'
                    ]);
                }

                return $deleted;
            } catch (Exception $e) {
                Log::error('Failed to delete fine', [
                    'fine_id' => $fineId,
                    'outlet_id' => $outletId,
                    'error' => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type' => 'fine_service_error'
                ]);
                throw $e;
            }
        });
    }

    public function storeLaundryService(int $outletId, array $data): LaundryService
    {
        return DB::transaction(function () use ($outletId, $data) {
            try {
                $outlet = $this->outlet->byId($outletId)->firstOrFail();

                $laundryService = $outlet->laundryServices()->create([
                    'category_id' => $data['categoryId'],
                    'unit_id' => $data['unitId'],
                    'name' => $data['name'],
                    'description' => $data['description'] ?? null,
                    'is_active' => $data['isActive'] ?? true,
                    'price' => $data['price'],
                    'duration_hours' => $data['durationHours'] ?? null,
                    'min_quantity' => $data['minQuantity'] ?? 1,
                ]);

                if (isset($data['laundryServiceProcesses']) && is_array($data['laundryServiceProcesses'])) {
                    foreach ($data['laundryServiceProcesses'] as $index => $processData) {
                        $processData['sequence'] = $index + 1;

                        $this->laundryServiceProcess->create([
                            'laundry_service_id' => $laundryService->id,
                            'process_id' => $processData['processId'],
                            'sequence' => $processData['sequence'],
                        ]);
                    }

                    Log::info('LaundryServiceProcesses created', [
                        'laundry_service_id' => $laundryService->id,
                        'processes_count' => count($data['laundryServiceProcesses']),
                        'type' => 'laundry_service_process_action'
                    ]);
                }

                Log::info('Laundry service created successfully', [
                    'laundry_service_id' => $laundryService->id,
                    'outlet_id' => $outletId,
                    'category_id' => $data['categoryId'],
                    'service_name' => $laundryService->name,
                    'type' => 'laundry_service_management'
                ]);

                return $laundryService->load(['category', 'unit', 'laundryServiceProcesses.process']);
            } catch (Exception $e) {
                Log::error('Failed to create laundry service', [
                    'outlet_id' => $outletId,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'user_id' => Auth::id(),
                    'type' => 'laundry_service_service_error'
                ]);
                throw $e;
            }
        });
    }

    public function updateLaundryService(int $outletId, int $laundryServiceId, array $data): LaundryService
    {
        return DB::transaction(function () use ($outletId, $laundryServiceId, $data) {
            try {
                $laundryService = $this->laundryService
                    ->byId($laundryServiceId)
                    ->firstOrFail();

                $this->authorizeLaundryServiceAccess($laundryService);

                if (isset($data['categoryId'])) {
                    $laundryService->category_id = $data['categoryId'];
                }

                if (isset($data['unitId'])) {
                    $laundryService->unit_id = $data['unitId'];
                }

                if (isset($data['name'])) {
                    $laundryService->name = $data['name'];
                }

                if (isset($data['description'])) {
                    $laundryService->description = $data['description'];
                }

                if (isset($data['isActive'])) {
                    $laundryService->is_active = $data['isActive'];
                }

                if (isset($data['price'])) {
                    $laundryService->price = $data['price'];
                }

                if (isset($data['durationHours'])) {
                    $laundryService->duration_hours = $data['durationHours'];
                }

                if (isset($data['minQuantity'])) {
                    $laundryService->min_quantity = $data['minQuantity'];
                }

                $laundryService->save();

                if (isset($data['laundryServiceProcesses']) && is_array($data['laundryServiceProcesses'])) {
                    $this->laundryServiceProcess->where('laundry_service_id', $laundryServiceId)->delete();

                    foreach ($data['laundryServiceProcesses'] as $index => $processData) {
                        $processData['sequence'] = $index + 1;

                        $this->laundryServiceProcess->create([
                            'laundry_service_id' => $laundryServiceId,
                            'process_id' => $processData['processId'],
                            'sequence' => $processData['sequence'],
                        ]);
                    }

                    Log::info('LaundryServiceProcesses updated', [
                        'laundry_service_id' => $laundryServiceId,
                        'processes_count' => count($data['laundryServiceProcesses']),
                        'type' => 'laundry_service_process_action'
                    ]);
                }

                Log::info('Laundry service updated successfully', [
                    'laundry_service_id' => $laundryServiceId,
                    'outlet_id' => $outletId,
                    'changes' => array_keys($data),
                    'type' => 'laundry_service_management'
                ]);

                return $laundryService->fresh(['category', 'unit', 'laundryServiceProcesses.process']);
            } catch (Exception $e) {
                Log::error('Failed to update laundry service', [
                    'laundry_service_id' => $laundryServiceId,
                    'outlet_id' => $outletId,
                    'error' => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type' => 'laundry_service_service_error'
                ]);
                throw $e;
            }
        });
    }

    public function destroyLaundryService(int $outletId, int $laundryServiceId): bool
    {
        return DB::transaction(function () use ($outletId, $laundryServiceId) {
            try {
                $laundryService = $this->laundryService
                    ->byId($laundryServiceId)
                    ->firstOrFail();

                $this->authorizeLaundryServiceAccess($laundryService);

                $deleted = $laundryService->delete();

                if ($deleted) {
                    Log::info('Laundry service deleted successfully', [
                        'laundry_service_id' => $laundryServiceId,
                        'outlet_id' => $outletId,
                        'service_name' => $laundryService->name,
                        'type' => 'laundry_service_management'
                    ]);
                }

                return $deleted;
            } catch (Exception $e) {
                Log::error('Failed to delete laundry service', [
                    'laundry_service_id' => $laundryServiceId,
                    'outlet_id' => $outletId,
                    'error' => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type' => 'laundry_service_service_error'
                ]);
                throw $e;
            }
        });
    }

    public function storeMembershipPlan(int $outletId, array $data): MembershipPlan
    {
        return DB::transaction(function () use ($outletId, $data) {
            try {
                $outlet = $this->outlet->byId($outletId)->firstOrFail();

                $membershipPlan = $outlet->membershipPlans()->create([
                    'name' => $data['name'],
                    'price' => $data['price'],
                    'duration_days' => $data['durationDays'] ?? null,
                    'discount_percentage' => $data['discountPercentage'] ?? null,
                    'description' => $data['description'] ?? null,
                    'level' => $data['level'],
                    'is_active' => $data['isActive'] ?? true,
                ]);

                Log::info('Membership plan created successfully', [
                    'membership_plan_id' => $membershipPlan->id,
                    'outlet_id' => $outletId,
                    'plan_name' => $membershipPlan->name,
                    'level' => $membershipPlan->level,
                    'created_by' => Auth::id(),
                    'type' => 'membership_plan_management'
                ]);

                return $membershipPlan;
            } catch (Exception $e) {
                Log::error('Failed to create membership plan', [
                    'outlet_id' => $outletId,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'user_id' => Auth::id(),
                    'type' => 'membership_plan_service_error'
                ]);
                throw $e;
            }
        });
    }

    public function updateMembershipPlan(int $outletId, int $planId, array $data): MembershipPlan
    {
        return DB::transaction(function () use ($outletId, $planId, $data) {
            try {
                $membershipPlan = $this->membershipPlan->byId($planId)->firstOrFail();

                if (isset($data['name'])) {
                    $membershipPlan->name = $data['name'];
                }

                if (isset($data['price'])) {
                    $membershipPlan->price = $data['price'];
                }

                if (isset($data['durationDays'])) {
                    $membershipPlan->duration_days = $data['durationDays'];
                }

                if (isset($data['discountPercentage'])) {
                    $membershipPlan->discount_percentage = $data['discountPercentage'];
                }

                if (isset($data['description'])) {
                    $membershipPlan->description = $data['description'];
                }

                if (isset($data['level'])) {
                    $membershipPlan->level = $data['level'];
                }

                if (isset($data['isActive'])) {
                    $membershipPlan->is_active = $data['isActive'];
                }

                $membershipPlan->save();

                Log::info('Membership plan updated successfully', [
                    'membership_plan_id' => $planId,
                    'outlet_id' => $outletId,
                    'changes' => array_keys($data),
                    'updated_by' => Auth::id(),
                    'type' => 'membership_plan_management'
                ]);

                return $membershipPlan->fresh();
            } catch (Exception $e) {
                Log::error('Failed to update membership plan', [
                    'membership_plan_id' => $planId,
                    'outlet_id' => $outletId,
                    'error' => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type' => 'membership_plan_service_error'
                ]);
                throw $e;
            }
        });
    }

    public function destroyMembershipPlan(int $outletId, int $planId): bool
    {
        return DB::transaction(function () use ($outletId, $planId) {
            try {
                $membershipPlan = $this->membershipPlan->byId($planId)->firstOrFail();

                $deleted = $membershipPlan->delete();

                if ($deleted) {
                    Log::info('Membership plan deleted successfully', [
                        'membership_plan_id' => $planId,
                        'outlet_id' => $outletId,
                        'plan_name' => $membershipPlan->name,
                        'deleted_by' => Auth::id(),
                        'type' => 'membership_plan_management'
                    ]);
                }

                return $deleted;
            } catch (Exception $e) {
                Log::error('Failed to delete membership plan', [
                    'membership_plan_id' => $planId,
                    'outlet_id' => $outletId,
                    'error' => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type' => 'membership_plan_service_error'
                ]);
                throw $e;
            }
        });
    }

    public function storeOperationalDay(int $outletId, array $data): OperationalDay
    {
        return DB::transaction(function () use ($outletId, $data) {
            try {
                $outlet = $this->outlet->byId($outletId)->firstOrFail();

                $this->authorizeOutletAccess($outlet);

                $operationalDay = $outlet->operationalDays()->create([
                    'day_of_week' => $data['dayOfWeek'],
                    'is_open' => $data['isOpen'],
                    'open_time' => $data['openTime'] ?? null,
                    'close_time' => $data['closeTime'] ?? null,
                ]);

                Log::info('Operational Day created successfully', [
                    'operational_day_id' => $operationalDay->id,
                    'day_of_week' => $operationalDay->day_of_week,
                    'is_open' => $operationalDay->is_open,
                    'open_time' => $operationalDay->open_time,
                    'close_time' => $operationalDay->close_time,
                    'outlet_id' => $outletId,
                    'type' => 'operational_day_management'
                ]);
                return $operationalDay;
            } catch (Exception $e) {
                Log::error('Failed to create operational day', [
                    'outlet_id' => $outletId,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'user_id' => Auth::id(),
                    'type' => 'operational_day_service_error'
                ]);
                throw $e;
            }
        });
    }

    public function updateOperationalDay(int $outletId, int $operationalDayId, array $data): OperationalDay
    {
        return DB::transaction(function () use ($outletId, $operationalDayId, $data) {
            try {
                $operationalDay = $this->operationalDay->byId($operationalDayId)->firstOrFail();

                $this->authorizeOperationalDayAccess($operationalDay);

                if (isset($data['dayOfWeek'])) {
                    $operationalDay->day_of_week = $data['dayOfWeek'];
                }

                if (isset($data['isOpen'])) {
                    $operationalDay->is_open = $data['isOpen'];
                }

                if (isset($data['openTime'])) {
                    $operationalDay->open_time = $data['openTime'];
                }

                if (isset($data['closeTime'])) {
                    $operationalDay->close_time = $data['closeTime'];
                }
                $operationalDay->save();

                Log::info('Operational Day updated successfully', [
                    'operational_day_id' => $operationalDayId,
                    'outlet_id' => $outletId,
                    'changes' => array_keys($data),
                    'type' => 'operational_day_management'
                ]);

                return $operationalDay->fresh();
            } catch (Exception $e) {
                Log::error('Failed to update operational day', [
                    'operational_day_id' => $operationalDayId,
                    'outlet_id' => $outletId,
                    'error' => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type' => 'operational_day_service_error'
                ]);
                throw $e;
            }
        });
    }

    public function destroyOperationalDay(int $outletId, int $operationalDayId): bool
    {
        return DB::transaction(function () use ($outletId, $operationalDayId) {
            try {
                $operationalDay = $this->operationalDay->byId($operationalDayId)->firstOrFail();

                $this->authorizeOperationalDayAccess($operationalDay);

                $deleted = $operationalDay->delete();

                if ($deleted) {
                    Log::info('Operational Day deleted successfully', [
                        'operational_day_id' => $operationalDayId,
                        'outlet_id' => $outletId,
                        'deleted_by' => Auth::id(),
                        'type' => 'operational_day_management'
                    ]);
                }

                return $deleted;
            } catch (Exception $e) {
                Log::error('Failed to delete operational day', [
                    'operational_day_id' => $operationalDayId,
                    'outlet_id' => $outletId,
                    'error' => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type' => 'operational_day_service_error'
                ]);
                throw $e;
            }
        });
    }

    public function storePosition(int $outletId, array $data): Position
    {
        return DB::transaction(function () use ($outletId, $data) {
            try {
                $outlet = $this->outlet->byId($outletId)->firstOrFail();
                $this->authorizeOutletAccess($outlet);

                $normalizedName = trim((string) $data['name']);
                $existingPosition = $this->position
                    ->withTrashed()
                    ->where('outlet_id', $outletId)
                    ->whereRaw('LOWER(name) = ?', [strtolower($normalizedName)])
                    ->first();

                if ($existingPosition && !$existingPosition->trashed()) {
                    throw ValidationException::withMessages([
                        'name' => 'Nama posisi sudah digunakan.',
                    ]);
                }

                if ($existingPosition && $existingPosition->trashed()) {
                    $existingPosition->restore();
                    $existingPosition->name = $normalizedName;
                    $existingPosition->description = $data['description'] ?? null;
                    $existingPosition->is_active = $data['isActive'] ?? true;
                    $existingPosition->save();

                    $position = $existingPosition;
                } else {
                    $position = $outlet->positions()->create([
                        'name' => $normalizedName,
                        'description' => $data['description'] ?? null,
                        'is_active' => $data['isActive'] ?? true,
                    ]);
                }

                if (isset($data['permissions']) && is_array($data['permissions'])) {
                    app(PositionService::class)->updatePermissions($position->id, $data['permissions']);
                }

                Log::info('Position created successfully', [
                    'position_id' => $position->id,
                    'outlet_id' => $outletId,
                    'position_name' => $position->name,
                    'type' => 'position_management'
                ]);

                return $position->fresh(['permissions']);
            } catch (Exception $e) {
                Log::error('Failed to create position', [
                    'outlet_id' => $outletId,
                    'error' => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type' => 'position_service_error'
                ]);
                throw $e;
            }
        });
    }

    public function updatePosition(int $outletId, int $positionId, array $data): Position
    {
        return DB::transaction(function () use ($outletId, $positionId, $data) {
            try {
                $position = $this->position
                    ->where('id', $positionId)
                    ->where('outlet_id', $outletId)
                    ->firstOrFail();
                $this->authorizePositionAccess($position);

                if (isset($data['name'])) {
                    $position->name = trim((string) $data['name']);
                }

                if (isset($data['description'])) {
                    $position->description = $data['description'];
                }

                if (isset($data['isActive'])) {
                    $position->is_active = $data['isActive'];
                }

                $position->save();

                if (isset($data['permissions']) && is_array($data['permissions'])) {
                    app(PositionService::class)->updatePermissions($position->id, $data['permissions']);
                }

                Log::info('Position updated successfully', [
                    'position_id' => $positionId,
                    'outlet_id' => $outletId,
                    'changes' => array_keys($data),
                    'type' => 'position_management'
                ]);

                return $position->fresh(['permissions']);
            } catch (Exception $e) {
                Log::error('Failed to update position', [
                    'outlet_id' => $outletId,
                    'position_id' => $positionId,
                    'error' => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type' => 'position_service_error'
                ]);
                throw $e;
            }
        });
    }

    public function destroyPosition(int $outletId, int $positionId): bool
    {
        return DB::transaction(function () use ($outletId, $positionId) {
            try {
                $position = $this->position
                    ->where('id', $positionId)
                    ->where('outlet_id', $outletId)
                    ->firstOrFail();
                $this->authorizePositionAccess($position);
                $deleted = $position->delete();


                if ($deleted) {
                    Log::info('Position deleted successfully', [
                        'position_id' => $positionId,
                        'outlet_id' => $outletId,
                        'deleted_by' => Auth::id(),
                        'type' => 'position_management'
                    ]);
                }

                return $deleted;
            } catch (Exception $e) {
                Log::error('Failed to delete position', [
                    'outlet_id' => $outletId,
                    'position_id' => $positionId,
                    'error' => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type' => 'position_service_error'
                ]);
                throw $e;
            }
        });
    }

    public function storeServicePackage(int $outletId, array $data): ServicePackage
    {
        return DB::transaction(function () use ($outletId, $data) {
            try {
                $outlet = $this->outlet->byId($outletId)->firstOrFail();

                $servicePackage = $outlet->servicePackages()->create([
                    'name' => $data['name'],
                    'description' => $data['description'] ?? null,
                    'price' => $data['price'],
                    'validity_days' => $data['validityDays'] ?? null,
                    'is_active' => $data['isActive'] ?? true,
                ]);

                if (!empty($data['servicePackageItems']) && is_array($data['servicePackageItems'])) {
                    foreach ($data['servicePackageItems'] as $itemData) {
                        $servicePackage->servicePackageItems()->create([
                            'laundry_service_id' => $itemData['laundryServiceId'],
                            'quantity' => $itemData['quantity'],
                        ]);
                    }
                }

                Log::info('Service package created successfully', [
                    'service_package_id' => $servicePackage->id,
                    'outlet_id' => $outletId,
                    'package_name' => $servicePackage->name,
                    'items_count' => count($data['servicePackageItems'] ?? []),
                    'created_by' => Auth::id(),
                    'type' => 'service_package_management'
                ]);

                return $servicePackage->load(['servicePackageItems', 'servicePackageItems.laundryService']);
            } catch (Exception $e) {
                Log::error('Failed to create service package', [
                    'outlet_id' => $outletId,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'user_id' => Auth::id(),
                    'type' => 'service_package_service_error'
                ]);
                throw $e;
            }
        });
    }

    public function updateServicePackage(int $outletId, int $packageId, array $data): ServicePackage
    {
        return DB::transaction(function () use ($outletId, $packageId, $data) {
            try {
                $servicePackage = $this->servicePackage->byId($packageId)->firstOrFail();

                if (isset($data['name'])) {
                    $servicePackage->name = $data['name'];
                }

                if (isset($data['description'])) {
                    $servicePackage->description = $data['description'];
                }

                if (isset($data['price'])) {
                    $servicePackage->price = $data['price'];
                }

                if (isset($data['validityDays'])) {
                    $servicePackage->validity_days = $data['validityDays'];
                }

                if (isset($data['isActive'])) {
                    $servicePackage->is_active = $data['isActive'];
                }

                $servicePackage->save();

                if (isset($data['servicePackageItems']) && is_array($data['servicePackageItems'])) {
                    $servicePackage->servicePackageItems()->delete();

                    foreach ($data['servicePackageItems'] as $itemData) {
                        $servicePackage->servicePackageItems()->create([
                            'laundry_service_id' => $itemData['laundryServiceId'],
                            'quantity' => $itemData['quantity'],
                        ]);
                    }
                }

                Log::info('Service package updated successfully', [
                    'service_package_id' => $packageId,
                    'outlet_id' => $outletId,
                    'changes' => array_keys($data),
                    'items_count' => count($data['servicePackageItems'] ?? []),
                    'updated_by' => Auth::id(),
                    'type' => 'service_package_management'
                ]);

                return $servicePackage->fresh(['servicePackageItems', 'servicePackageItems.laundryService']);
            } catch (Exception $e) {
                Log::error('Failed to update service package', [
                    'service_package_id' => $packageId,
                    'outlet_id' => $outletId,
                    'error' => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type' => 'service_package_service_error'
                ]);
                throw $e;
            }
        });
    }

    public function destroyServicePackage(int $outletId, int $packageId): bool
    {
        return DB::transaction(function () use ($outletId, $packageId) {
            try {
                $servicePackage = $this->servicePackage->byId($packageId)->firstOrFail();

                $deleted = $servicePackage->delete();

                if ($deleted) {
                    Log::info('Service package deleted successfully', [
                        'service_package_id' => $packageId,
                        'outlet_id' => $outletId,
                        'package_name' => $servicePackage->name,
                        'deleted_by' => Auth::id(),
                        'type' => 'service_package_management'
                    ]);
                }

                return $deleted;
            } catch (Exception $e) {
                Log::error('Failed to delete service package', [
                    'service_package_id' => $packageId,
                    'outlet_id' => $outletId,
                    'error' => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type' => 'service_package_service_error'
                ]);
                throw $e;
            }
        });
    }

    private function authorizeOutletAccess(Outlet $outlet): void
    {
        $user = Auth::user();

        if (!$user) {
            throw new AccessDeniedHttpException('User not authenticated');
        }

        if ($user instanceof \App\Models\Employee) {
            if ($user->outlet_id === $outlet->id) {
                return;
            }
        }

        if (method_exists($user, 'hasRole')) {
            if ($user->hasRole('super_admin')) {
                return;
            }

            if ($user->hasRole('owner')) {
                if ($user->id === $outlet->owner_id) {
                    return;
                }
            }
        }

        Log::warning('Unauthorized outlet access attempt', [
            'user_id' => $user->id,
            'outlet_id' => $outlet->id,
            'outlet_owner_id' => $outlet->owner_id,
            'type' => 'authorization_failure'
        ]);

        throw new AccessDeniedHttpException('You do not have permission to access this outlet');
    }

    private function authorizeCategoryAccess(Category $category): void
    {
        /** @var User $user */
        $user = Auth::user();

        if (!$user) {
            throw new AccessDeniedHttpException('User not authenticated');
        }

        if ($user->hasRole('super_admin')) {
            return;
        }

        $outlet = $category->outlet;
        if ($user->hasRole('owner') && $outlet && $outlet->isOwner($user)) {
            return;
        }

        Log::warning('Unauthorized category access attempt', [
            'user_id' => $user->id,
            'category_id' => $category->id,
            'outlet_id' => $category->outlet_id,
            'type' => 'authorization_failure'
        ]);

        throw new AccessDeniedHttpException('You do not have permission to access this category');
    }

    private function authorizeCustomerAccess(Customer $customer): void
    {
        /** @var User $user */
        $user = Auth::user();

        if (!$user) {
            throw new AccessDeniedHttpException('User not authenticated');
        }

        if ($user->hasRole('super_admin')) {
            return;
        }

        $outlet = $customer->outlet;
        if ($user->hasRole('owner') && $outlet && $outlet->isOwner($user)) {
            return;
        }

        Log::warning('Unauthorized customer access attempt', [
            'user_id' => $user->id,
            'customer_id' => $customer->id,
            'outlet_id' => $customer->outlet_id,
            'type' => 'authorization_failure'
        ]);

        throw new AccessDeniedHttpException('You do not have permission to access this customer');
    }

    private function authorizeEmployeeAccess(Employee $employee): void
    {
        /** @var User $user */
        $user = Auth::user();

        if (!$user) {
            throw new AccessDeniedHttpException('User not authenticated');
        }

        if ($user->hasRole('super_admin')) {
            return;
        }

        $outlet = $employee->outlet;
        if ($user->hasRole('owner') && $outlet && $outlet->isOwner($user)) {
            return;
        }

        Log::warning('Unauthorized employee access attempt', [
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'outlet_id' => $employee->outlet_id,
            'type' => 'authorization_failure'
        ]);

        throw new AccessDeniedHttpException('You do not have permission to access this employee');
    }

    private function authorizeFineAccess(Fine $fine): void
    {
        /** @var User $user */
        $user = Auth::user();

        if (!$user) {
            throw new AccessDeniedHttpException('User not authenticated');
        }

        if ($user->hasRole('super_admin')) {
            return;
        }

        $outlet = $fine->outlet;
        if ($user->hasRole('owner') && $outlet && $outlet->isOwner($user)) {
            return;
        }

        Log::warning('Unauthorized fine access attempt', [
            'user_id' => $user->id,
            'fine_id' => $fine->id,
            'outlet_id' => $fine->outlet_id,
            'type' => 'authorization_failure'
        ]);

        throw new AccessDeniedHttpException('You do not have permission to access this fine');
    }

    private function authorizeLaundryServiceAccess(LaundryService $laundryService): void
    {
        /** @var User $user */
        $user = Auth::user();

        if (!$user) {
            throw new AccessDeniedHttpException('User not authenticated');
        }

        if ($user->hasRole('super_admin')) {
            return;
        }

        $outlet = $laundryService->outlet;
        if ($user->hasRole('owner') && $outlet && $outlet->isOwner($user)) {
            return;
        }

        Log::warning('Unauthorized laundry service access attempt', [
            'user_id' => $user->id,
            'laundry_service_id' => $laundryService->id,
            'category_id' => $laundryService->category_id,
            'type' => 'authorization_failure'
        ]);

        throw new AccessDeniedHttpException('You do not have permission to access this laundry service');
    }

    private function authorizeOperationalDayAccess(OperationalDay $operationalDay): void
    {
        /** @var User $user */
        $user = Auth::user();

        if (!$user) {
            throw new AccessDeniedHttpException('User not authenticated');
        }

        if ($user->hasRole('super_admin')) {
            return;
        }

        $outlet = $operationalDay->outlet;
        if ($user->hasRole('owner') && $outlet && $outlet->isOwner($user)) {
            return;
        }

        Log::warning('Unauthorized operational day access attempt', [
            'user_id' => $user->id,
            'operational_day_id' => $operationalDay->id,
            'outlet_id' => $operationalDay->outlet_id,
            'type' => 'authorization_failure'
        ]);

        throw new AccessDeniedHttpException('You do not have permission to access this operational day');
    }

    private function authorizePositionAccess(Position $position): void
    {
        /** @var User $user */
        $user = Auth::user();

        if (!$user) {
            throw new AccessDeniedHttpException('User not authenticated');
        }

        if ($user->hasRole('super_admin')) {
            return;
        }

        $outlet = $position->outlet;
        if ($user->hasRole('owner') && $outlet && $outlet->isOwner($user)) {
            return;
        }

        Log::warning('Unauthorized position access attempt', [
            'user_id' => $user->id,
            'position_id' => $position->id,
            'outlet_id' => $position->outlet_id,
            'type' => 'authorization_failure'
        ]);

        throw new AccessDeniedHttpException('You do not have permission to access this position');
    }



    /*
    |--------------------------------------------------------------------------
    | Private — Filters
    |--------------------------------------------------------------------------
    */
    private function applyDistanceSelect(Builder $query, float $latitude, float $longitude): void
    {
        $haversine = "(6371 * acos(cos(radians(?))
             * cos(radians(latitude))
             * cos(radians(longitude) - radians(?))
             + sin(radians(?))
             * sin(radians(latitude))))";

        $query->select('outlets.*')
            ->selectRaw("$haversine AS distance", [$latitude, $longitude, $latitude]);
    }

    private function applyFilters(Builder &$query, array $filters = []): void
    {
        if (!empty($filters['search'])) {
            if (($filters['includeServices'] ?? false) === true) {
                $this->applyDiscoverySearch($query, (string) $filters['search']);
            } else {
                $query->search($filters['search']);
            }
        }

        if (!empty($filters['status'])) {
            $query->byStatus($filters['status']);
        }

        if (($filters['isExposure'] ?? null) === true) {
            $query->exposure();
        }

        if (($filters['includeServices'] ?? false) === true) {
            $this->applyDiscoveryOutletFilters($query, $filters);
        }

        if (!empty($filters['provinceId'])) {
            $query->byProvinceId($filters['provinceId']);
        }

        if (!empty($filters['provinceName'])) {
            $query->byProvinceName($filters['provinceName']);
        }

        if (!empty($filters['cityId'])) {
            $query->byCityId($filters['cityId']);
        }

        if (!empty($filters['districtId'])) {
            $query->byDistrictId($filters['districtId']);
        }

        if (!empty($filters['villageId'])) {
            $query->byVillageId($filters['villageId']);
        }

        if (!empty($filters['dateFrom']) && !empty($filters['dateTo'])) {
            $query->byRangeDate($filters['dateFrom'], $filters['dateTo']);
        }

        $this->applyOutletSort($query, $filters['sortBy'] ?? 'createdAt', $filters['sortDirection'] ?? 'desc');
    }

    private function applyDiscoverySearch(Builder $query, string $search): void
    {
        $likeSearch = "%{$search}%";

        $query->where(function (Builder $q) use ($likeSearch) {
            $q->where('name', 'LIKE', $likeSearch)
                ->orWhere('code', 'LIKE', $likeSearch)
                ->orWhere('email', 'LIKE', $likeSearch)
                ->orWhere('phone', 'LIKE', $likeSearch)
                ->orWhere('province_name', 'LIKE', $likeSearch)
                ->orWhere('city_name', 'LIKE', $likeSearch)
                ->orWhere('district_name', 'LIKE', $likeSearch)
                ->orWhere('village_name', 'LIKE', $likeSearch)
                ->orWhereHas('categories', function (Builder $categoryQuery) use ($likeSearch) {
                    $categoryQuery->where('name', 'LIKE', $likeSearch)
                        ->orWhereHas('laundryServices', function (Builder $serviceQuery) use ($likeSearch) {
                            $serviceQuery->where('name', 'LIKE', $likeSearch)
                                ->orWhere('description', 'LIKE', $likeSearch)
                                ->orWhere('slug', 'LIKE', $likeSearch)
                                ->orWhereHas('unit', function (Builder $unitQuery) use ($likeSearch) {
                                    $unitQuery->where('name', 'LIKE', $likeSearch)
                                        ->orWhere('symbol', 'LIKE', $likeSearch);
                                });
                        });
                });
        });
    }

    private function buildDiscoveryServiceCandidateQuery(array $filters): Builder
    {
        $query = $this->laundryService->query()
            ->where('is_active', true)
            ->whereHas('category', function (Builder $categoryQuery) use ($filters) {
                $categoryQuery->where('is_active', true)
                    ->whereHas('outlet', function (Builder $outletQuery) use ($filters) {
                        $outletQuery->where('status', 'active');

                        if (($filters['isExposure'] ?? null) === true) {
                            $outletQuery->hasExposure();
                        }

                        if (!empty($filters['outletId'])) {
                            $outletQuery->where('id', (int) $filters['outletId']);
                        }

                        if (!empty($filters['provinceId'])) {
                            $outletQuery->where('province_id', (int) $filters['provinceId']);
                        }

                        if (!empty($filters['cityId'])) {
                            $outletQuery->where('city_id', (int) $filters['cityId']);
                        }

                        if (!empty($filters['districtId'])) {
                            $outletQuery->where('district_id', (int) $filters['districtId']);
                        }

                        if (($filters['supportsCourier'] ?? null) === true) {
                            $outletQuery->whereHas('courierSetting', function (Builder $courierQuery) {
                                $courierQuery->where('is_courier_enabled', true);
                            });
                        }

                        if (($filters['freeShippingEligible'] ?? null) === true) {
                            $outletQuery->whereHas('courierSetting', function (Builder $courierQuery) {
                                $courierQuery->where('unconditional_free_shipping_enabled', true);
                            });
                        }
                    });

                if (!empty($filters['categoryId'])) {
                    $categoryQuery->where('id', (int) $filters['categoryId']);
                }
            });

        if (!empty($filters['unitId'])) {
            $query->where('unit_id', (int) $filters['unitId']);
        }

        if (($filters['supportsCourier'] ?? null) === true) {
            $query->where('supports_courier', true);
        }

        if (isset($filters['minPrice'])) {
            $query->where('price', '>=', (float) $filters['minPrice']);
        }

        if (isset($filters['maxPrice'])) {
            $query->where('price', '<=', (float) $filters['maxPrice']);
        }

        return $query;
    }

    private function normalizeDiscoveryTerm(string $value, bool $keepSpaces = false): string
    {
        $normalized = Str::lower(trim($value));
        $normalized = preg_replace('/[^a-z0-9\s]/', ' ', $normalized) ?? '';
        $normalized = preg_replace('/\s+/', ' ', trim($normalized)) ?? '';

        return $keepSpaces ? $normalized : str_replace(' ', '', $normalized);
    }

    private function scoreDiscoveryCandidate(string $normalizedSearch, string $candidate): float
    {
        $normalizedCandidate = $this->normalizeDiscoveryTerm($candidate);
        if ($normalizedCandidate === '') {
            return 0.0;
        }

        $fullScore = $this->computePairScore($normalizedSearch, $normalizedCandidate);
        $queryTokens = array_filter(explode(' ', $this->normalizeDiscoveryTerm($normalizedSearch, true)));
        $candidateTokens = array_filter(explode(' ', $this->normalizeDiscoveryTerm($candidate, true)));

        $tokenScore = 0.0;
        if (!empty($queryTokens) && !empty($candidateTokens)) {
            $tokenScore = $this->computeTokenLevelScore(
                array_values($queryTokens),
                array_values($candidateTokens)
            );
        }

        return max($fullScore, $tokenScore);
    }

    private function computePairScore(string $a, string $b): float
    {
        if ($a === '' || $b === '') {
            return 0.0;
        }

        similar_text($a, $b, $similarPercent);
        $maxLen = max(strlen($a), strlen($b));
        $levenshteinScore = $maxLen > 0 && strlen($a) <= 255 && strlen($b) <= 255
            ? (1 - levenshtein($a, $b) / $maxLen) * 100
            : 0.0;

        return max((float) $similarPercent, (float) $levenshteinScore);
    }

    private function computeTokenLevelScore(array $queryTokens, array $candidateTokens): float
    {
        $totalWeight = 0.0;
        $weightedScore = 0.0;

        foreach ($queryTokens as $qToken) {
            $qToken = (string) $qToken;
            if ($qToken === '') {
                continue;
            }

            $bestTokenScore = 0.0;
            foreach ($candidateTokens as $cToken) {
                $cToken = (string) $cToken;
                if ($cToken === '') {
                    continue;
                }

                $pairScore = $this->computePairScore($qToken, $cToken);
                if ($pairScore > $bestTokenScore) {
                    $bestTokenScore = $pairScore;
                }
            }

            $weight = max(1.0, (float) strlen($qToken));
            $weightedScore += $bestTokenScore * $weight;
            $totalWeight += $weight;
        }

        return $totalWeight > 0 ? $weightedScore / $totalWeight : 0.0;
    }

    private function applyDiscoveryOutletFilters(Builder $query, array $filters): void
    {
        $includeServiceSearch = true;

        if (!empty($filters['outletId'])) {
            $query->where('id', (int) $filters['outletId']);
        }

        if (($filters['freeShippingEligible'] ?? null) === true) {
            $query->whereHas('courierSetting', function (Builder $courierQuery) {
                $courierQuery->where('unconditional_free_shipping_enabled', true);
            });
        }

        if (($filters['supportsCourier'] ?? null) === true) {
            $query->whereHas('courierSetting', function (Builder $courierQuery) {
                $courierQuery->where('is_courier_enabled', true);
            });
        }

        $query->whereHas('categories.laundryServices', function (Builder $serviceQuery) use ($filters, $includeServiceSearch) {
            $this->applyDiscoveryServiceQuery($serviceQuery, $filters, $includeServiceSearch);
        });
    }

    private function applyDiscoveryServiceQuery(Builder|Relation $query, array $filters, bool $includeSearch = true): void
    {
        $query->where('is_active', true);

        if ($includeSearch && !empty($filters['search'])) {
            $likeSearch = "%{$filters['search']}%";
            $query->where(function (Builder $q) use ($likeSearch) {
                $q->where('name', 'LIKE', $likeSearch)
                    ->orWhere('description', 'LIKE', $likeSearch)
                    ->orWhere('slug', 'LIKE', $likeSearch)
                    ->orWhereHas('category', function (Builder $categoryQuery) use ($likeSearch) {
                        $categoryQuery->where('name', 'LIKE', $likeSearch);
                    })
                    ->orWhereHas('unit', function (Builder $unitQuery) use ($likeSearch) {
                        $unitQuery->where('name', 'LIKE', $likeSearch)
                            ->orWhere('symbol', 'LIKE', $likeSearch);
                    });
            });
        }

        if (!empty($filters['categoryId'])) {
            $query->where('category_id', (int) $filters['categoryId']);
        }

        if (!empty($filters['unitId'])) {
            $query->where('unit_id', (int) $filters['unitId']);
        }

        if (($filters['supportsCourier'] ?? null) === true) {
            $query->where('supports_courier', true);
        }

        if (isset($filters['minPrice'])) {
            $query->where('price', '>=', (float) $filters['minPrice']);
        }

        if (isset($filters['maxPrice'])) {
            $query->where('price', '<=', (float) $filters['maxPrice']);
        }
    }

    private function applyDiscoveryServiceSort(Builder|Relation $query, string $serviceSortBy): void
    {
        match ($serviceSortBy) {
            'cheapest' => $query->orderBy('price', 'asc')->orderBy('name', 'asc'),
            'best' => $query->withCount('orderItems')->orderByDesc('order_items_count')->orderBy('price', 'asc'),
            'popular' => $query->withCount('orderItems')->orderByDesc('order_items_count')->orderBy('name', 'asc'),
            'relevant' => $query->orderBy('name', 'asc')->orderBy('price', 'asc'),
            default => $query->orderBy('name', 'asc'),
        };
    }

    private function applyOutletSort(Builder $query, string $sortBy, string $sortDirection): void
    {
        $direction = strtolower($sortDirection) === 'asc' ? 'asc' : 'desc';

        if ($sortBy === 'best' || $sortBy === 'popular') {
            $query->withAvg([
                'orderReviews as published_reviews_avg_rating' => function (Builder $reviewQuery) {
                    $reviewQuery->where('is_published', true);
                },
            ], 'rating')
                ->withCount([
                    'orderReviews as published_reviews_count' => function (Builder $reviewQuery) {
                        $reviewQuery->where('is_published', true);
                    },
                ])
                ->orderByDesc('published_reviews_avg_rating')
                ->orderByDesc('published_reviews_count')
                ->orderByDesc('created_at');

            return;
        }

        if ($sortBy === 'nearest') {
            return;
        }

        $columnMap = [
            'createdAt' => 'created_at',
            'updatedAt' => 'updated_at',
            'provinceName' => 'province_name',
            'cityName' => 'city_name',
            'districtName' => 'district_name',
        ];

        $query->sortBy($columnMap[$sortBy] ?? $sortBy, $direction);
    }
}
