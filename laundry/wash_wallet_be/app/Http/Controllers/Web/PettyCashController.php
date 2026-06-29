<?php

namespace App\Http\Controllers\Web;

use Illuminate\Routing\Attributes\Controllers\Middleware;

use App\Helpers\PaginationHelper;
use App\Http\Controllers\Controller;
use App\Http\Resources\Account\AccountResource;
use App\Http\Resources\Outlet\OutletResource;
use App\Http\Resources\PettyCash\PettyCashResource;
use App\Services\AccountService;
use App\Services\OutletService;
use App\Services\PettyCashService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

#[Middleware('auth')]
class PettyCashController extends Controller
{
    public function __construct(private readonly PettyCashService $pettyCashService, private readonly OutletService $outletService, private readonly AccountService $accountService) {}

    public function index(Request $request): Response
    {
        try {
            $filters = $this->getFiltersFromRequest($request);

            $pettyCashes = $this->pettyCashService->getAll(
                $filters,
                $request->integer('page', 1),
                $request->integer('perPage', 15),
                ['cashier', 'outlet', 'sourceAccount', 'approvedBy']
            );

            $user = Auth::user();
            $outlets = $this->outletService->getAll(filters: ['ownerId' => $user->id]);
            $accounts = $this->accountService->getAll(['ownerId' => $user->id]);

            $statusOptions = [
                ['value' => 'pending', 'label' => 'Menunggu Persetujuan'],
                ['value' => 'approved', 'label' => 'Disetujui'],
                ['value' => 'rejected', 'label' => 'Ditolak'],
            ];

            return Inertia::render('Dashboard/PettyCashes/Index', [
                'pettyCashes' => [
                    'data' => PettyCashResource::collection($pettyCashes->items())->resolve(),
                    'meta' => PaginationHelper::format($pettyCashes, $request),
                ],
                'filterOptions' => [
                    'outlets' => OutletResource::collection($outlets)->resolve(),
                    'accounts' => AccountResource::collection($accounts)->resolve(),
                    'statusOptions' => $statusOptions,
                ],
                'filters' => [
                    'search' => $filters['search'] ?? '',
                    'status' => $filters['status'] ?? '',
                    'outletId' => $filters['outlet_id'] ?? null,
                    'startDate' => $filters['start_date'] ?? '',
                    'endDate' => $filters['end_date'] ?? '',
                    'sortBy' => $filters['sortBy'] ?? 'created_at',
                    'sortDirection' => $filters['sortDirection'] ?? 'desc',
                    'page' => $request->integer('page', 1),
                    'perPage' => $request->integer('perPage', 15),
                ],
                'flash' => [
                    'success' => session('success'),
                    'error' => session('error'),
                ],
            ]);
        } catch (Throwable $e) {
            Log::error('[PettyCashController] Failed to load petty cashes index', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'petty_cash_management',
            ]);

            return Inertia::render('Dashboard/PettyCashes/Index', [
                'pettyCashes' => [
                    'data' => [],
                    'meta' => null,
                ],
                'filterOptions' => [
                    'outlets' => [],
                    'accounts' => [],
                    'statusOptions' => [],
                ],
                'filters' => [],
                'error' => 'Gagal memuat data. Silakan coba lagi.',
            ]);
        }
    }

    public function show(int $id): Response|RedirectResponse
    {
        try {
            $pettyCash = $this->pettyCashService->getById(
                $id,
                ['cashier', 'outlet', 'sourceAccount', 'approvedBy', 'journalEntry']
            );

            $user = Auth::user();
            $accounts = $this->accountService->getAll(['ownerId' => $user->id]);

            return Inertia::render('Dashboard/PettyCashes/Show', [
                'pettyCash' => (new PettyCashResource($pettyCash))->resolve(),
                'accounts' => AccountResource::collection($accounts)->resolve(),
                'flash' => [
                    'success' => session('success'),
                    'error' => session('error'),
                ],
            ]);
        } catch (Throwable $e) {
            Log::error('[PettyCashController] Failed to load petty cash detail', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'petty_cash_management',
            ]);

            return redirect()
                ->route('petty-cashes.index')
                ->with('error', 'Gagal memuat detail petty cash.');
        }
    }

    public function approve(Request $request, int $id): RedirectResponse
    {
        try {
            $validated = $request->validate([
                'sourceAccountId' => 'required|integer|exists:accounts,id',
            ]);

            $pettyCash = $this->pettyCashService->approve($id, $validated['sourceAccountId']);

            Log::info('Petty cash approved successfully', [
                'user_id' => Auth::id(),
                'petty_cash_id' => $id,
                'petty_cash_code' => $pettyCash->code,
            ]);

            return redirect()
                ->back()
                ->with('success', 'Petty cash berhasil disetujui.');
        } catch (Throwable $e) {
            Log::error('[PettyCashController] Failed to approve petty cash', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'petty_cash_management',
            ]);

            return redirect()
                ->back()
                ->with('error', $e->getMessage());
        }
    }

    public function reject(Request $request, int $id): RedirectResponse
    {
        try {
            $validated = $request->validate([
                'reason' => 'required|string|max:500',
            ]);

            $pettyCash = $this->pettyCashService->reject($id, $validated['reason']);

            Log::info('Petty cash rejected successfully', [
                'user_id' => Auth::id(),
                'petty_cash_id' => $id,
                'petty_cash_code' => $pettyCash->code,
                'reason' => $validated['reason'],
            ]);

            return redirect()
                ->back()
                ->with('success', 'Petty cash berhasil ditolak.');
        } catch (Throwable $e) {
            Log::error('[PettyCashController] Failed to reject petty cash', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'petty_cash_management',
            ]);

            return redirect()
                ->back()
                ->with('error', $e->getMessage());
        }
    }

    public function destroy(int $id): RedirectResponse
    {
        try {
            $this->pettyCashService->destroy($id);

            Log::info('Petty cash deleted successfully', [
                'user_id' => Auth::id(),
                'petty_cash_id' => $id,
            ]);

            return redirect()
                ->route('petty-cashes.index')
                ->with('success', 'Petty cash berhasil dihapus.');
        } catch (Throwable $e) {
            Log::error('[PettyCashController] Failed to delete petty cash', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'petty_cash_management',
            ]);

            return redirect()
                ->back()
                ->with('error', $e->getMessage());
        }
    }

    private function getFiltersFromRequest(Request $request): array
    {
        return [
            'search' => $request->string('search')->toString(),
            'status' => $request->string('status')->toString(),
            'outlet_id' => $request->has('outletId') && $request->filled('outletId')
                ? $request->integer('outletId')
                : null,
            'start_date' => $request->string('startDate')->toString(),
            'end_date' => $request->string('endDate')->toString(),
            'sortBy' => $request->string('sortBy', 'created_at')->toString(),
            'sortDirection' => $request->string('sortDirection', 'desc')->toString(),
        ];
    }
}
