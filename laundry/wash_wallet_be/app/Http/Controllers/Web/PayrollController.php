<?php

namespace App\Http\Controllers\Web;

use Illuminate\Routing\Attributes\Controllers\Middleware;

use App\Helpers\PaginationHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\Payroll\StorePayrollRequest;
use App\Http\Requests\Payroll\UpdatePayrollRequest;
use App\Http\Resources\Payroll\PayrollResource;
use App\Http\Resources\Outlet\OutletResource;
use App\Http\Resources\Account\AccountResource;
use App\Services\PayrollService;
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
class PayrollController extends Controller
{
    public function __construct(private readonly PayrollService $payrollService, private readonly OutletService $outletService, private readonly AccountService $accountService) {}

    /**
     * Display a listing of payrolls
     */
    public function index(Request $request): Response
    {
        try {
            $filters = $this->getFiltersFromRequest($request);

            $payrolls = $this->payrollService->getAll(
                filters: $filters,
                page: $filters['page'] ?? 1,
                perPage: $filters['perPage'] ?? 15,
                relations: ['employee.outlet:id,name,code', 'employee', 'bankAccount']
            );

            $outlets = $this->outletService->getAll();

            return Inertia::render('Dashboard/Payrolls/Index', [
                'payrolls' => [
                    'data' => PayrollResource::collection($payrolls->items())->resolve(),
                    'meta' => PaginationHelper::format($payrolls, $request),
                ],
                'outlets' => OutletResource::collection($outlets)->resolve(),
                'filters' => $filters,
                'flash'   => [
                    'success' => session('success'),
                    'error'   => session('error'),
                    'warning' => session('warning'),
                ],
            ]);
        } catch (Throwable $e) {
            Log::error('[PayrollController] Failed to load payrolls index', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'payroll_controller_error',
            ]);

            return Inertia::render('Dashboard/Payrolls/Index', [
                'payrolls' => [
                    'data' => [],
                    'meta' => [],
                ],
                'outlets' => [],
                'filters' => [],
                'flash'   => [
                    'error' => 'Gagal memuat data penggajian',
                ],
            ]);
        }
    }

    /**
     * Show the form for creating a new payroll
     */
    public function create(): Response|RedirectResponse
    {
        try {
            $outlets = $this->outletService->getAll(relations: ['employees']);

            $bankAccounts = $this->accountService->getAll([
                'type'            => 'asset',
                'isTransactional' => true,
            ]);

            return Inertia::render('Dashboard/Payrolls/Create', [
                'outlets'      => OutletResource::collection($outlets)->resolve(),
                'bankAccounts' => AccountResource::collection($bankAccounts)->resolve(),
                'flash'        => [
                    'success' => session('success'),
                    'error'   => session('error'),
                ],
            ]);
        } catch (Throwable $e) {
            Log::error('[PayrollController] Failed to load payroll create form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'payroll_controller_error',
            ]);

            return redirect()->route('payrolls.index')
                ->with('error', 'Gagal memuat formulir penggajian');
        }
    }

    /**
     * Store a newly created payroll
     */
    public function store(StorePayrollRequest $request): RedirectResponse
    {
        try {
            $result = $this->payrollService->store(
                data: $request->validated(),
                attachment: $request->file('attachment')
            );

            if ($result['error_count'] > 0) {
                return redirect()->route('payrolls.index')
                    ->with('warning', "Penggajian berhasil dibuat ({$result['created_count']} karyawan), namun {$result['error_count']} gagal diproses.");
            }

            return redirect()->route('payrolls.index')
                ->with('success', "Penggajian berhasil dibuat untuk {$result['created_count']} karyawan");
        } catch (Throwable $e) {
            Log::error('[PayrollController] Failed to create payroll', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'payroll_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Show the form for editing the specified payroll
     */
    public function edit(int $id): Response|RedirectResponse
    {
        try {
            $payroll = $this->payrollService->getPayrollById(
                id: $id,
                relations: [
                    'employee:id,name,username,outlet_id',
                    'employee.outlet:id,name,code',
                    'bankAccount:id,name,code',
                    'payrollItems',
                ]
            );

            if (!$payroll->isDraft()) {
                return redirect()->route('payrolls.show', $id)
                    ->with('warning', 'Hanya payroll draft yang dapat diedit');
            }

            return Inertia::render('Dashboard/Payrolls/Edit', [
                'payroll' => (new PayrollResource($payroll))->resolve(),
                'flash'   => [
                    'success' => session('success'),
                    'error'   => session('error'),
                    'warning' => session('warning'),
                ],
            ]);
        } catch (Throwable $e) {
            Log::error('[PayrollController] Failed to load payroll edit form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'payroll_controller_error',
            ]);

            return redirect()->route('payrolls.index')
                ->with('error', 'Gagal memuat formulir edit payroll');
        }
    }

    /**
     * Display the specified payroll
     */
    public function show(int $id): Response|RedirectResponse
    {
        try {
            $payroll = $this->payrollService->getPayrollById(
                id: $id,
                relations: [
                    'employee:id,name,username,outlet_id',
                    'employee.outlet:id,name,code',
                    'bankAccount:id,name,code',
                    'payrollItems',
                    'fineLogs.fine:id,name',
                ]
            );

            return Inertia::render('Dashboard/Payrolls/Show', [
                'payroll' => (new PayrollResource($payroll))->resolve(),
                'flash'   => [
                    'success' => session('success'),
                    'error'   => session('error'),
                    'warning' => session('warning'),
                ],
            ]);
        } catch (Throwable $e) {
            Log::error('[PayrollController] Failed to show payroll', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'payroll_controller_error',
            ]);

            return redirect()->route('payrolls.index')
                ->with('error', 'Penggajian tidak ditemukan atau akses ditolak');
        }
    }

    /**
     * Update the specified payroll
     */
    public function update(UpdatePayrollRequest $request, int $id): RedirectResponse
    {
        try {
            $this->payrollService->update(
                id: $id,
                data: $request->validated(),
                attachment: $request->file('attachment')
            );

            return redirect()->route('payrolls.show', $id)
                ->with('success', 'Payroll berhasil diperbarui');
        } catch (Throwable $e) {
            Log::error('[PayrollController] Failed to update payroll', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'payroll_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Cancel/Delete payroll
     */
    public function destroy(int $id): RedirectResponse
    {
        try {
            $deleted = $this->payrollService->destroy($id);

            if ($deleted) {
                return redirect()->route('payrolls.index')
                    ->with('success', 'Penggajian berhasil dibatalkan');
            }

            return redirect()->back()
                ->with('error', 'Gagal membatalkan penggajian');
        } catch (Throwable $e) {
            Log::error('[PayrollController] Failed to delete payroll', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'payroll_controller_error',
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
            'search'        => $request->string('search')->toString(),
            'outletId'      => $request->filled('outletId')
                ? $request->integer('outletId')
                : null,
            'employeeId' => $request->filled('employeeId')
                ? $request->integer('employeeId')
                : null,
            'status'         => $request->string('status')->toString(),
            'type'           => $request->string('type')->toString(),
            'paymentMethod'  => $request->string('paymentMethod')->toString(),
            'minStartDate'   => $request->string('minStartDate')->toString(),
            'maxStartDate'   => $request->string('maxStartDate')->toString(),
            'minEndDate'     => $request->string('minEndDate')->toString(),
            'maxEndDate'     => $request->string('maxEndDate')->toString(),
            'month'          => $request->filled('month')
                ? $request->integer('month')
                : null,
            'year' => $request->filled('year')
                ? $request->integer('year')
                : null,
            'page'          => $request->integer('page', 1),
            'perPage'       => $request->integer('perPage', 15),
            'sortBy'        => $request->string('sortBy', 'payment_date')->toString(),
            'sortDirection' => $request->string('sortDirection', 'desc')->toString(),
        ];
    }
}
