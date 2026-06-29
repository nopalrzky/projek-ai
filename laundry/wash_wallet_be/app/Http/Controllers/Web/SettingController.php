<?php

namespace App\Http\Controllers\Web;

use Illuminate\Routing\Attributes\Controllers\Middleware;

use App\Helpers\PaginationHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\Setting\StoreSettingRequest;
use App\Http\Requests\Setting\UpdateSettingRequest;
use App\Http\Resources\Setting\SettingResource;
use App\Services\SettingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

#[Middleware('auth')]
#[Middleware('role:super_admin')]
class SettingController extends Controller
{
    public function __construct(private readonly SettingService $settingService) {}

    /**
     * Display a listing of the settings.
     */
    public function index(Request $request): Response
    {
        try {
            $filters  = $this->getFiltersFromRequest($request);
            $settings = $this->settingService->getAll(
                $filters,
                $filters['page'] ?? 1,
                $filters['perPage'] ?? 15
            );

            return Inertia::render('Dashboard/Settings/Index', [
                'settings' => [
                    'data' => SettingResource::collection($settings->items())->resolve(),
                    'meta' => PaginationHelper::format($settings, $request),
                ],
                'filters' => $filters,
                'flash'   => [
                    'success' => $request->session()->get('success'),
                    'error'   => $request->session()->get('error'),
                ],
            ]);
        } catch (Throwable $e) {
            Log::error('[SettingController] Failed to load settings index', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'setting_controller_error',
            ]);

            return Inertia::render('Dashboard/Settings/Index', [
                'settings' => ['data' => [], 'meta' => []],
                'filters'  => [],
                'error'    => 'Gagal memuat data pengaturan. Silakan coba lagi.',
            ]);
        }
    }

    /**
     * Show the form for creating a new setting.
     */
    public function create(): Response|RedirectResponse
    {
        try {
            return Inertia::render('Dashboard/Settings/Create');
        } catch (Throwable $e) {
            Log::error('[SettingController] Failed to load setting create form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'setting_controller_error',
            ]);

            return redirect()->route('settings.index')
                ->with('error', 'Gagal memuat formulir tambah pengaturan.');
        }
    }

    /**
     * Store a newly created setting in storage.
     */
    public function store(StoreSettingRequest $request): RedirectResponse
    {
        try {
            $this->settingService->store($request->validated());

            return redirect()->route('settings.index')
                ->with('success', 'Pengaturan berhasil ditambahkan');
        } catch (Throwable $e) {
            Log::error('[SettingController] Failed to create setting', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'setting_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Display the specified setting.
     */
    public function show(int $id): Response|RedirectResponse
    {
        try {
            $setting = $this->settingService->getById($id, ['outletSettings.outlet']);

            return Inertia::render('Dashboard/Settings/Show', [
                'setting' => (new SettingResource($setting))->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[SettingController] Failed to show setting detail', [
                'setting_id' => $id,
                'error'      => $e->getMessage(),
                'user_id'    => Auth::id(),
                'type'       => 'setting_controller_error',
            ]);

            return redirect()->route('settings.index')
                ->with('error', 'Data pengaturan tidak ditemukan atau akses ditolak');
        }
    }

    /**
     * Show the form for editing the specified setting.
     */
    public function edit(int $id): Response|RedirectResponse
    {
        try {
            $setting = $this->settingService->getById($id);

            return Inertia::render('Dashboard/Settings/Edit', [
                'setting' => (new SettingResource($setting))->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[SettingController] Failed to load setting edit form', [
                'setting_id' => $id,
                'error'      => $e->getMessage(),
                'user_id'    => Auth::id(),
                'type'       => 'setting_controller_error',
            ]);

            return redirect()->route('settings.index')
                ->with('error', 'Data pengaturan tidak ditemukan atau akses ditolak');
        }
    }

    /**
     * Update the specified setting in storage.
     */
    public function update(UpdateSettingRequest $request, int $id): RedirectResponse
    {
        try {
            $this->settingService->update($id, $request->validated());

            return redirect()->route('settings.index')
                ->with('success', 'Pengaturan berhasil diperbarui');
        } catch (Throwable $e) {
            Log::error('[SettingController] Failed to update setting', [
                'setting_id' => $id,
                'error'      => $e->getMessage(),
                'user_id'    => Auth::id(),
                'type'       => 'setting_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Remove the specified setting from storage.
     */
    public function destroy(int $id): RedirectResponse
    {
        try {
            $deleted = $this->settingService->destroy($id);

            if ($deleted) {
                return redirect()->route('settings.index')
                    ->with('success', 'Pengaturan berhasil dihapus');
            }

            return redirect()->back()
                ->with('error', 'Gagal menghapus data pengaturan');
        } catch (Throwable $e) {
            Log::error('[SettingController] Failed to delete setting', [
                'setting_id' => $id,
                'error'      => $e->getMessage(),
                'user_id'    => Auth::id(),
                'type'       => 'setting_controller_error',
            ]);

            return redirect()->back()
                ->with('error', $e->getMessage());
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Internal Helpers
    |--------------------------------------------------------------------------
    */

    /**
     * Extract filters from request.
     */
    private function getFiltersFromRequest(Request $request): array
    {
        return [
            'search'        => $request->string('search')->toString(),
            'key'           => $request->filled('key') ? $request->string('key')->toString() : null,
            'sortBy'        => $request->string('sortBy', 'created_at')->toString(),
            'sortDirection' => $request->string('sortDirection', 'desc')->toString(),
            'page'          => $request->integer('page', 1),
            'perPage'       => $request->integer('perPage', 15),
        ];
    }
}
