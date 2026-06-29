<?php

namespace App\Http\Controllers\Web;

use Illuminate\Routing\Attributes\Controllers\Middleware;
use Illuminate\Http\Request;

use App\Http\Controllers\Controller;
use App\Http\Resources\Account\AccountResource;
use App\Models\Outlet;
use App\Services\DashboardService;
use App\Services\OwnerDashboardService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

#[Middleware('auth')]
class DashboardController extends Controller
{
    public function __construct(
        private readonly DashboardService $dashboardService,
        private readonly OwnerDashboardService $ownerDashboardService
    ) {}

    public function index(Request $request): Response
    {
        $user = Auth::user();
        $period = $request->query('period', 'today');
        $outletId = $request->query('outlet_id') ? (int) $request->query('outlet_id') : null;

        $dashboard = $this->ownerDashboardService->buildPayload($user->id, $period, $outletId);

        $outlets = Outlet::byOwnerId($user->id)->get()->map(function ($outlet) {
            return [
                'id' => $outlet->id,
                'name' => $outlet->name,
            ];
        });

        return Inertia::render('Dashboard/Index', [
            'dashboard' => $dashboard,
            'outlets'   => $outlets,
        ]);
    }

    public function showAsset(string $slug): Response
    {
        $asset = $this->dashboardService->getAssetBySlug($slug);

        if (!$asset) {
            abort(404, 'Aset tidak ditemukan');
        }

        return Inertia::render('Dashboard/AssetShow', [
            'account'               => (new AccountResource($asset['account']))->resolve(),
            'transactionalAccounts' => $asset['transactionalAccounts'],
            'summary'               => $asset['summary'],
        ]);
    }
}
