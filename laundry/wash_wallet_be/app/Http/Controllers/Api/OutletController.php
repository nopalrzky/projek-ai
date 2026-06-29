<?php

namespace App\Http\Controllers\Api;

use App\Helpers\PaginationHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\Outlet\NearbyOutletRequest;
use App\Http\Resources\Outlet\OutletResource;
use App\Services\OutletService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Throwable;

use Illuminate\Routing\Attributes\Controllers\Middleware;

#[Middleware('auth:sanctum,customer_sanctum')]
class OutletController extends Controller
{
    public function __construct(
        private readonly OutletService $outletService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'latitude' => 'nullable|numeric|between:-90,90',
                'longitude' => 'nullable|numeric|between:-180,180',
            ]);

            $filters = $this->getFilters($request);
            $correctedQuery = $this->outletService->resolveDiscoveryCorrectedQuery(
                $filters['search'] ?? null,
                $filters
            );
            if (!empty($correctedQuery)) {
                $filters['search'] = $correctedQuery;
            }

            $outlets = $this->outletService->getAll(
                filters: $filters,
                page: $filters['page'],
                perPage: $filters['perPage'],
                relations: $this->outletService->customerDiscoveryRelations($filters),
            );

            $meta = PaginationHelper::format($outlets, $request);
            if (!empty($correctedQuery)) {
                $meta['correctedQuery'] = $correctedQuery;
            }

            return $this->successResponse(
                OutletResource::collection($outlets->items())->resolve(),
                'Outlets retrieved successfully',
                200,
                $meta,
            );
        } catch (ValidationException $e) {
            return $this->errorResponse('Validasi gagal', 422, $e->errors());
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to fetch outlets', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'outlet_management',
            ]);

            return $this->errorResponse('Gagal memuat data outlet', 500, $e);
        }
    }

    public function nearby(NearbyOutletRequest $request): JsonResponse
    {
        try {
            $filters = $this->getFilters($request);
            $correctedQuery = $this->outletService->resolveDiscoveryCorrectedQuery(
                $filters['search'] ?? null,
                $filters
            );
            if (!empty($correctedQuery)) {
                $filters['search'] = $correctedQuery;
            }

            $outlets = $this->outletService->getNearby(
                latitude: $request->input('latitude'),
                longitude: $request->input('longitude'),
                radius: (float) ($request->input('radius') ?? 10.0),
                filters: $filters,
                page: $filters['page'],
                perPage: $filters['perPage'],
                relations: $this->outletService->customerDiscoveryRelations($filters),
            );

            $meta = PaginationHelper::format($outlets, $request);
            if (!empty($correctedQuery)) {
                $meta['correctedQuery'] = $correctedQuery;
            }

            return $this->successResponse(
                OutletResource::collection($outlets->items())->resolve(),
                'Nearby outlets retrieved successfully',
                200,
                $meta,
            );
        } catch (ValidationException $e) {
            return $this->errorResponse('Validasi gagal', 422, $e->errors());
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to fetch nearby outlets', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'outlet_management',
            ]);

            return $this->errorResponse('Gagal memuat data outlet terdekat', 500, $e);
        }
    }

    public function show(Request $request, int $id): JsonResponse
    {
        try {
            $request->validate([
                'latitude' => 'nullable|numeric|between:-90,90',
                'longitude' => 'nullable|numeric|between:-180,180',
            ]);

            $outlet = $this->outletService->getById(
                id: $id,
                relations: [
                    'categories.laundryServices.unit',
                    'operationalDays',
                    'courierSetting',
                    'outletFeatures.feature',
                ],
                latitude: $request->filled('latitude') ? (float) $request->input('latitude') : null,
                longitude: $request->filled('longitude') ? (float) $request->input('longitude') : null,
            );

            return $this->successResponse(
                (new OutletResource($outlet))->resolve(),
                'Outlet retrieved successfully'
            );
        } catch (ValidationException $e) {
            return $this->errorResponse('Validasi gagal', 422, $e->errors());
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to fetch outlet', [
                'error'     => $e->getMessage(),
                'user_id'   => Auth::id(),
                'type'      => 'outlet_management',
                'outlet_id' => $id,
            ]);

            return $this->errorResponse('Gagal memuat data outlet', 500, $e);
        }
    }

    private function getFilters(Request $request): array
    {
        return [
            'search'        => $request->string('search')->toString(),
            'status'        => $request->filled('status')
                ? $request->string('status')->toString()
                : null,
            'provinceId'    => $request->filled('provinceId')
                ? $request->integer('provinceId')
                : null,
            'cityId'        => $request->filled('cityId')
                ? $request->integer('cityId')
                : null,
            'districtId'    => $request->filled('districtId')
                ? $request->integer('districtId')
                : null,
            'isExposure'    => $request->has('isExposure') && $request->filled('isExposure')
                ? $request->boolean('isExposure')
                : null,
            'includeServices' => $request->has('includeServices') && $request->filled('includeServices')
                ? $request->boolean('includeServices')
                : false,
            'outletId'      => $request->filled('outletId')
                ? $request->integer('outletId')
                : null,
            'categoryId'    => $request->filled('categoryId')
                ? $request->integer('categoryId')
                : null,
            'unitId'        => $request->filled('unitId')
                ? $request->integer('unitId')
                : null,
            'minPrice'      => $request->filled('minPrice')
                ? (float) $request->input('minPrice')
                : null,
            'maxPrice'      => $request->filled('maxPrice')
                ? (float) $request->input('maxPrice')
                : null,
            'supportsCourier' => $request->has('supportsCourier') && $request->filled('supportsCourier')
                ? $request->boolean('supportsCourier')
                : null,
            'freeShippingEligible' => $request->has('freeShippingEligible') && $request->filled('freeShippingEligible')
                ? $request->boolean('freeShippingEligible')
                : null,
            'serviceSortBy' => $request->string('serviceSortBy', 'relevant')->toString(),
            'sortBy'        => $request->string('sortBy', 'createdAt')->toString(),
            'sortDirection' => $request->string('sortDirection', 'desc')->toString(),
            'latitude'      => $request->filled('latitude')
                ? (float) $request->input('latitude')
                : null,
            'longitude'     => $request->filled('longitude')
                ? (float) $request->input('longitude')
                : null,
            'page'          => $request->integer('page', 1),
            'perPage'       => $request->integer('perPage', 15),
        ];
    }
}
