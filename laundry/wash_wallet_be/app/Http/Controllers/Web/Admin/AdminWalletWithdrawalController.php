<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web\Admin;

use App\Helpers\PaginationHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\WalletWithdrawal\ProcessWithdrawalRequest;
use App\Http\Requests\WalletWithdrawal\RejectWithdrawalRequest;
use App\Http\Resources\WalletWithdrawal\WalletWithdrawalResource;
use App\Services\WalletWithdrawalService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Attributes\Controllers\Middleware;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

#[Middleware('auth')]
#[Middleware('role:super_admin')]
class AdminWalletWithdrawalController extends Controller
{
    public function __construct(
        private readonly WalletWithdrawalService $walletWithdrawalService,
    ) {}

    public function index(Request $request): Response
    {
        try {
            $filters = $this->getFiltersFromRequest($request);
            $withdrawals = $this->walletWithdrawalService->getAll($filters, $filters['page'], $filters['perPage'], ['user']);

            return Inertia::render('Dashboard/Admin/WalletWithdrawals/Index', [
                'withdrawals' => [
                    'data' => WalletWithdrawalResource::collection($withdrawals->items())->resolve(),
                    'meta' => PaginationHelper::format($withdrawals, $request),
                ],
                'filters' => $filters,
            ]);
        } catch (Throwable $e) {
            Log::error('[AdminWalletWithdrawalController] Failed to load withdrawals queue', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'admin_wallet_withdrawal_controller_error',
            ]);

            return Inertia::render('Dashboard/Admin/WalletWithdrawals/Index', [
                'withdrawals' => ['data' => [], 'meta' => []],
                'filters'     => $this->getFiltersFromRequest($request),
                'error'       => 'Gagal memuat antrean penarikan.',
            ]);
        }
    }

    public function show(int $id): Response|RedirectResponse
    {
        try {
            $withdrawal = $this->walletWithdrawalService->getById($id, ['user', 'ownerBankAccount', 'processedByUser']);

            return Inertia::render('Dashboard/Admin/WalletWithdrawals/Show', [
                'withdrawal' => (new WalletWithdrawalResource($withdrawal))->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[AdminWalletWithdrawalController] Failed to show withdrawal details', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'admin_wallet_withdrawal_controller_error',
                'id'      => $id,
            ]);

            return redirect()->route('admin.wallet-withdrawals.index')
                ->with('error', 'Data penarikan tidak ditemukan.');
        }
    }

    public function process(int $id): RedirectResponse
    {
        try {
            $this->walletWithdrawalService->process($id);

            return redirect()->back()
                ->with('success', 'Status penarikan berhasil diubah menjadi Diproses.');
        } catch (Throwable $e) {
            Log::error('[AdminWalletWithdrawalController] Failed to change status to processing', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'admin_wallet_withdrawal_controller_error',
                'id'      => $id,
            ]);

            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function markPaid(ProcessWithdrawalRequest $request, int $id): RedirectResponse
    {
        try {
            $this->walletWithdrawalService->markPaid($id, $request->validated());

            return redirect()->back()
                ->with('success', 'Penarikan saldo berhasil diselesaikan.');
        } catch (Throwable $e) {
            Log::error('[AdminWalletWithdrawalController] Failed to mark withdrawal as paid', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'admin_wallet_withdrawal_controller_error',
                'id'      => $id,
            ]);

            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function reject(RejectWithdrawalRequest $request, int $id): RedirectResponse
    {
        try {
            $this->walletWithdrawalService->reject($id, $request->validated()['reason']);

            return redirect()->back()
                ->with('success', 'Penarikan saldo berhasil ditolak.');
        } catch (Throwable $e) {
            Log::error('[AdminWalletWithdrawalController] Failed to reject withdrawal request', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'admin_wallet_withdrawal_controller_error',
                'id'      => $id,
            ]);

            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    private function getFiltersFromRequest(Request $request): array
    {
        return [
            'search'        => $request->string('search')->toString(),
            'status'        => $request->string('status')->toString(),
            'startDate'     => $request->string('startDate')->toString(),
            'endDate'       => $request->string('endDate')->toString(),
            'page'          => $request->integer('page', 1),
            'perPage'       => $request->integer('perPage', 15),
            'sortBy'        => $request->string('sortBy', 'created_at')->toString(),
            'sortDirection' => $request->string('sortDirection', 'desc')->toString(),
        ];
    }
}
