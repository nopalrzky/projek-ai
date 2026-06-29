<?php

namespace App\Http\Controllers\Web;

use Illuminate\Routing\Attributes\Controllers\Middleware;

use App\Helpers\PaginationHelper;
use App\Http\Controllers\Controller;

use App\Http\Requests\LaundryService\StoreLaundryServiceRequest;
use App\Http\Requests\LaundryService\UpdateLaundryServiceRequest;
use App\Http\Requests\LaundryService\LaundryServiceProcess\StoreLaundryServiceProcessRequest;
use App\Http\Requests\LaundryService\LaundryServiceProcess\UpdateLaundryServiceProcessRequest;

use App\Http\Resources\Category\CategoryResource;
use App\Http\Resources\LaundryService\LaundryServiceResource;
use App\Http\Resources\LaundryServiceProcess\LaundryServiceProcessResource;
use App\Http\Resources\Process\ProcessResource;
use App\Http\Resources\Outlet\OutletResource;
use App\Http\Resources\Unit\UnitResource;

use App\Services\CategoryService;
use App\Services\LaundryServiceService;
use App\Services\LaundryServiceProcessService;
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
class LaundryServiceController extends Controller
{
    public function __construct(private readonly CategoryService $categoryService, private readonly LaundryServiceService $laundryServiceService, private readonly LaundryServiceProcessService $laundryServiceProcessService, private readonly OutletService $outletService, private readonly ProcessService $processService, private readonly UnitService $unitService) {}

