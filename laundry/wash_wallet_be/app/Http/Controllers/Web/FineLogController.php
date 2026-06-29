<?php

namespace App\Http\Controllers\Web;

use Illuminate\Routing\Attributes\Controllers\Middleware;

use App\Helpers\PaginationHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\FineLog\StoreFineLogRequest;
use App\Http\Requests\FineLog\UpdateFineLogRequest;
use App\Http\Resources\FineLog\FineLogResource;
use App\Http\Resources\Employee\EmployeeResource;
use App\Http\Resources\Outlet\OutletResource;
use App\Http\Resources\Fine\FineResource;
use App\Services\FineService;
use App\Services\FineLogService;
use App\Services\EmployeeService;
use App\Services\OutletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

#[Middleware('auth')]
class FineLogController extends Controller
{
    public function __construct(private readonly FineService $fineService, private readonly FineLogService $fineLogService, private readonly EmployeeService $employeeService, private readonly OutletService $outletService) {}

    /**
     * Display a listing of fine logs
     */
    public function index(Request $request): Response
    {
        try {
            $filters = $this->getFiltersFromRequest($request);

            $fineLogs = $this->fineLogService->getAll(
                filters: $filters,
                page: $request->input('page', 1),
                perPage: $request->input('perPage', 15),
                relations: ['employee', 'fine', 'outlet', 'payrollItem']
            );


            $employees = $this->employeeService->getAll([], null, null, []);
            $outlets = $this->outletService->getAll([], null, null, []);
            $fines = $this->fineService->getAll([], null, null, []);

            return Inertia::render('Dashboard/FineLogs/Index', [
                'fineLogs' => [
                    'data' => FineLogResource::collection($fineLogs)->resolve(),
                    'meta' => PaginationHelper::format($fineLogs, $request),
                ],
                'employees' => EmployeeResource::collection($employees)->resolve(),
                'outlets' => OutletResource::collection($outlets)->resolve(),
                'fines' => FineResource::collection($fines)->resolve(),
                'filters' => $filters,
            ]);
        } catch (Throwable $e) {
            Log::error('[FineLogController] Failed to load fine logs index', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'fine_log_controller_error',
            ]);

            return Inertia::render('Dashboard/FineLogs/Index', [
                'fineLogs' => [
                    'data' => [],
                    'meta' => [],
                ],
                'employees' => [],
                'outlets' => [],
                'fines' => [],
                'filters' => $filters ?? [],
                'error' => 'Gagal memuat data. Silakan coba lagi.',
            ]);
        }
    }

    /**
     * Show the form for creating a new fine log
     */
    public function create(): Response|RedirectResponse
    {
        try {
            $outlets = $this->outletService->getAll();

            return Inertia::render('Dashboard/FineLogs/Create', [
                'outlets' => OutletResource::collection($outlets)->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[FineLogController] Failed to load fine log create form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'fine_log_controller_error',
            ]);

            return redirect()->route('fine-logs.index')
                ->with('error', 'Gagal memuat formulir pencatatan denda');
        }
    }

    /**
     * Store a newly created fine log
     */
    public function store(StoreFineLogRequest $request): RedirectResponse
    {
        try {
            $this->fineLogService->store(
                data: $request->validated(),
                attachment: $request->file('attachment')
            );

            return redirect()->route('fine-logs.index')
                ->with('success', 'Denda karyawan berhasil dicatat');
        } catch (Throwable $e) {
            Log::error('[FineLogController] Failed to create fine log', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'fine_log_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Display the specified fine log
     */
    public function show(int $id): Response|RedirectResponse
    {
        try {
            $fineLog = $this->fineLogService->getById(
                id: $id,
                relations: [
                    'employee',
                    'fine',
                    'outlet',
                    'payroll',
                ]
            );

            return Inertia::render('Dashboard/FineLogs/Show', [
                'fineLog' => (new FineLogResource($fineLog))->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[FineLogController] Failed to show fine log', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'fine_log_controller_error',
            ]);

            return redirect()->route('fine-logs.index')
                ->with('error', 'Denda karyawan tidak ditemukan atau akses ditolak');
        }
    }

    /**
     * Show the form for editing the specified fine log
     */
    public function edit(int $id): Response|RedirectResponse
    {
        try {
            $fineLog = $this->fineLogService->getById(
                id: $id,
                relations: ['employee:id,full_name', 'fine:id,name,amount', 'outlet:id,name', 'payroll']
            );

            if (!$fineLog->canBeUpdated()) {
                Log::warning('Attempt to edit paid or cancelled fine log', [
                    'fine_log_id' => $id,
                    'status' => $fineLog->status,
                    'user_id' => Auth::id(),
                ]);

                return redirect()->route('fine-logs.show', $id)
                    ->with('error', 'Denda yang sudah dibayar atau dibatalkan tidak dapat diubah');
            }

            $outlets = $this->outletService->getAll([], null, null, []);

            return Inertia::render('Dashboard/FineLogs/Edit', [
                'fineLog' => (new FineLogResource($fineLog))->resolve(),
                'outlets' => OutletResource::collection($outlets)->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[FineLogController] Failed to load fine log edit form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'fine_log_controller_error',
            ]);

            return redirect()->route('fine-logs.index')
                ->with('error', 'Denda karyawan tidak ditemukan atau akses ditolak');
        }
    }

    /**
     * Update the specified fine log
     */
    public function update(UpdateFineLogRequest $request, int $id): RedirectResponse
    {
        try {
            $fineLog = $this->fineLogService->update(
                id: $id,
                data: $request->validated(),
                attachment: $request->file('attachment')
            );

            return redirect()->route('fine-logs.show', $fineLog->id)
                ->with('success', 'Data denda karyawan berhasil diperbarui');
        } catch (Throwable $e) {
            Log::error('[FineLogController] Failed to update fine log', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'fine_log_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Remove the specified fine log
     */
    public function destroy(int $id): RedirectResponse
    {
        try {
            $deleted = $this->fineLogService->destroy($id);

            if ($deleted) {
                return redirect()->route('fine-logs.index')
                    ->with('success', 'Denda karyawan berhasil dihapus');
            }

            return redirect()->back()
                ->with('error', 'Gagal menghapus denda karyawan');
        } catch (Throwable $e) {
            Log::error('[FineLogController] Failed to delete fine log', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'fine_log_controller_error',
            ]);

            return redirect()->back()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Get unpaid fines for specific employee (API endpoint for payroll)
     */
    public function getUnpaidByEmployee(int $employeeId): JsonResponse
    {
        try {
            $unpaidFines = $this->fineLogService->getUnpaidFines($employeeId);
            $totalAmount = $this->fineLogService->getTotalUnpaidAmount($employeeId);

            return response()->json([
                'success' => true,
                'data' => [
                    'fines' => FineLogResource::collection($unpaidFines)->resolve(),
                    'total' => $totalAmount,
                    'count' => $unpaidFines->count(),
                ],
            ]);
        } catch (Throwable $e) {
            Log::error('[FineLogController] Failed to fetch unpaid fines by employee', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'fine_log_controller_error',
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch unpaid fines: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get filters from request
     */
    private function getFiltersFromRequest(Request $request): array
    {
        return [
            'search' => $request->string('search')->toString(),
            'status' => $request->string('status')->toString(),
            'page' => $request->integer('page', 1),
            'perPage' => $request->integer('perPage', 15),
            'employeeId' => $request->filled('employeeId') && $request->has('employeeId')
                ? $request->integer('employeeId')
                : null,
            'outletId' => $request->filled('outletId') && $request->has('outletId')
                ? $request->integer('outletId')
                : null,
            'fineId' => $request->filled('fineId') && $request->has('fineId')
                ? $request->integer('fineId')
                : null,
            'dateFrom' => $request->has('dateRange.from') && $request->filled('dateRange.from')
                ? $request->string('dateRange.from')->toString()
                : null,
            'dateTo' => $request->has('dateRange.to') && $request->filled('dateRange.to')
                ? $request->string('dateRange.to')->toString()
                : null,
            'minAmount' => $request->has('amount.min') && $request->filled('amount.min')
                ? $request->float('amount.min')
                : null,
            'maxAmount' => $request->has('amount.max') && $request->filled('amount.max')
                ? $request->float('amount.max')
                : null,
            'sortBy' => $request->string('sortBy', 'date')->toString(),
            'sortDirection' => $request->string('sortDirection', 'desc')->toString(),
        ];
    }
}
