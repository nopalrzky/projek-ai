<?php

namespace App\Http\Controllers\Api;

use App\Helpers\PaginationHelper;
use App\Http\Controllers\Controller;
use App\Http\Resources\ServicePackage\ServicePackageResource;
use App\Services\ServicePackageService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Throwable;

use Illuminate\Routing\Attributes\Controllers\Middleware;

#[Middleware('auth:sanctum')]
class ServicePackageController extends Controller
{
    public function __construct(
        private readonly ServicePackageService $servicePackageService,
    ) {}

    /**
     * Get all service packages with filters and pagination
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $this->getFilters($request);

            $packages = $this->servicePackageService->getAll(
                page: $filters['page'],
                perPage: $filters['perPage'],
                filters: $filters,
                relations: [
                    'outlet',
                    'servicePackageItems.laundryService.unit',
                    'servicePackageItems.laundryService.category',
                ]
            );

            return $this->successResponse(
                ServicePackageResource::collection($packages)->resolve(),
                'Service packages retrieved successfully',
                200,
                PaginationHelper::format($packages, $request)
            );
        } catch (Throwable $e) {
            Log::error('[ServicePackageController] Failed to retrieve service packages', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'service_package',
            ]);

            return $this->errorResponse('Gagal memuat data paket layanan', 500, $e);
        }
    }

    /**
     * Get service package by ID
     */
    public function show(int $id): JsonResponse
    {
        try {
            $package = $this->servicePackageService->getById($id, [
                'outlet',
                'servicePackageItems.laundryService.unit',
                'servicePackageItems.laundryService.category',
            ]);

            return $this->successResponse(
                (new ServicePackageResource($package))->resolve(),
                'Service package retrieved successfully'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[ServicePackageController] Failed to retrieve service package', [
                'error'      => $e->getMessage(),
                'user_id'    => Auth::id(),
                'type'       => 'service_package',
                'package_id' => $id,
            ]);

            return $this->errorResponse('Gagal memuat data paket layanan', 500, $e);
        }
    }

    /**
     * Get filters from request
     */
    private function getFilters(Request $request): array
    {
        return [
            'search'          => $request->string('search')->toString(),
            'outletId'        => $request->has('outletId') && $request->filled('outletId')
                ? $request->integer('outletId')
                : null,
            'isActive'        => $request->has('isActive') && $request->filled('isActive')
                ? filter_var($request->input('isActive'), FILTER_VALIDATE_BOOLEAN)
                : null,
            'minPrice'        => $request->has('minPrice') && $request->filled('minPrice')
                ? $request->float('minPrice')
                : null,
            'maxPrice'        => $request->has('maxPrice') && $request->filled('maxPrice')
                ? $request->float('maxPrice')
                : null,
            'minValidityDays' => $request->has('minValidityDays') && $request->filled('minValidityDays')
                ? $request->integer('minValidityDays')
                : null,
            'maxValidityDays' => $request->has('maxValidityDays') && $request->filled('maxValidityDays')
                ? $request->integer('maxValidityDays')
                : null,
            'sortBy'          => $request->string('sortBy', 'createdAt')->toString(),
            'sortDirection'   => $request->string('sortDirection', 'desc')->toString(),
            'page'            => $request->integer('page', 1),
            'perPage'         => $request->integer('perPage', 15),
        ];
    }
}