    /**
     * Display a listing of the laundry services
     */
    public function index(Request $request): Response
    {
        try {
            $filters = $this->getFiltersFromRequest($request);

            $laundryServices = $this->laundryServiceService->getAll(
                $filters,
                $filters['page'],
                $filters['perPage'],
                ['category.outlet', 'unit']
            );

            $outlets = $this->outletService->getAll();
            $categories = $this->categoryService->getAll();
            $units = $this->unitService->getAll();

            return Inertia::render('Dashboard/LaundryServices/Index', [
                'laundryServices' => [
                    'data' => LaundryServiceResource::collection($laundryServices->items())->resolve(),
                    'meta' => PaginationHelper::format($laundryServices, $request),
                ],
                'filterOptions' => [
                    'outlets'       => OutletResource::collection($outlets)->resolve(),
                    'categories'    => CategoryResource::collection($categories)->resolve(),
                    'units'         => UnitResource::collection($units)->resolve(),
                    'statusOptions' => [
                        ['value' => true, 'label' => 'Aktif'],
                        ['value' => false, 'label' => 'Tidak Aktif'],
                    ],
                ],
                'filters' => [
                    'search'           => $filters['search'] ?? '',
                    'isActive'         => $filters['isActive'] ?? null,
                    'outletId'         => $filters['outletId'] ?? null,
                    'categoryId'       => $filters['categoryId'] ?? null,
                    'unitId'           => $filters['unitId'] ?? null,
                    'minPrice'         => $filters['minPrice'] ?? null,
                    'maxPrice'         => $filters['maxPrice'] ?? null,
                    'minDurationHours' => $filters['minDurationHours'] ?? null,
                    'maxDurationHours' => $filters['maxDurationHours'] ?? null,
                    'minQuantity'      => $filters['minQuantity'] ?? null,
                    'perPage'          => $filters['perPage'] ?? 15,
                    'page'             => $filters['page'] ?? 1,
                    'sortBy'           => $filters['sortBy'] ?? 'created_at',
                    'sortDirection'    => $filters['sortDirection'] ?? 'desc',
                ],
                'flash' => [
                    'success' => session('success'),
                    'error'   => session('error'),
                ],
            ]);
        } catch (Throwable $e) {
            Log::error('[LaundryServiceController] Failed to load laundry services index', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'laundry_service_controller_error',
            ]);

            return Inertia::render('Dashboard/LaundryServices/Index', [
                'laundryServices' => [
                    'data' => [],
                    'meta' => [
                        'total'       => 0,
                        'perPage'     => 15,
                        'currentPage' => 1,
                        'lastPage'    => 1,
                        'from'        => 1,
                        'to'          => 1,
                    ],
                ],
                'filterOptions' => [
                    'outlets'       => [],
                    'categories'    => [],
                    'units'         => [],
                    'statusOptions' => [],
                ],
                'filters' => [],
                'flash'   => [
                    'error' => 'Gagal memuat data layanan laundry. Silakan coba lagi.',
                ],
            ]);
        }
    }

    /**
     * Show the form for creating a new laundry service
     */
    public function create(): Response|RedirectResponse
    {
        try {
            $outlets = $this->outletService->getAll();
            $units = $this->unitService->getAll();
            $processes = $this->processService->getAll();

            if ($outlets->isEmpty()) {
                return redirect()->route('outlets.create')
                    ->with('warning', 'Silakan buat outlet terlebih dahulu sebelum menambah layanan laundry');
            }

            return Inertia::render('Dashboard/LaundryServices/Create', [
                'outlets'   => OutletResource::collection($outlets)->resolve(),
                'units'     => UnitResource::collection($units)->resolve(),
                'processes' => ProcessResource::collection($processes)->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[LaundryServiceController] Failed to load laundry service create form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'laundry_service_controller_error',
            ]);

            return redirect()->route('laundry-services.index')
                ->with('error', 'Gagal memuat formulir pembuatan layanan laundry');
        }
    }

    /**
     * Store a newly created laundry service
     */
    public function store(StoreLaundryServiceRequest $request): RedirectResponse
    {
        try {
            $laundryService = $this->laundryServiceService->store($request->validated());

            return redirect()->route('laundry-services.index')
                ->with('success', "Layanan laundry '{$laundryService->name}' berhasil dibuat");
        } catch (Throwable $e) {
            Log::error('[LaundryServiceController] Failed to create laundry service via web', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'laundry_service_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Display the specified laundry service
     */
    public function show(Request $request, int $id): Response|RedirectResponse
    {
        try {
            $laundryService = $this->laundryServiceService->getById($id, [
                'category',
                'category.outlet',
                'unit',
                'laundryServiceProcesses.process',
                'servicePackageItems.servicePackage',
                'servicePackageItems.servicePackage.outlet',
            ]);

            // Load count orderItems tanpa memuat seluruh data
            $laundryService->loadCount('orderItems');

            // Load orderItems terbatas 20 terbaru dengan relasi order dan customer
            $laundryService->load(['orderItems' => function ($query) {
                $query->with(['order', 'order.customer'])
                      ->orderBy('created_at', 'desc')
                      ->limit(20);
            }]);

            return Inertia::render('Dashboard/LaundryServices/Show', [
                'laundryService' => (new LaundryServiceResource($laundryService))->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[LaundryServiceController] Failed to show laundry service', [
                'error'              => $e->getMessage(),
                'user_id'            => Auth::id(),
                'type'               => 'laundry_service_controller_error',
            ]);

            return redirect()->route('laundry-services.index')
                ->with('error', 'Layanan laundry tidak ditemukan atau akses ditolak');
        }
    }

    /**
     * Show the form for editing the specified laundry service
     */
    public function edit(Request $request, int $id): Response|RedirectResponse
    {
        try {
            $laundryService = $this->laundryServiceService->getById($id, [
                'category.outlet',
                'unit',
                'laundryServiceProcesses.process',
            ]);
            $units = $this->unitService->getAll();
            $categories = $this->categoryService->getAll(
                filters: ['outletId' => $laundryService->category->outlet->id]
            );
            $processes = $this->processService->getAll([], null, null, []);

            return Inertia::render('Dashboard/LaundryServices/Edit', [
                'laundryService' => (new LaundryServiceResource($laundryService))->resolve(),
                'categories'     => CategoryResource::collection($categories)->resolve(),
                'units'          => UnitResource::collection($units)->resolve(),
                'processes'      => ProcessResource::collection($processes)->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[LaundryServiceController] Failed to load laundry service edit form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'laundry_service_controller_error',
            ]);

            return redirect()->route('laundry-services.index')
                ->with('error', 'Layanan laundry tidak ditemukan atau akses ditolak');
        }
    }

    /**
     * Update the specified laundry service
     */
    public function update(UpdateLaundryServiceRequest $request, int $id): RedirectResponse
    {
        try {
            $updatedLaundryService = $this->laundryServiceService->update($id, $request->validated());

            return redirect()->route('laundry-services.index')
                ->with('success', "Layanan laundry '{$updatedLaundryService->name}' berhasil diperbarui");
        } catch (Throwable $e) {
            Log::error('[LaundryServiceController] Failed to update laundry service via web', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'laundry_service_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Remove the specified laundry service
     */
    public function destroy(Request $request, int $id): RedirectResponse
    {
        try {
            $this->laundryServiceService->destroy($id);

            return redirect()->route('laundry-services.index')
                ->with('success', 'Layanan laundry berhasil dihapus');
        } catch (Throwable $e) {
            Log::error('[LaundryServiceController] Failed to delete laundry service via web', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'laundry_service_controller_error',
            ]);

            return redirect()->back()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Restore soft deleted laundry service
     */
    public function restore(Request $request, int $id): RedirectResponse
    {
        try {
            $laundryService = $this->laundryServiceService->restore($id);

            return redirect()->route('laundry-services.show', $laundryService->id)
                ->with('success', "Layanan laundry '{$laundryService->name}' berhasil dipulihkan");
        } catch (Throwable $e) {
            Log::error('[LaundryServiceController] Failed to restore laundry service via web', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'laundry_service_controller_error',
            ]);

            return redirect()->back()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Permanently delete laundry service
     */
    public function forceDestroy(Request $request, int $id): RedirectResponse
    {
        try {
            $deleted = $this->laundryServiceService->forceDestroy($id);

            if ($deleted) {
                Log::info('Laundry service permanently deleted via web interface', [
                    'laundry_service_id' => $id,
                    'deleted_by'         => $request->user()?->id,
                    'type'               => 'laundry_service_web_action',
                ]);

                return redirect()->route('laundry-services.index')
                    ->with('success', 'Layanan laundry berhasil dihapus permanen');
            }

            return redirect()->back()
                ->with('error', 'Gagal menghapus layanan laundry secara permanen');
        } catch (Throwable $e) {
            Log::error('[LaundryServiceController] Failed to force delete laundry service via web', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'laundry_service_controller_error',
            ]);

            return redirect()->back()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Show form for creating new laundry service process
     */
    public function createLaundryServiceProcess(int $laundryServiceId): Response|RedirectResponse
    {
        try {
            $laundryService = $this->laundryServiceService->getById(
                $laundryServiceId,
                ['category.outlet', 'unit', 'laundryServiceProcesses.process']
            );
            $process = $this->processService->getAll();
            $assignedProcessIds = $laundryService->laundryServiceProcesses
                ->pluck('process_id')
                ->toArray();
            $availableProcesses = $process->filter(function ($process) use ($assignedProcessIds) {
                return !in_array($process->id, $assignedProcessIds);
            });

            return Inertia::render('Dashboard/LaundryServices/LaundryServiceProcesses/Create', [
                'laundryService' => (new LaundryServiceResource($laundryService))->resolve(),
                'processes'      => ProcessResource::collection($availableProcesses)->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[LaundryServiceController] Failed to load laundry service process create form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'laundry_service_process_controller_error',
            ]);

            return redirect()->route('laundry-services.show', $laundryServiceId)
                ->with('error', 'Gagal memuat formulir pembuatan proses layanan');
        }
    }

    /**
     * Store new laundry service process
     */
    public function storeLaundryServiceProcess(
        int $laundryServiceId,
        StoreLaundryServiceProcessRequest $request
    ): RedirectResponse {
        try {
            $laundryServiceProcess = $this->laundryServiceService
                ->storeLaundryServiceProcess($laundryServiceId, $request->validated());

            return redirect()->route('laundry-services.show', $laundryServiceId)
                ->with('success', "Proses '{$laundryServiceProcess->process->name}' berhasil ditambahkan ke layanan");
        } catch (Throwable $e) {
            Log::error('[LaundryServiceController] Failed to create laundry service process', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'laundry_service_process_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Show form for editing laundry service process
     */
    public function editLaundryServiceProcess(
        int $laundryServiceId,
        int $laundryServiceProcessId
    ): Response|RedirectResponse {
        try {
            $laundryService = $this->laundryServiceService->getById(
                $laundryServiceId,
                ['category.outlet', 'unit']
            );

            $laundryServiceProcess = $this->laundryServiceProcessService
                ->getById($laundryServiceProcessId);

            $processes = $this->processService->getAll();

            return Inertia::render('Dashboard/LaundryServices/LaundryServiceProcesses/Edit', [
                'laundryService'        => (new LaundryServiceResource($laundryService))->resolve(),
                'laundryServiceProcess' => (new LaundryServiceProcessResource($laundryServiceProcess))->resolve(),
                'processes'             => ProcessResource::collection($processes)->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[LaundryServiceController] Failed to load laundry service process edit form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'laundry_service_process_controller_error',
            ]);

            return redirect()->route('laundry-services.show', $laundryServiceId)
                ->with('error', 'Proses layanan tidak ditemukan');
        }
    }

    /**
     * Update laundry service process
     */
    public function updateLaundryServiceProcess(
        int $laundryServiceId,
        int $laundryServiceProcessId,
        UpdateLaundryServiceProcessRequest $request
    ): RedirectResponse {
        try {
            $laundryServiceProcess = $this->laundryServiceService
                ->updateLaundryServiceProcess(
                    $laundryServiceId,
                    $laundryServiceProcessId,
                    $request->validated()
                );

            return redirect()->route('laundry-services.show', $laundryServiceId)
                ->with('success', "Proses '{$laundryServiceProcess->process->name}' berhasil diperbarui");
        } catch (Throwable $e) {
            Log::error('[LaundryServiceController] Failed to update laundry service process', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'laundry_service_process_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Delete laundry service process
     */
    public function destroyLaundryServiceProcess(
        int $laundryServiceId,
        int $laundryServiceProcessId
    ): RedirectResponse {
        try {
            $deleted = $this->laundryServiceService
                ->destroyLaundryServiceProcess($laundryServiceId, $laundryServiceProcessId);

            if ($deleted) {
                return redirect()->route('laundry-services.show', $laundryServiceId)
                    ->with('success', 'Proses berhasil dihapus dari layanan');
            }

            return redirect()->back()
                ->with('error', 'Gagal menghapus proses');
        } catch (Throwable $e) {
            Log::error('[LaundryServiceController] Failed to delete laundry service process', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'laundry_service_process_controller_error',
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
            'search'   => $request->string('search')->toString(),
            'isActive' => $request->has('isActive') && $request->filled('isActive')
                ? $request->boolean('isActive')
                : null,
            'outletId' => $request->has('outletId') && $request->filled('outletId')
                ? $request->integer('outletId')
                : null,
            'categoryId' => $request->has('categoryId') && $request->filled('categoryId')
                ? $request->integer('categoryId')
                : null,
            'unitId' => $request->has('unitId') && $request->filled('unitId')
                ? $request->integer('unitId')
                : null,

            'withCounts'    => true,
            'sortBy'        => $request->string('sortBy', 'created_at')->toString(),
            'sortDirection' => $request->string('sortDirection', 'desc')->toString(),
            'page'          => $request->integer('page', 1),
            'perPage'       => $request->integer('perPage', 15),
        ];
    }
}
