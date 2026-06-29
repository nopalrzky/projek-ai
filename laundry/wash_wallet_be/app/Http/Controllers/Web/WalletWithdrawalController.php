<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Helpers\PaginationHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\WalletWithdrawal\StoreWalletWithdrawalRequest;
use App\Http\Resources\WalletWithdrawal\WalletWithdrawalResource;
use App\Http\Resources\OwnerBankAccount\OwnerBankAccountResource;
use App\Services\WalletWithdrawalService;
use App\Services\OwnerBankAccountService;
use App\Services\WalletBalanceService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Attributes\Controllers\Middleware;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

#[Middleware('auth')]
class WalletWithdrawalController extends Controller
{
    public function __construct(
        private readonly WalletWithdrawalService $walletWithdrawalService,
        private readonly OwnerBankAccountService $ownerBankAccountService,
        private readonly WalletBalanceService $walletBalanceService,
    ) {}

    public function index(Request $request): Response
    {
        try {
            $filters = $this->getFiltersFromRequest($request);
            $withdrawals = $this->walletWithdrawalService->getAll($filters, $filters['page'], $filters['perPage']);

            return Inertia::render('Dashboard/WalletWithdrawals/Index', [
                'withdrawals' => [
                    'data' => WalletWithdrawalResource::collection($withdrawals->items())->resolve(),
                    'meta' => PaginationHelper::format($withdrawals, $request),
                ],
                'filters' => $filters,
            ]);
        } catch (Throwable $e) {
            Log::error('[WalletWithdrawalController] Failed to load withdrawals index', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'wallet_withdrawal_controller_error',
            ]);

            return Inertia::render('Dashboard/WalletWithdrawals/Index', [
                'withdrawals' => ['data' => [], 'meta' => []],
                'filters'     => $this->getFiltersFromRequest($request),
                'error'       => 'Gagal memuat data penarikan saldo.',
            ]);
        }
    }

    public function create(): Response|RedirectResponse
    {
        try {
            $userId = (int) Auth::id();
            $stats = $this->walletBalanceService->getStats($userId);
            $accounts = $this->ownerBankAccountService->getAll(['isActive' => true]);

            return Inertia::render('Dashboard/WalletWithdrawals/Create', [
                'stats'    => $stats,
                'accounts' => OwnerBankAccountResource::collection($accounts)->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[WalletWithdrawalController] Failed to load withdrawal form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'wallet_withdrawal_controller_error',
            ]);

            return redirect()->route('wallet-withdrawals.index')
                ->with('error', 'Gagal memuat formulir penarikan.');
        }
    }

    public function store(StoreWalletWithdrawalRequest $request): RedirectResponse
    {
        try {
            $withdrawal = $this->walletWithdrawalService->store($request->validated());

            return redirect()->route('wallet-withdrawals.show', $withdrawal->id)
                ->with('success', 'Permintaan penarikan saldo berhasil dikirim.');
        } catch (Throwable $e) {
            Log::error('[WalletWithdrawalController] Failed to store withdrawal request', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'wallet_withdrawal_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    public function show(int $id): Response|RedirectResponse
    {
        try {
            $withdrawal = $this->walletWithdrawalService->getById($id);

            return Inertia::render('Dashboard/WalletWithdrawals/Show', [
                'withdrawal' => (new WalletWithdrawalResource($withdrawal))->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[WalletWithdrawalController] Failed to show withdrawal details', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'wallet_withdrawal_controller_error',
                'id'      => $id,
            ]);

            return redirect()->route('wallet-withdrawals.index')
                ->with('error', 'Data penarikan tidak ditemukan.');
        }
    }

    public function cancel(int $id): RedirectResponse
    {
        try {
            $this->walletWithdrawalService->cancel($id);

            return redirect()->back()
                ->with('success', 'Permintaan penarikan saldo berhasil dibatalkan.');
        } catch (Throwable $e) {
            Log::error('[WalletWithdrawalController] Failed to cancel withdrawal request', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'wallet_withdrawal_controller_error',
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
