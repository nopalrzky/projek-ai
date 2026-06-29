<?php

namespace App\Http\Controllers\Web;

use Illuminate\Routing\Attributes\Controllers\Middleware;

use App\Helpers\PaginationHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\Loan\StoreLoanRequest;
use App\Http\Requests\Loan\UpdateLoanRequest;
use App\Http\Resources\Account\AccountResource;
use App\Http\Resources\Employee\EmployeeResource;
use App\Http\Resources\Loan\LoanResource;
use App\Http\Resources\Outlet\OutletResource;
use App\Services\AccountService;
use App\Services\EmployeeService;
use App\Services\LoanService;
use App\Services\OutletService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

#[Middleware('auth')]
class LoanController extends Controller
{
    public function __construct(private readonly LoanService $loanService, private readonly EmployeeService $employeeService, private readonly AccountService $accountService, private readonly OutletService $outletService) {}

    public function index(Request $request): Response
    {
        try {
            $filters = $this->getFiltersFromRequest($request);
            $loans = $this->loanService->getAll(
                $filters,
                $filters['page'],
                $filters['perPage'],
                ['employee', 'loanLogs', 'sourceAccount']
            );

            $employees = $this->employeeService->getAll();
            $outlets = $this->outletService->getAll();

            return Inertia::render('Dashboard/Loans/Index', [
                'loans' => [
                    'data' => LoanResource::collection($loans->items())->resolve(),
                    'meta' => PaginationHelper::format($loans, $request),
                ],
                'filterOptions' => [
                    'employees' => EmployeeResource::collection($employees)->resolve(),
                    'outlets'   => OutletResource::collection($outlets)->resolve(),
                ],
                'filters' => $filters,
                'flash'   => [
                    'success' => session('success'),
                    'error'   => session('error'),
                ],
            ]);
        } catch (Throwable $e) {
            Log::error('[LoanController] Failed to load loans index', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'loan_controller_error',
            ]);

            return Inertia::render('Dashboard/Loans/Index', [
                'loans' => [
                    'data' => [],
                    'meta' => [],
                ],
                'filterOptions' => [
                    'employees' => [],
                    'outlets'   => [],
                ],
                'filters' => [],
                'flash'   => [
                    'error' => 'Gagal memuat data kasbon',
                ],
            ]);
        }
    }

    public function create(): Response|RedirectResponse
    {
        try {
            $outlets = $this->outletService->getAll();
            $sourceAccounts = $this->accountService->getAll([
                'owner_id' => Auth::id(),
                'type'            => 'asset',
                'isTransactional' => true,
            ]);

            return Inertia::render('Dashboard/Loans/Create', [
                'outlets'        => OutletResource::collection($outlets)->resolve(),
                'sourceAccounts' => AccountResource::collection($sourceAccounts)->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[LoanController] Failed to load loan create form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'loan_controller_error',
            ]);

            return redirect()->route('loans.index')
                ->with('error', 'Gagal memuat formulir pembuatan kasbon');
        }
    }

    public function store(StoreLoanRequest $request): RedirectResponse
    {
        try {
            $this->loanService->store($request->validated());

            return redirect()->route('loans.index')
                ->with('success', 'Kasbon berhasil dibuat');
        } catch (Throwable $e) {
            Log::error('[LoanController] Failed to store new loan', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'loan_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    public function show(int $id): Response|RedirectResponse
    {
        try {
            $loan = $this->loanService->getById($id, ['employee', 'loanLogs', 'sourceAccount']);

            return Inertia::render('Dashboard/Loans/Show', [
                'loan' => new LoanResource($loan),
            ]);
        } catch (Throwable $e) {
            Log::error('[LoanController] Failed to load loan show page', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'loan_controller_error',
            ]);

            return redirect()->route('loans.index')
                ->with('error', 'Gagal memuat data kasbon');
        }
    }

    public function edit(int $id): Response|RedirectResponse
    {
        try {
            $loan = $this->loanService->getById($id, ['employee', 'loanLogs', 'sourceAccount']);

            $employees = $this->employeeService->getAll();
            $sourceAccounts = $this->accountService->getAll(
                filters: [
                    'isTransactional' => true,
                    'sortBy' => 'code',
                    'sortDirection' => 'asc',
                ],
                page: null,
                perPage: null
            );

            return Inertia::render('Dashboard/Loans/Edit', [
                'loan'           => new LoanResource($loan),
                'employees'      => EmployeeResource::collection($employees)->resolve(),
                'sourceAccounts' => AccountResource::collection($sourceAccounts)->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[LoanController] Failed to load loan edit form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'loan_controller_error',
            ]);

            return redirect()->route('loans.index')
                ->with('error', 'Gagal memuat formulir edit kasbon');
        }
    }

    public function update(UpdateLoanRequest $request, int $id): RedirectResponse
    {
        try {
            $this->loanService->update($id, $request->validated());

            return redirect()->route('loans.index')
                ->with('success', 'Kasbon berhasil diperbarui');
        } catch (Throwable $e) {
            Log::error('[LoanController] Failed to update loan', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'loan_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    public function destroy(int $id): RedirectResponse
    {
        try {
            $this->loanService->destroy($id);

            return redirect()->route('loans.index')
                ->with('success', 'Kasbon berhasil dihapus');
        } catch (Throwable $e) {
            Log::error('[LoanController] Failed to delete loan', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'loan_controller_error',
            ]);

            return redirect()->back()
                ->with('error', $e->getMessage());
        }
    }

    private function getFiltersFromRequest(Request $request): array
    {
        return [
            'search'        => $request->filled('search') ? $request->string('search')->toString() : null,
            'status'        => $request->filled('status') ? $request->string('status')->toString() : null,
            'outletId'      => $request->has('outletId') && $request->filled('outletId')
                ? $request->integer('outletId')
                : null,
            'employeeId'    => $request->has('employeeId') && $request->filled('employeeId')
                ? $request->integer('employeeId')
                : null,
            'repaymentType' => $request->filled('repaymentType') ? $request->string('repaymentType')->toString() : null,
            'loanDateFrom'  => $request->has('loanDate.from') && $request->filled('loanDate.from')
                ? $request->date('loanDate.from')->format('Y-m-d')
                : null,
            'loanDateTo'    => $request->has('loanDate.to') && $request->filled('loanDate.to')
                ? $request->date('loanDate.to')->format('Y-m-d')
                : null,
            'minAmount'     => $request->has('minAmount') && $request->filled('minAmount')
                ? $request->float('minAmount')
                : null,
            'maxAmount'     => $request->has('maxAmount') && $request->filled('maxAmount')
                ? $request->float('maxAmount')
                : null,
            'minRemainingAmount' => $request->has('minRemainingAmount') && $request->filled('minRemainingAmount')
                ? $request->float('minRemainingAmount')
                : null,
            'maxRemainingAmount' => $request->has('maxRemainingAmount') && $request->filled('maxRemainingAmount')
                ? $request->float('maxRemainingAmount')
                : null,
            'minInstallmentAmount' => $request->has('minInstallmentAmount') && $request->filled('minInstallmentAmount')
                ? $request->float('minInstallmentAmount')
                : null,
            'maxInstallmentAmount' => $request->has('maxInstallmentAmount') && $request->filled('maxInstallmentAmount')
                ? $request->float('maxInstallmentAmount')
                : null,
            'sortBy'        => $request->string('sortBy', 'loanDate')->toString(),
            'sortDirection' => $request->string('sortDirection', 'desc')->toString(),
            'page'          => $request->integer('page', 1),
            'perPage'       => $request->integer('perPage', 15),
        ];
    }
}
