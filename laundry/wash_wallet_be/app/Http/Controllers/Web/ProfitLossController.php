<?php

namespace App\Http\Controllers\Web;

use Illuminate\Routing\Attributes\Controllers\Middleware;

use App\Http\Controllers\Controller;
use App\Http\Resources\Outlet\OutletResource;
use App\Services\OutletService;
use App\Services\ProfitLossService;
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
class ProfitLossController extends Controller
{
    public function __construct(private readonly ProfitLossService $profitLossService, private readonly OutletService $outletService) {}

    public function index(Request $request): Response|RedirectResponse
    {
        try {
            $ownerId = Auth::id();

            $outlets = $this->outletService->getAll(filters: ['ownerId' => $ownerId]);

            $dateRange = $request->input('date_range', 'this_month');
            $dates = $this->parseDateRange($dateRange, $request);

            $filters = [
                'outlet_id'  => $request->input('outlet_id'),
                'date_range' => $dateRange,
                'start_date' => $dates['start'],
                'end_date'   => $dates['end'],
            ];

            $report = null;

            if ($filters['outlet_id']) {
                try {
                    $report = $this->profitLossService->getReport(
                        $ownerId,
                        (int) $filters['outlet_id'],
                        $filters['start_date'],
                        $filters['end_date']
                    );

                    Log::info('Profit & Loss report viewed successfully', [
                        'outlet_id'  => $filters['outlet_id'],
                        'date_range' => $dateRange,
                        'start_date' => $filters['start_date'],
                        'end_date'   => $filters['end_date'],
                        'net_profit' => $report['netProfit'] ?? 0,
                        'user_id'    => $ownerId,
                        'type'       => 'profit_loss_view',
                    ]);
                } catch (Throwable $e) {
                    Log::error('[ProfitLossController] Failed to generate Profit & Loss report', [
                        'outlet_id'  => $filters['outlet_id'],
                        'date_range' => $dateRange,
                        'start_date' => $filters['start_date'],
                        'end_date'   => $filters['end_date'],
                        'error'      => $e->getMessage(),
                        'user_id'    => $ownerId,
                        'type'       => 'profit_loss_controller_error',
                    ]);

                    return redirect()->back()->with('error', 'Gagal memuat laporan laba rugi: ' . $e->getMessage());
                }
            }

            return Inertia::render('Dashboard/ProfitLoss/Index', [
                'report'           => $report,
                'outlets'          => OutletResource::collection($outlets)->resolve(),
                'filters'          => $filters,
                'dateRangeOptions' => $this->getDateRangeOptions(),
            ]);
        } catch (Throwable $e) {
            Log::error('[ProfitLossController] Failed to load Profit & Loss page', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'profit_loss_controller_error',
            ]);

            return redirect()->route('dashboard')->with('error', 'Gagal memuat halaman laporan laba rugi');
        }
    }

    public function compare(Request $request): Response|RedirectResponse
    {
        try {
            $ownerId = Auth::id();

            $outlets = $this->outletService->getAll(filters: ['ownerId' => $ownerId]);

            $currentDateRange = $request->input('current_date_range', 'this_month');
            $previousDateRange = $request->input('previous_date_range', 'last_month');

            $currentDates = $this->parseDateRange($currentDateRange, $request, 'current_');
            $previousDates = $this->parseDateRange($previousDateRange, $request, 'previous_');

            $filters = [
                'outlet_id'           => $request->input('outlet_id'),
                'current_date_range'  => $currentDateRange,
                'current_start_date'  => $currentDates['start'],
                'current_end_date'    => $currentDates['end'],
                'previous_date_range' => $previousDateRange,
                'previous_start_date' => $previousDates['start'],
                'previous_end_date'   => $previousDates['end'],
            ];

            $comparison = null;

            if ($filters['outlet_id']) {
                try {
                    $comparison = $this->profitLossService->getComparativeReport(
                        $ownerId,
                        (int) $filters['outlet_id'],
                        $filters['current_start_date'],
                        $filters['current_end_date'],
                        $filters['previous_start_date'],
                        $filters['previous_end_date']
                    );

                    Log::info('Comparative Profit & Loss report viewed successfully', [
                        'outlet_id'       => $filters['outlet_id'],
                        'current_period'  => [
                            'start' => $filters['current_start_date'],
                            'end'   => $filters['current_end_date'],
                        ],
                        'previous_period' => [
                            'start' => $filters['previous_start_date'],
                            'end'   => $filters['previous_end_date'],
                        ],
                        'user_id' => $ownerId,
                        'type'    => 'profit_loss_compare_view',
                    ]);
                } catch (Throwable $e) {
                    Log::error('[ProfitLossController] Failed to generate comparative Profit & Loss report', [
                        'outlet_id' => $filters['outlet_id'],
                        'error'     => $e->getMessage(),
                        'user_id'   => $ownerId,
                        'type'      => 'profit_loss_controller_error',
                    ]);

                    return redirect()->back()->with('error', 'Gagal memuat perbandingan laporan: ' . $e->getMessage());
                }
            }

            return Inertia::render('Dashboard/Accounting/ProfitLoss/Compare', [
                'comparison'       => $comparison,
                'outlets'          => OutletResource::collection($outlets)->resolve(),
                'filters'          => $filters,
                'dateRangeOptions' => $this->getDateRangeOptions(),
            ]);
        } catch (Throwable $e) {
            Log::error('[ProfitLossController] Failed to load comparative Profit & Loss page', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'profit_loss_controller_error',
            ]);

            return redirect()->route('dashboard')->with('error', 'Gagal memuat halaman perbandingan laporan');
        }
    }

    public function export(Request $request): RedirectResponse
    {
        try {
            $validated = $request->validate([
                'outlet_id'  => 'required|integer|exists:outlets,id',
                'start_date' => 'required|date',
                'end_date'   => 'required|date|after_or_equal:start_date',
                'format'     => 'nullable|string|in:array,pdf,excel',
            ]);

            $ownerId = Auth::id();
            $format = $validated['format'] ?? 'array';

            $exportData = $this->profitLossService->exportReport(
                $ownerId,
                $validated['outlet_id'],
                $validated['start_date'],
                $validated['end_date'],
                $format
            );

            Log::info('Profit & Loss report exported successfully', [
                'outlet_id'  => $validated['outlet_id'],
                'start_date' => $validated['start_date'],
                'end_date'   => $validated['end_date'],
                'format'     => $format,
                'user_id'    => $ownerId,
                'type'       => 'profit_loss_export',
            ]);

            return redirect()->back()->with([
                'success'    => 'Laporan laba rugi berhasil diekspor',
                'exportData' => $exportData,
            ]);
        } catch (ValidationException $e) {
            Log::warning('Profit & Loss export validation failed', [
                'errors'  => $e->errors(),
                'user_id' => Auth::id(),
                'type'    => 'profit_loss_validation_error',
            ]);

            return redirect()->back()->withErrors($e->errors())->with('error', 'Data tidak valid');
        } catch (Throwable $e) {
            Log::error('[ProfitLossController] Failed to export Profit & Loss report', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'profit_loss_controller_error',
            ]);

            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function print(Request $request): Response|RedirectResponse
    {
        try {
            $validated = $request->validate([
                'outlet_id'  => 'required|integer|exists:outlets,id',
                'start_date' => 'required|date',
                'end_date'   => 'required|date|after_or_equal:start_date',
            ]);

            $ownerId = Auth::id();

            $report = $this->profitLossService->getReport(
                $ownerId,
                $validated['outlet_id'],
                $validated['start_date'],
                $validated['end_date']
            );

            $outlet = $this->outletService->getById($validated['outlet_id']);

            Log::info('Profit & Loss print view generated', [
                'outlet_id'  => $validated['outlet_id'],
                'start_date' => $validated['start_date'],
                'end_date'   => $validated['end_date'],
                'user_id'    => $ownerId,
                'type'       => 'profit_loss_print',
            ]);

            return Inertia::render('Dashboard/Accounting/ProfitLoss/Print', [
                'report' => $report,
                'outlet' => OutletResource::make($outlet)->resolve(),
            ]);
        } catch (ValidationException $e) {
            Log::warning('Profit & Loss print validation failed', [
                'errors'  => $e->errors(),
                'user_id' => Auth::id(),
                'type'    => 'profit_loss_validation_error',
            ]);

            return redirect()->back()->withErrors($e->errors())->with('error', 'Data tidak valid');
        } catch (Throwable $e) {
            Log::error('[ProfitLossController] Failed to generate print view', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'profit_loss_controller_error',
            ]);

            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    private function parseDateRange(string $dateRange, Request $request, string $prefix = ''): array
    {
        $now = Carbon::now();

        return match ($dateRange) {
            'today' => [
                'start' => $now->format('Y-m-d'),
                'end'   => $now->format('Y-m-d'),
            ],
            'yesterday' => [
                'start' => $now->copy()->subDay()->format('Y-m-d'),
                'end'   => $now->copy()->subDay()->format('Y-m-d'),
            ],
            'this_week' => [
                'start' => $now->copy()->startOfWeek()->format('Y-m-d'),
                'end'   => $now->copy()->endOfWeek()->format('Y-m-d'),
            ],
            'last_week' => [
                'start' => $now->copy()->subWeek()->startOfWeek()->format('Y-m-d'),
                'end'   => $now->copy()->subWeek()->endOfWeek()->format('Y-m-d'),
            ],
            'this_month' => [
                'start' => $now->copy()->startOfMonth()->format('Y-m-d'),
                'end'   => $now->copy()->endOfMonth()->format('Y-m-d'),
            ],
            'last_month' => [
                'start' => $now->copy()->subMonth()->startOfMonth()->format('Y-m-d'),
                'end'   => $now->copy()->subMonth()->endOfMonth()->format('Y-m-d'),
            ],
            'this_quarter' => [
                'start' => $now->copy()->firstOfQuarter()->format('Y-m-d'),
                'end'   => $now->copy()->lastOfQuarter()->format('Y-m-d'),
            ],
            'last_quarter' => [
                'start' => $now->copy()->subQuarter()->firstOfQuarter()->format('Y-m-d'),
                'end'   => $now->copy()->subQuarter()->lastOfQuarter()->format('Y-m-d'),
            ],
            'this_year' => [
                'start' => $now->copy()->startOfYear()->format('Y-m-d'),
                'end'   => $now->copy()->endOfYear()->format('Y-m-d'),
            ],
            'last_year' => [
                'start' => $now->copy()->subYear()->startOfYear()->format('Y-m-d'),
                'end'   => $now->copy()->subYear()->endOfYear()->format('Y-m-d'),
            ],
            'custom' => [
                'start' => $request->input($prefix . 'start_date', $now->copy()->startOfMonth()->format('Y-m-d')),
                'end'   => $request->input($prefix . 'end_date', $now->copy()->endOfMonth()->format('Y-m-d')),
            ],
            default => [
                'start' => $now->copy()->startOfMonth()->format('Y-m-d'),
                'end'   => $now->copy()->endOfMonth()->format('Y-m-d'),
            ],
        };
    }

    private function getDateRangeOptions(): array
    {
        return [
            ['value' => 'today', 'label' => 'Hari Ini'],
            ['value' => 'yesterday', 'label' => 'Kemarin'],
            ['value' => 'this_week', 'label' => 'Minggu Ini'],
            ['value' => 'last_week', 'label' => 'Minggu Lalu'],
            ['value' => 'this_month', 'label' => 'Bulan Ini'],
            ['value' => 'last_month', 'label' => 'Bulan Lalu'],
            ['value' => 'this_quarter', 'label' => 'Kuartal Ini'],
            ['value' => 'last_quarter', 'label' => 'Kuartal Lalu'],
            ['value' => 'this_year', 'label' => 'Tahun Ini'],
            ['value' => 'last_year', 'label' => 'Tahun Lalu'],
            ['value' => 'custom', 'label' => 'Custom'],
        ];
    }
}
