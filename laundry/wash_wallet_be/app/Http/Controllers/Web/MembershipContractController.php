<?php

namespace App\Http\Controllers\Web;

use Illuminate\Routing\Attributes\Controllers\Middleware;

use App\Helpers\PaginationHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\MembershipContract\StoreMembershipContractRequest;
use App\Http\Requests\MembershipContract\UpdateMembershipContractRequest;
use App\Http\Resources\MembershipContract\MembershipContractResource;
use App\Http\Resources\Customer\CustomerResource;
use App\Http\Resources\MembershipPlan\MembershipPlanResource;
use App\Http\Resources\Outlet\OutletResource;
use App\Services\MembershipContractService;
use App\Services\CustomerService;
use App\Services\OutletService;
use App\Services\MembershipPlanService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

#[Middleware('auth')]
class MembershipContractController extends Controller
{
    public function __construct(private readonly MembershipContractService $membershipContractService, private readonly CustomerService $customerService, private readonly OutletService $outletService, private readonly MembershipPlanService $membershipPlanService) {}

    /**
     * Display a listing of membership contracts
     */
    public function index(Request $request): Response
    {
        try {
            $filters = $this->getFiltersFromRequest($request);

            $membershipContracts = $this->membershipContractService->getAll(
                $filters,
                $filters['page'],
                $filters['perPage'],
                ['customer', 'outlet', 'membershipPlan']
            );

            $outlets = $this->outletService->getAll();
            $customers = $this->customerService->getAll();
            $membershipPlans = $this->membershipPlanService->getAll();

            return Inertia::render('Dashboard/MembershipContracts/Index', [
                'membershipContracts' => [
                    'data' => MembershipContractResource::collection($membershipContracts->items())->resolve(),
                    'meta' => PaginationHelper::format($membershipContracts, $request),
                ],
                'filterOptions' => [
                    'outlets' => OutletResource::collection($outlets)->resolve(),
                    'customers' => CustomerResource::collection($customers)->resolve(),
                    'membershipPlans' => MembershipPlanResource::collection($membershipPlans)->resolve(),
                    'statusOptions' => [
                        ['value' => 'active', 'label' => 'Aktif'],
                        ['value' => 'expired', 'label' => 'Expired'],
                        ['value' => 'replaced', 'label' => 'Diganti'],
                    ],
                ],
                'filters' => [
                    'search' => $filters['search'] ?? '',
                    'customerId' => $filters['customerId'] ?? null,
                    'outletId' => $filters['outletId'] ?? null,
                    'membershipPlanId' => $filters['membershipPlanId'] ?? null,
                    'status' => $filters['status'] ?? null,
                    'startDateFrom' => $filters['startDateFrom'] ?? null,
                    'startDateTo' => $filters['startDateTo'] ?? null,
                    'expiredDateFrom' => $filters['expiredDateFrom'] ?? null,
                    'expiredDateTo' => $filters['expiredDateTo'] ?? null,
                    'startDate' => $filters['startDate'] ?? null,
                    'endDate' => $filters['endDate'] ?? null,
                    'hasExpiredDate' => $filters['hasExpiredDate'] ?? null,
                    'expiringSoonDays' => $filters['expiringSoonDays'] ?? null,
                    'sortBy' => $filters['sortBy'] ?? 'created_at',
                    'sortDirection' => $filters['sortDirection'] ?? 'desc',
                ],
                'flash' => [
                    'success' => session('success'),
                    'error' => session('error'),
                ],
            ]);
        } catch (Throwable $e) {
            Log::error('[MembershipContractController] Failed to load membership contracts index', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'membership_contract_controller_error',
            ]);

            return Inertia::render('Dashboard/MembershipContracts/Index', [
                'membershipContracts' => [
                    'data' => [],
                    'meta' => [
                        'current_page' => 1,
                        'from' => 0,
                        'last_page' => 1,
                        'per_page' => 15,
                        'to' => 0,
                        'total' => 0,
                    ],
                ],
                'filterOptions' => [
                    'outlets' => [],
                    'customers' => [],
                    'membershipPlans' => [],
                    'statusOptions' => [],
                ],
                'filters' => [],
                'error' => 'Gagal memuat data. Silakan coba lagi.',
            ]);
        }
    }

    /**
     * Show the form for creating a new membership contract
     */
    public function create(): Response|RedirectResponse
    {
        try {
            $outlets = $this->outletService->getAll();

            return Inertia::render('Dashboard/MembershipContracts/Create', [
                'outlets' => OutletResource::collection($outlets)->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[MembershipContractController] Failed to load membership contract create form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'membership_contract_controller_error',
            ]);

            return redirect()->route('membership-contracts.index')
                ->with('error', 'Gagal memuat form tambah kontrak membership.');
        }
    }

    /**
     * Store a newly created membership contract
     */
    public function store(StoreMembershipContractRequest $request): RedirectResponse
    {
        try {
            $this->membershipContractService->store($request->validated());

            return redirect()->route('membership-contracts.index')
                ->with('success', 'Kontrak membership berhasil ditambahkan.');
        } catch (Throwable $e) {
            Log::error('[MembershipContractController] Failed to create membership contract', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'membership_contract_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Display the specified membership contract
     */
    public function show(int $id): Response|RedirectResponse
    {
        try {
            $membershipContract = $this->membershipContractService->getById(
                $id,
                relations: [
                    'customer',
                    'outlet',
                    'membershipPlan',
                ]
            );

            return Inertia::render('Dashboard/MembershipContracts/Show', [
                'membershipContract' => new MembershipContractResource($membershipContract),
            ]);
        } catch (Throwable $e) {
            Log::error('[MembershipContractController] Failed to load membership contract detail', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'membership_contract_controller_error',
            ]);

            return redirect()->route('membership-contracts.index')
                ->with('error', 'Kontrak membership tidak ditemukan.');
        }
    }

    /**
     * Show the form for editing the specified membership contract
     */
    public function edit(int $id): Response|RedirectResponse
    {
        try {
            $membershipContract = $this->membershipContractService->getById(
                $id,
                relations: ['customer', 'outlet', 'membershipPlan']
            );

            $customers = $this->customerService->getAll();
            $outlets = $this->outletService->getAll();
            $membershipPlans = $this->membershipPlanService->getAll();

            return Inertia::render('Dashboard/MembershipContracts/Edit', [
                'membershipContract' => new MembershipContractResource($membershipContract),
                'customers' => CustomerResource::collection($customers)->resolve(),
                'outlets' => OutletResource::collection($outlets)->resolve(),
                'membershipPlans' => MembershipPlanResource::collection($membershipPlans)->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[MembershipContractController] Failed to load membership contract edit form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'membership_contract_controller_error',
            ]);

            return redirect()->route('membership-contracts.index')
                ->with('error', 'Kontrak membership tidak ditemukan.');
        }
    }

    /**
     * Update the specified membership contract
     */
    public function update(UpdateMembershipContractRequest $request, int $id): RedirectResponse
    {
        try {
            $this->membershipContractService->update($id, $request->validated());

            return redirect()->route('membership-contracts.index')
                ->with('success', 'Kontrak membership berhasil diperbarui.');
        } catch (Throwable $e) {
            Log::error('[MembershipContractController] Failed to update membership contract', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'membership_contract_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Remove the specified membership contract
     */
    public function destroy(int $id): RedirectResponse
    {
        try {
            $this->membershipContractService->destroy($id);

            return redirect()->route('membership-contracts.index')
                ->with('success', 'Kontrak membership berhasil dihapus.');
        } catch (Throwable $e) {
            Log::error('[MembershipContractController] Failed to delete membership contract', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'membership_contract_controller_error',
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
            'customerId' => $request->has('customerId') && $request->filled('customerId')
                ? $request->integer('customerId')
                : null,
            'outletId' => $request->has('outletId') && $request->filled('outletId')
                ? $request->integer('outletId')
                : null,
            'membershipPlanId' => $request->has('membershipPlanId') && $request->filled('membershipPlanId')
                ? $request->integer('membershipPlanId')
                : null,
            'status' => $request->has('status') && $request->filled('status')
                ? $request->string('status')->toString()
                : null,
            'startDateFrom' => $request->has('startDateRange.from') && $request->filled('startDateRange.from')
                ? $request->date('startDateRange.from')->format('Y-m-d')
                : null,
            'startDateTo' => $request->has('startDateRange.to') && $request->filled('startDateRange.to')
                ? $request->date('startDateRange.to')->format('Y-m-d')
                : null,
            'expiredDateFrom' => $request->has('expiredDateRange.from') && $request->filled('expiredDateRange.from')
                ? $request->date('expiredDateRange.from')->format('Y-m-d')
                : null,
            'expiredDateTo' => $request->has('expiredDateRange.to') && $request->filled('expiredDateRange.to')
                ? $request->date('expiredDateRange.to')->format('Y-m-d')
                : null,
            'sortBy' => $request->string('sortBy', 'created_at')->toString(),
            'sortDirection' => $request->string('sortDirection', 'desc')->toString(),
            'page' => $request->integer('page', 1),
            'perPage' => $request->integer('perPage', 15),
        ];
    }
}
