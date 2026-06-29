<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\Unit\UnitResource;
use App\Services\UnitService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Throwable;

use Illuminate\Routing\Attributes\Controllers\Middleware;

#[Middleware('auth:sanctum')]
class UnitController extends Controller
{
    public function __construct(
        private readonly UnitService $unitService,
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $this->getFilters($request);

            $units = $this->unitService->getAll(
                filters: $filters,
                relations: []
            );

            return $this->successResponse(
                UnitResource::collection($units)->resolve(),
                'Units fetched successfully'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[UnitController] Failed to fetch units', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'unit_management',
            ]);

            return $this->errorResponse('Gagal memuat data satuan', 500, $e);
        }
    }

    /**
     * Helper: Get filters from request
     */
    private function getFilters(Request $request): array
    {
        return [
            'search'        => $request->string('search')->toString(),
            'sortBy'        => $request->string('sortBy', 'createdAt')->toString(),
            'sortDirection' => $request->string('sortDirection', 'desc')->toString(),
            'page'          => $request->integer('page', 1),
            'perPage'       => $request->integer('perPage', $request->integer('per_page', 15)),
            'isActive'      => $request->has('isActive') && $request->filled('isActive')
                ? $request->boolean('isActive')
                : null,
        ];
    }
}
