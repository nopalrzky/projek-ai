<?php

namespace App\Services;

use App\Models\LaundryService;
use App\Models\Outlet;
use App\Models\ServicePackage;
use App\Models\ServicePackageItem;
use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ServicePackageService extends BaseService
{
    public function __construct(
        protected Outlet $outlet,
        protected LaundryService $laundryService,
        protected ServicePackage $servicePackage,
        protected ServicePackageItem $servicePackageItem,
    ) {}

    /*
    |--------------------------------------------------------------------------
    | Read Methods
    |--------------------------------------------------------------------------
    */

    public function getAll(
        ?int $page = null,
        ?int $perPage = null,
        array $filters = [],
        array $relations = []
    ): LengthAwarePaginator|Collection {
        try {
            $query = $this->servicePackage->query();

            $this->applyTenantScope($query);
            $this->applyFilters($query, $filters);

            if (!empty($relations)) {
                $query->with($relations);
            }

            return $this->paginate($query, $perPage, $page);
        } catch (Exception $e) {
            Log::error('Failed to get service packages', [
                'filters' => $filters,
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'service_package_service_error',
            ]);
            throw $e;
        }
    }

    public function getById(int $id, array $relations = []): ServicePackage
    {
        try {
            $query = $this->servicePackage->byId($id);

            if (!empty($relations)) {
                $query->with($relations);
            }

            return $query->firstOrFail();
        } catch (Exception $e) {
            Log::error('Failed to get service package by ID', [
                'service_package_id' => $id,
                'error'              => $e->getMessage(),
                'user_id'            => Auth::id(),
                'type'               => 'service_package_service_error',
            ]);
            throw $e;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Write Methods
    |--------------------------------------------------------------------------
    */

    public function store(array $data): ServicePackage
    {
        return DB::transaction(function () use ($data) {
            try {
                $servicePackage = $this->servicePackage->create([
                    'outlet_id'     => $data['outletId'],
                    'name'          => $data['name'],
                    'price'         => $data['price'],
                    'validity_days' => $data['validityDays'] ?? null,
                    'description'   => $data['description'] ?? null,
                    'is_active'     => $data['isActive'] ?? true,
                ]);

                $servicePackage->servicePackageItems()->createMany(
                    array_map(
                        fn($item) => [
                            'laundry_service_id' => $item['laundryServiceId'],
                            'quantity'           => $item['quantity'],
                        ],
                        $data['servicePackageItems']
                    )
                );

                Log::info('Service package created successfully', [
                    'service_package_id' => $servicePackage->id,
                    'outlet_id'          => $servicePackage->outlet_id,
                    'name'               => $servicePackage->name,
                    'user_id'            => Auth::id(),
                    'type'               => 'service_package_action',
                ]);

                return $servicePackage->load([
                    'outlet',
                    'servicePackageItems.laundryService.unit',
                    'servicePackageItems.laundryService.category',
                ]);
            } catch (Exception $e) {
                Log::error('Failed to create service package', [
                    'data'    => $data,
                    'error'   => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type'    => 'service_package_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function update(int $id, array $data): ServicePackage
    {
        return DB::transaction(function () use ($id, $data) {
            try {
                $servicePackage = $this->servicePackage->findOrFail($id);

                if ($servicePackage->hasTransactions()) {
                    throw new Exception(
                        "Paket sudah digunakan dalam transaksi. " .
                            "Tidak dapat mengubah data paket. " .
                            "Silakan nonaktifkan paket ini dan buat paket baru."
                    );
                }

                if (isset($data['name']))         $servicePackage->name          = $data['name'];
                if (isset($data['price']))         $servicePackage->price         = $data['price'];
                if (isset($data['description']))   $servicePackage->description   = $data['description'];
                if (isset($data['validityDays']))  $servicePackage->validity_days = $data['validityDays'];
                if (isset($data['isActive']))      $servicePackage->is_active     = $data['isActive'];

                $servicePackage->save();

                $servicePackage->servicePackageItems()->delete();
                $servicePackage->servicePackageItems()->createMany(
                    array_map(
                        fn($item) => [
                            'laundry_service_id' => $item['laundryServiceId'],
                            'quantity'           => $item['quantity'],
                        ],
                        $data['servicePackageItems']
                    )
                );

                Log::info('Service package updated successfully', [
                    'service_package_id' => $servicePackage->id,
                    'user_id'            => Auth::id(),
                    'type'               => 'service_package_action',
                ]);

                return $servicePackage->load([
                    'outlet',
                    'servicePackageItems.laundryService.unit',
                    'servicePackageItems.laundryService.category',
                ]);
            } catch (Exception $e) {
                Log::error('Failed to update service package', [
                    'service_package_id' => $id,
                    'error'              => $e->getMessage(),
                    'user_id'            => Auth::id(),
                    'type'               => 'service_package_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function destroy(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            try {
                $package = $this->servicePackage->withTrashed()->findOrFail($id);

                if ($package->hasTransactions()) {
                    if ($package->trashed()) {
                        throw new Exception('Package is already deleted');
                    }

                    $package->delete();

                    Log::info('Service package soft deleted (has transactions)', [
                        'package_id' => $id,
                        'user_id'    => Auth::id(),
                        'type'       => 'service_package_action',
                    ]);
                } else {
                    ServicePackageItem::where('service_package_id', $package->id)->forceDelete();
                    $package->forceDelete();

                    Log::info('Service package permanently deleted', [
                        'package_id' => $id,
                        'user_id'    => Auth::id(),
                        'type'       => 'service_package_action',
                    ]);
                }

                return true;
            } catch (Exception $e) {
                Log::error('Failed to delete service package', [
                    'package_id' => $id,
                    'error'      => $e->getMessage(),
                    'user_id'    => Auth::id(),
                    'type'       => 'service_package_service_error',
                ]);
                throw $e;
            }
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Private — Filters
    |--------------------------------------------------------------------------
    */

    protected function applyFilters(Builder $query, array $filters): void
    {
        if (!empty($filters['search'])) {
            $query->search($filters['search']);
        }

        if (isset($filters['isActive'])) {
            $filters['isActive'] ? $query->active() : $query->inactive();
        }

        if (!empty($filters['minPrice'])) {
            $query->minPrice((float) $filters['minPrice']);
        }

        if (!empty($filters['maxPrice'])) {
            $query->maxPrice((float) $filters['maxPrice']);
        }

        if (!empty($filters['minValidityDays'])) {
            $query->minValidityDays((int) $filters['minValidityDays']);
        }

        if (!empty($filters['maxValidityDays'])) {
            $query->maxValidityDays((int) $filters['maxValidityDays']);
        }

        $sortBy        = $filters['sortBy'] ?? 'createdAt';
        $sortDirection = $filters['sortDirection'] ?? 'desc';

        $query->sortBy($sortBy, $sortDirection);
    }
}
