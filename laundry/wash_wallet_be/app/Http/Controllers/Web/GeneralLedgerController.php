<?php

namespace App\Http\Controllers\Web;

use Illuminate\Routing\Attributes\Controllers\Middleware;

use App\Http\Controllers\Controller;
use App\Http\Resources\Account\AccountResource;
use App\Http\Resources\Outlet\OutletResource;
use App\Services\AccountService;
use App\Services\GeneralLedgerService;
use App\Services\OutletService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

#[Middleware('auth')]
class GeneralLedgerController extends Controller
{
    public function __construct(private readonly GeneralLedgerService $generalLedgerService, private readonly AccountService $accountService, private readonly OutletService $outletService) {}

    public function index(Request $request): Response|RedirectResponse
    {
        try {
            $ownerId = Auth::id();

            $outlets = $this->outletService->getAll();
            $accounts = $this->accountService->getAll([
                'owner_id' => $ownerId,
                'isTransactional' => true,
                'isActive'        => true,
            ]);

            $filters = $this->getFiltersFromRequest($request);

            $ledger = null;

            if ($filters['outletId'] && $filters['accountId']) {
                $ledger = $this->generalLedgerService->getLedger(
                    (int) $filters['outletId'],
                    (int) $filters['accountId'],
                    $filters['startDate'],
                    $filters['endDate']
                );

                $ledger['account'] = AccountResource::make($ledger['account'])->resolve();
                $ledger['openingBalance'] = (float) $ledger['opening_balance'];
                $ledger['closingBalance'] = (float) $ledger['closing_balance'];
                $ledger['transactions'] = $ledger['transactions']->map(function ($transaction) {
                    return [
                        'id'                => $transaction->id,
                        'date'              => $transaction->journalEntry->date->format('Y-m-d'),
                        'transactionNumber' => $transaction->journalEntry->transaction_number,
                        'description'       => $transaction->journalEntry->description,
                        'memo'              => $transaction->memo,
                        'debit'             => (float) $transaction->debit,
                        'credit'            => (float) $transaction->credit,
                        'mutation'          => (float) $transaction->mutation,
                        'runningBalance'    => (float) $transaction->running_balance,
                        'isManual'          => $transaction->journalEntry->is_manual,
                        'referenceType'     => $transaction->journalEntry->reference_type,
                        'referenceId'       => $transaction->journalEntry->reference_id,
                    ];
                })->toArray();
                unset($ledger['opening_balance'], $ledger['closing_balance']);

                Log::info('General ledger viewed successfully', [
                    'outlet_id'          => $filters['outletId'],
                    'account_id'         => $filters['accountId'],
                    'start_date'         => $filters['startDate'],
                    'end_date'           => $filters['endDate'],
                    'transactions_count' => count($ledger['transactions']),
                    'user_id'            => $ownerId,
                    'type'               => 'general_ledger_view',
                ]);
            }

            return Inertia::render('Dashboard/GeneralLedgers/Index', [
                'ledger'   => $ledger,
                'accounts' => AccountResource::collection($accounts)->resolve(),
                'outlets'  => OutletResource::collection($outlets)->resolve(),
                'filters'  => $filters,
            ]);
        } catch (Throwable $e) {
            Log::error('[GeneralLedgerController] Failed to load general ledger page', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'general_ledger_controller_error',
            ]);

            return redirect()->route('dashboard')->with('error', 'Gagal memuat halaman buku besar');
        }
    }

    public function summary(Request $request): Response|RedirectResponse
    {
        try {
            $ownerId = Auth::id();

            $outlets = $this->outletService->getAll(filters: ['ownerId' => $ownerId]);

            $filters = $this->getFiltersFromRequest($request);

            $summary = null;

            if ($filters['outletId']) {
                $summary = $this->generalLedgerService->getLedgerSummary(
                    (int) $filters['outletId'],
                    $filters['startDate'],
                    $filters['endDate'],
                    $filters['accountType'] ?: null
                );

                Log::info('General ledger summary viewed successfully', [
                    'outlet_id'      => $filters['outletId'],
                    'account_type'   => $filters['accountType'],
                    'start_date'     => $filters['startDate'],
                    'end_date'       => $filters['endDate'],
                    'accounts_count' => count($summary['summary']),
                    'user_id'        => $ownerId,
                    'type'           => 'general_ledger_summary_view',
                ]);
            }

            return Inertia::render('Dashboard/Accounting/GeneralLedger/Summary', [
                'summary'      => $summary,
                'outlets'      => OutletResource::collection($outlets)->resolve(),
                'filters'      => $filters,
                'accountTypes' => [
                    ['value' => '', 'label' => 'Semua Tipe'],
                    ['value' => 'asset', 'label' => 'Aset'],
                    ['value' => 'liability', 'label' => 'Liabilitas'],
                    ['value' => 'equity', 'label' => 'Ekuitas'],
                    ['value' => 'revenue', 'label' => 'Pendapatan'],
                    ['value' => 'expense', 'label' => 'Beban'],
                ],
            ]);
        } catch (Throwable $e) {
            Log::error('[GeneralLedgerController] Failed to load general ledger summary page', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'general_ledger_controller_error',
            ]);

            return redirect()->route('dashboard')->with('error', 'Gagal memuat halaman ringkasan buku besar');
        }
    }

    public function export(Request $request): RedirectResponse
    {
        try {
            $validated = $request->validate([
                'outletId'  => 'required|integer|exists:outlets,id',
                'accountId' => 'required|integer|exists:accounts,id',
                'startDate' => 'required|date',
                'endDate'   => 'required|date|after_or_equal:startDate',
                'format'    => 'nullable|string|in:array,pdf,excel',
            ]);

            $format = $validated['format'] ?? 'array';

            $exportData = $this->generalLedgerService->exportLedger(
                $validated['outletId'],
                $validated['accountId'],
                $validated['startDate'],
                $validated['endDate'],
                $format
            );

            Log::info('General ledger exported successfully', [
                'outlet_id'  => $validated['outletId'],
                'account_id' => $validated['accountId'],
                'start_date' => $validated['startDate'],
                'end_date'   => $validated['endDate'],
                'format'     => $format,
                'user_id'    => Auth::id(),
                'type'       => 'general_ledger_export',
            ]);

            return redirect()->back()->with([
                'success'    => 'Buku besar berhasil diekspor',
                'exportData' => $exportData,
            ]);
        } catch (ValidationException $e) {
            Log::warning('General ledger export validation failed', [
                'errors'  => $e->errors(),
                'user_id' => Auth::id(),
                'type'    => 'general_ledger_validation_error',
            ]);

            return redirect()->back()->withErrors($e->errors())->with('error', 'Data tidak valid');
        } catch (Throwable $e) {
            Log::error('[GeneralLedgerController] Failed to export general ledger', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'general_ledger_controller_error',
            ]);

            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function print(Request $request): Response|RedirectResponse
    {
        try {
            $validated = $request->validate([
                'outletId'  => 'required|integer|exists:outlets,id',
                'accountId' => 'required|integer|exists:accounts,id',
                'startDate' => 'required|date',
                'endDate'   => 'required|date|after_or_equal:startDate',
            ]);

            $ledger = $this->generalLedgerService->getLedger(
                $validated['outletId'],
                $validated['accountId'],
                $validated['startDate'],
                $validated['endDate']
            );

            $outlet = $this->outletService->getById($validated['outletId']);

            $ledger['account'] = AccountResource::make($ledger['account'])->resolve();
            $ledger['outlet'] = OutletResource::make($outlet)->resolve();
            $ledger['openingBalance'] = (float) $ledger['opening_balance'];
            $ledger['closingBalance'] = (float) $ledger['closing_balance'];
            $ledger['transactions'] = $ledger['transactions']->map(function ($transaction) {
                return [
                    'id'                => $transaction->id,
                    'date'              => $transaction->journalEntry->date->format('Y-m-d'),
                    'transactionNumber' => $transaction->journalEntry->transaction_number,
                    'description'       => $transaction->journalEntry->description,
                    'memo'              => $transaction->memo,
                    'debit'             => (float) $transaction->debit,
                    'credit'            => (float) $transaction->credit,
                    'mutation'          => (float) $transaction->mutation,
                    'runningBalance'    => (float) $transaction->running_balance,
                    'isManual'          => $transaction->journalEntry->is_manual,
                ];
            })->toArray();
            unset($ledger['opening_balance'], $ledger['closing_balance']);

            Log::info('General ledger print view generated', [
                'outlet_id'  => $validated['outletId'],
                'account_id' => $validated['accountId'],
                'start_date' => $validated['startDate'],
                'end_date'   => $validated['endDate'],
                'user_id'    => Auth::id(),
                'type'       => 'general_ledger_print',
            ]);

            return Inertia::render('Dashboard/Accounting/GeneralLedger/Print', [
                'ledger' => $ledger,
            ]);
        } catch (ValidationException $e) {
            Log::warning('General ledger print validation failed', [
                'errors'  => $e->errors(),
                'user_id' => Auth::id(),
                'type'    => 'general_ledger_validation_error',
            ]);

            return redirect()->back()->withErrors($e->errors())->with('error', 'Data tidak valid');
        } catch (Throwable $e) {
            Log::error('[GeneralLedgerController] Failed to generate print view', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'general_ledger_controller_error',
            ]);

            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function compare(Request $request): Response|RedirectResponse
    {
        try {
            $ownerId = Auth::id();

            $outlets = $this->outletService->getAll(filters: ['ownerId' => $ownerId]);
            $accounts = $this->accountService->getAll([
                'owner_id' => $ownerId,
                'isTransactional' => true,
                'isActive'        => true,
            ]);

            $filters = $this->getFiltersFromRequest($request);

            $comparison = null;

            if ($filters['outletId'] && !empty($filters['accountIds'])) {
                $comparison = $this->generalLedgerService->getLedgerByMultipleAccounts(
                    (int) $filters['outletId'],
                    array_map('intval', $filters['accountIds']),
                    $filters['startDate'],
                    $filters['endDate']
                );

                $comparison['ledgers'] = array_map(function ($ledger) {
                    $ledger['account'] = AccountResource::make($ledger['account'])->resolve();
                    $ledger['transactions'] = $ledger['transactions']->map(function ($transaction) {
                        return [
                            'id'                => $transaction->id,
                            'date'              => $transaction->journalEntry->date->format('Y-m-d'),
                            'transactionNumber' => $transaction->journalEntry->transaction_number,
                            'description'       => $transaction->journalEntry->description,
                            'memo'              => $transaction->memo,
                            'debit'             => (float) $transaction->debit,
                            'credit'            => (float) $transaction->credit,
                            'mutation'          => (float) $transaction->mutation,
                            'runningBalance'    => (float) $transaction->running_balance,
                        ];
                    })->toArray();

                    return $ledger;
                }, $comparison['ledgers']);

                Log::info('General ledger comparison viewed successfully', [
                    'outlet_id'      => $filters['outletId'],
                    'account_ids'    => $filters['accountIds'],
                    'start_date'     => $filters['startDate'],
                    'end_date'       => $filters['endDate'],
                    'accounts_count' => count($filters['accountIds']),
                    'user_id'        => $ownerId,
                    'type'           => 'general_ledger_compare',
                ]);
            }

            return Inertia::render('Dashboard/Accounting/GeneralLedger/Compare', [
                'comparison' => $comparison,
                'accounts'   => AccountResource::collection($accounts)->resolve(),
                'outlets'    => OutletResource::collection($outlets)->resolve(),
                'filters'    => $filters,
            ]);
        } catch (Throwable $e) {
            Log::error('[GeneralLedgerController] Failed to load general ledger comparison page', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'general_ledger_controller_error',
            ]);

            return redirect()->route('dashboard')->with('error', 'Gagal memuat halaman perbandingan buku besar');
        }
    }

    private function getFiltersFromRequest(Request $request): array
    {
        return [
            'outletId' => $request->has('outletId') && $request->filled('outletId')
                ? $request->integer('outletId')
                : null,
            'accountId' => $request->has('accountId') && $request->filled('accountId')
                ? $request->integer('accountId')
                : null,
            'accountType' => $request->string('accountType')->toString() ?: null,
            'accountIds'  => $request->input('accountIds', []),
            'startDate'   => $request->string('startDate', now()->startOfMonth()->format('Y-m-d'))->toString(),
            'endDate'     => $request->string('endDate', now()->endOfMonth()->format('Y-m-d'))->toString(),
        ];
    }
}
