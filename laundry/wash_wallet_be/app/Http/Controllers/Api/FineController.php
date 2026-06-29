<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\Fine\FineResource;
use App\Services\FineService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Throwable;

use Illuminate\Routing\Attributes\Controllers\Middleware;

#[Middleware('auth:sanctum')]
class FineController extends Controller
{
    public function __construct(
        private readonly FineService $fineService,
    ) {}

    /**
     * Display a listing of fines
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $this->getFilters($request);

            $fines = $this->fineService->getAll(
                filters: $filters,
                page: $filters['page'],
                perPage: $filters['perPage'],
                relations: ['outlet']
            );

            return $this->successResponse(
                FineResource::collection($fines)->resolve(),
                'Fines fetched successfully'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[FineController] Failed to fetch fines', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'fine_management',
            ]);

            return $this->errorResponse('Gagal memuat data denda', 500, $e);
        }
    }

    /**
     * Display the specified fine
     */
    public function show(int $id): JsonResponse
    {
        try {
            $fine = $this->fineService->getById($id, ['outlet']);

            return $this->successResponse(
                (new FineResource($fine))->resolve(),
                'Fine fetched successfully'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[FineController] Failed to fetch fine', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'fine_management',
                'fine_id' => $id,
            ]);

            return $this->errorResponse('Gagal memuat data denda', 500, $e);
        }
    }

    /**
     * Get filters from request
     */
    private function getFilters(Request $request): array
    {
        return [
            'search'        => $request->string('search', ''),
            'page'          => $request->integer('page', 1),
            'perPage'       => $request->integer('perPage', 15),
            'sortBy'        => $request->string('sortBy', 'createdAt')->toString(),
            'sortDirection' => $request->string('sortDirection', 'desc')->toString(),
            'outletId'      => $request->has('outletId') && $request->filled('outletId')
                ? $request->integer('outletId')
                : null,
            'minAmount'     => $request->has('minAmount') && $request->filled('minAmount')
                ? $request->float('minAmount')
                : null,
            'maxAmount'     => $request->has('maxAmount') && $request->filled('maxAmount')
                ? $request->float('maxAmount')
                : null,
        ];
    }
}
