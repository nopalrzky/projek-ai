<?php

namespace App\Http\Controllers\Web;

use Illuminate\Routing\Attributes\Controllers\Middleware;

use App\Http\Controllers\Controller;
use App\Http\Resources\Outlet\OutletResource;
use App\Services\AccountingPeriodService;
use App\Services\OutletService;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

#[Middleware('auth')]
class AccountingPeriodController extends Controller
{
    public function __construct(private readonly AccountingPeriodService $accountingPeriodService, private readonly OutletService $outletService) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response|RedirectResponse
    {
        try {
            $user = Auth::user();
            $outlets = $this->outletService->getAll();

            $filters = [
                'outletId' => $request->integer('outletId') ?: ($outlets->first()?->id ?? null),
                'isClosed' => $request->has('isClosed') ? ($request->boolean('isClosed') ? true : false) : null,
                'search'   => $request->string('search')->toString(),
            ];

            $periods = [];
            if ($filters['outletId']) {
                $periods = $this->accountingPeriodService->getAll([
                    'outletId'  => $filters['outletId'],
                    'is_closed' => $filters['isClosed'],
                    'search'    => $filters['search'],
                ]);
            }

            return Inertia::render('Dashboard/Accounting/AccountingPeriods/Index', [
                'periods' => $periods,
                'outlets' => OutletResource::collection($outlets)->resolve(),
                'filters' => $filters,
            ]);
        } catch (Throwable $e) {
            Log::error('Failed to load accounting periods index', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'accounting_period_controller_error',
            ]);

            return redirect()->route('dashboard')->with('error', 'Gagal memuat daftar periode akuntansi');
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        try {
            $validated = $request->validate([
                'outlet_id'  => 'required|integer|exists:outlets,id',
                'start_date' => 'required|date',
                'end_date'   => 'required|date|after_or_equal:start_date',
            ]);

            $this->accountingPeriodService->store($validated);

            Log::info('Accounting period created via controller', [
                'outlet_id' => $validated['outlet_id'],
                'user_id'   => Auth::id(),
                'type'      => 'accounting_period_action',
            ]);

            return redirect()->back()->with('success', 'Periode akuntansi berhasil dibuat');
        } catch (Exception $e) {
            Log::error('Failed to store accounting period', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'accounting_period_controller_error',
            ]);

            return redirect()->back()->withErrors(['error' => $e->getMessage()])->withInput();
        } catch (Throwable $e) {
            Log::error('Failed to store accounting period (system error)', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'accounting_period_controller_error',
            ]);

            return redirect()->back()->with('error', 'Gagal membuat periode akuntansi');
        }
    }

    /**
     * Close the specified period.
     */
    public function close(int $id): RedirectResponse
    {
        try {
            $this->accountingPeriodService->close($id);

            return redirect()->back()->with('success', 'Periode akuntansi berhasil ditutup');
        } catch (Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        } catch (Throwable $e) {
            Log::error('Failed to close accounting period via controller', [
                'period_id' => $id,
                'error'     => $e->getMessage(),
                'user_id'   => Auth::id(),
                'type'      => 'accounting_period_controller_error',
            ]);

            return redirect()->back()->with('error', 'Gagal menutup periode akuntansi');
        }
    }

    /**
     * Reopen the specified period.
     */
    public function reopen(int $id): RedirectResponse
    {
        try {
            $this->accountingPeriodService->reopen($id);

            return redirect()->back()->with('success', 'Periode akuntansi berhasil dibuka kembali');
        } catch (Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        } catch (Throwable $e) {
            Log::error('Failed to reopen accounting period via controller', [
                'period_id' => $id,
                'error'     => $e->getMessage(),
                'user_id'   => Auth::id(),
                'type'      => 'accounting_period_controller_error',
            ]);

            return redirect()->back()->with('error', 'Gagal membuka kembali periode akuntansi');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(int $id): RedirectResponse
    {
        try {
            $this->accountingPeriodService->destroy($id);

            return redirect()->back()->with('success', 'Periode akuntansi berhasil dihapus');
        } catch (Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        } catch (Throwable $e) {
            Log::error('Failed to delete accounting period via controller', [
                'period_id' => $id,
                'error'     => $e->getMessage(),
                'user_id'   => Auth::id(),
                'type'      => 'accounting_period_controller_error',
            ]);

            return redirect()->back()->with('error', 'Gagal menghapus periode akuntansi');
        }
    }
}
