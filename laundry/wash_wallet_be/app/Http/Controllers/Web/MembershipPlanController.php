<?php

namespace App\Http\Controllers\Web;

use Illuminate\Routing\Attributes\Controllers\Middleware;

use App\Helpers\PaginationHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\MembershipPlan\StoreMembershipPlanRequest;
use App\Http\Requests\MembershipPlan\UpdateMembershipPlanRequest;
use App\Http\Resources\MembershipPlan\MembershipPlanResource;
use App\Http\Resources\Outlet\OutletResource;
use App\Services\MembershipPlanService;
use App\Services\OutletService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

#[Middleware('auth')]
class MembershipPlanController extends Controller
{
    public function __construct(private readonly MembershipPlanService $membershipPlanService, private readonly OutletService $outletService) {}

    /**
     * Display a listing of membership plans
     */
    public function index(Request $request): Response
    {
        try {
            $filters = $this->getFiltersFromRequest($request);
            $membershipPlans = $this->membershipPlanService->getAll(
                $filters,
                $filters['page'],
                $filters['perPage'],
                relations: ['outlet']
            );

            $outlets = $this->outletService->getAll();

            return Inertia::render('Dashboard/MembershipPlans/Index', [
                'membershipPlans' => [
                    'data' => MembershipPlanResource::collection($membershipPlans->items())->resolve(),
                    'meta' => PaginationHelper::format($membershipPlans, $request),
                ],
                'filterOptions' => [
                    'outlets' => OutletResource::collection($outlets)->resolve(),
                ],
                'filters' => $filters,
                'flash' => [
                    'success' => session('success'),
                    'error' => session('error'),
                ],
            ]);
        } catch (Throwable $e) {
            Log::error('[MembershipPlanController] Failed to load membership plans index', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'membership_plan_controller_error',
            ]);

            return Inertia::render('Dashboard/MembershipPlans/Index', [
                'membershipPlans' => [
                    'data' => [],
                    'meta' => null,
                ],
                'filterOptions' => [
                    'outlets' => [],
                ],
                'filters' => [],
                'error' => 'Gagal memuat data. Silakan coba lagi.',
            ]);
        }
    }

    /**
     * Show the form for creating a new membership plan
     */
    public function create(): Response|RedirectResponse
    {
        try {
            $outlets = $this->outletService->getAll();

            return Inertia::render('Dashboard/MembershipPlans/Create', [
                'outlets' => $outlets,
            ]);
        } catch (Throwable $e) {
            Log::error('[MembershipPlanController] Failed to load membership plan create form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'membership_plan_controller_error',
            ]);

            return redirect()->route('membership-plans.index')
                ->with('error', 'Gagal memuat form tambah paket membership.');
        }
    }

    /**
     * Store a newly created membership plan
     */
    public function store(StoreMembershipPlanRequest $request): RedirectResponse
    {
        try {
            $this->membershipPlanService->store($request->validated());

            return redirect()->route('membership-plans.index')
                ->with('success', 'Paket membership berhasil ditambahkan.');
        } catch (Throwable $e) {
            Log::error('[MembershipPlanController] Failed to create membership plan', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'membership_plan_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Display the specified membership plan
     */
    public function show(int $id): Response|RedirectResponse
    {
        try {
            $membershipPlan = $this->membershipPlanService->getById(
                $id,
                relations: [
                    'outlet',
                    'membershipContracts',
                    'membershipContracts.customer',
                ]
            );

            return Inertia::render('Dashboard/MembershipPlans/Show', [
                'membershipPlan' => (new MembershipPlanResource($membershipPlan))->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[MembershipPlanController] Failed to load membership plan detail', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'membership_plan_controller_error',
            ]);

            return redirect()->route('membership-plans.index')
                ->with('error', 'Paket membership tidak ditemukan.');
        }
    }

    /**
     * Show the form for editing the specified membership plan
     */
    public function edit(int $id): Response|RedirectResponse
    {
        try {
            $membershipPlan = $this->membershipPlanService->getById(
                $id,
                relations: ['outlet']
            );

            return Inertia::render('Dashboard/MembershipPlans/Edit', [
                'membershipPlan' => new MembershipPlanResource($membershipPlan),
            ]);
        } catch (Throwable $e) {
            Log::error('[MembershipPlanController] Failed to load membership plan edit form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'membership_plan_controller_error',
            ]);

            return redirect()->route('membership-plans.index')
                ->with('error', 'Paket membership tidak ditemukan.');
        }
    }

    /**
     * Update the specified membership plan
     */
    public function update(UpdateMembershipPlanRequest $request, int $id): RedirectResponse
    {
        try {
            $this->membershipPlanService->update($id, $request->validated());

            return redirect()->route('membership-plans.index')
                ->with('success', 'Paket membership berhasil diperbarui.');
        } catch (Throwable $e) {
            Log::error('[MembershipPlanController] Failed to update membership plan', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'membership_plan_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Remove the specified membership plan
     */
    public function destroy(int $id): RedirectResponse
    {
        try {
            $this->membershipPlanService->destroy($id);

            return redirect()->route('membership-plans.index')
                ->with('success', 'Paket membership berhasil dihapus.');
        } catch (Throwable $e) {
            Log::error('[MembershipPlanController] Failed to delete membership plan', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'membership_plan_controller_error',
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
            'status' => $request->string('status')->toString(),
            'sortBy' => $request->string('sortBy', 'createdAt')->toString(),
            'sortDirection' => $request->string('sortDirection', 'desc')->toString(),
            'page' => $request->integer('page', 1),
            'perPage' => $request->integer('perPage', 15),
            'outletId' => $request->has('outletId') && $request->filled('outletId')
                ? $request->integer('outletId')
                : null,
            'isActive' => $request->has('isActive') && $request->filled('isActive')
                ? $request->boolean('isActive')
                : null,
            'minPrice' => $request->has('minPrice') && $request->filled('minPrice')
                ? $request->float('minPrice')
                : null,
            'maxPrice' => $request->has('maxPrice') && $request->filled('maxPrice')
                ? $request->float('maxPrice')
                : null,
            'minDurationDays' => $request->has('minDurationDays') && $request->filled('minDurationDays')
                ? $request->integer('minDurationDays')
                : null,
            'maxDurationDays' => $request->has('maxDurationDays') && $request->filled('maxDurationDays')
                ? $request->integer('maxDurationDays')
                : null,
            'minDiscountPercentage' => $request->has('minDiscountPercentage') && $request->filled('minDiscountPercentage')
                ? $request->float('minDiscountPercentage')
                : null,
            'maxDiscountPercentage' => $request->has('maxDiscountPercentage') && $request->filled('maxDiscountPercentage')
                ? $request->float('maxDiscountPercentage')
                : null,
        ];
    }
}
