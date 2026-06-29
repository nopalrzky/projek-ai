<?php

namespace App\Http\Controllers\Web;

use Illuminate\Routing\Attributes\Controllers\Middleware;

use App\Helpers\PaginationHelper;

use App\Http\Controllers\Controller;
use App\Http\Requests\Outlet\StoreOutletRequest;
use App\Http\Requests\Outlet\UpdateOutletRequest;
use App\Http\Requests\Outlet\Category\StoreCategoryRequest;
use App\Http\Requests\Outlet\Category\UpdateCategoryRequest;
use App\Http\Requests\Outlet\CourierSchedule\StoreCourierScheduleRequest;
use App\Http\Requests\Outlet\CourierSchedule\UpdateCourierScheduleRequest;
use App\Http\Requests\Outlet\CourierSetting\UpdateCourierSettingRequest;
use App\Http\Requests\Outlet\Customer\StoreCustomerRequest;
use App\Http\Requests\Outlet\Customer\UpdateCustomerRequest;
use App\Http\Requests\Outlet\Employee\StoreEmployeeRequest;
use App\Http\Requests\Outlet\Employee\UpdateEmployeeRequest;
use App\Http\Requests\Outlet\Fine\StoreFineRequest;
use App\Http\Requests\Outlet\Fine\UpdateFineRequest;
use App\Http\Requests\Outlet\LaundryService\StoreLaundryServiceRequest;
use App\Http\Requests\Outlet\LaundryService\UpdateLaundryServiceRequest;
use App\Http\Requests\LaundryService\BulkUpdateCourierEligibilityRequest;
use App\Http\Requests\Outlet\MembershipPlan\StoreMembershipPlanRequest;
use App\Http\Requests\Outlet\MembershipPlan\UpdateMembershipPlanRequest;
use App\Http\Requests\Outlet\OperationalDay\StoreOperationalDayRequest;
use App\Http\Requests\Outlet\OperationalDay\UpdateOperationalDayRequest;
use App\Http\Requests\Outlet\Position\StorePositionRequest;
use App\Http\Requests\Outlet\Position\UpdatePositionRequest;
use App\Http\Requests\Outlet\ServicePackage\StoreServicePackageRequest;
use App\Http\Requests\Outlet\ServicePackage\UpdateServicePackageRequest;

use App\Http\Resources\Category\CategoryResource;
use App\Http\Resources\Customer\CustomerResource;
use App\Http\Resources\Employee\EmployeeResource;
use App\Http\Resources\Fine\FineResource;
use App\Http\Resources\LaundryService\LaundryServiceResource;
use App\Http\Resources\MembershipPlan\MembershipPlanResource;
use App\Http\Resources\Feature\FeatureResource;
use App\Http\Resources\Outlet\OutletResource;
use App\Http\Resources\Position\PositionResource;
use App\Http\Resources\Process\ProcessResource;
use App\Http\Resources\Salary\SalaryResource;
use App\Http\Resources\ServicePackage\ServicePackageResource;
use App\Http\Resources\Unit\UnitResource;

use App\Services\CategoryService;
use App\Services\CourierScheduleService;
use App\Services\CourierSettingService;
use App\Services\CustomerService;
use App\Services\EmployeeService;
use App\Services\FineService;
use App\Services\LaundryServiceService;
use App\Services\MembershipPlanService;
use App\Services\OperationalDayService;
use App\Services\OutletService;
use App\Services\OutletOverviewService;
use App\Services\PositionService;
use App\Services\ProcessService;
use App\Services\SalaryService;
use App\Services\ServicePackageService;
use App\Services\UnitService;
use App\Services\FeatureCatalogService;
use App\Services\OutletFeatureService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;
use Illuminate\Support\Facades\Auth;

#[Middleware('auth')]
class OutletController extends Controller
{
    public function __construct(
        private readonly CategoryService $categoryService,
        private readonly CourierSettingService $courierSettingService,
        private readonly CourierScheduleService $courierScheduleService,
        private readonly CustomerService $customerService,
        private readonly EmployeeService $employeeService,
        private readonly FeatureCatalogService $featureCatalogService,
        private readonly OutletFeatureService $outletFeatureService,
        private readonly FineService $fineService,
        private readonly LaundryServiceService $laundryServiceService,
        private readonly MembershipPlanService $membershipPlanService,
        private readonly OperationalDayService $operationalDayService,
        private readonly OutletService $outletService,
        private readonly OutletOverviewService $outletOverviewService,
        private readonly PositionService $positionService,
        private readonly ProcessService $processService,
        private readonly SalaryService $salaryService,
        private readonly ServicePackageService $servicePackageService,
        private readonly UnitService $unitService,
    ) {}

    /**
     * Display a listing of the outlets
     */
    public function index(Request $request): Response
    {
        try {
            $filters = $this->getFiltersFromRequest($request);

            $outlets = $this->outletService->getAll(
                $filters,
                $filters['page'],
                $filters['perPage'],
                ['courierSetting'],
            );

            $ownerId = Auth::id();

            $provinces = \App\Models\Outlet::byOwnerId($ownerId)
                ->whereNotNull('province_id')
                ->whereNotNull('province_name')
                ->select('province_id as id', 'province_name as name')
                ->distinct()
                ->orderBy('name')
                ->get()
                ->map(fn($item) => ['id' => (int) $item->id, 'name' => (string) $item->name])
                ->toArray();

            $cities = \App\Models\Outlet::byOwnerId($ownerId)
                ->whereNotNull('city_id')
                ->whereNotNull('city_name')
                ->select('city_id as id', 'city_name as name')
                ->distinct()
                ->orderBy('name')
                ->get()
                ->map(fn($item) => ['id' => (int) $item->id, 'name' => (string) $item->name])
                ->toArray();

            $districts = \App\Models\Outlet::byOwnerId($ownerId)
                ->whereNotNull('district_id')
                ->whereNotNull('district_name')
                ->select('district_id as id', 'district_name as name')
                ->distinct()
                ->orderBy('name')
                ->get()
                ->map(fn($item) => ['id' => (int) $item->id, 'name' => (string) $item->name])
                ->toArray();

            return Inertia::render('Dashboard/Outlets/Index', [
                'outlets' => [
                    'data' => OutletResource::collection($outlets->items())->resolve(),
                    'meta' => PaginationHelper::format($outlets, $request),
                ],
                'filterOptions' => [
                    'provinces' => $provinces,
                    'cities' => $cities,
                    'districts' => $districts,
                    'statusOptions' => [
                        ['value' => 'active', 'label' => 'Aktif'],
                        ['value' => 'inactive', 'label' => 'Nonaktif'],
                        ['value' => 'suspended', 'label' => 'Suspended'],
                    ],
                ],
                'filters' => [
                    'search' => $filters['search'] ?? '',
                    'status' => $filters['status'] ?? null,
                    'provinceId' => $filters['provinceId'] ?? null,
                    'cityId' => $filters['cityId'] ?? null,
                    'districtId' => $filters['districtId'] ?? null,
                    'sortBy' => $filters['sortBy'] ?? 'created_at',
                    'sortDirection' => $filters['sortDirection'] ?? 'desc',
                    'perPage' => $filters['perPage'] ?? 10,
                    'page' => $filters['page'] ?? 1,
                ],
                'flash' => [
                    'success' => session('success'),
                    'error' => session('error'),
                ],
            ]);
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to load outlets index', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'outlet_controller_error',
            ]);

