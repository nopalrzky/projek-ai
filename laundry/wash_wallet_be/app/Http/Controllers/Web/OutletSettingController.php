<?php

namespace App\Http\Controllers\Web;

use Illuminate\Routing\Attributes\Controllers\Middleware;

use App\Http\Controllers\Controller;
use App\Models\Outlet;
use App\Services\OutletSettingService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

#[Middleware('auth')]
class OutletSettingController extends Controller
{
    public function __construct(protected readonly OutletSettingService $outletSettingService) {}

    /**
     * Display a listing of the settings for an outlet.
     */
    public function index(int $outletId)
    {
        $outlet = Outlet::findOrFail($outletId);
        
        if (!$outlet->authorizeOutletAccess()) {
            abort(403);
        }

        $settings = $this->outletSettingService->getAll($outlet->id);

        return Inertia::render('Dashboard/Outlets/Settings', [
            'outlet' => $outlet,
            'settings' => $settings,
        ]);
    }

    /**
     * Update the specified setting.
     */
    public function update(Request $request, int $outletId)
    {
        $outlet = Outlet::findOrFail($outletId);

        if (!$outlet->authorizeOutletAccess()) {
            abort(403);
        }

        $request->validate([
            'key' => 'required|string|max:100',
            'value' => 'required|string|max:255',
        ]);

        try {
            $this->outletSettingService->setValue(
                $outlet->id,
                $request->key,
                $request->value
            );

            return back()->with('success', 'Pengaturan berhasil diperbarui.');
        } catch (\Exception $e) {
            Log::error('Failed to update outlet setting', [
                'outlet_id' => $outlet->id,
                'key' => $request->key,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Gagal memperbarui pengaturan.');
        }
    }
}
