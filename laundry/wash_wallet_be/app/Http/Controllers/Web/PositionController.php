<?php

namespace App\Http\Controllers\Web;

use Illuminate\Routing\Attributes\Controllers\Middleware;

use App\Helpers\PaginationHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\Position\StorePositionRequest;
use App\Http\Requests\Position\UpdatePositionRequest;
use App\Http\Resources\Outlet\OutletResource;
use App\Http\Resources\Position\PositionResource;
use App\Services\OutletService;
use App\Services\PositionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

#[Middleware('auth')]
class PositionController extends Controller
{
    public function __construct(private readonly PositionService $positionService, 
    private readonly OutletService $outletService) {}

    /**
     * Display a listing of positions
     */
    public function index(Request $request): Response
    {
        try {
            $filters = $this->getFiltersFromRequest($request);

            $positions = $this->positionService->getAll(
                $filters,
                $filters['page'] ?? 1,
                $filters['perPage'] ?? 15,
                ['outlet']
            );

            $outlets = $this->outletService->getAll();

            return Inertia::render('Dashboard/Positions/Index', [
                'positions' => [
                    'data' => PositionResource::collection($positions->items())->resolve(),
                    'meta' => PaginationHelper::format($positions, $request),
                ],
                'filterOptions' => [
                    'outlets' => OutletResource::collection($outlets)->resolve(),
                ],
                'filters' => $filters,
                'flash'   => [
                    'success' => session('success'),
                    'error'   => session('error'),
                ],
            ]);
        } catch (Throwable $e) {
            Log::error('[PositionController] Failed to load positions index', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'position_controller_error',
            ]);

            return Inertia::render('Dashboard/Positions/Index', [
                'positions'  => collect(),
                'statistics' => [],
                'filters'    => [],
                'error'      => 'Failed to load positions data',
            ]);
        }
    }

    /**
     * Show the form for creating a new position
     */
    public function create(): Response|RedirectResponse
    {
        try {
            $outlets = $this->outletService->getAll();
            $availablePermissions = collect(\App\Enums\Permission::cases())->map(fn($p) => [
                'key' => $p->value,
                'label' => $p->label(),
            ])->toArray();

            return Inertia::render('Dashboard/Positions/Create', [
                'outlets' => OutletResource::collection($outlets)->resolve(),
                'availablePermissions' => $availablePermissions,
            ]);
        } catch (Throwable $e) {
            Log::error('[PositionController] Failed to load position create form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'position_controller_error',
            ]);

            return redirect()->route('positions.index')
                ->with('error', 'Gagal memuat formulir pembuatan posisi');
        }
    }

    /**
     * Store a newly created position
     */
    public function store(StorePositionRequest $request): RedirectResponse
    {
        try {
            $validated = $request->validated();
            $position = $this->positionService->store($validated);

            if ($request->has('permissions')) {
                $this->positionService->updatePermissions($position->id, $request->input('permissions', []));
            }

            return redirect()->route('positions.index')
                ->with('success', 'Posisi berhasil dibuat');
        } catch (Throwable $e) {
            Log::error('[PositionController] Failed to create position via web', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'position_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Display the specified position
     */
    public function show(Request $request, int $id): Response|RedirectResponse
    {
        try {
            $position = $this->positionService->getById($id, [
                'outlet',
                'permissions',
                'employeePositions',
                'employeePositions.employee',
            ]);

            return Inertia::render('Dashboard/Positions/Show', [
                'position' => (new PositionResource($position))->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[PositionController] Failed to show position', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'position_controller_error',
            ]);

            return redirect()->route('positions.index')
                ->with('error', 'Posisi tidak ditemukan');
        }
    }

    /**
     * Show the form for editing the specified position
     */
    public function edit(int $id): Response|RedirectResponse
    {
        try {
            $position = $this->positionService->getById($id, ['permissions']);
            $outlets = $this->outletService->getAll();
            $availablePermissions = collect(\App\Enums\Permission::cases())->map(fn($p) => [
                'key' => $p->value,
                'label' => $p->label(),
            ])->toArray();

            return Inertia::render('Dashboard/Positions/Edit', [
                'position' => (new PositionResource($position))->resolve(),
                'outlets'  => OutletResource::collection($outlets)->resolve(),
                'availablePermissions' => $availablePermissions,
            ]);
        } catch (Throwable $e) {
            Log::error('[PositionController] Failed to load position edit form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'position_controller_error',
            ]);

            return redirect()->route('positions.index')
                ->with('error', 'Posisi tidak ditemukan');
        }
    }

    /**
     * Update the specified position
     */
    public function update(UpdatePositionRequest $request, int $id): RedirectResponse
    {
        try {
            $validated = $request->validated();
            $updatedPosition = $this->positionService->update($id, $validated);

            if ($request->has('permissions')) {
                $this->positionService->updatePermissions($id, $request->input('permissions', []));
            }

            return redirect()->route('positions.index')
                ->with('success', "Posisi '{$updatedPosition->name}' berhasil diperbarui");
        } catch (Throwable $e) {
            Log::error('[PositionController] Failed to update position via web', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'position_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Remove the specified position
     */
    public function destroy(Request $request, int $id): RedirectResponse
    {
        try {
            $this->positionService->destroy($id);

            return redirect()->route('positions.index')
                ->with('success', 'Posisi berhasil dihapus');
        } catch (Throwable $e) {
            Log::error('[PositionController] Failed to delete position via web', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'position_controller_error',
            ]);

            return redirect()->back()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Restore soft deleted position
     */
    public function restore(Request $request, int $id): RedirectResponse
    {
        try {
            $position = $this->positionService->restore($id);

            Log::info('Position restored via web interface', [
                'position_id'   => $id,
                'position_name' => $position->name,
                'restored_by'   => $request->user()?->id,
                'type'          => 'position_web_action',
            ]);

            return redirect()->route('positions.show', $position->id)
                ->with('success', "Posisi '{$position->name}' berhasil dipulihkan");
        } catch (Throwable $e) {
            Log::error('[PositionController] Failed to restore position via web', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'position_controller_error',
            ]);

            return redirect()->back()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Permanently delete position
     */
    public function forceDestroy(Request $request, int $id): RedirectResponse
    {
        try {
            $deleted = $this->positionService->forceDestroy($id);

            if ($deleted) {
                Log::info('Position permanently deleted via web interface', [
                    'position_id' => $id,
                    'deleted_by'  => $request->user()?->id,
                    'type'        => 'position_web_action',
                ]);

                return redirect()->route('positions.index')
                    ->with('success', 'Posisi berhasil dihapus permanen');
            }

            return redirect()->back()
                ->with('error', 'Gagal menghapus posisi secara permanen');
        } catch (Throwable $e) {
            Log::error('[PositionController] Failed to force delete position via web', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'position_controller_error',
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
            'search'   => $request->string('search', '')->toString(),
            'isActive' => $request->has('isActive') && $request->filled('isActive')
                ? $request->boolean('isActive')
                : null,
            'outletId' => $request->has('outletId') && $request->filled('outletId')
                ? $request->integer('outletId')
                : null,
            'sortBy'        => $request->string('sortBy', 'createdAt')->toString(),
            'sortDirection' => $request->string('sortDirection', 'desc')->toString(),
            'page'          => $request->integer('page', 1),
            'perPage'       => $request->integer('perPage', 15),
        ];
    }
}
