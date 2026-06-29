<?php

namespace App\Http\Controllers\Web;

use Illuminate\Routing\Attributes\Controllers\Middleware;

use App\Helpers\PaginationHelper;
use App\Http\Controllers\Controller;
use App\Http\Resources\Deposit\DepositResource;
use App\Http\Resources\Outlet\OutletResource;
use App\Services\DepositService;
use App\Services\OutletService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

#[Middleware('auth')]
class DepositController extends Controller
{
    public function __construct(private readonly DepositService $depositService, private readonly OutletService $outletService) {}

    public function index(Request $request): Response
    {
        try {
            $filters = $this->getFiltersFromRequest($request);

            $deposits = $this->depositService->getAll(
                $filters,
                $request->integer('page', 1),
                $request->integer('perPage', 15),
                ['cashier', 'outlet', 'sourceAccount', 'destinationAccount', 'approvedBy']
            );

            $user    = Auth::user();
            $outlets = $this->outletService->getAll(filters: ['ownerId' => $user->id]);

            $statusOptions = [
                ['value' => 'pending',  'label' => 'Menunggu Persetujuan'],
                ['value' => 'approved', 'label' => 'Disetujui'],
                ['value' => 'rejected', 'label' => 'Ditolak'],
            ];

            return Inertia::render('Dashboard/Deposits/Index', [
                'deposits' => [
                    'data' => DepositResource::collection($deposits->items())->resolve(),
                    'meta' => PaginationHelper::format($deposits, $request),
                ],
                'filterOptions' => [
                    'outlets'       => OutletResource::collection($outlets)->resolve(),
                    'statusOptions' => $statusOptions,
                ],
                'filters' => $filters,
                'flash'   => [
                    'success' => session('success'),
                    'error'   => session('error'),
                ],
            ]);
        } catch (Throwable $e) {
            Log::error('[DepositController] Failed to fetch deposits', [
                'user_id' => Auth::id(),
                'filters' => $filters ?? [],
                'error'   => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
                'type'    => 'deposit_management',
            ]);

            return Inertia::render('Dashboard/Deposits/Index', [
                'deposits' => [
                    'data' => [],
                    'meta' => null,
                ],
                'filterOptions' => [
                    'outlets'       => [],
                    'statusOptions' => [],
                ],
                'filters' => [],
                'flash'   => [
                    'error' => 'Gagal memuat data deposit. Silakan coba lagi.',
                ],
            ]);
        }
    }

    public function show(int $id): Response|RedirectResponse
    {
        try {
            $deposit = $this->depositService->getById(
                $id,
                ['cashier', 'outlet', 'sourceAccount', 'destinationAccount', 'approvedBy', 'journalEntry']
            );

            return Inertia::render('Dashboard/Deposits/Show', [
                'deposit' => (new DepositResource($deposit))->resolve(),
                'flash'   => [
                    'success' => session('success'),
                    'error'   => session('error'),
                ],
            ]);
        } catch (Throwable $e) {
            Log::error('[DepositController] Failed to fetch deposit', [
                'user_id'    => Auth::id(),
                'deposit_id' => $id,
                'error'      => $e->getMessage(),
                'trace'      => $e->getTraceAsString(),
                'type'       => 'deposit_management',
            ]);

            return redirect()
                ->route('deposits.index')
                ->with('error', 'Gagal memuat detail deposit.');
        }
    }

    public function approve(int $id): RedirectResponse
    {
        try {
            $deposit = $this->depositService->approve($id);

            Log::info('[DepositController] Deposit approved successfully', [
                'user_id'      => Auth::id(),
                'deposit_id'   => $id,
                'deposit_code' => $deposit->code,
            ]);

            return redirect()
                ->back()
                ->with('success', 'Deposit berhasil disetujui.');
        } catch (Throwable $e) {
            Log::error('[DepositController] Failed to approve deposit', [
                'user_id'    => Auth::id(),
                'deposit_id' => $id,
                'error'      => $e->getMessage(),
                'trace'      => $e->getTraceAsString(),
                'type'       => 'deposit_management',
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

            $deposit = $this->depositService->reject($id, $validated['reason']);

            Log::info('[DepositController] Deposit rejected successfully', [
                'user_id'      => Auth::id(),
                'deposit_id'   => $id,
                'deposit_code' => $deposit->code,
                'reason'       => $validated['reason'],
            ]);

            return redirect()
                ->back()
                ->with('success', 'Deposit berhasil ditolak.');
        } catch (Throwable $e) {
            Log::error('[DepositController] Failed to reject deposit', [
                'user_id'    => Auth::id(),
                'deposit_id' => $id,
                'error'      => $e->getMessage(),
                'trace'      => $e->getTraceAsString(),
                'type'       => 'deposit_management',
            ]);

            return redirect()
                ->back()
                ->with('error', $e->getMessage());
        }
    }

    public function destroy(int $id): RedirectResponse
    {
        try {
            $this->depositService->destroy($id);

            Log::info('[DepositController] Deposit deleted successfully', [
                'user_id'    => Auth::id(),
                'deposit_id' => $id,
            ]);

            return redirect()
                ->route('deposits.index')
                ->with('success', 'Deposit berhasil dihapus.');
        } catch (Throwable $e) {
            Log::error('[DepositController] Failed to delete deposit', [
                'user_id'    => Auth::id(),
                'deposit_id' => $id,
                'error'      => $e->getMessage(),
                'trace'      => $e->getTraceAsString(),
                'type'       => 'deposit_management',
            ]);

            return redirect()
                ->back()
                ->with('error', $e->getMessage());
        }
    }

    private function getFiltersFromRequest(Request $request): array
    {
        return [
            'search'        => $request->string('search')->toString(),
            'status'        => $request->string('status')->toString(),
            'outlet_id'     => $request->has('outletId') && $request->filled('outletId')
                ? $request->integer('outletId')
                : null,
            'start_date'    => $request->string('startDate')->toString(),
            'end_date'      => $request->string('endDate')->toString(),
            'sortBy'        => $request->string('sortBy', 'created_at')->toString(),
            'sortDirection' => $request->string('sortDirection', 'desc')->toString(),
        ];
    }
}
