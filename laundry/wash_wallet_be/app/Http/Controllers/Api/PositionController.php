<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Position\StorePositionRequest;
use App\Http\Requests\Position\UpdatePositionRequest;
use App\Http\Resources\Position\PositionResource;
use App\Models\Position;
use App\Services\PositionService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Gate;
use Throwable;

use Illuminate\Routing\Attributes\Controllers\Middleware;

#[Middleware('auth:sanctum')]
class PositionController extends Controller
{
    public function __construct(
        private readonly PositionService $positionService,
    ) {}

    /**
     * Display a listing of positions
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $this->getFilters($request);

            $positions = $this->positionService->getAll(
                filters: $filters,
                page: $filters['page'],
                perPage: $filters['perPage'],
                relations: []
            );

            return $this->successResponse(
                PositionResource::collection($positions)->resolve(),
                'Positions fetched successfully'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[PositionController] Failed to fetch positions', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'position_management',
            ]);

            return $this->errorResponse('Gagal memuat data jabatan', 500, $e);
        }
    }

    /**
     * Store a newly created position
     */
    public function store(StorePositionRequest $request): JsonResponse
    {
        try {
            Gate::authorize('store', Position::class);
            $position = $this->positionService->store($request->validated());

            return $this->successResponse(
                (new PositionResource($position))->resolve(),
                'Position created successfully',
                201
            );
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return $this->errorResponse($e->getMessage() ?: 'Aksi tidak diotorisasi.', 403, $e);
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[PositionController] Failed to create position', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'position_management',
            ]);

            return $this->errorResponse('Gagal membuat jabatan', 500, $e);
        }
    }

    /**
     * Display the specified position
     */
    public function show(int $id): JsonResponse
    {
        try {
            $position = $this->positionService->getById($id);

            return $this->successResponse(
                (new PositionResource($position))->resolve(),
                'Position fetched successfully'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[PositionController] Failed to fetch position', [
                'error'       => $e->getMessage(),
                'user_id'     => Auth::id(),
                'type'        => 'position_management',
                'position_id' => $id,
            ]);

            return $this->errorResponse('Gagal memuat data jabatan', 500, $e);
        }
    }

    /**
     * Update the specified position
     */
    public function update(UpdatePositionRequest $request, int $id): JsonResponse
    {
        try {
            $position = $this->positionService->getById($id);
            Gate::authorize('update', $position);
            $position = $this->positionService->update($id, $request->validated());

            return $this->successResponse(
                (new PositionResource($position))->resolve(),
                'Position updated successfully'
            );
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return $this->errorResponse($e->getMessage() ?: 'Aksi tidak diotorisasi.', 403, $e);
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[PositionController] Failed to update position', [
                'error'       => $e->getMessage(),
                'user_id'     => Auth::id(),
                'type'        => 'position_management',
                'position_id' => $id,
            ]);

            return $this->errorResponse('Gagal memperbarui jabatan', 500, $e);
        }
    }

    /**
     * Remove the specified position
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $position = $this->positionService->getById($id);
            Gate::authorize('destroy', $position);
            $deleted = $this->positionService->destroy($id);

            if ($deleted) {
                return $this->successResponse(null, 'Position deleted successfully');
            }

            return $this->errorResponse('Jabatan tidak ditemukan atau sudah dihapus', 404);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return $this->errorResponse($e->getMessage() ?: 'Aksi tidak diotorisasi.', 403, $e);
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[PositionController] Failed to delete position', [
                'error'       => $e->getMessage(),
                'user_id'     => Auth::id(),
                'type'        => 'position_management',
                'position_id' => $id,
            ]);

            return $this->errorResponse('Gagal menghapus jabatan', 500, $e);
        }
    }

    /**
     * Restore soft deleted position
     */
    public function restore(int $id): JsonResponse
    {
        try {
            $position = \App\Models\Position::withTrashed()->findOrFail($id);
            Gate::authorize('restore', $position);
            $position = $this->positionService->restore($id);

            return $this->successResponse(
                (new PositionResource($position))->resolve(),
                'Position restored successfully'
            );
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return $this->errorResponse($e->getMessage() ?: 'Aksi tidak diotorisasi.', 403, $e);
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[PositionController] Failed to restore position', [
                'error'       => $e->getMessage(),
                'user_id'     => Auth::id(),
                'type'        => 'position_management',
                'position_id' => $id,
            ]);

            return $this->errorResponse('Gagal memulihkan jabatan', 500, $e);
        }
    }

    /**
     * Permanently delete position
     */
    public function forceDestroy(int $id): JsonResponse
    {
        try {
            $position = \App\Models\Position::withTrashed()->findOrFail($id);
            Gate::authorize('forceDestroy', $position);
            $deleted = $this->positionService->forceDestroy($id);

            if ($deleted) {
                Log::info('Position permanently deleted', [
                    'position_id' => $id,
                    'deleted_by'  => Auth::id(),
                    'type'        => 'position_management',
                ]);

                return $this->successResponse(null, 'Position permanently deleted');
            }

            return $this->errorResponse('Jabatan tidak ditemukan', 404);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return $this->errorResponse($e->getMessage() ?: 'Aksi tidak diotorisasi.', 403, $e);
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[PositionController] Failed to force delete position', [
                'error'       => $e->getMessage(),
                'user_id'     => Auth::id(),
                'type'        => 'position_management',
                'position_id' => $id,
            ]);

            return $this->errorResponse('Gagal menghapus permanen jabatan', 500, $e);
        }
    }

    /**
     * Get positions by outlet ID
     */
    public function getPositionsByOutletId(int $outletId): JsonResponse
    {
        try {
            $positions = $this->positionService->getAll(
                filters: ['outletId' => $outletId],
                relations: ['outlet']
            );

            return $this->successResponse(
                PositionResource::collection($positions)->resolve(),
                'Positions retrieved successfully'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[PositionController] Failed to fetch positions by outlet', [
                'error'     => $e->getMessage(),
                'user_id'   => Auth::id(),
                'type'      => 'position_management',
                'outlet_id' => $outletId,
            ]);

            return $this->errorResponse('Gagal memuat data jabatan untuk outlet', 500, $e);
        }
    }

    private function getFilters(Request $request): array
    {
        return [
            'search'        => $request->string('search', '')->toString(),
            'isActive'      => $request->has('isActive') && $request->filled('isActive')
                ? $request->boolean('isActive')
                : null,
            'outletId'      => $request->has('outletId') && $request->filled('outletId')
                ? $request->integer('outletId')
                : null,
            'sortBy'        => $request->string('sortBy', 'createdAt')->toString(),
            'sortDirection' => $request->string('sortDirection', 'desc')->toString(),
            'page'          => $request->integer('page', 1),
            'perPage'       => $request->integer('perPage', 15),
        ];
    }
}
