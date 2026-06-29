<?php

namespace App\Http\Controllers\Web;

use Illuminate\Routing\Attributes\Controllers\Middleware;

use App\Helpers\PaginationHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\Feature\StoreFeatureRequest;
use App\Http\Requests\Feature\UpdateFeatureRequest;
use App\Http\Resources\Feature\FeatureResource;
use App\Services\FeatureCatalogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

#[Middleware('auth')]
#[Middleware('role:super_admin')]
class FeatureCatalogController extends Controller
{
    public function __construct(protected readonly FeatureCatalogService $featureCatalogService) {}

    /**
     * Display a listing of features
     */
    public function index(Request $request): Response
    {
        try {
            $filters = $this->getFiltersFromRequest($request);

            $features = $this->featureCatalogService->getAll(
                $filters,
                $filters['page'] ?? 1,
                $filters['perPage'] ?? 15
            );

            return Inertia::render('Dashboard/Features/Index', [
                'features' => [
                    'data' => FeatureResource::collection($features->items())->resolve(),
                    'meta' => PaginationHelper::format($features, $request),
                ],
                'filters' => $filters,
                'flash' => [
                    'success' => session('success'),
                    'error' => session('error'),
                ],
            ]);
        } catch (Throwable $e) {
            Log::error('[FeatureCatalogController] Failed to load features index', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'feature_catalog_controller_error',
            ]);

            return Inertia::render('Dashboard/Features/Index', [
                'features' => [
                    'data' => [],
                    'meta' => [],
                ],
                'filters' => $this->getFiltersFromRequest($request),
                'error' => 'Gagal memuat data. Silakan coba lagi.',
            ]);
        }
    }
    
    /**
     * Show the form for creating a new feature
     */
    public function create(): Response
    {
        return Inertia::render('Dashboard/Features/Create');
    }

    /**
     * Store a newly created feature
     */
    public function store(StoreFeatureRequest $request): RedirectResponse
    {
        try {
            $feature = $this->featureCatalogService->store($request->validated());

            return redirect()->route('features.index')
                ->with('success', "Fitur '{$feature->name}' berhasil dibuat");
        } catch (Throwable $e) {
            Log::error('[FeatureCatalogController] Failed to create feature via web', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'feature_catalog_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Show the form for editing the specified feature
     */
    public function edit(int $id): Response
    {
        $feature = $this->featureCatalogService->getById($id);

        return Inertia::render('Dashboard/Features/Edit', [
            'feature' => new FeatureResource($feature),
        ]);
    }

    /**
     * Update existing feature
     */
    public function update(UpdateFeatureRequest $request, int $id): RedirectResponse
    {
        try {
            $feature = $this->featureCatalogService->update($id, $request->validated());

            return redirect()->route('features.index')
                ->with('success', "Fitur '{$feature->name}' berhasil diperbarui");
        } catch (Throwable $e) {
            Log::error('[FeatureCatalogController] Failed to update feature via web', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'feature_catalog_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Delete feature
     */
    public function destroy(int $id): RedirectResponse
    {
        try {
            $this->featureCatalogService->destroy($id);

            return redirect()->route('features.index')
                ->with('success', 'Fitur berhasil dihapus');
        } catch (Throwable $e) {
            Log::error('[FeatureCatalogController] Failed to delete feature via web', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'feature_catalog_controller_error',
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
            'isActive' => $request->filled('isActive') ? (bool) $request->integer('isActive') : null,
            'page' => $request->integer('page', 1),
            'perPage' => $request->integer('perPage', 15),
            'sortBy' => $request->string('sortBy', 'sort_order')->toString(),
            'sortDirection' => $request->string('sortDirection', 'asc')->toString(),
        ];
    }
}
