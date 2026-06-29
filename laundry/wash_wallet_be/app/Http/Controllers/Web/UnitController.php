<?php

namespace App\Http\Controllers\Web;

use Illuminate\Routing\Attributes\Controllers\Middleware;

use App\Helpers\PaginationHelper;
use App\Http\Controllers\Controller;
use App\Services\UnitService;
use App\Http\Requests\Unit\StoreUnitRequest;
use App\Http\Requests\Unit\UpdateUnitRequest;
use App\Http\Resources\Unit\UnitResource;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

#[Middleware('auth')]
#[Middleware('role:super_admin')]
class UnitController extends Controller
{
    public function __construct(private readonly UnitService $unitService) {}

    /**
     * Display a listing of the units
     */
    public function index(Request $request): Response
    {
        try {
            $filters = $this->getFiltersFromRequest($request);
            $units = $this->unitService->getAll(
                $filters,
                ['laundryServices']
            );

            return Inertia::render('Dashboard/Units/Index', [
                'units' => [
                    'data' => UnitResource::collection($units->items())->resolve(),
                    'meta' => PaginationHelper::format($units, $request),
                ],
                'filters' => $filters,
                'flash' => [
                    'success' => session('success'),
                    'error' => session('error'),
                ],
            ]);
        } catch (Throwable $e) {
            Log::error('[UnitController] Failed to load units index', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'unit_controller_error',
            ]);

            return Inertia::render('Dashboard/Units/Index', [
                'units' => [
                    'data' => [],
                    'meta' => [],
                ],
                'filters' => $this->getFiltersFromRequest($request),
                'error' => 'Gagal memuat data. Silakan coba lagi.',
            ]);
        }
    }

    /**
     * Show the form for creating a new unit
     */
    public function create(): Response|RedirectResponse
    {
        try {
            return Inertia::render('Dashboard/Units/Create');
        } catch (Throwable $e) {
            Log::error('[UnitController] Failed to load unit create form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'unit_controller_error',
            ]);

            return redirect()->route('units.index')
                ->with('error', 'Gagal memuat formulir pembuatan unit');
        }
    }

    /**
     * Store a newly created unit
     */
    public function store(StoreUnitRequest $request): RedirectResponse
    {
        try {
            $unit = $this->unitService->store($request->validated());

            return redirect()->route('units.index')
                ->with('success', "Unit '{$unit->name}' berhasil dibuat");
        } catch (Throwable $e) {
            Log::error('[UnitController] Failed to create unit via web', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'unit_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Display the specified unit
     */
    public function show(int $id): Response|RedirectResponse
    {
        try {
            $unit = $this->unitService->getById($id, ['laundryServices']);

            return Inertia::render('Dashboard/Units/Show', [
                'unit' => $unit,
            ]);
        } catch (Throwable $e) {
            Log::error('[UnitController] Failed to show unit', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'unit_controller_error',
            ]);

            return redirect()->route('units.index')
                ->with('error', 'Unit tidak ditemukan');
        }
    }

    /**
     * Show the form for editing the specified unit
     */
    public function edit(int $id): Response|RedirectResponse
    {
        try {
            return Inertia::render('Dashboard/Units/Edit', [
                'unit' => $this->unitService->getById($id),
            ]);
        } catch (Throwable $e) {
            Log::error('[UnitController] Failed to load unit edit form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'unit_controller_error',
            ]);

            return redirect()->route('units.index')
                ->with('error', 'Unit tidak ditemukan');
        }
    }

    /**
     * Update the specified unit
     */
    public function update(UpdateUnitRequest $request, int $id): RedirectResponse
    {
        try {
            $result = $this->unitService->update($id, $request->validated());

            return redirect()->route('units.index')
                ->with('success', "Unit '{$result->name}' berhasil diperbarui");
        } catch (Throwable $e) {
            Log::error('[UnitController] Failed to update unit via web', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'unit_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Remove the specified unit
     */
    public function destroy(Request $request, int $id): RedirectResponse
    {
        try {
            $deleted = $this->unitService->destroy($id);

            if ($deleted) {
                return redirect()->route('units.index')
                    ->with('success', 'Unit berhasil dihapus');
            }

            return redirect()->back()
                ->with('error', 'Gagal menghapus unit');
        } catch (Throwable $e) {
            Log::error('[UnitController] Failed to delete unit via web', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'unit_controller_error',
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
            'search' => $request->string('search')->toString(),
            'symbol' => $request->string('symbol')->toString(),
            'page' => $request->integer('page', 1),
            'perPage' => $request->integer('perPage', 15),
            'sortBy' => $request->string('sortBy', 'created_at')->toString(),
            'sortDirection' => $request->string('sortDirection', 'desc')->toString(),
        ];
    }
}
