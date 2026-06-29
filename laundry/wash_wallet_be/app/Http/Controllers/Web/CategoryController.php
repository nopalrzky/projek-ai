<?php

namespace App\Http\Controllers\Web;

use Illuminate\Routing\Attributes\Controllers\Middleware;

use App\Helpers\PaginationHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\Category\StoreCategoryRequest;
use App\Http\Requests\Category\UpdateCategoryRequest;
use App\Http\Requests\Category\LaundryService\StoreLaundryServiceRequest;
use App\Http\Requests\Category\LaundryService\UpdateLaundryServiceRequest;
use App\Http\Resources\Category\CategoryResource;
use App\Http\Resources\LaundryService\LaundryServiceResource;
use App\Http\Resources\Outlet\OutletResource;
use App\Http\Resources\Process\ProcessResource;
use App\Http\Resources\Unit\UnitResource;
use App\Services\CategoryService;
use App\Services\LaundryServiceService;
use App\Services\OutletService;
use App\Services\ProcessService;
use App\Services\UnitService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

#[Middleware('auth')]
class CategoryController extends Controller
{
    public function __construct(private readonly CategoryService $categoryService, private readonly LaundryServiceService $laundryServiceService, private readonly OutletService $outletService, private readonly ProcessService $processService, private readonly UnitService $unitService) {}

