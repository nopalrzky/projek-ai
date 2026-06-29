<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\Account\AccountResource;
use App\Services\AccountService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Throwable;

use Illuminate\Routing\Attributes\Controllers\Middleware;

#[Middleware('auth:sanctum')]
class AccountController extends Controller
{
    public function __construct(
        private readonly AccountService $accountService,
    ) {}

    /**
     * Get next available account code
     */
    public function getNextCode(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'owner_id' => 'sometimes|required|integer|exists:users,id',
                'parent_id' => 'nullable|integer|exists:accounts,id',
            ]);

            $ownerId = $request->input('owner_id', Auth::id());
            $parentId = $request->input('parent_id');

            $nextCode = $this->accountService->getNextCode($ownerId, $parentId);

            return $this->successResponse(['nextCode' => $nextCode], 'Next code retrieved successfully');
        } catch (Throwable $e) {
            Log::error('[AccountController] Failed to generate next code', [
                'error'     => $e->getMessage(),
                'user_id'   => Auth::id(),
                'type'      => 'account_management',
                'owner_id'  => $request->input('owner_id'),
                'parent_id' => $request->input('parent_id'),
            ]);

            return $this->errorResponse('Gagal membuat kode akun', 500, $e);
        }
    }

    /**
     * Get account options by type and outlet using query filters.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $this->getFilters($request);

            $accounts = $this->accountService->getAll(
                filters: $filters,
                page: null,
                perPage: null
            );

            return $this->successResponse(
                AccountResource::collection($accounts)->resolve(),
                'Accounts retrieved successfully'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Outlet tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[AccountController] Failed to get accounts by filters', [
                'error'     => $e->getMessage(),
                'user_id'   => Auth::id(),
                'type'      => 'account_management',
                'outlet_id' => $request->input('outletId'),
                'account_type' => $request->input('type'),
            ]);

            return $this->errorResponse('Gagal memuat daftar akun', 500, $e);
        }
    }

    private function getFilters(Request $request): array
    {
        $validated = $request->validate([
            'outletId' => 'required|integer|exists:outlets,id',
            'type' => 'required|string|in:funding,expense,transfer',
        ]);

        $baseFilters = [
            'outletId' => (int) $validated['outletId'],
            'includeCommonOutletAccounts' => true,
            'isTransactional' => true,
            'isActive' => true,
            'sortBy' => 'code',
            'sortDirection' => 'asc',
        ];

        return match ($validated['type']) {
            'funding' => array_merge($baseFilters, [
                'type' => 'asset',
                'accountRoles' => AccountService::FUNDING_ACCOUNT_ROLES,
            ]),
            'expense' => array_merge($baseFilters, [
                'type' => 'expense',
            ]),
            'transfer' => array_merge($baseFilters, [
                'type' => 'asset',
                'accountRoles' => AccountService::TRANSFER_ACCOUNT_ROLES,
                'sortBy' => 'account_role',
            ]),
        };
    }
}
