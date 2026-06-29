<?php

namespace App\Http\Controllers\Api;

use App\Helpers\PaginationHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\Deposit\StoreDepositRequest;
use App\Http\Requests\Deposit\UpdateDepositRequest;
use App\Http\Resources\Deposit\DepositResource;
use App\Services\DepositService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Throwable;

use Illuminate\Routing\Attributes\Controllers\Middleware;

#[Middleware('auth:sanctum')]
class DepositController extends Controller
{
    public function __construct(
        private readonly DepositService $depositService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $this->getFilters($request);

            $deposits = $this->depositService->getAll(
                filters: $filters,
                page: $filters['page'],
                perPage: $filters['perPage'],
                relations: ['cashier', 'outlet', 'sourceAccount', 'destinationAccount', 'approvedBy']
            );

            return $this->successResponse(
                DepositResource::collection($deposits->items())->resolve(),
                'Deposits retrieved successfully',
                200,
                PaginationHelper::format($deposits, $request)
            );
        } catch (Throwable $e) {
            Log::error('[DepositController] Failed to fetch deposits', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'deposit_management',
            ]);

            return $this->errorResponse('Gagal memuat daftar deposit', 500, $e);
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            $deposit = $this->depositService->getById(
                $id,
                ['cashier', 'outlet', 'sourceAccount', 'destinationAccount', 'approvedBy', 'journal']
            );

            Log::info('[DepositController] Deposit retrieved successfully', [
                'deposit_id' => $id,
                'user_id'    => Auth::id(),
                'type'       => 'deposit_management',
                'data'       => (new DepositResource($deposit))->resolve(),
            ]);

            return $this->successResponse(
                (new DepositResource($deposit))->resolve(),
                'Deposit retrieved successfully'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Deposit tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[DepositController] Failed to fetch deposit', [
                'error'      => $e->getMessage(),
                'user_id'    => Auth::id(),
                'type'       => 'deposit_management',
                'deposit_id' => $id,
            ]);

            return $this->errorResponse('Gagal memuat data deposit', 500, $e);
        }
    }

    public function store(StoreDepositRequest $request): JsonResponse
    {
        try {
            $deposit = $this->depositService->store($request->validated());

            return $this->successResponse(
                (new DepositResource($deposit->load(['cashier', 'outlet', 'sourceAccount', 'destinationAccount'])))->resolve(),
                'Deposit created successfully',
                201
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Akun tujuan tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[DepositController] Failed to create deposit', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'deposit_management',
            ]);

            return $this->errorResponse('Gagal membuat deposit', 500, $e);
        }
    }

    public function update(UpdateDepositRequest $request, int $id): JsonResponse
    {
        try {
            $deposit = $this->depositService->update($id, $request->validated());

            return $this->successResponse(
                (new DepositResource($deposit->load(['cashier', 'outlet', 'sourceAccount', 'destinationAccount'])))->resolve(),
                'Deposit updated successfully'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Deposit tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[DepositController] Failed to update deposit', [
                'error'      => $e->getMessage(),
                'user_id'    => Auth::id(),
                'type'       => 'deposit_management',
                'deposit_id' => $id,
            ]);

            return $this->errorResponse('Gagal memperbarui deposit', 500, $e);
        }
    }

    private function getFilters(Request $request): array
    {
        return [
            'search' => $request->string('search')->toString(),
            'outletId' => $request->has('outletId') && $request->filled('outletId')
                ? $request->integer('outletId')
                : null,
            'cashierId' => $request->has('cashierId') && $request->filled('cashierId')
                ? $request->integer('cashierId')
                : null,
            'ownerId' => $request->has('ownerId') && $request->filled('ownerId')
                ? $request->integer('ownerId')
                : null,
            'status' => $request->has('status') && $request->filled('status')
                ? $request->string('status')->toString()
                : null,
            'sortBy'        => $request->string('sortBy', 'created_at')->toString(),
            'sortDirection' => $request->string('sortDirection', 'desc')->toString(),
            'page'          => $request->integer('page', 1),
            'perPage'       => $request->integer('perPage', 15),
        ];
    }
}