    public function index(Request $request): Response
    {
        try {
            $filters = $this->getFiltersFromRequest($request);

            $categories = $this->categoryService->getAll(
                filters: $filters,
                page: $filters['page'],
                perPage: $filters['perPage'],
                relations: ['outlet:id,name,code', 'laundryServices']
            );

            $outlets = $this->outletService->getAll();

            return Inertia::render('Dashboard/Categories/Index', [
                'categories' => [
                    'data' => CategoryResource::collection($categories->items())->resolve(),
                    'meta' => PaginationHelper::format($categories, $request),
                ],
                'filterOptions' => [
                    'outlets' => OutletResource::collection($outlets)->resolve(),
                    'statusOptions' => [
                        ['value' => 'true',  'label' => 'Aktif'],
                        ['value' => 'false', 'label' => 'Nonaktif'],
                    ],
                ],
                'filters' => [
                    'search'        => $filters['search'] ?? '',
                    'outletId'      => $filters['outletId'] ?? null,
                    'isActive'      => $filters['isActive'] ?? null,
                    'sortBy'        => $filters['sortBy'] ?? 'created_at',
                    'sortDirection' => $filters['sortDirection'] ?? 'desc',
                ],
                'flash' => [
                    'success' => session('success'),
                    'error'   => session('error'),
                ],
            ]);
        } catch (Throwable $e) {
            Log::error('[CategoryController] Failed to load categories index', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'category_controller_error',
            ]);

            return Inertia::render('Dashboard/Categories/Index', [
                'categories' => [
                    'data' => [],
                    'meta' => [
                        'current_page' => 1,
                        'from'         => 0,
                        'last_page'    => 1,
                        'per_page'     => 15,
                        'to'           => 0,
                        'total'        => 0,
                    ],
                ],
                'filterOptions' => [
                    'outlets' => [],
                    'statusOptions' => [
                        ['value' => 'true',  'label' => 'Aktif'],
                        ['value' => 'false', 'label' => 'Nonaktif'],
                    ],
                ],
                'filters' => [],
                'flash'   => [
                    'error' => 'Gagal memuat data kategori. Silakan coba lagi.',
                ],
            ]);
        }
    }

    public function create(): Response|RedirectResponse
    {
        try {
            $outlets = $this->outletService->getAll();

            return Inertia::render('Dashboard/Categories/Create', [
                'outlets' => OutletResource::collection($outlets)->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[CategoryController] Failed to load category create form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'category_controller_error',
            ]);

            return redirect()->route('categories.index')
                ->with('error', 'Gagal memuat formulir pembuatan kategori');
        }
    }

    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        try {
            $category = $this->categoryService->store($request->validated());

            return redirect()->route('categories.index')
                ->with('success', "Kategori '{$category->name}' berhasil dibuat");
        } catch (Throwable $e) {
            Log::error('[CategoryController] Failed to create category', [
                'data'    => $request->except(['password']),
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'category_controller_error',
            ]);

            return redirect()->back()
                ->withInput($request->except(['password']))
                ->withErrors(['error' => 'Gagal membuat kategori: ' . $e->getMessage()])
                ->with('error', 'Gagal membuat kategori: ' . $e->getMessage());
        }
    }

    public function show(int $id): Response|RedirectResponse
    {
        try {
            $category = $this->categoryService->getById(
                $id,
                [
                    'outlet',
                    'laundryServices',
                    'laundryServices.unit',
                    'laundryServices',
                ]
            );

            return Inertia::render('Dashboard/Categories/Show', [
                'category' => (new CategoryResource($category))->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[CategoryController] Failed to show category', [
                'category_id' => $id,
                'error'       => $e->getMessage(),
                'user_id'     => Auth::id(),
                'type'        => 'category_controller_error',
            ]);

            return redirect()->route('categories.index')
                ->with('error', 'Kategori tidak ditemukan atau akses ditolak');
        }
    }

    public function edit(int $id): Response|RedirectResponse
    {
        try {
            $category = $this->categoryService->getById(
                $id,
            );

            $outlets = $this->outletService->getAll();

            return Inertia::render('Dashboard/Categories/Edit', [
                'category' => (new CategoryResource($category))->resolve(),
                'outlets'  => OutletResource::collection($outlets)->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[CategoryController] Failed to load category edit form', [
                'category_id' => $id,
                'error'       => $e->getMessage(),
                'user_id'     => Auth::id(),
                'type'        => 'category_controller_error',
            ]);

            return redirect()->route('categories.index')
                ->with('error', 'Kategori tidak ditemukan atau akses ditolak');
        }
    }

    public function update(UpdateCategoryRequest $request, int $id): RedirectResponse
    {
        try {
            $category = $this->categoryService->update(
                id: $id,
                data: $request->validated()
            );

            return redirect()->route('categories.index')
                ->with('success', "Kategori '{$category->name}' berhasil diperbarui");
        } catch (Throwable $e) {
            Log::error('[CategoryController] Failed to update category', [
                'category_id' => $id,
                'data'        => $request->validated(),
                'error'       => $e->getMessage(),
                'user_id'     => Auth::id(),
                'type'        => 'category_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'Gagal memperbarui kategori: ' . $e->getMessage());
        }
    }

    public function destroy(int $id): RedirectResponse
    {
        try {
            $deleted = $this->categoryService->destroy($id);

            if ($deleted) {
                return redirect()->route('categories.index')
                    ->with('success', 'Kategori berhasil dihapus');
            }

            return redirect()->back()
                ->with('error', 'Gagal menghapus kategori');
        } catch (Throwable $e) {
            Log::error('[CategoryController] Failed to delete category', [
                'category_id' => $id,
                'error'       => $e->getMessage(),
                'user_id'     => Auth::id(),
                'type'        => 'category_controller_error',
            ]);

            return redirect()->back()
                ->with('error', 'Gagal menghapus kategori: ' . $e->getMessage());
        }
    }

    public function createLaundryService(int $categoryId): Response|RedirectResponse
    {
        try {
            $category = $this->categoryService->getById(
                id: $categoryId,
                relations: ['outlet']
            );

            $units     = $this->unitService->getAll();
            $processes = $this->processService->getAll();

            return Inertia::render('Dashboard/Categories/LaundryServices/Create', [
                'category'  => (new CategoryResource($category))->resolve(),
                'units'     => UnitResource::collection($units)->resolve(),
                'processes' => ProcessResource::collection($processes)->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[CategoryController] Failed to load laundry service create form', [
                'category_id' => $categoryId,
                'error'       => $e->getMessage(),
                'user_id'     => Auth::id(),
                'type'        => 'laundry_service_controller_error',
            ]);

            return redirect()->route('categories.show', $categoryId)
                ->with('error', 'Gagal memuat formulir pembuatan layanan');
        }
    }

    public function storeLaundryService(StoreLaundryServiceRequest $request, int $categoryId): RedirectResponse
    {
        try {
            $laundryService = $this->categoryService->storeLaundryService(
                categoryId: $categoryId,
                data: $request->validated()
            );

            return redirect()->route('categories.show', $categoryId)
                ->with('success', "Layanan '{$laundryService->name}' berhasil ditambahkan ke kategori");
        } catch (Throwable $e) {
            Log::error('[CategoryController] Failed to create laundry service', [
                'category_id' => $categoryId,
                'data'        => $request->validated(),
                'error'       => $e->getMessage(),
                'user_id'     => Auth::id(),
                'type'        => 'laundry_service_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'Gagal menambahkan layanan: ' . $e->getMessage());
        }
    }

    public function editLaundryService(int $categoryId, int $laundryServiceId): Response|RedirectResponse
    {
        try {
            $category = $this->categoryService->getById(
                id: $categoryId,
                relations: ['outlet']
            );

            $laundryService = $this->laundryServiceService->getById(
                $laundryServiceId,
                ['unit', 'category', 'outlet', 'laundryServiceProcesses.process']
            );

            $units     = $this->unitService->getAll();
            $processes = $this->processService->getAll();

            return Inertia::render('Dashboard/Categories/LaundryServices/Edit', [
                'category'       => (new CategoryResource($category))->resolve(),
                'laundryService' => (new LaundryServiceResource($laundryService))->resolve(),
                'units'          => UnitResource::collection($units)->resolve(),
                'processes'      => ProcessResource::collection($processes)->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[CategoryController] Failed to load laundry service edit form', [
                'category_id'       => $categoryId,
                'laundry_service_id' => $laundryServiceId,
                'error'             => $e->getMessage(),
                'user_id'           => Auth::id(),
                'type'              => 'laundry_service_controller_error',
            ]);

            return redirect()->route('categories.show', $categoryId)
                ->with('error', 'Layanan tidak ditemukan atau akses ditolak');
        }
    }

    public function updateLaundryService(
        UpdateLaundryServiceRequest $request,
        int $categoryId,
        int $laundryServiceId
    ): RedirectResponse {
        try {
            $laundryService = $this->categoryService->updateLaundryService(
                categoryId: $categoryId,
                laundryServiceId: $laundryServiceId,
                data: $request->validated()
            );

            return redirect()->route('categories.show', $categoryId)
                ->with('success', "Layanan '{$laundryService->name}' berhasil diperbarui");
        } catch (Throwable $e) {
            Log::error('[CategoryController] Failed to update laundry service', [
                'category_id'       => $categoryId,
                'laundry_service_id' => $laundryServiceId,
                'data'              => $request->validated(),
                'error'             => $e->getMessage(),
                'user_id'           => Auth::id(),
                'type'              => 'laundry_service_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'Gagal memperbarui layanan: ' . $e->getMessage());
        }
    }

    public function destroyLaundryService(int $categoryId, int $laundryServiceId): RedirectResponse
    {
        try {
            $deleted = $this->categoryService->destroyLaundryService(
                categoryId: $categoryId,
                laundryServiceId: $laundryServiceId
            );

            if ($deleted) {
                return redirect()->route('categories.show', $categoryId)
                    ->with('success', 'Layanan berhasil dihapus dari kategori');
            }

            return redirect()->back()
                ->with('error', 'Gagal menghapus layanan');
        } catch (Throwable $e) {
            Log::error('[CategoryController] Failed to delete laundry service', [
                'category_id'       => $categoryId,
                'laundry_service_id' => $laundryServiceId,
                'error'             => $e->getMessage(),
                'user_id'           => Auth::id(),
                'type'              => 'laundry_service_controller_error',
            ]);

            return redirect()->back()
                ->with('error', 'Gagal menghapus layanan: ' . $e->getMessage());
        }
    }

    private function getFiltersFromRequest(Request $request): array
    {
        return [
            'search'    => $request->string('search')->toString(),
            'outletId'  => $request->has('outletId') && $request->filled('outletId')
                ? $request->integer('outletId')
                : null,
            'isActive'  => $request->has('isActive') && $request->filled('isActive')
                ? $request->boolean('isActive')
                : null,
            'sortBy'        => $request->string('sortBy', 'created_at')->toString(),
            'sortDirection' => $request->string('sortDirection', 'desc')->toString(),
            'page'          => $request->integer('page', 1),
            'perPage'       => $request->integer('perPage', 15),
        ];
    }
}
