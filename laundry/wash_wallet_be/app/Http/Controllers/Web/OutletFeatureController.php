<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Resources\Outlet\OutletResource;
use App\Services\OutletFeatureService;
use App\Services\OutletService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Attributes\Controllers\Middleware;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

#[Middleware('auth')]
class OutletFeatureController extends Controller
{
    public function __construct(
        protected readonly OutletFeatureService $outletFeatureService,
        protected readonly OutletService $outletService,
    ) {}

    /**
     * Display a listing of features for an outlet
     */
    public function index(int $outletId): Response|RedirectResponse
    {
        try {
            $outlet = $this->outletService->getById($outletId, [
                'owner',
                'outletFeatures',
                'outletFeatures.feature',
            ]);

            return Inertia::render('Dashboard/Outlets/OutletFeatures/Index', [
                'outlet' => (new OutletResource($outlet))->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[OutletFeatureController] Failed to list outlet features', [
                'outlet_id' => $outletId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'outlet_feature_controller_error'
            ]);

            return redirect()->route('dashboard')
                ->with('error', 'Gagal memuat daftar fitur: ' . $e->getMessage());
        }
    }

    /**
     * Start trial for a feature
     */
    public function startTrial(int $outletId, int $featureId): RedirectResponse
    {
        try {
            $feature = \App\Models\Feature::byKey('outlet_activation')->firstOrFail();
            if ($feature->id !== $featureId) {
                return back()->with('error', 'Trial hanya tersedia untuk fitur aktivasi outlet.');
            }

            $this->outletFeatureService->startTrial($outletId);

            return back()->with('success', 'Masa trial berhasil diaktifkan.');
        } catch (Throwable $e) {
            Log::error('[OutletFeatureController] Failed to start trial', [
                'outlet_id' => $outletId,
                'feature_id' => $featureId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'outlet_feature_controller_error'
            ]);

            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Unlock feature using coin
     */
    public function unlock(int $outletId, int $featureId): RedirectResponse
    {
        try {
            $this->outletFeatureService->unlockFeature($outletId, $featureId);

            return back()->with('success', 'Fitur berhasil di-unlock!');
        } catch (Throwable $e) {
            Log::error('[OutletFeatureController] Failed to unlock feature', [
                'outlet_id' => $outletId,
                'feature_id' => $featureId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'outlet_feature_controller_error'
            ]);

            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Activate outlet (unlock outlet_activation feature)
     */
    public function activate(int $outletId): RedirectResponse
    {
        try {
            $this->outletFeatureService->activateOutlet($outletId);

            return back()->with('success', 'Outlet berhasil diaktifkan!');
        } catch (Throwable $e) {
            Log::error('[OutletFeatureController] Failed to activate outlet', [
                'outlet_id' => $outletId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'outlet_feature_controller_error'
            ]);

            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Activate or renew outlet_exposure feature
     */
    public function exposure(Request $request, int $outletId, int $featureId): RedirectResponse
    {
        try {
            $type = $request->input('type', 'owner');
            $this->outletFeatureService->activateExposure($outletId, $type);

            return back()->with('success', 'Fitur ekspos berhasil diperbarui!');
        } catch (Throwable $e) {
            Log::error('[OutletFeatureController] Failed to activate exposure', [
                'outlet_id' => $outletId,
                'feature_id' => $featureId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'outlet_feature_controller_error'
            ]);

            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Toggle auto-renewal for exposure feature
     */
    public function toggleAutoRenewal(Request $request, int $outletId): RedirectResponse
    {
        try {
            $enabled = $request->boolean('enabled');
            $this->outletFeatureService->toggleExposureAutoRenewal($outletId, $enabled);

            return back()->with('success', 'Preferensi perpanjangan otomatis berhasil diperbarui.');
        } catch (Throwable $e) {
            Log::error('[OutletFeatureController] Failed to toggle auto renewal', [
                'outlet_id' => $outletId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'outlet_feature_controller_error'
            ]);

            return back()->with('error', $e->getMessage());
        }
    }
}
