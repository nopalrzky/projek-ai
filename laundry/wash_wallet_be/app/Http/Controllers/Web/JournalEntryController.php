<?php

namespace App\Http\Controllers\Web;

use Illuminate\Routing\Attributes\Controllers\Middleware;

use App\Helpers\PaginationHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\JournalEntry\StoreJournalEntryRequest;
use App\Http\Requests\JournalEntry\UpdateJournalEntryRequest;
use App\Http\Resources\JournalEntry\JournalEntryResource;
use App\Http\Resources\Outlet\OutletResource;
use App\Http\Resources\Account\AccountResource;
use App\Services\JournalEntryService;
use App\Services\OutletService;
use App\Services\AccountService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

#[Middleware('auth')]
class JournalEntryController extends Controller
{
    public function __construct(private readonly JournalEntryService $journalEntryService, private readonly OutletService $outletService, private readonly AccountService $accountService) {}

    /**
     * Display a listing of journal entries
     */
    public function index(Request $request): Response
    {
        try {
            $filters = $this->getFiltersFromRequest($request);

            $journalEntries = $this->journalEntryService->getAll(
                $filters,
                $filters['page'],
                $filters['perPage'],
                [
                    'outlet',
                    'journalDetails',
                    'journalDetails.account',
                ]
            );

            $outlets = $this->outletService->getAll();

            return Inertia::render('Dashboard/JournalEntries/Index', [
                'journalEntries' => [
                    'data' => JournalEntryResource::collection($journalEntries->items())->resolve(),
                    'meta' => PaginationHelper::format($journalEntries, $request),
                ],
                'filterOptions' => [
                    'outlets' => OutletResource::collection($outlets)->resolve(),
                ],
                'filters' => $filters,
                'flash'   => [
                    'success' => session('success'),
                    'error'   => session('error'),
                ],
            ]);
        } catch (Throwable $e) {
            Log::error('[JournalEntryController] Failed to load journal entries index', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'journal_entry_controller_error',
            ]);

            return Inertia::render('Dashboard/JournalEntries/Index', [
                'journalEntries' => [
                    'data' => [],
                    'meta' => [],
                ],
                'filterOptions' => [
                    'outlets' => [],
                ],
                'filters' => [],
                'flash'   => [
                    'error' => 'Gagal memuat daftar jurnal entry',
                ],
            ]);
        }
    }

    /**
     * Show the form for creating a new journal entry
     */
    public function create(): Response|RedirectResponse
    {
        try {
            $accounts = $this->accountService->getAll([
                'isTransactional' => true,
            ]);

            $outlets = $this->outletService->getAll();

            return Inertia::render('Dashboard/JournalEntries/Create', [
                'accounts' => AccountResource::collection($accounts)->resolve(),
                'outlets'  => OutletResource::collection($outlets)->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[JournalEntryController] Failed to load journal entry create form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'journal_entry_controller_error',
            ]);

            return redirect()->route('journal-entries.index')
                ->with('error', 'Gagal memuat formulir pembuatan jurnal entry');
        }
    }

    /**
     * Store a newly created journal entry
     */
    public function store(StoreJournalEntryRequest $request): RedirectResponse
    {
        try {
            $journalEntry = $this->journalEntryService->store(
                $request->validated()
            );

            return redirect()->route('journal-entries.index')
                ->with('success', "Jurnal Entry '{$journalEntry->transaction_number}' berhasil ditambahkan");
        } catch (Throwable $e) {
            Log::error('[JournalEntryController] Failed to create journal entry', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'journal_entry_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Display the specified journal entry
     */
    public function show(int $journalEntryId): Response|RedirectResponse
    {
        try {
            $journalEntry = $this->journalEntryService->getById(
                $journalEntryId,
                [
                    'outlet',
                    'journalDetails',
                    'journalDetails.account',
                    'reference',
                ]
            );

            return Inertia::render('Dashboard/JournalEntries/Show', [
                'journalEntry' => (new JournalEntryResource($journalEntry))->resolve(),
                'outlet'       => (new OutletResource($journalEntry->outlet))->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[JournalEntryController] Failed to show journal entry', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'journal_entry_controller_error',
            ]);

            return redirect()->route('journal-entries.index')
                ->with('error', 'Jurnal entry tidak ditemukan atau akses ditolak');
        }
    }

    /**
     * Show the form for editing the specified journal entry
     */
    public function edit(int $journal_entry): Response|RedirectResponse
    {
        try {
            $journalEntry = $this->journalEntryService->getById(
                $journal_entry,
                [
                    'outlet:id,name,code',
                    'journalDetails.account:id,code,name,type',
                ]
            );

            $accounts = $this->accountService->getAll([
                'isTransactional' => true,
                'isActive'        => true,
            ]);

            return Inertia::render('Dashboard/JournalEntries/Edit', [
                'journalEntry' => (new JournalEntryResource($journalEntry))->resolve(),
                'accounts'     => AccountResource::collection($accounts)->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[JournalEntryController] Failed to load journal entry edit form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'journal_entry_controller_error',
            ]);

            return redirect()->route('journal-entries.index')
                ->with('error', 'Jurnal entry tidak ditemukan atau akses ditolak');
        }
    }

    /**
     * Update the specified journal entry
     */
    public function update(
        UpdateJournalEntryRequest $request,
        int $journal_entry
    ): RedirectResponse {
        try {
            $journalEntry = $this->journalEntryService->update(
                $journal_entry,
                $request->validated()
            );

            return redirect()->route('journal-entries.show', $journalEntry->id)
                ->with('success', "Jurnal Entry '{$journalEntry->transaction_number}' berhasil diperbarui");
        } catch (Throwable $e) {
            Log::error('[JournalEntryController] Failed to update journal entry', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'journal_entry_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Remove the specified journal entry
     */
    public function destroy(int $journal_entry): RedirectResponse
    {
        try {
            $deleted = $this->journalEntryService->destroy($journal_entry);

            if ($deleted) {
                return redirect()->route('journal-entries.index')
                    ->with('success', 'Jurnal entry berhasil dihapus');
            }

            return redirect()->back()
                ->with('error', 'Gagal menghapus jurnal entry');
        } catch (Throwable $e) {
            Log::error('[JournalEntryController] Failed to delete journal entry', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'journal_entry_controller_error',
            ]);

            return redirect()->back()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Restore soft deleted journal entry
     */
    public function restore(int $journal_entry): RedirectResponse
    {
        try {
            $journalEntry = $this->journalEntryService->restore($journal_entry);

            return redirect()->route('journal-entries.show', $journalEntry->id)
                ->with('success', "Jurnal Entry '{$journalEntry->transaction_number}' berhasil dipulihkan");
        } catch (Throwable $e) {
            Log::error('[JournalEntryController] Failed to restore journal entry', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'journal_entry_controller_error',
            ]);

            return redirect()->back()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Permanently delete journal entry
     */
    public function forceDestroy(int $journal_entry): RedirectResponse
    {
        try {
            $deleted = $this->journalEntryService->forceDestroy($journal_entry);

            if ($deleted) {
                return redirect()->route('journal-entries.index')
                    ->with('success', 'Jurnal entry berhasil dihapus permanen');
            }

            return redirect()->back()
                ->with('error', 'Gagal menghapus jurnal entry secara permanen');
        } catch (Throwable $e) {
            Log::error('[JournalEntryController] Failed to force delete journal entry', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'journal_entry_controller_error',
            ]);

            return redirect()->back()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Get filters from request
     */
    private function getFiltersFromRequest(Request $request): array
    {
        return [
            'search'  => $request->string('search')->toString(),
            'outletId' => $request->filled('outletId')
                ? $request->integer('outletId')
                : null,
            'isManual' => $request->has('isManual') && $request->filled('isManual')
                ? $request->boolean('isManual')
                : null,
            'referenceType' => $request->filled('referenceType')
                ? $request->string('referenceType')->toString()
                : null,
            'dateFrom'  => $request->string('dateFrom')->toString(),
            'dateTo'    => $request->string('dateTo')->toString(),
            'minAmount' => $request->filled('minAmount')
                ? $request->float('minAmount')
                : null,
            'maxAmount' => $request->filled('maxAmount')
                ? $request->float('maxAmount')
                : null,
            'balanced' => $request->has('balanced') && $request->filled('balanced')
                ? $request->boolean('balanced')
                : null,
            'sortBy'        => $request->string('sortBy', 'date')->toString(),
            'sortDirection' => $request->string('sortDirection', 'desc')->toString(),
            'perPage'       => $request->integer('perPage', 15),
            'page'          => $request->integer('page', 1),
        ];
    }
}
