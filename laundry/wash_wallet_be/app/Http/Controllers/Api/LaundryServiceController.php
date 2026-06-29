<?php

namespace App\Http\Controllers\Api;

use App\Helpers\PaginationHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\LaundryService\StoreLaundryServiceRequest;
use App\Http\Requests\LaundryService\UpdateLaundryServiceRequest;
use App\Http\Resources\LaundryService\LaundryServiceResource;
use App\Services\LaundryServiceService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Throwable;

use Illuminate\Routing\Attributes\Controllers\Middleware;

#[Middleware('auth:sanctum')]
class LaundryServiceController extends Controller
{
    public function __construct(
        private readonly LaundryServiceService $laundryServiceService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $this->getFilters($request);

            $services = $this->laundryServiceService->getAll(
                filters: $filters,
                page: $filters['page'],
                perPage: $filters['perPage'],
                relations: ['category', 'unit']
            );

            return $this->successResponse(
                LaundryServiceResource::collection($services)->resolve(),
                'Laundry service list retrieved successfully',
                200,
                PaginationHelper::format($services, $request)
            );
        } catch (Throwable $e) {
            Log::error('[LaundryServiceController] Failed to retrieve laundry services', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'laundry_service',
            ]);

            return $this->errorResponse('Gagal memuat data layanan laundry', 500, $e);
        }
    }

    public function store(StoreLaundryServiceRequest $request): JsonResponse
    {
        try {
            $service = $this->laundryServiceService->store($request->validated());

            return $this->successResponse(
                new LaundryServiceResource($service),
                'Laundry service created successfully',
                201
            );
        } catch (Throwable $e) {
            Log::error('[LaundryServiceController] Failed to create laundry service', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'laundry_service',
            ]);

            return $this->errorResponse('Gagal membuat layanan laundry', 500, $e);
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            $service = $this->laundryServiceService->getById($id, [
                'category',
                'unit',
            ]);

            return $this->successResponse(
                new LaundryServiceResource($service),
                'Laundry service retrieved successfully'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[LaundryServiceController] Failed to retrieve laundry service', [
                'error'              => $e->getMessage(),
                'user_id'            => Auth::id(),
                'type'               => 'laundry_service',
                'laundry_service_id' => $id,
            ]);

            return $this->errorResponse('Gagal memuat data layanan laundry', 500, $e);
        }
    }

    public function update(UpdateLaundryServiceRequest $request, int $id): JsonResponse
    {
        try {
            $service = $this->laundryServiceService->update($id, $request->validated());

            return $this->successResponse(
                new LaundryServiceResource($service->load(['category', 'unit'])),
                'Laundry service updated successfully'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[LaundryServiceController] Failed to update laundry service', [
                'error'              => $e->getMessage(),
                'user_id'            => Auth::id(),
                'type'               => 'laundry_service',
                'laundry_service_id' => $id,
            ]);

            return $this->errorResponse('Gagal memperbarui layanan laundry', 500, $e);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $deleted = $this->laundryServiceService->destroy($id);

            if ($deleted) {
                return $this->successResponse(null, 'Laundry service deleted successfully');
            }

            return $this->errorResponse('Laundry service not found or cannot be deleted', 404);
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[LaundryServiceController] Failed to delete laundry service', [
                'error'              => $e->getMessage(),
                'user_id'            => Auth::id(),
                'type'               => 'laundry_service',
                'laundry_service_id' => $id,
            ]);

            return $this->errorResponse('Gagal menghapus layanan laundry', 500, $e);
        }
    }

    private function getFilters(Request $request): array
    {
        return [
            'search'        => $request->string('search')->toString(),
            'isActive'      => $request->has('isActive') && $request->filled('isActive')
                ? $request->boolean('isActive')
                : null,
            'outletId'      => $request->has('outletId') && $request->filled('outletId')
                ? $request->integer('outletId')
                : null,
            'categoryId'    => $request->has('categoryId') && $request->filled('categoryId')
                ? $request->integer('categoryId')
                : null,
            'unitId'        => $request->has('unitId') && $request->filled('unitId')
                ? $request->integer('unitId')
                : null,
            'sortBy'        => $request->string('sortBy', 'createdAt')->toString(),
            'sortDirection' => $request->string('sortDirection', 'desc')->toString(),
            'page'          => $request->integer('page', 1),
            'perPage'       => $request->integer('perPage', 15),
        ];
    }
}
