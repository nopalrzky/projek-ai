<?php

namespace App\Http\Controllers\Web;

use Illuminate\Routing\Attributes\Controllers\Middleware;

use App\Helpers\PaginationHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\Expense\StoreExpenseRequest;
use App\Http\Requests\Expense\UpdateExpenseRequest;
use App\Http\Resources\Expense\ExpenseResource;
use App\Http\Resources\Outlet\OutletResource;
use App\Http\Resources\Account\AccountResource;
use App\Services\ExpenseService;
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
class ExpenseController extends Controller
{
    public function __construct(private readonly ExpenseService $expenseService, private readonly OutletService $outletService, private readonly AccountService $accountService) {}

    /**
     * Display a listing of expenses
     */
    public function index(Request $request): Response
    {
        try {
            $filters = $this->getFiltersFromRequest($request);

            $expenses = $this->expenseService->getAll(
                $filters,
                $filters['page'] ?? 1,
                $filters['perPage'] ?? 15,
                relations: ['outlet:id,name,code', 'employee:id,name', 'user:id,name', 'expenseAccount', 'sourceAccount']
            );

            $outlets = $this->outletService->getAll();

            $expenseAccounts = $this->accountService->getAll(['ownerId' => Auth::id(), 'type' => 'expense', 'isTransactional' => true]);

            $sourceAccounts = $this->accountService->getAll(['ownerId' => Auth::id(), 'type' => 'asset', 'isTransactional' => true]);

            return Inertia::render('Dashboard/Expenses/Index', [
                'expenses' => [
                    'data' => ExpenseResource::collection($expenses->items())->resolve(),
                    'meta' => PaginationHelper::format($expenses, $request),
                ],
                'filters' => [
                    'search' => $filters['search'] ?? '',
                    'outletId' => $filters['outletId'] ?? null,
                    'expenseAccountId' => $filters['expenseAccountId'] ?? null,
                    'sourceAccountId' => $filters['sourceAccountId'] ?? null,
                    'startDate' => $filters['startDate'] ?? '',
                    'endDate' => $filters['endDate'] ?? '',
                    'minAmount' => $filters['minAmount'] ?? null,
                    'maxAmount' => $filters['maxAmount'] ?? null,
                    'hasAttachment' => $filters['hasAttachment'] ?? null,
                    'sortBy' => $filters['sortBy'] ?? 'date',
                    'sortDirection' => $filters['sortDirection'] ?? 'desc',
                ],
                'filterOptions' => [
                    'outlets' => OutletResource::collection($outlets)->resolve(),
                    'expenseAccounts' => AccountResource::collection($expenseAccounts)->resolve(),
                    'sourceAccounts' => AccountResource::collection($sourceAccounts)->resolve(),
                ],
                'flash' => [
                    'success' => $request->session()->get('success'),
                    'error' => $request->session()->get('error'),
                ],
            ]);
        } catch (Throwable $e) {
            Log::error('[ExpenseController] Failed to load expenses index', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'expense_controller_error',
            ]);

            return Inertia::render('Dashboard/Expenses/Index', [
                'expenses' => [
                    'data' => [],
                    'meta' => [],
                ],
                'filters' => [
                    'search' => '',
                    'outletId' => null,
                    'expenseAccountId' => null,
                    'sourceAccountId' => null,
                    'startDate' => '',
                    'endDate' => '',
                    'minAmount' => null,
                    'maxAmount' => null,
                    'hasAttachment' => null,
                    'sortBy' => 'date',
                    'sortDirection' => 'desc',
                ],
                'filterOptions' => [
                    'outlets' => [],
                    'expenseAccounts' => [],
                    'sourceAccounts' => [],
                ],
                'error' => 'Gagal memuat data. Silakan coba lagi.',
            ]);
        }
    }

    /**
     * Show the form for creating a new expense
     */
    public function create(): Response|RedirectResponse
    {
        try {
            $outlets = $this->outletService->getAll();

            return Inertia::render('Dashboard/Expenses/Create', [
                'outlets' => OutletResource::collection($outlets)->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[ExpenseController] Failed to load expense create form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'expense_controller_error',
            ]);

            return redirect()->route('expenses.index')
                ->with('error', 'Gagal memuat formulir pembuatan Pengeluaran');
        }
    }

    /**
     * Store a newly created expense
     */
    public function store(StoreExpenseRequest $request): RedirectResponse
    {
        try {
            $this->expenseService->store(
                $request->validated(),
            );

            return redirect()->route('expenses.index')
                ->with('success', 'Pengeluaran berhasil ditambahkan');
        } catch (Throwable $e) {
            Log::error('[ExpenseController] Failed to create expense', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'expense_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Display the specified expense
     */
    public function show(int $id): Response|RedirectResponse
    {
        try {
            $expense = $this->expenseService->getById(
                id: $id,
                relations: [
                    'outlet',
                    'employee',
                    'user',
                    'expenseAccount',
                    'sourceAccount',
                    'journalEntry',
                ]
            );

            $sourceAccounts = $this->accountService->getAll([
                'ownerId' => Auth::id(),
                'type' => 'asset',
                'isTransactional' => true,
            ]);

            return Inertia::render('Dashboard/Expenses/Show', [
                'expense' => (new ExpenseResource($expense))->resolve(),
                'sourceAccounts' => AccountResource::collection($sourceAccounts)->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[ExpenseController] Failed to show expense', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'expense_controller_error',
            ]);

            return redirect()->route('expenses.index')
                ->with('error', 'Pengeluaran tidak ditemukan atau akses ditolak');
        }
    }

    /**
     * Show the form for editing the specified expense
     */
    public function edit(Request $request, int $id): Response|RedirectResponse
    {
        try {
            $expense = $this->expenseService->getById(
                id: $id,
                relations: ['outlet:id,name,code,city_name', 'expenseAccount', 'sourceAccount']
            );

            $user = Auth::user();
            $outlets = $this->outletService->getAll();

            $expenseAccounts = $this->accountService->getAll(
                filters: [
                    'outletId' => $expense->outletId,
                    'includeCommonOutletAccounts' => true,
                    'type' => 'expense',
                    'isTransactional' => true,
                    'isActive' => true,
                    'sortBy' => 'code',
                    'sortDirection' => 'asc',
                ],
                page: null,
                perPage: null
            );

            $sourceAccounts = $this->accountService->getAll(
                filters: [
                    'outletId' => $expense->outletId,
                    'includeCommonOutletAccounts' => true,
                    'type' => 'asset',
                    'accountRoles' => AccountService::FUNDING_ACCOUNT_ROLES,
                    'isTransactional' => true,
                    'isActive' => true,
                    'sortBy' => 'code',
                    'sortDirection' => 'asc',
                ],
                page: null,
                perPage: null
            );

            return Inertia::render('Dashboard/Expenses/Edit', [
                'expense' => (new ExpenseResource($expense))->resolve(),
                'outlets' => OutletResource::collection($outlets)->resolve(),
                'expenseAccounts' => AccountResource::collection($expenseAccounts)->resolve(),
                'sourceAccounts' => AccountResource::collection($sourceAccounts)->resolve(),
                'flash' => [
                    'error' => $request->session()->get('error'),
                ],
            ]);
        } catch (Throwable $e) {
            Log::error('[ExpenseController] Failed to load expense edit form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'expense_controller_error',
            ]);

            return redirect()->route('expenses.index')
                ->with('error', 'Pengeluaran tidak ditemukan atau akses ditolak');
        }
    }

    /**
     * Update the specified expense
     */
    public function update(UpdateExpenseRequest $request, int $id): RedirectResponse
    {
        try {
            $this->expenseService->update(
                id: $id,
                data: $request->validated(),
                attachment: $request->file('attachment')
            );

            return redirect()->route('expenses.index')
                ->with('success', 'Data Pengeluaran berhasil diperbarui');
        } catch (Throwable $e) {
            Log::error('[ExpenseController] Failed to update expense', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'expense_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Approve expense
     */
    public function approve(Request $request, int $id): RedirectResponse
    {
        try {
            $request->validate([
                'sourceAccountId' => 'nullable|integer|exists:accounts,id',
            ]);

            $sourceAccountId = $request->filled('sourceAccountId')
                ? $request->integer('sourceAccountId')
                : null;

            $this->expenseService->approve(
                id: $id,
                sourceAccountId: $sourceAccountId
            );

            return redirect()->back()
                ->with('success', 'Pengeluaran berhasil disetujui');
        } catch (Throwable $e) {
            Log::error('[ExpenseController] Failed to approve expense', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'expense_controller_error',
            ]);

            return redirect()->back()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Reject expense
     */
    public function reject(Request $request, int $id): RedirectResponse
    {
        try {
            $request->validate([
                'rejectionReason' => 'required|string|max:500',
            ]);

            $this->expenseService->reject(
                id: $id,
                reason: $request->string('rejectionReason')->toString()
            );

            return redirect()->back()
                ->with('success', 'Pengeluaran berhasil ditolak');
        } catch (Throwable $e) {
            Log::error('[ExpenseController] Failed to reject expense', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'expense_controller_error',
            ]);

            return redirect()->back()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Remove the specified expense
     */
    public function destroy(int $id): RedirectResponse
    {
        try {
            $deleted = $this->expenseService->destroy($id);

            if ($deleted) {
                return redirect()->route('expenses.index')
                    ->with('success', 'Pengeluaran berhasil dihapus');
            }

            return redirect()->back()
                ->with('error', 'Gagal menghapus Pengeluaran');
        } catch (Throwable $e) {
            Log::error('[ExpenseController] Failed to delete expense', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'expense_controller_error',
            ]);

            return redirect()->back()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Restore soft deleted expense
     */
    public function restore(int $id): RedirectResponse
    {
        try {
            $expense = $this->expenseService->restore($id);

            return redirect()->route('expenses.show', $expense->id)
                ->with('success', 'Pengeluaran berhasil dipulihkan');
        } catch (Throwable $e) {
            Log::error('[ExpenseController] Failed to restore expense', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'expense_controller_error',
            ]);

            return redirect()->back()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Permanently delete expense
     */
    public function forceDestroy(int $id): RedirectResponse
    {
        try {
            $deleted = $this->expenseService->forceDestroy($id);

            if ($deleted) {
                return redirect()->route('expenses.index')
                    ->with('success', 'Pengeluaran berhasil dihapus permanen');
            }

            return redirect()->back()
                ->with('error', 'Gagal menghapus Pengeluaran secara permanen');
        } catch (Throwable $e) {
            Log::error('[ExpenseController] Failed to force delete expense', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'expense_controller_error',
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
            'search' => $request->string('search')->toString(),
            'outletId' => $request->filled('outletId')
                ? $request->integer('outletId')
                : null,
            'expenseAccountId' => $request->filled('expenseAccountId')
                ? $request->integer('expenseAccountId')
                : null,
            'sourceAccountId' => $request->filled('sourceAccountId')
                ? $request->integer('sourceAccountId')
                : null,
            'startDate' => $request->string('startDate')->toString(),
            'endDate' => $request->string('endDate')->toString(),
            'minAmount' => $request->filled('minAmount')
                ? $request->float('minAmount')
                : null,
            'maxAmount' => $request->filled('maxAmount')
                ? $request->float('maxAmount')
                : null,
            'hasAttachment' => $request->has('hasAttachment') && $request->filled('hasAttachment')
                ? $request->boolean('hasAttachment')
                : null,
            'sortBy' => $request->string('sortBy', 'date')->toString(),
            'sortDirection' => $request->string('sortDirection', 'desc')->toString(),
            'page' => $request->integer('page', 1),
            'perPage' => $request->integer('perPage', 15),
        ];
    }
}
