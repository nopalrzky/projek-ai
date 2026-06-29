<?php

namespace App\Http\Controllers\Api;

use App\Helpers\PaginationHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\PettyCash\StorePettyCashRequest;
use App\Http\Requests\PettyCash\UpdatePettyCashRequest;
use App\Http\Resources\PettyCash\PettyCashResource;
use App\Services\PettyCashService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Throwable;

use Illuminate\Routing\Attributes\Controllers\Middleware;

#[Middleware('auth:sanctum')]
class PettyCashController extends Controller
{
    public function __construct(
        private readonly PettyCashService $pettyCashService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $this->getFilters($request);

            $pettyCashes = $this->pettyCashService->getAll(
                filters: $filters,
                page: $filters['page'],
                perPage: $filters['perPage'],
                relations: ['cashier', 'outlet', 'sourceAccount', 'approvedBy']
            );

            return $this->successResponse(
                PettyCashResource::collection($pettyCashes->items())->resolve(),
                'Petty cashes retrieved successfully',
                200,
                PaginationHelper::format($pettyCashes, $request)
            );
        } catch (Throwable $e) {
            Log::error('[PettyCashController] Failed to retrieve petty cashes', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'petty_cash',
            ]);

            return $this->errorResponse('Gagal memuat data petty cash', 500, $e);
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            $pettyCash = $this->pettyCashService->getById(
                $id,
                ['cashier', 'outlet', 'sourceAccount', 'approvedBy', 'journalEntry']
            );

            return $this->successResponse(
                (new PettyCashResource($pettyCash))->resolve(),
                'Petty cash retrieved successfully'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[PettyCashController] Failed to retrieve petty cash', [
                'error'         => $e->getMessage(),
                'user_id'       => Auth::id(),
                'type'          => 'petty_cash',
                'petty_cash_id' => $id,
            ]);

            return $this->errorResponse('Gagal memuat data petty cash', 500, $e);
        }
    }

    public function store(StorePettyCashRequest $request): JsonResponse
    {
        try {
            $pettyCash = $this->pettyCashService->store($request->validated());

            return $this->successResponse(
                (new PettyCashResource($pettyCash->load(['cashier', 'outlet'])))->resolve(),
                'Petty cash created successfully',
                201
            );
        } catch (Throwable $e) {
            Log::error('[PettyCashController] Failed to create petty cash', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'petty_cash',
            ]);

            return $this->errorResponse('Gagal membuat petty cash', 500, $e);
        }
    }

    public function update(UpdatePettyCashRequest $request, int $id): JsonResponse
    {
        try {
            $pettyCash = $this->pettyCashService->update($id, $request->validated());

            return $this->successResponse(
                (new PettyCashResource($pettyCash->load(['cashier', 'outlet'])))->resolve(),
                'Petty cash updated successfully'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[PettyCashController] Failed to update petty cash', [
                'error'         => $e->getMessage(),
                'user_id'       => Auth::id(),
                'type'          => 'petty_cash',
                'petty_cash_id' => $id,
            ]);

            return $this->errorResponse('Gagal memperbarui petty cash', 500, $e);
        }
    }

    private function getFilters(Request $request): array
    {
        return [
            'search'        => $request->string('search')->toString(),
            'outletId'      => $request->has('outletId') && $request->filled('outletId')
                ? $request->integer('outletId')
                : null,
            'cashierId'     => $request->has('cashierId') && $request->filled('cashierId')
                ? $request->integer('cashierId')
                : null,
            'ownerId'       => $request->has('ownerId') && $request->filled('ownerId')
                ? $request->integer('ownerId')
                : null,
            'status'        => $request->has('status') && $request->filled('status')
                ? $request->string('status')->toString()
                : null,
            'sortBy'        => $request->string('sortBy', 'created_at')->toString(),
            'sortDirection' => $request->string('sortDirection', 'desc')->toString(),
            'page'          => $request->integer('page', 1),
            'perPage'       => $request->integer('perPage', 15),
        ];
    }
}