            return Inertia::render('Dashboard/Outlets/Index', [
                'outlets' => [
                    'data' => [],
                    'meta' => [
                        'current_page' => 1,
                        'from' => 0,
                        'last_page' => 1,
                        'per_page' => 10,
                        'to' => 0,
                        'total' => 0,
                    ],
                ],
                'filterOptions' => [
                    'provinces' => [],
                    'cities' => [],
                    'districts' => [],
                    'statusOptions' => [
                        ['value' => 'active', 'label' => 'Aktif'],
                        ['value' => 'inactive', 'label' => 'Nonaktif'],
                        ['value' => 'suspended', 'label' => 'Suspended'],
                    ],
                ],
                'filters' => $this->getFiltersFromRequest($request),
                'flash' => [
                    'error' => 'Gagal memuat data outlet',
                ],
            ]);
        }
    }

    /**
     * Show the form for creating a new outlet
     */
    public function create(): Response|RedirectResponse
    {
        try {
            return Inertia::render('Dashboard/Outlets/Create', [
                'googleMapsApiKey' => config('google_maps.api_key'),
            ]);
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to load outlet create form', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'outlet_controller_error'
            ]);

            return redirect()->route('outlets.index')
                ->with('error', 'Gagal memuat formulir pembuatan outlet');
        }
    }

    /**
     * Store a newly created outlet
     */
    public function store(StoreOutletRequest $request): RedirectResponse
    {
        try {
            $outlet = $this->outletService->store($request->validated());

            return redirect()->route('outlets.index')
                ->with('success', "Outlet '{$outlet->name}' berhasil dibuat");
        } catch (Throwable $e) {
            return redirect()->back()
                ->withInput()
                ->with('error', 'Gagal membuat outlet: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified outlet
     */
    public function show(int $id, Request $request): Response|RedirectResponse
    {
        try {
            $outlet = $this->outletService->getById($id, [
                'owner',
                'categories',
                'customers',
                'employees',
                'fines',
                'laundryServices',
                'laundryServices.unit',
                'laundryServices.category',
                'membershipPlans',
                'operationalDays.courierSchedules',
                'positions',
                'servicePackages',
                'courierSchedules',
                'outletFeatures',
                'outletFeatures.feature',
                'outletSettings.setting',
                'courierSetting',
                'courierSetting.pricingTiers',
                'courierSetting.pricingZones',
                'orderReviews',
            ]);

            if ($outlet->status !== 'active') {
                return redirect()->route('outlets.activate.page', $id);
            }

            $period = $request->input('period', '30d');
            $overview = $this->outletOverviewService->buildPayload($outlet, $period);

            return Inertia::render('Dashboard/Outlets/Show', [
                'outlet'               => (new OutletResource($outlet))->resolve(),
                'overviewStats'        => $overview['stats'],
                'overviewCharts'       => $overview['charts'],
                'recentOrders'         => $overview['recentOrders'],
                'operationalChecklist' => $overview['checklist'],
                'overviewMeta'         => $overview['meta'],
            ]);
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to show outlet', [
                'outlet_id' => $id,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'outlet_controller_error'
            ]);

            return redirect()->route('outlets.index')
                ->with('error', 'Outlet tidak ditemukan atau akses ditolak');
        }
    }

    /**
     * Show the activation page for the specified outlet
     */
    public function activatePage(int $id): Response|RedirectResponse
    {
        try {
            $outlet = $this->outletService->getById($id, ['owner']);

            if ($outlet->status === 'active') {
                return redirect()->route('outlets.show', $id);
            }

            $activationFeatureCatalog = $this->featureCatalogService->getAll([
                'key' => 'outlet_activation',
            ])->first();

            $exposureFeatureCatalog = $this->featureCatalogService->getAll([
                'key' => 'outlet_exposure',
            ])->first();

            $trialEligibility = $this->outletFeatureService->getTrialEligibility($id);

            return Inertia::render('Dashboard/Outlets/Activate', [
                'outlet' => (new OutletResource($outlet))->resolve(),
                'ownerCoinBalance' => Auth::user()->coin_balance ?? 0,
                'activationFeatureCatalog' => $activationFeatureCatalog,
                'exposureFeatureCatalog' => $exposureFeatureCatalog,
                'trialEligibility' => $trialEligibility,
            ]);
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to load activate page', [
                'outlet_id' => $id,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'outlet_controller_error'
            ]);

            return redirect()->route('outlets.index')
                ->with('error', 'Gagal memuat halaman aktivasi: ' . $e->getMessage());
        }
    }

    public function toggleExposureAutoRenewal(Request $request, int $outletId): RedirectResponse
    {
        try {
            $enabled = $request->boolean('autoRenewal');

            $this->outletFeatureService->toggleExposureAutoRenewal($outletId, $enabled);

            return back()->with('success', $enabled
                ? 'Auto-renew ekspos outlet berhasil diaktifkan.'
                : 'Auto-renew ekspos outlet berhasil dimatikan.');
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to toggle exposure auto renewal', [
                'outlet_id' => $outletId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'outlet_controller_error',
            ]);

            return back()->with('error', 'Gagal memperbarui auto-renew ekspos outlet: ' . $e->getMessage());
        }
    }

    /**
     * Show the form for editing the specified outlet
     */
    public function edit(int $id): Response|RedirectResponse
    {
        try {
            $outlet = $this->outletService->getById($id);

            return Inertia::render('Dashboard/Outlets/Edit', [
                'outlet' => (new OutletResource($outlet))->resolve(),
                'googleMapsApiKey' => config('google_maps.api_key'),
            ]);
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to load outlet edit form', [
                'outlet_id' => $id,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'outlet_controller_error'
            ]);

            return redirect()->route('outlets.index')
                ->with('error', 'Outlet tidak ditemukan atau akses ditolak');
        }
    }

    /**
     * Update the specified outlet
     */
    public function update(UpdateOutletRequest $request, int $id): RedirectResponse
    {
        try {
            $result = $this->outletService->update($id, $request->validated());

            return redirect()->route('outlets.index')
                ->with('success', "Outlet '{$result->name}' berhasil diperbarui");
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to update outlet via web', [
                'outlet_id' => $id,
                'data' => $request->safe()->except(['password']),
                'error' => $e->getMessage(),
                'user_id' => $request->user()->id,
                'type' => 'outlet_controller_error'
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'Gagal memperbarui outlet: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified outlet
     */
    public function destroy(int $id): RedirectResponse
    {
        try {
            $deleted = $this->outletService->destroy($id);

            if ($deleted) {
                Log::info('[OutletController] Outlet deleted via web interface', [
                    'outlet_id' => $id,
                    'deleted_by' => Auth::id(),
                    'type' => 'outlet_web_action'
                ]);

                return redirect()->route('outlets.index')
                    ->with('success', "Outlet berhasil dihapus");
            }

            return redirect()->back()
                ->with('error', 'Gagal menghapus outlet');
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to delete outlet via web', [
                'outlet_id' => $id,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'outlet_controller_error'
            ]);

            return redirect()->back()
                ->with('error', 'Gagal menghapus outlet: ' . $e->getMessage());
        }
    }

    /**
     * Restore soft deleted outlet
     */
    public function restore(Request $request, int $id): RedirectResponse
    {
        try {
            $outlet = $this->outletService->restore($id);

            Log::info('[OutletController] Outlet restored via web interface', [
                'outlet_id' => $id,
                'outlet_name' => $outlet->name,
                'restored_by' => $request->user()->id,
                'type' => 'outlet_web_action'
            ]);

            return redirect()->route('outlets.show', $outlet->id)
                ->with('success', "Outlet '{$outlet->name}' berhasil dipulihkan");
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to restore outlet via web', [
                'outlet_id' => $id,
                'error' => $e->getMessage(),
                'user_id' => $request->user()->id,
                'type' => 'outlet_controller_error'
            ]);

            return redirect()->back()
                ->with('error', 'Gagal memulihkan outlet: ' . $e->getMessage());
        }
    }

    /**
     * Permanently delete outlet
     */
    public function forceDestroy(Request $request, int $id): RedirectResponse
    {
        try {
            $deleted = $this->outletService->forceDestroy($id);

            if ($deleted) {
                Log::info('[OutletController] Outlet permanently deleted via web interface', [
                    'outlet_id' => $id,
                    'deleted_by' => $request->user()->id,
                    'type' => 'outlet_web_action'
                ]);

                return redirect()->route('outlets.index')
                    ->with('success', 'Outlet berhasil dihapus permanen');
            }

            return redirect()->back()
                ->with('error', 'Gagal menghapus outlet secara permanen');
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to force delete outlet via web', [
                'outlet_id' => $id,
                'error' => $e->getMessage(),
                'user_id' => $request->user()->id,
                'type' => 'outlet_controller_error'
            ]);

            return redirect()->back()
                ->with('error', 'Gagal menghapus outlet secara permanen: ' . $e->getMessage());
        }
    }

    // public function startTrial(int $id): RedirectResponse|JsonResponse
    // {
    //     try {
    //         $trialFeature = $this->outletFeatureService->startTrial($id);

    //         if (request()->expectsJson() || request()->wantsJson()) {
    //             return $this->successResponse([
    //                 'outletId' => $id,
    //                 'status' => $trialFeature->status,
    //                 'trialStartedAt' => $trialFeature->trial_started_at?->toISOString(),
    //                 'trialExpiresAt' => $trialFeature->trial_expires_at?->toISOString(),
    //                 'canStartTrial' => false,
    //             ], 'Trial outlet berhasil dimulai');
    //         }

    //         return redirect()->route('outlets.show', $id)
    //             ->with('success', 'Trial outlet berhasil dimulai');
    //     } catch (ValidationException $e) {
    //         $validationMessage = collect($e->errors())->flatten()->first() ?: 'Validasi trial gagal.';

    //         Log::warning('[OutletController] Trial validation failed', [
    //             'outlet_id' => $id,
    //             'error' => $validationMessage,
    //             'validation_errors' => $e->errors(),
    //             'user_id' => Auth::id(),
    //             'type' => 'outlet_controller_validation'
    //         ]);

    //         if (request()->expectsJson() || request()->wantsJson()) {
    //             return $this->errorResponse($validationMessage, 422, [
    //                 'errors' => $e->errors(),
    //                 'canStartTrial' => false,
    //             ]);
    //         }

    //         return redirect()->back()
    //             ->with('error', 'Gagal memulai trial outlet: ' . $validationMessage);
    //     } catch (Throwable $e) {
    //         Log::error('[OutletController] Failed to start trial for outlet', [
    //             'outlet_id' => $id,
    //             'error' => $e->getMessage(),
    //             'user_id' => Auth::id(),
    //             'type' => 'outlet_controller_error'
    //         ]);

    //         if (request()->expectsJson() || request()->wantsJson()) {
    //             return $this->errorResponse('Gagal memulai trial outlet.', 500, $e);
    //         }

    //         return redirect()->back()
    //             ->with('error', 'Gagal memulai trial outlet: ' . $e->getMessage());
    //     }
    // }

    // public function endTrial(int $id): RedirectResponse
    // {
    //     try {
    //         $this->outletService->endTrial($id);

    //         return redirect()->route('outlets.show', $id)
    //             ->with('success', 'Trial outlet berhasil diakhiri');
    //     } catch (Throwable $e) {
    //         Log::error('[OutletController] Failed to end trial for outlet', [
    //             'outlet_id' => $id,
    //             'error' => $e->getMessage(),
    //             'user_id' => Auth::id(),
    //             'type' => 'outlet_controller_error'
    //         ]);

    //         return redirect()->back()
    //             ->with('error', 'Gagal mengakhiri trial outlet: ' . $e->getMessage());
    //     }
    // }


    public function activate(Request $request, int $id): RedirectResponse
    {
        try {
            $request->validate([
                'type' => 'required|in:owner,outlet',
                'withExposure' => 'boolean'
            ]);

            $this->outletFeatureService->activate($id, $request->input('type'), $request->input('withExposure', false));

            return redirect()->route('outlets.show', $id)
                ->with('success', 'Outlet berhasil diaktifkan');
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to activate outlet', [
                'outlet_id' => $id,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'outlet_controller_error'
            ]);

            return redirect()->back()
                ->with('error', 'Gagal mengaktifkan outlet: ' . $e->getMessage());
        }
    }

    /**
     * Show form for adding new feature to outlet
     */
    public function createOutletFeature(int $outletId): Response|RedirectResponse
    {
        try {
            $outlet = $this->outletService->getById($outletId, ['owner']);
            $features = $this->featureCatalogService->getAll([
                'isActive' => true,
                'excludeKey' => 'outlet_activation',
            ]);

            return Inertia::render('Dashboard/Outlets/OutletFeatures/Create', [
                'outlet' => (new OutletResource($outlet))->resolve(),
                'features' => FeatureResource::collection($features)->resolve(),
                'ownerCoins' => (int) $outlet->owner->coin_balance,
            ]);
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to load outlet feature create form', [
                'outlet_id' => $outletId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'outlet_feature_controller_error'
            ]);

            return redirect()->route('outlets.show', $outletId)
                ->with('error', 'Gagal memuat formulir penambahan fitur: ' . $e->getMessage());
        }
    }

    /**
     * Store new feature for outlet
     */
    public function storeOutletFeature(int $outletId, Request $request): RedirectResponse
    {
        try {
            $featureId = $request->input('featureId');
            $coinType = $request->input('coinType', 'outlet');
            $this->outletService->storeOutletFeature($outletId, $featureId, $coinType);

            return redirect()->route('outlets.show', $outletId)
                ->with('success', 'Fitur berhasil diaktifkan');
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to store outlet feature', [
                'outlet_id' => $outletId,
                'feature_id' => $request->input('featureId'),
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'outlet_feature_controller_error'
            ]);

            return redirect()->back()
                ->with('error', 'Gagal mengaktifkan fitur: ' . $e->getMessage());
        }
    }

    /**
     * Activate courier feature (free)
     */
    public function activateCourierFeature(int $outletId): RedirectResponse
    {
        try {
            $this->outletService->activateCourierFeature($outletId);

            return redirect()->route('outlets.show', $outletId)
                ->with('success', 'Layanan Antar-Jemput berhasil diaktifkan secara gratis');
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to activate courier feature', [
                'outlet_id' => $outletId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'outlet_feature_controller_error'
            ]);

            return redirect()->back()
                ->with('error', 'Gagal mengaktifkan fitur kurir: ' . $e->getMessage());
        }
    }

    /**
     * Store new courier schedule
     */
    public function storeCourierSchedule(int $outletId, StoreCourierScheduleRequest $request): RedirectResponse
    {
        try {
            $this->outletService->storeCourierSchedule($outletId, $request->validated());

            return redirect()->route('outlets.show', [$outletId, 'tab' => 'courier-schedules'])
                ->with('success', 'Jadwal kurir berhasil ditambahkan');
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to store courier schedule', [
                'outlet_id' => $outletId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'outlet_controller_error'
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'Gagal menyimpan jadwal: ' . $e->getMessage());
        }
    }

    /**
     * Update courier schedule
     */
    public function updateCourierSchedule(int $outletId, int $courierScheduleId, UpdateCourierScheduleRequest $request): RedirectResponse
    {
        try {
            $this->outletService->updateCourierSchedule($outletId, $courierScheduleId, $request->validated());

            return redirect()->route('outlets.show', [$outletId, 'tab' => 'courier-schedules'])
                ->with('success', 'Jadwal kurir berhasil diperbarui');
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to update courier schedule', [
                'outlet_id' => $outletId,
                'schedule_id' => $courierScheduleId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'outlet_controller_error'
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'Gagal memperbarui jadwal: ' . $e->getMessage());
        }
    }

    /**
     * Delete courier schedule
     */
    public function destroyCourierSchedule(int $outletId, int $scheduleId): RedirectResponse
    {
        try {
            $this->outletService->destroyCourierSchedule($outletId, $scheduleId);

            return redirect()->route('outlets.show', [$outletId, 'tab' => 'courier-schedules'])
                ->with('success', 'Jadwal kurir berhasil dihapus');
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to delete courier schedule', [
                'outlet_id' => $outletId,
                'schedule_id' => $scheduleId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'outlet_controller_error'
            ]);

            return redirect()->back()
                ->with('error', 'Gagal menghapus jadwal: ' . $e->getMessage());
        }
    }

    /**
     * Show courier settings edit page
     */
    public function editCourierSetting(int $outletId): Response|RedirectResponse
    {
        try {
            $outlet = $this->outletService->getById($outletId, [
                'courierSetting',
                'courierSetting.pricingTiers',
                'courierSetting.pricingZones',
                'outletFeatures.feature',
            ]);

            return Inertia::render('Dashboard/Outlets/Courier/Edit', [
                'outlet' => (new OutletResource($outlet))->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to load courier settings edit page', [
                'outlet_id' => $outletId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'outlet_controller_error'
            ]);

            return redirect()->route('outlets.show', $outletId)
                ->with('error', 'Gagal memuat halaman pengaturan kurir');
        }
    }

    /**
     * Update courier settings (Dashboard)
     */
    public function updateCourierSetting(int $outletId, UpdateCourierSettingRequest $request): RedirectResponse
    {
        try {
            $data = $request->validated();
            $courierSettingId = (int) ($data['courierSettingId'] ?? 0);

            if ($courierSettingId <= 0) {
                $courierSettingId = $this->courierSettingService->getByOutletId($outletId)->id;
            }

            $this->outletService->updateCourierSetting($outletId, $courierSettingId, $data);

            return redirect()->route('outlets.show', $outletId)
                ->with('success', 'Konfigurasi kurir berhasil diperbarui');
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to update courier settings via web', [
                'outlet_id' => $outletId,
                'error'     => $e->getMessage(),
                'user_id'   => Auth::id(),
                'type'      => 'outlet_controller_error',
            ]);
            return redirect()->route('outlets.show', $outletId)
                ->with('error', 'Gagal memperbarui konfigurasi kurir: ' . $e->getMessage());
        }
    }

    public function updateLaundryServiceCourierEligibility(
        Request $request,
        int $outletId,
        int $laundryServiceId
    ): RedirectResponse {
        try {
            $this->laundryServiceService->updateCourierEligibility(
                $laundryServiceId,
                $request->boolean('supportsCourier')
            );

            return redirect()->back()
                ->with('success', 'Status kurir layanan berhasil diperbarui.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return redirect()->back()
                ->with('error', 'Layanan tidak ditemukan.');
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to update courier eligibility', [
                'error'              => $e->getMessage(),
                'user_id'            => Auth::id(),
                'type'               => 'outlet_controller_error',
                'outlet_id'          => $outletId,
                'laundry_service_id' => $laundryServiceId,
            ]);

            return redirect()->back()
                ->with('error', 'Gagal memperbarui status kurir layanan.');
        }
    }

    public function bulkUpdateLaundryServiceCourierEligibility(
        BulkUpdateCourierEligibilityRequest $request,
        int $outletId
    ): RedirectResponse {
        try {
            $this->laundryServiceService->bulkUpdateCourierEligibility(
                $request->validated()['services']
            );

            return redirect()->back()
                ->with('success', 'Status kurir layanan berhasil diperbarui.');
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to bulk update courier eligibility', [
                'error'     => $e->getMessage(),
                'user_id'   => Auth::id(),
                'type'      => 'outlet_controller_error',
                'outlet_id' => $outletId,
            ]);

            return redirect()->back()
                ->with('error', 'Gagal memperbarui status kurir layanan.');
        }
    }

    public function toggleCourierEnabled(int $outletId, Request $request): RedirectResponse
    {
        try {
            $data = $request->validate([
                'is_courier_enabled' => ['required', 'boolean'],
            ]);

            $this->courierSettingService->toggleCourierEnabled($outletId, (bool) $data['is_courier_enabled']);

            $statusMessage = $data['is_courier_enabled']
                ? 'Layanan kurir berhasil diaktifkan'
                : 'Layanan kurir berhasil dinonaktifkan';

            return redirect()->route('outlets.show', $outletId)
                ->with('success', $statusMessage);
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to toggle courier enabled status via web', [
                'outlet_id' => $outletId,
                'error'     => $e->getMessage(),
                'user_id'   => Auth::id(),
                'type'      => 'outlet_controller_error',
            ]);
            return redirect()->route('outlets.show', $outletId)
                ->with('error', 'Gagal mengubah status layanan kurir: ' . $e->getMessage());
        }
    }

    // ==================== CATEGORY MANAGEMENT ====================
    /**
     * Show form for creating new category
     */
    public function createCategory(int $outletId): Response|RedirectResponse
    {
        try {
            $outlet = $this->outletService->getById($outletId);

            return Inertia::render('Dashboard/Outlets/Categories/Create', [
                'outlet' => (new OutletResource($outlet))->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to load category create form for outlet', [
                'outlet_id' => $outletId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'category_controller_error'
            ]);

            return redirect()->route('outlets.show', $outletId)
                ->with('error', 'Gagal memuat formulir pembuatan kategori untuk outlet');
        }
    }

    /**
     * Store new category for outlet
     */
    public function storeCategory(int $outletId, StoreCategoryRequest $request): RedirectResponse
    {
        try {
            $category = $this->outletService
                ->storeCategory($outletId, $request->validated());

            return redirect()->route('outlets.show', $outletId)
                ->with('success', "Kategori '{$category->name}' berhasil dibuat untuk outlet");
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to create category for outlet', [
                'outlet_id' => $outletId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'category_controller_error'
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'Gagal membuat kategori untuk outlet: ' . $e->getMessage());
        }
    }

    /**
     * Show category
     */
    public function showCategory(int $outletId, int $categoryId): Response|RedirectResponse
    {
        try {
            $category = $this->categoryService->getById(
                $categoryId,
                ['outlet', 'laundryServices']
            );

            return Inertia::render('Dashboard/Outlets/Categories/Show', [
                'category' => (new CategoryResource($category))->resolve(),
                'outlet' => (new OutletResource($category->outlet))->resolve(),
                'laundryServices' => LaundryServiceResource::collection($category->laundryServices)->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to load category details', [
                'outlet_id' => $outletId,
                'category_id' => $categoryId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'category_controller_error'
            ]);

            return redirect()->route('outlets.show', $outletId)
                ->with('error', 'Kategori tidak ditemukan atau akses ditolak');
        }
    }

    /**
     * Edit category
     */
    public function editCategory(int $outletId, int $categoryId): Response|RedirectResponse
    {
        try {
            $category = $this->categoryService->getById($categoryId);

            return Inertia::render('Dashboard/Outlets/Categories/Edit', [
                'outlet' => (new OutletResource($category->outlet))->resolve(),
                'category' => (new CategoryResource($category))->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to load category edit form', [
                'outlet_id' => $outletId,
                'category_id' => $categoryId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'category_controller_error'
            ]);

            return redirect()->route('outlets.show', $outletId)
                ->with('error', 'Kategori tidak ditemukan atau akses ditolak');
        }
    }

    /**
     * Update category
     */
    public function updateCategory(int $outletId, int $categoryId, UpdateCategoryRequest $request): RedirectResponse
    {
        try {
            $category = $this->outletService
                ->updateCategory($outletId, $categoryId, $request->validated());

            return redirect()->route('outlets.show', $outletId)
                ->with('success', "Kategori '{$category->name}' berhasil diperbarui");
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to update category', [
                'outlet_id' => $outletId,
                'category_id' => $categoryId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'category_controller_error'
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'Gagal memperbarui kategori: ' . $e->getMessage());
        }
    }

    /**
     * Delete category
     */
    public function destroyCategory(int $outletId, int $categoryId): RedirectResponse
    {
        try {
            $deleted = $this->outletService->destroyCategory($outletId, $categoryId);

            if ($deleted) {
                return redirect()->route('outlets.show', $outletId)
                    ->with('success', "Kategori berhasil dihapus");
            }

            return redirect()->back()
                ->with('error', 'Gagal menghapus kategori');
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to delete category', [
                'outlet_id' => $outletId,
                'category_id' => $categoryId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'category_controller_error'
            ]);

            return redirect()->back()
                ->with('error', 'Gagal menghapus kategori: ' . $e->getMessage());
        }
    }

    // ==================== CUSTOMER MANAGEMENT ====================
    /**
     * Show form for creating new customer
     */
    public function createCustomer(int $outletId): Response|RedirectResponse
    {
        try {
            $outlet = $this->outletService->getById($outletId);

            return Inertia::render('Dashboard/Outlets/Customers/Create', [
                'outlet' => (new OutletResource($outlet))->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to load customer create form for outlet', [
                'outlet_id' => $outletId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'customer_controller_error'
            ]);

            return redirect()->route('outlets.show', $outletId)
                ->with('error', 'Gagal memuat formulir pembuatan pelanggan untuk outlet');
        }
    }

    /**
     * Store new customer for outlet
     */
    public function storeCustomer(int $outletId, StoreCustomerRequest $request): RedirectResponse
    {
        try {
            $customer = $this->outletService
                ->storeCustomer($outletId, $request->validated());

            return redirect()->route('outlets.show', $outletId)
                ->with('success', "Pelanggan '{$customer->name}' berhasil dibuat untuk outlet");
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to create customer for outlet', [
                'outlet_id' => $outletId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'customer_controller_error'
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'Gagal membuat pelanggan untuk outlet: ' . $e->getMessage());
        }
    }

    /**
     * Edit customer
     */
    public function editCustomer(int $outletId, int $customerId): Response|RedirectResponse
    {
        try {
            $customer = $this->customerService->getById($customerId);

            return Inertia::render('Dashboard/Outlets/Customers/Edit', [
                'outlet' => (new OutletResource($customer->outlet))->resolve(),
                'customer' => (new CustomerResource($customer))->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to load customer edit form', [
                'outlet_id' => $outletId,
                'customer_id' => $customerId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'customer_controller_error'
            ]);

            return redirect()->route('outlets.show', $outletId)
                ->with('error', 'Pelanggan tidak ditemukan atau akses ditolak');
        }
    }

    /**
     * Update customer
     */
    public function updateCustomer(int $outletId, int $customerId, UpdateCustomerRequest $request): RedirectResponse
    {
        try {
            $customer = $this->outletService
                ->updateCustomer($outletId, $customerId, $request->validated());

            return redirect()->route('outlets.show', $outletId)
                ->with('success', "Pelanggan '{$customer->name}' berhasil diperbarui");
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to update customer', [
                'outlet_id' => $outletId,
                'customer_id' => $customerId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'customer_controller_error'
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'Gagal memperbarui pelanggan: ' . $e->getMessage());
        }
    }

    /**
     * Delete customer
     */
    public function destroyCustomer(int $outletId, int $customerId): RedirectResponse
    {
        try {
            $deleted = $this->outletService->destroyCustomer($outletId, $customerId);

            if ($deleted) {
                return redirect()->route('outlets.show', $outletId)
                    ->with('success', "Pelanggan berhasil dihapus");
            }

            return redirect()->back()
                ->with('error', 'Gagal menghapus pelanggan');
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to delete customer', [
                'outlet_id' => $outletId,
                'customer_id' => $customerId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'customer_controller_error'
            ]);

            return redirect()->back()
                ->with('error', 'Gagal menghapus pelanggan: ' . $e->getMessage());
        }
    }


    // ==================== EMPLOYEE MANAGEMENT ====================
    /**
     * Show form for creating new employee
     */
    public function createEmployee(int $outletId): Response|RedirectResponse
    {
        try {
            $outlet = $this->outletService->getById($outletId);
            $positions = $this->positionService->getAll(
                filters: ['outletId' => $outletId]
            );
            $salaries = $this->salaryService->getAll();
            $processes = $this->processService->getAll();

            return Inertia::render('Dashboard/Outlets/Employees/Create', [
                'outlet' => (new OutletResource($outlet))->resolve(),
                'outletId' => $outletId,
                'positions' => (PositionResource::collection($positions))->resolve(),
                'processes' => (ProcessResource::collection($processes))->resolve(),
                'salaries' => (SalaryResource::collection($salaries))->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to load employee create form for outlet', [
                'outlet_id' => $outletId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'employee_controller_error'
            ]);

            return redirect()->route('outlets.show', $outletId)
                ->with('error', 'Gagal memuat formulir pembuatan karyawan untuk outlet');
        }
    }

    /**
     * Store new employee for outlet
     */
    public function storeEmployee(int $outletId, StoreEmployeeRequest $request): RedirectResponse
    {
        try {
            $employee = $this->outletService
                ->storeEmployee($outletId, $request->validated());

            return redirect()->route('outlets.show', $outletId)
                ->with('success', "Karyawan '{$employee->name}' berhasil dibuat untuk outlet");
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to create employee for outlet', [
                'outlet_id' => $outletId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'employee_controller_error'
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'Gagal membuat karyawan untuk outlet: ' . $e->getMessage());
        }
    }

    /**
     * Show employee
     */
    public function showEmployee(int $outletId, int $employeeId): Response|RedirectResponse
    {
        try {
            $outlet = $this->outletService->getById($outletId);
            $employee = $this->employeeService->getById($employeeId, [
                'employeePositions',
                'employeePositions.position'
            ]);

            return Inertia::render('Dashboard/Outlets/Employees/Show', [
                'outlet' => (new OutletResource($outlet))->resolve(),
                'employee' => (new EmployeeResource($employee))->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to load employee details', [
                'outlet_id' => $outletId,
                'employee_id' => $employeeId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'employee_controller_error'
            ]);

            return redirect()->route('outlets.show', $outletId)
                ->with('error', 'Karyawan tidak ditemukan atau akses ditolak');
        }
    }

    /**
     * Edit employee
     */
    public function editEmployee(int $outletId, int $employeeId): Response|RedirectResponse
    {
        try {
            $outlet = $this->outletService->getById($outletId);
            $employee = $this->employeeService->getById($employeeId);


            return Inertia::render('Dashboard/Outlets/Employees/Edit', [
                'outlet' => (new OutletResource($outlet))->resolve(),
                'employee' => (new EmployeeResource($employee))->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to load employee edit form', [
                'outlet_id' => $outletId,
                'employee_id' => $employeeId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'employee_controller_error'
            ]);

            return redirect()->route('outlets.show', $outletId)
                ->with('error', 'Karyawan tidak ditemukan atau akses ditolak');
        }
    }

    /**
     * Update employee
     */
    public function updateEmployee(int $outletId, int $employeeId, UpdateEmployeeRequest $request): RedirectResponse
    {
        try {
            $employee = $this->outletService->updateEmployee($outletId, $employeeId, $request->validated());

            return redirect()->route('outlets.show', $outletId)
                ->with('success', "Karyawan '{$employee->name}' berhasil diperbarui");
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to update employee', [
                'outlet_id' => $outletId,
                'employee_id' => $employeeId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'employee_controller_error'
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'Gagal memperbarui karyawan: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified employee from outlet
     */
    public function destroyEmployee(int $outletId, int $employeeId): RedirectResponse
    {
        try {
            $deleted = $this->outletService->destroyEmployee($outletId, $employeeId);

            if ($deleted) {
                return redirect()->route('outlets.show', $outletId)
                    ->with('success', 'Karyawan berhasil dihapus');
            }

            return redirect()->back()
                ->with('error', 'Gagal menghapus karyawan');
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to delete employee from outlet', [
                'outlet_id'   => $outletId,
                'employee_id' => $employeeId,
                'error'       => $e->getMessage(),
                'user_id'     => Auth::id(),
                'type'        => 'employee_controller_error'
            ]);

            return redirect()->back()
                ->with('error', $e->getMessage());
        }
    }

        // ==================== FINE MANAGEMENT ====================
    /**
     * Show form for creating new fine
     */
    public function createFine(int $outletId): Response|RedirectResponse
    {
        try {
            $outlet = $this->outletService->getById($outletId);

            return Inertia::render('Dashboard/Outlets/Fines/Create', [
                'outlet' => (new OutletResource($outlet))->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to load fine create form for outlet', [
                'outlet_id' => $outletId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'fine_controller_error'
            ]);

            return redirect()->route('outlets.show', $outletId)
                ->with('error', 'Gagal memuat formulir pembuatan denda untuk outlet');
        }
    }

    /**
     * Store new fine for outlet
     */
    public function storeFine(int $outletId, StoreFineRequest $request): RedirectResponse
    {
        try {
            $fine = $this->outletService->storeFine($outletId, $request->validated());

            return redirect()->route('outlets.show', $outletId)
                ->with('success', "Denda '{$fine->name}' berhasil dibuat untuk outlet");
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to create fine for outlet', [
                'outlet_id' => $outletId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'fine_controller_error'
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'Gagal membuat denda untuk outlet: ' . $e->getMessage());
        }
    }

    /**
     * Show fine details
     */
    public function showFine(int $outletId, int $fineId): Response|RedirectResponse
    {
        try {
            $outlet = $this->outletService->getById($outletId);
            $fine = $this->fineService->getById($fineId);

            return Inertia::render('Dashboard/Outlets/Fines/Show', [
                'outlet' => (new OutletResource($outlet))->resolve(),
                'fine' => (new FineResource($fine))->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to load fine details', [
                'outlet_id' => $outletId,
                'fine_id' => $fineId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'fine_controller_error'
            ]);

            return redirect()->route('outlets.show', $outletId)
                ->with('error', 'Denda tidak ditemukan atau akses ditolak');
        }
    }

    /**
     * Edit fine
     */
    public function editFine(int $outletId, int $fineId): Response|RedirectResponse
    {
        try {
            $fine = $this->fineService->getById($fineId);

            return Inertia::render('Dashboard/Outlets/Fines/Edit', [
                'outlet' => (new OutletResource($fine->outlet))->resolve(),
                'fine' => (new FineResource($fine))->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to load fine edit form', [
                'outlet_id' => $outletId,
                'fine_id' => $fineId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'fine_controller_error'
            ]);

            return redirect()->route('outlets.show', $outletId)
                ->with('error', 'Denda tidak ditemukan atau akses ditolak');
        }
    }

    /**
     * Update fine
     */
    public function updateFine(int $outletId, int $fineId, UpdateFineRequest $request): RedirectResponse
    {
        try {
            $fine = $this->outletService->updateFine($outletId, $fineId, $request->validated());

            return redirect()->route('outlets.show', $outletId)
                ->with('success', "Denda '{$fine->name}' berhasil diperbarui");
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to update fine', [
                'outlet_id' => $outletId,
                'fine_id' => $fineId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'fine_controller_error'
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'Gagal memperbarui denda: ' . $e->getMessage());
        }
    }

    /**
     * Delete fine
     */
    public function destroyFine(int $outletId, int $fineId): RedirectResponse
    {
        try {
            $deleted = $this->outletService->destroyFine($outletId, $fineId);

            if ($deleted) {
                return redirect()->route('outlets.show', $outletId)
                    ->with('success', 'Denda berhasil dihapus');
            }

            return redirect()->back()
                ->with('error', 'Gagal menghapus denda');
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to delete fine', [
                'outlet_id' => $outletId,
                'fine_id' => $fineId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'fine_controller_error'
            ]);

            return redirect()->back()
                ->with('error', 'Gagal menghapus denda: ' . $e->getMessage());
        }
    }


    // ==================== LAUNDRY SERVICE MANAGEMENT ====================
    /**
     * Show form for creating new laundry service
     */
    public function createLaundryService(int $outletId): Response|RedirectResponse
    {
        try {
            $outlet = $this->outletService->getById($outletId);
            $categories = $this->categoryService->getAll(
                filters: ['outletId' => $outletId]
            );
            $units = $this->unitService->getAll();
            $processes = $this->processService->getAll();

            return Inertia::render('Dashboard/Outlets/LaundryServices/Create', [
                'outlet' => (new OutletResource($outlet))->resolve(),
                'categories' => (CategoryResource::collection($categories))->resolve(),
                'units' => (UnitResource::collection($units))->resolve(),
                'processes' => (ProcessResource::collection($processes))->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to load laundry service create form for outlet', [
                'outlet_id' => $outletId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'laundry_service_controller_error'
            ]);

            return redirect()->route('outlets.show', $outletId)
                ->with('error', 'Gagal memuat formulir pembuatan layanan laundry untuk outlet');
        }
    }

    /**
     * Store new laundry service for outlet
     */
    public function storeLaundryService(int $outletId, StoreLaundryServiceRequest $request): RedirectResponse
    {
        try {

            $laundryService = $this->outletService->storeLaundryService($outletId, $request->validated());

            return redirect()->route('outlets.show', $outletId)
                ->with('success', "Layanan laundry '{$laundryService->name}' berhasil dibuat untuk outlet");
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to create laundry service for outlet', [
                'outlet_id' => $outletId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'laundry_service_controller_error'
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'Gagal membuat layanan laundry untuk outlet: ' . $e->getMessage());
        }
    }

    /**
     * Show laundry service details
     */
    public function showLaundryService(int $outletId, int $laundryServiceId): Response|RedirectResponse
    {
        try {
            $outlet = $this->outletService->getById($outletId);
            $laundryService = $this->laundryServiceService->getById(
                $laundryServiceId,
                ['category']
            );

            return Inertia::render('Dashboard/Outlets/LaundryServices/Show', [
                'outlet' => (new OutletResource($outlet))->resolve(),
                'laundryService' => (new LaundryServiceResource($laundryService))->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to load laundry service details', [
                'outlet_id' => $outletId,
                'laundry_service_id' => $laundryServiceId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'laundry_service_controller_error'
            ]);

            return redirect()->route('outlets.show', $outletId)
                ->with('error', 'Layanan laundry tidak ditemukan atau akses ditolak');
        }
    }

    /**
     * Show form for editing laundry service
     */
    public function editLaundryService(int $outletId, int $laundryServiceId): Response|RedirectResponse
    {
        try {
            $outlet = $this->outletService->getById($outletId);
            $laundryService = $this->laundryServiceService->getById(
                $laundryServiceId,
                ['category']
            );
            $categories = $this->categoryService->getAll(
                filters: ['outletId' => $outletId]
            );
            $units = $this->unitService->getAll();
            $processes = $this->processService->getAll();

            return Inertia::render('Dashboard/Outlets/LaundryServices/Edit', [
                'outlet' => (new OutletResource($outlet))->resolve(),
                'laundryService' => (new LaundryServiceResource($laundryService))->resolve(),
                'categories' => (CategoryResource::collection($categories))->resolve(),
                'units' => (UnitResource::collection($units))->resolve(),
                'processes' => (ProcessResource::collection($processes))->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to load laundry service edit form', [
                'outlet_id' => $outletId,
                'laundry_service_id' => $laundryServiceId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'laundry_service_controller_error'
            ]);

            return redirect()->route('outlets.show', $outletId)
                ->with('error', 'Layanan laundry tidak ditemukan atau akses ditolak');
        }
    }

    /**
     * Update laundry service
     */
    public function updateLaundryService(int $outletId, int $laundryServiceId, UpdateLaundryServiceRequest $request): RedirectResponse
    {
        try {
            $data = $request->validated();
            $laundryService = $this->outletService
                ->updateLaundryService($outletId, $laundryServiceId, $data);

            return redirect()->route('outlets.show', $outletId)
                ->with('success', "Layanan laundry '{$laundryService->name}' berhasil diperbarui");
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to update laundry service', [
                'outlet_id' => $outletId,
                'laundry_service_id' => $laundryServiceId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'laundry_service_controller_error'
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'Gagal memperbarui layanan laundry: ' . $e->getMessage());
        }
    }

    /**
     * Delete laundry service
     */
    public function destroyLaundryService(int $outletId, int $laundryServiceId): RedirectResponse
    {
        try {
            $deleted = $this->outletService->destroyLaundryService($outletId, $laundryServiceId);

            if ($deleted) {
                return redirect()->route('outlets.show', $outletId)
                    ->with('success', 'Layanan laundry berhasil dihapus');
            }

            return redirect()->back()
                ->with('error', 'Gagal menghapus layanan laundry');
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to delete laundry service', [
                'outlet_id' => $outletId,
                'laundry_service_id' => $laundryServiceId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'laundry_service_controller_error'
            ]);

            return redirect()->back()
                ->with('error', 'Gagal menghapus layanan laundry: ' . $e->getMessage());
        }
    }

    // ==================== MEMBERSHIP PLAN MANAGEMENT ====================
    /**
     * Show form for creating new membership plan
     */
    public function createMembershipPlan(int $outletId): Response|RedirectResponse
    {
        try {
            $outlet = $this->outletService->getById($outletId);

            return Inertia::render('Dashboard/Outlets/MembershipPlans/Create', [
                'outlet' => (new OutletResource($outlet))->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to load membership plan create form for outlet', [
                'outlet_id' => $outletId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'membership_plan_controller_error'
            ]);

            return redirect()->route('outlets.show', $outletId)
                ->with('error', 'Gagal memuat formulir pembuatan paket membership untuk outlet');
        }
    }

    /**
     * Store new membership plan for outlet
     */
    public function storeMembershipPlan(int $outletId, StoreMembershipPlanRequest $request): RedirectResponse
    {
        try {
            $membershipPlan = $this->outletService->storeMembershipPlan($outletId, $request->validated());

            return redirect()->route('outlets.show', $outletId)
                ->with('success', "Paket membership '{$membershipPlan->name}' berhasil dibuat untuk outlet");
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to create membership plan for outlet', [
                'outlet_id' => $outletId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'membership_plan_controller_error'
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'Gagal membuat paket membership untuk outlet: ' . $e->getMessage());
        }
    }

    /**
     * Show membership plan details
     */
    public function showMembershipPlan(int $outletId, int $planId): Response|RedirectResponse
    {
        try {
            $outlet = $this->outletService->getById($outletId);
            $membershipPlan = $this->membershipPlanService->getById($planId);

            return Inertia::render('Dashboard/Outlets/MembershipPlans/Show', [
                'outlet' => (new OutletResource($outlet))->resolve(),
                'membershipPlan' => (new MembershipPlanResource($membershipPlan))->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to load membership plan details', [
                'outlet_id' => $outletId,
                'membership_plan_id' => $planId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'membership_plan_controller_error'
            ]);

            return redirect()->route('outlets.show', $outletId)
                ->with('error', 'Paket membership tidak ditemukan atau akses ditolak');
        }
    }


    /**
     * Edit membership plan
     */
    public function editMembershipPlan(int $outletId, int $membershipPlanId): Response|RedirectResponse
    {
        try {
            $membershipPlan = $this->membershipPlanService->getById($membershipPlanId);

            return Inertia::render('Dashboard/Outlets/MembershipPlans/Edit', [
                'outlet' => (new OutletResource($membershipPlan->outlet))->resolve(),
                'membershipPlan' => (new MembershipPlanResource($membershipPlan))->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to load membership plan edit form', [
                'outlet_id' => $outletId,
                'membership_plan_id' => $membershipPlanId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'membership_plan_controller_error'
            ]);

            return redirect()->route('outlets.show', $outletId)
                ->with('error', 'Paket membership tidak ditemukan atau akses ditolak');
        }
    }

    /**
     * Update membership plan
     */
    public function updateMembershipPlan(int $outletId, int $membershipPlanId, UpdateMembershipPlanRequest $request): RedirectResponse
    {
        try {
            $membershipPlan = $this->outletService->updateMembershipPlan($outletId, $membershipPlanId, $request->validated());

            return redirect()->route('outlets.show', $outletId)
                ->with('success', "Paket membership '{$membershipPlan->name}' berhasil diperbarui");
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to update membership plan', [
                'outlet_id' => $outletId,
                'membership_plan_id' => $membershipPlanId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'membership_plan_controller_error'
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'Gagal memperbarui paket membership: ' . $e->getMessage());
        }
    }

    public function destroyMembershipPlan(int $outletId, int $membershipPlanId): RedirectResponse
    {
        try {
            $deleted = $this->outletService->destroyMembershipPlan($outletId, $membershipPlanId);

            if ($deleted) {
                return redirect()->route('outlets.show', $outletId)
                    ->with('success', 'Paket membership berhasil dihapus');
            }

            return redirect()->back()
                ->with('error', 'Gagal menghapus paket membership');
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to delete membership plan', [
                'outlet_id' => $outletId,
                'membership_plan_id' => $membershipPlanId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'membership_plan_controller_error'
            ]);

            return redirect()->back()
                ->with('error', 'Gagal menghapus paket membership: ' . $e->getMessage());
        }
    }


    // ==================== OPERATIONAL DAY MANAGEMENT ====================
    /**
     * Store new operational day for outlet
     */
    public function storeOperationalDay(int $outletId, StoreOperationalDayRequest $request): RedirectResponse
    {
        try {
            $data = $request->validated();
            $operationalDay = $this->outletService->storeOperationalDay($outletId, $data);

            return redirect()->route('outlets.show', $outletId)
                ->with('success', "Jam kerja untuk '{$operationalDay->day}' berhasil dibuat untuk outlet");
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to create operational day for outlet', [
                'outlet_id' => $outletId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'operational_day_controller_error'
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'Gagal membuat jam kerja untuk outlet: ' . $e->getMessage());
        }
    }

    /**
     * Update operational day
     */
    public function updateOperationalDay(
        int $outletId,
        int $operationalDayId,
        UpdateOperationalDayRequest $request
    ): RedirectResponse {
        try {
            $data = $request->validated();

            $data['outletId'] = $outletId;

            if ($operationalDayId === 0 || $operationalDayId < 1) {
                $operationalDay = $this->operationalDayService->updateOrCreate(
                    $outletId,
                    $data['dayOfWeek'],
                    $data
                );
            } else {
                $operationalDay = $this->operationalDayService->update($operationalDayId, $data);
            }

            return redirect()->route('outlets.show', $outletId)
                ->with('success', "Jam operasional untuk hari {$operationalDay->day_label} berhasil diperbarui");
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to update operational day for outlet', [
                'outlet_id' => $outletId,
                'operational_day_id' => $operationalDayId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'operational_day_controller_error'
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'Gagal memperbarui jam operasional: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified operational day from outlet
     */
    public function destroyOperationalDay(int $outletId, int $operationalDayId): RedirectResponse
    {
        try {
            $deleted = $this->operationalDayService->destroy($operationalDayId);

            if ($deleted) {
                return redirect()->route('outlets.show', $outletId)
                    ->with('success', 'Jam operasional berhasil dihapus');
            }

            return redirect()->back()
                ->with('error', 'Gagal menghapus jam operasional');
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to delete operational day from outlet', [
                'outlet_id'          => $outletId,
                'operational_day_id' => $operationalDayId,
                'error'              => $e->getMessage(),
                'user_id'            => Auth::id(),
                'type'               => 'operational_day_controller_error'
            ]);

            return redirect()->back()
                ->with('error', $e->getMessage());
        }
    }


    // ==================== POSITION MANAGEMENT ====================
    /**
     * Show form for creating new position
     */
    public function createPosition(int $outletId): Response|RedirectResponse
    {
        try {
            $outlet = $this->outletService->getById($outletId);

            return Inertia::render('Dashboard/Outlets/Positions/Create', [
                'outlet'            => (new OutletResource($outlet))->resolve(),
                'permissionCatalog' => $this->positionService->getPermissionCatalog(),
            ]);
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to load position create form for outlet', [
                'outlet_id' => $outletId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'position_controller_error'
            ]);

            return redirect()->route('outlets.show', $outletId)
                ->with('error', 'Gagal memuat formulir pembuatan posisi untuk outlet');
        }
    }

    /**
     * Store new position for outlet
     */
    public function storePosition(int $outletId, StorePositionRequest $request): RedirectResponse
    {
        try {
            $position = $this->outletService->storePosition($outletId, $request->validated());

            return redirect()->route('outlets.show', $outletId)
                ->with('success', "Posisi '{$position->name}' berhasil dibuat untuk outlet");
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to create position for outlet', [
                'outlet_id' => $outletId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'position_controller_error'
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'Gagal membuat posisi untuk outlet: ' . $e->getMessage());
        }
    }

    /**
     * Show form for editing position
     */
    public function editPosition(int $outletId, int $positionId): Response|RedirectResponse
    {
        try {
            $position = $this->positionService->getById($positionId, ['outlet', 'permissions']);

            return Inertia::render('Dashboard/Outlets/Positions/Edit', [
                'outlet'            => (new OutletResource($position->outlet))->resolve(),
                'position'          => (new PositionResource($position))->resolve(),
                'permissionCatalog' => $this->positionService->getPermissionCatalog(),
            ]);
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to load position edit form', [
                'outlet_id' => $outletId,
                'position_id' => $positionId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'position_controller_error'
            ]);

            return redirect()->route('outlets.show', $outletId)
                ->with('error', 'Posisi tidak ditemukan atau akses ditolak');
        }
    }

    /**
     * Update position
     */
    public function updatePosition(int $outletId, int $positionId, UpdatePositionRequest $request): RedirectResponse
    {
        try {
            $position = $this->outletService->updatePosition($outletId, $positionId, $request->validated());

            return redirect()->route('outlets.show', $outletId)
                ->with('success', "Posisi '{$position->name}' berhasil diperbarui");
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to update position', [
                'outlet_id' => $outletId,
                'position_id' => $positionId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'position_controller_error'
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'Gagal memperbarui posisi: ' . $e->getMessage());
        }
    }

    /**
     * Delete position
     */
    public function destroyPosition(int $outletId, int $positionId): RedirectResponse
    {
        try {
            $deleted = $this->outletService->destroyPosition($outletId, $positionId);

            if ($deleted) {
                return redirect()->route('outlets.show', $outletId)
                    ->with('success', 'Posisi berhasil dihapus');
            }

            return redirect()->back()
                ->with('error', 'Gagal menghapus posisi');
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to delete position', [
                'outlet_id' => $outletId,
                'position_id' => $positionId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'position_controller_error'
            ]);

            return redirect()->back()
                ->with('error', 'Gagal menghapus posisi: ' . $e->getMessage());
        }
    }

    
