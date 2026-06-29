<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Helpers\PaginationHelper;
use App\Http\Controllers\Controller;
use App\Http\Resources\WalletTransaction\WalletTransactionResource;
use App\Services\WalletBalanceService;
use Illuminate\Http\Request;
use Illuminate\Routing\Attributes\Controllers\Middleware;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

#[Middleware('auth')]
class WalletController extends Controller
{
    public function __construct(
        private readonly WalletBalanceService $walletBalanceService,
    ) {}

    public function index(Request $request): Response
    {
        try {
            $filters = $this->getFiltersFromRequest($request);
            $userId = (int) Auth::id();

            $stats = $this->walletBalanceService->getStats($userId);
            $transactions = $this->walletBalanceService->getAll($filters);

            return Inertia::render('Dashboard/Wallet/Index', [
                'stats' => $stats,
                'transactions' => [
                    'data' => WalletTransactionResource::collection($transactions->items())->resolve(),
                    'meta' => PaginationHelper::format($transactions, $request),
                ],
                'filters' => $filters,
            ]);
        } catch (Throwable $e) {
            Log::error('[WalletController] Failed to load wallet index', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'wallet_controller_error',
            ]);

            return Inertia::render('Dashboard/Wallet/Index', [
                'stats' => [
                    'walletBalance'    => 0.00,
                    'availableBalance' => 0.00,
                    'pendingWdrTotal'  => 0.00,
                ],
                'transactions' => ['data' => [], 'meta' => []],
                'filters' => $this->getFiltersFromRequest($request),
                'error'   => 'Gagal memuat data dompet.',
            ]);
        }
    }

    private function getFiltersFromRequest(Request $request): array
    {
        return [
            'search'        => $request->string('search')->toString(),
            'type'          => $request->string('type')->toString(),
            'startDate'     => $request->string('startDate')->toString(),
            'endDate'       => $request->string('endDate')->toString(),
            'page'          => $request->integer('page', 1),
            'perPage'       => $request->integer('perPage', 15),
            'sortBy'        => $request->string('sortBy', 'created_at')->toString(),
            'sortDirection' => $request->string('sortDirection', 'desc')->toString(),
        ];
    }
}
