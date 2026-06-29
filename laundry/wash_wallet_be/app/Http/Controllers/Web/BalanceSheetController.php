<?php

namespace App\Http\Controllers\Web;

use Illuminate\Routing\Attributes\Controllers\Middleware;

use App\Http\Controllers\Controller;
use App\Http\Resources\Outlet\OutletResource;
use App\Services\BalanceSheetService;
use App\Services\OutletService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

#[Middleware('auth')]
class BalanceSheetController extends Controller
{
    public function __construct(private readonly BalanceSheetService $balanceSheetService, private readonly OutletService $outletService) {}

    public function index(Request $request): Response|RedirectResponse
    {
        try {
            $ownerId = Auth::id();
            $outlets = $this->outletService->getAll();

            $date = $request->input('date', Carbon::now()->format('Y-m-d'));

            $filters = [
                'outlet_id' => $request->input('outlet_id'),
                'date'      => $date,
            ];

            $report = null;

            if ($filters['outlet_id']) {
                $report = $this->balanceSheetService->getReport(
                    $ownerId,
                    (int) $filters['outlet_id'],
                    $filters['date']
                );

                Log::info('[BalanceSheetController] Balance Sheet report viewed successfully', [
                    'outlet_id'    => $filters['outlet_id'],
                    'date'         => $filters['date'],
                    'total_assets' => $report['summary']['totalAssets'] ?? 0,
                    'is_balanced'  => $report['summary']['isBalanced'] ?? false,
                    'user_id'      => $ownerId,
                    'type'         => 'balance_sheet_view',
                ]);
            }

            return Inertia::render('Dashboard/BalanceSheets/Index', [
                'report'  => $report,
                'outlets' => OutletResource::collection($outlets)->resolve(),
                'filters' => $filters,
            ]);
        } catch (Throwable $e) {
            Log::error('[BalanceSheetController] Failed to load Balance Sheet page', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'balance_sheet_controller_error',
            ]);

            return redirect()->route('dashboard')->with('error', 'Gagal memuat halaman laporan neraca');
        }
    }

    public function compare(Request $request): Response|RedirectResponse
    {
        try {
            $ownerId = Auth::id();
            $outlets = $this->outletService->getAll(filters: ['ownerId' => $ownerId]);

            $currentDate  = $request->input('current_date', Carbon::now()->format('Y-m-d'));
            $previousDate = $request->input(
                'previous_date',
                Carbon::now()->subYear()->format('Y-m-d')
            );

            $filters = [
                'outlet_id'     => $request->input('outlet_id'),
                'current_date'  => $currentDate,
                'previous_date' => $previousDate,
            ];

            $comparison = null;

            if ($filters['outlet_id']) {
                $comparison = $this->balanceSheetService->getComparativeReport(
                    $ownerId,
                    (int) $filters['outlet_id'],
                    $filters['current_date'],
                    $filters['previous_date']
                );

                Log::info('[BalanceSheetController] Comparative Balance Sheet report viewed successfully', [
                    'outlet_id'     => $filters['outlet_id'],
                    'current_date'  => $filters['current_date'],
                    'previous_date' => $filters['previous_date'],
                    'user_id'       => $ownerId,
                    'type'          => 'balance_sheet_compare_view',
                ]);
            }

            return Inertia::render('Dashboard/Accounting/Reports/BalanceSheet/Compare', [
                'comparison' => $comparison,
                'outlets'    => OutletResource::collection($outlets)->resolve(),
                'filters'    => $filters,
            ]);
        } catch (Throwable $e) {
            Log::error('[BalanceSheetController] Failed to load comparative Balance Sheet page', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'balance_sheet_controller_error',
            ]);

            return redirect()->route('dashboard')->with('error', 'Gagal memuat halaman perbandingan laporan');
        }
    }

    public function export(Request $request): RedirectResponse
    {
        try {
            $validated = $request->validate([
                'outlet_id' => 'required|integer|exists:outlets,id',
                'date'      => 'required|date',
                'format'    => 'nullable|string|in:array,pdf,excel',
            ]);

            $ownerId = Auth::id();
            $format  = $validated['format'] ?? 'array';

            $exportData = $this->balanceSheetService->exportReport(
                $ownerId,
                $validated['outlet_id'],
                $validated['date'],
                $format
            );

            Log::info('[BalanceSheetController] Balance Sheet report exported successfully', [
                'outlet_id' => $validated['outlet_id'],
                'date'      => $validated['date'],
                'format'    => $format,
                'user_id'   => $ownerId,
                'type'      => 'balance_sheet_export',
            ]);

            return redirect()->back()->with([
                'success'    => 'Laporan neraca berhasil diekspor',
                'exportData' => $exportData,
            ]);
        } catch (ValidationException $e) {
            Log::warning('[BalanceSheetController] Balance Sheet export validation failed', [
                'errors'  => $e->errors(),
                'user_id' => Auth::id(),
                'type'    => 'balance_sheet_validation_error',
            ]);

            return redirect()->back()->withErrors($e->errors())->with('error', 'Data tidak valid');
        } catch (Throwable $e) {
            Log::error('[BalanceSheetController] Failed to export Balance Sheet report', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'balance_sheet_controller_error',
            ]);

            return redirect()->back()->with('error', 'Gagal mengekspor laporan: ' . $e->getMessage());
        }
    }

    public function print(Request $request): Response|RedirectResponse
    {
        try {
            $validated = $request->validate([
                'outlet_id' => 'required|integer|exists:outlets,id',
                'date'      => 'required|date',
            ]);

            $ownerId = Auth::id();

            $report = $this->balanceSheetService->getReport(
                $ownerId,
                $validated['outlet_id'],
                $validated['date']
            );

            $outlet = $this->outletService->getById($validated['outlet_id']);

            Log::info('[BalanceSheetController] Balance Sheet print view generated', [
                'outlet_id' => $validated['outlet_id'],
                'date'      => $validated['date'],
                'user_id'   => $ownerId,
                'type'      => 'balance_sheet_print',
            ]);

            return Inertia::render('Dashboard/Accounting/Reports/BalanceSheet/Print', [
                'report' => $report,
                'outlet' => OutletResource::make($outlet)->resolve(),
            ]);
        } catch (ValidationException $e) {
            Log::warning('[BalanceSheetController] Balance Sheet print validation failed', [
                'errors'  => $e->errors(),
                'user_id' => Auth::id(),
                'type'    => 'balance_sheet_validation_error',
            ]);

            return redirect()->back()->withErrors($e->errors())->with('error', 'Data tidak valid');
        } catch (Throwable $e) {
            Log::error('[BalanceSheetController] Failed to generate print view', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'balance_sheet_controller_error',
            ]);

            return redirect()->back()->with('error', 'Gagal memuat tampilan cetak: ' . $e->getMessage());
        }
    }
}