// ==================== SERVICE PACKAGE MANAGEMENT ====================
    /**
     * Show form for creating new service package
     */
    public function createServicePackage(int $outletId): Response|RedirectResponse
    {
        try {
            $outlet = $this->outletService->getById($outletId);
            $laundryServices = $this->laundryServiceService->getAll(
                filters: ['outletId' => $outletId]
            );

            return Inertia::render('Dashboard/Outlets/ServicePackages/Create', [
                'outlet' => (new OutletResource($outlet))->resolve(),
                'laundryServices' => LaundryServiceResource::collection($laundryServices)->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to load service package create form for outlet', [
                'outlet_id' => $outletId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'service_package_controller_error'
            ]);

            return redirect()->route('outlets.show', $outletId)
                ->with('error', 'Gagal memuat formulir pembuatan paket layanan untuk outlet');
        }
    }

    /**
     * Store new service package for outlet
     */
    public function storeServicePackage(int $outletId, StoreServicePackageRequest $request): RedirectResponse
    {
        try {
            $servicePackage = $this->outletService->storeServicePackage($outletId, $request->validated());

            return redirect()->route('outlets.show', $outletId)
                ->with('success', "Paket layanan '{$servicePackage->name}' berhasil dibuat untuk outlet");
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to create service package for outlet', [
                'outlet_id' => $outletId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'service_package_controller_error'
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'Gagal membuat paket layanan untuk outlet: ' . $e->getMessage());
        }
    }

    /**
     * Show service package details
     */
    public function showServicePackage(int $outletId, int $packageId): Response|RedirectResponse
    {
        try {
            $outlet = $this->outletService->getById($outletId);
            $servicePackage = $this->servicePackageService->getById(
                $packageId,
                ['servicePackageItems', 'servicePackageItems.laundryService', 'customerSubscriptions']
            );

            return Inertia::render('Dashboard/Outlets/ServicePackages/Show', [
                'outlet' => (new OutletResource($outlet))->resolve(),
                'servicePackage' => (new ServicePackageResource($servicePackage))->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to load service package details', [
                'outlet_id' => $outletId,
                'service_package_id' => $packageId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'service_package_controller_error'
            ]);

            return redirect()->route('outlets.show', $outletId)
                ->with('error', 'Paket layanan tidak ditemukan atau akses ditolak');
        }
    }

    /**
     * Edit service package
     */
    public function editServicePackage(int $outletId, int $packageId): Response|RedirectResponse
    {
        try {
            $servicePackage = $this->servicePackageService->getById(
                $packageId,
                ['servicePackageItems', 'servicePackageItems.laundryService']
            );
            $laundryServices = $this->laundryServiceService->getAll(
                filters: ['outletId' => $outletId]
            );

            return Inertia::render('Dashboard/Outlets/ServicePackages/Edit', [
                'outlet' => (new OutletResource($servicePackage->outlet))->resolve(),
                'servicePackage' => (new ServicePackageResource($servicePackage))->resolve(),
                'laundryServices' => LaundryServiceResource::collection($laundryServices)->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to load service package edit form', [
                'outlet_id' => $outletId,
                'service_package_id' => $packageId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'service_package_controller_error'
            ]);

            return redirect()->route('outlets.show', $outletId)
                ->with('error', 'Paket layanan tidak ditemukan atau akses ditolak');
        }
    }

    /**
     * Update service package
     */
    public function updateServicePackage(int $outletId, int $packageId, UpdateServicePackageRequest $request): RedirectResponse
    {
        try {
            $servicePackage = $this->outletService->updateServicePackage($outletId, $packageId, $request->validated());

            return redirect()->route('outlets.show', $outletId)
                ->with('success', "Paket layanan '{$servicePackage->name}' berhasil diperbarui");
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to update service package', [
                'outlet_id' => $outletId,
                'service_package_id' => $packageId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'service_package_controller_error'
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'Gagal memperbarui paket layanan: ' . $e->getMessage());
        }
    }

    /**
     * Delete service package
     */
    public function destroyServicePackage(int $outletId, int $packageId): RedirectResponse
    {
        try {
            $deleted = $this->outletService->destroyServicePackage($outletId, $packageId);

            if ($deleted) {
                return redirect()->route('outlets.show', $outletId)
                    ->with('success', 'Paket layanan berhasil dihapus');
            }

            return redirect()->back()
                ->with('error', 'Gagal menghapus paket layanan');
        } catch (Throwable $e) {
            Log::error('[OutletController] Failed to delete service package', [
                'outlet_id' => $outletId,
                'service_package_id' => $packageId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'service_package_controller_error'
            ]);

            return redirect()->back()
                ->with('error', 'Gagal menghapus paket layanan: ' . $e->getMessage());
        }
    }

    /**
     * Get filters from request - ensuring proper types
     */
    private function getFiltersFromRequest(Request $request): array
    {
        return [
            'search' => $request->string('search')->toString(),
            'page' => $request->integer('page', 1),
            'perPage' => $request->integer('perPage', 10),
            'sortBy' => $request->string('sortBy', 'created_at')->toString(),
            'sortDirection' => $request->string('sortDirection', 'desc')->toString(),
            'status' => $request->string('status')->toString(),
            'provinceId' => $request->has('provinceId') && $request->filled('provinceId')
                ? $request->integer('provinceId')
                : null,
            'cityId' => $request->filled('cityId') ? $request->integer('cityId') : null,
            'districtId' => $request->filled('districtId') ? $request->integer('districtId') : null,
        ];
    }
    /**
     * Get location options for zone editor
     */
    public function getZoneLocationOptions(int $outletId): JsonResponse
    {
        try {
            $options = $this->courierSettingService->getZoneLocationOptions($outletId);
            return response()->json($options);
        } catch (Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get village options for a specific district
     */
    public function getZoneVillageOptions(int $outletId, int $districtId): JsonResponse
    {
        try {
            $villages = $this->courierSettingService->getZoneVillageOptions($districtId);
            return response()->json($villages);
        } catch (Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
