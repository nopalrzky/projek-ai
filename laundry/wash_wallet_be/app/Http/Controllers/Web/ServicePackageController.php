<?php

namespace App\Http\Controllers\Web;

use Illuminate\Routing\Attributes\Controllers\Middleware;

use App\Helpers\PaginationHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\ServicePackage\StoreServicePackageRequest;
use App\Http\Requests\ServicePackage\UpdateServicePackageRequest;
use App\Http\Resources\LaundryService\LaundryServiceResource;
use App\Http\Resources\Outlet\OutletResource;
use App\Http\Resources\ServicePackage\ServicePackageResource;
use App\Services\LaundryServiceService;
use App\Services\OutletService;
use App\Services\ServicePackageService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

#[Middleware('auth')]
class ServicePackageController extends Controller
{
    public function __construct(private readonly LaundryServiceService $laundryServiceService, private readonly ServicePackageService $servicePackageService, private readonly OutletService $outletService) {}

    public function index(Request $request): Response
    {
        try {
            $filters = $this->getFiltersFromRequest($request);

            $packages = $this->servicePackageService->getAll(
                filters: $filters,
                page: $filters['page'],
                perPage: $filters['perPage'],
                relations: [
                    'outlet:id,name',
                    'servicePackageItems.laundryService.unit',
                    'servicePackageItems.laundryService.category',
                ]
            );

            $outlets = $this->outletService->getAll();

            return Inertia::render('Dashboard/ServicePackages/Index', [
                'servicePackages' => [
                    'data' => ServicePackageResource::collection($packages->items())->resolve(),
                    'meta' => PaginationHelper::format($packages, $request),
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
            Log::error('[ServicePackageController] Failed to load service packages index', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'service_package_controller_error',
            ]);

            return Inertia::render('Dashboard/ServicePackages/Index', [
                'servicePackages' => [
                    'data' => [],
                    'meta' => [],
                ],
                'filterOptions' => [
                    'outlets' => [],
                ],
                'filters' => [],
                'flash'   => [
                    'error' => 'Gagal memuat daftar Paket Layanan',
                ],
            ]);
        }
    }

    public function create(): Response|RedirectResponse
    {
        try {
            $outlets = $this->outletService->getAll();

            return Inertia::render('Dashboard/ServicePackages/Create', [
                'outlets' => OutletResource::collection($outlets)->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[ServicePackageController] Failed to load service package create form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'service_package_controller_error',
            ]);

            return redirect()->route('service-packages.index')
                ->with('error', 'Gagal memuat formulir pembuatan Paket Layanan');
        }
    }

    public function store(StoreServicePackageRequest $request): RedirectResponse
    {
        try {
            $this->servicePackageService->store($request->validated());

            return redirect()->route('service-packages.index')
                ->with('success', 'Paket Layanan berhasil ditambahkan');
        } catch (Throwable $e) {
            Log::error('[ServicePackageController] Failed to create service package', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'service_package_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    public function show(int $id): Response|RedirectResponse
    {
        try {
            $servicePackage = $this->servicePackageService->getById($id, relations: [
                'servicePackageItems',
                'servicePackageItems.laundryService',
                'servicePackageItems.laundryService.category',
                'customerSubscriptions',
                'customerSubscriptions.customer',
                'outlet',
            ]);

            return Inertia::render('Dashboard/ServicePackages/Show', [
                'servicePackage' => (new ServicePackageResource($servicePackage))->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[ServicePackageController] Failed to show service package', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'service_package_controller_error',
            ]);

            return redirect()->route('service-packages.index')
                ->with('error', 'Paket Layanan tidak ditemukan atau akses ditolak');
        }
    }

    public function edit(int $id): Response|RedirectResponse
    {
        try {
            $servicePackage = $this->servicePackageService->getById($id, [
                'outlet',
                'servicePackageItems',
                'servicePackageItems.laundryService',
                'servicePackageItems.laundryService.category',
            ]);

            $laundryServices = $this->laundryServiceService->getAll(
                filters: ['outletId' => $servicePackage->outlet_id]
            );

            return Inertia::render('Dashboard/ServicePackages/Edit', [
                'servicePackage'  => (new ServicePackageResource($servicePackage))->resolve(),
                'laundryServices' => LaundryServiceResource::collection($laundryServices)->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[ServicePackageController] Failed to load service package edit form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'service_package_controller_error',
            ]);

            return redirect()->route('service-packages.index')
                ->with('error', 'Paket Layanan tidak ditemukan atau akses ditolak');
        }
    }

    public function update(UpdateServicePackageRequest $request, int $id): RedirectResponse
    {
        try {
            $this->servicePackageService->update($id, $request->validated());

            return redirect()->route('service-packages.index')
                ->with('success', 'Data Paket Layanan berhasil diperbarui');
        } catch (Throwable $e) {
            Log::error('[ServicePackageController] Failed to update service package', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'service_package_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    public function destroy(int $id): RedirectResponse
    {
        try {
            $deleted = $this->servicePackageService->destroy($id);

            if ($deleted) {
                return redirect()->route('service-packages.index')
                    ->with('success', 'Paket Layanan berhasil dihapus');
            }

            return redirect()->back()
                ->with('error', 'Gagal menghapus Paket Layanan');
        } catch (Throwable $e) {
            Log::error('[ServicePackageController] Failed to delete service package', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'service_package_controller_error',
            ]);

            return redirect()->back()
                ->with('error', $e->getMessage());
        }
    }

    private function getFiltersFromRequest(Request $request): array
    {
        $isActiveRaw = $request->input('isActive', $request->input('status'));

        return [
            'search'  => $request->string('search')->toString(),
            'isActive' => $isActiveRaw !== null && $isActiveRaw !== ''
                ? filter_var($isActiveRaw, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE)
                : null,
            'outletId' => $request->has('outletId') && $request->filled('outletId')
                ? $request->integer('outletId')
                : null,
            'minPrice' => $request->has('minPrice') && $request->filled('minPrice')
                ? $request->float('minPrice')
                : null,
            'maxPrice' => $request->has('maxPrice') && $request->filled('maxPrice')
                ? $request->float('maxPrice')
                : null,
            'minValidityDays' => $request->has('minValidityDays') && $request->filled('minValidityDays')
                ? $request->integer('minValidityDays')
                : null,
            'maxValidityDays' => $request->has('maxValidityDays') && $request->filled('maxValidityDays')
                ? $request->integer('maxValidityDays')
                : null,
            'sortBy'        => $request->string('sortBy', 'createdAt')->toString(),
            'sortDirection' => $request->string('sortDirection', 'desc')->toString(),
            'page'          => $request->integer('page', 1),
            'perPage'       => $request->integer('perPage', 15),
        ];
    }
}
