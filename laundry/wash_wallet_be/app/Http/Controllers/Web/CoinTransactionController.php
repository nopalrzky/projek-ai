<?php

namespace App\Http\Controllers\Web;

use Illuminate\Routing\Attributes\Controllers\Middleware;

use App\Helpers\PaginationHelper;
use App\Http\Controllers\Controller;
use App\Http\Resources\CoinTransaction\CoinTransactionResource;
use App\Services\CoinTransactionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

#[Middleware('auth')]
class CoinTransactionController extends Controller
{
    public function __construct(private readonly CoinTransactionService $coinTransactionService) {}

    /**
     * Display a listing of coin transactions
     */
    public function index(Request $request): Response
    {
        try {
            $filters = $this->getFiltersFromRequest($request);

            $transactions = $this->coinTransactionService->getAll(
                filters: $filters,
                page: $filters['page'],
                perPage: $filters['perPage'],
                relations: ['user:id,name,email', 'outlet:id,name,code']
            );

            return Inertia::render('Dashboard/CoinTransactions/Index', [
                'transactions' => [
                    'data' => CoinTransactionResource::collection($transactions->items())->resolve(),
                    'meta' => PaginationHelper::format($transactions, $request),
                ],
                'stats'         => $this->coinTransactionService->getStats(),
                'filterOptions' => [
                    'typeOptions' => [
                        ['value' => 'topup', 'label' => 'Topup'],
                        ['value' => 'commission', 'label' => 'Commission'],
                        ['value' => 'deduction', 'label' => 'Deduction'],
                        ['value' => 'refund', 'label' => 'Refund'],
                    ],
                    'statusOptions' => [
                        ['value' => 'pending', 'label' => 'Pending'],
                        ['value' => 'completed', 'label' => 'Completed'],
                        ['value' => 'failed', 'label' => 'Failed'],
                        ['value' => 'cancelled', 'label' => 'Cancelled'],
                    ],
                ],
                'filters' => [
                    'type'          => $filters['type'] ?? null,
                    'status'        => $filters['status'] ?? null,
                    'startDate'     => $filters['startDate'] ?? null,
                    'endDate'       => $filters['endDate'] ?? null,
                    'sortBy'        => $filters['sortBy'] ?? 'created_at',
                    'sortDirection' => $filters['sortDirection'] ?? 'desc',
                ],
                'flash' => [
                    'success' => session('success'),
                    'error'   => session('error'),
                ],
            ]);
        } catch (Throwable $e) {
            Log::error('[CoinTransactionController] Failed to load coin transactions index', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'coin_transaction_controller_error',
            ]);

            return Inertia::render('Dashboard/CoinTransactions/Index', [
                'transactions' => [
                    'data' => [],
                    'meta' => [
                        'current_page' => 1,
                        'from'         => 0,
                        'last_page'    => 1,
                        'per_page'     => 15,
                        'to'           => 0,
                        'total'        => 0,
                    ],
                ],
                'filterOptions' => [
                    'typeOptions'   => [],
                    'statusOptions' => [],
                ],
                'filters' => [],
                'flash'   => [
                    'error' => 'Gagal memuat data transaksi coin. Silakan coba lagi.',
                ],
            ]);
        }
    }

    /**
     * Display the specified coin transaction
     */
    public function show(int $id): Response|RedirectResponse
    {
        try {
            $coinTransaction = $this->coinTransactionService->getById(
                $id,
                ['user', 'outlet']
            );

            return Inertia::render('Dashboard/CoinTransactions/Show', [
                'coinTransaction' => (new CoinTransactionResource($coinTransaction))->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[CoinTransactionController] Failed to show coin transaction', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'coin_transaction_controller_error',
            ]);

            return redirect()->route('coin-transactions.index')
                ->with('error', 'Transaksi tidak ditemukan atau akses ditolak');
        }
    }

    /**
     * Extract filters from request
     */
    private function getFiltersFromRequest(Request $request): array
    {
        return [
            'type' => $request->has('type') && $request->filled('type')
                ? $request->string('type')->toString()
                : null,
            'status' => $request->has('status') && $request->filled('status')
                ? $request->string('status')->toString()
                : null,
            'userId' => $request->has('userId') && $request->filled('userId')
                ? $request->integer('userId')
                : null,
            'outletId' => $request->has('outletId') && $request->filled('outletId')
                ? $request->integer('outletId')
                : null,
            'referenceType' => $request->has('referenceType') && $request->filled('referenceType')
                ? $request->string('referenceType')->toString()
                : null,
            'referenceId' => $request->has('referenceId') && $request->filled('referenceId')
                ? $request->integer('referenceId')
                : null,
            'startDate' => $request->has('startDate') && $request->filled('startDate')
                ? $request->string('startDate')->toString()
                : null,
            'endDate' => $request->has('endDate') && $request->filled('endDate')
                ? $request->string('endDate')->toString()
                : null,
            'sortBy'        => $request->string('sortBy', 'created_at')->toString(),
            'sortDirection' => $request->string('sortDirection', 'desc')->toString(),
            'page'          => $request->integer('page', 1),
            'perPage'       => $request->integer('perPage', 15),
        ];
    }
}
