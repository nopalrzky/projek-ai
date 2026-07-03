<?php

namespace App\Http\Controllers\Web;

use Illuminate\Routing\Attributes\Controllers\Middleware;

use App\Helpers\PaginationHelper;
use App\Http\Controllers\Controller;
use App\Services\CustomerService;
use App\Services\MembershipContractService;
use App\Services\MembershipPlanService;
use App\Services\CustomerSubscriptionService;
use App\Services\OutletService;
use App\Services\ServicePackageService;

use App\Http\Requests\Customer\StoreCustomerRequest;
use App\Http\Requests\Customer\UpdateCustomerRequest;
use App\Http\Requests\Customer\CustomerSubscription\UpdateCustomerSubscriptionRequest;
use App\Http\Requests\Customer\CustomerSubscription\StoreCustomerSubscriptionRequest;
use App\Http\Requests\Customer\MembershipContract\StoreMembershipContractRequest;
use App\Http\Requests\MembershipContract\UpdateMembershipContractRequest;

use App\Http\Resources\Customer\CustomerResource;
use App\Http\Resources\CustomerSubscription\CustomerSubscriptionResource;
use App\Http\Resources\MembershipContract\MembershipContractResource;
use App\Http\Resources\MembershipPlan\MembershipPlanResource;
use App\Http\Resources\Outlet\OutletResource;
use App\Http\Resources\ServicePackage\ServicePackageResource;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Exception;
use Throwable;

#[Middleware('auth')]
class CustomerController extends Controller
{
    public function __construct(private readonly CustomerService $customerService, private readonly MembershipContractService $membershipContractService, private readonly MembershipPlanService $membershipPlanService, private readonly CustomerSubscriptionService $customerSubscriptionService, private readonly OutletService $outletService, private readonly ServicePackageService $servicePackageService) {}

    /**
     * Display a listing of customers
     */
    public function index(Request $request): Response
    {
        try {
            $filters = $this->getFiltersFromRequest($request);

            $customers = $this->customerService->getAll(
                $filters,
                $filters['page'],
                $filters['perPage'],
                ['outlet', 'orders']
            );

            $outlets = $this->outletService->getAll();

            return Inertia::render('Dashboard/Customers/Index', [
                'customers' => [
                    'data' => CustomerResource::collection($customers)->resolve(),
                    'meta' => PaginationHelper::format($customers, $request),
                ],
                'stats' => $this->customerService->getStats(),
                'filterOptions' => [
                    'outlets' => $outlets->map(fn($o) => [
                        'id'   => $o->id,
                        'name' => $o->name,
                        'code' => $o->code,
                    ])->toArray(),
                    'statusOptions' => [
                        ['value' => true,  'label' => 'Aktif'],
                        ['value' => false, 'label' => 'Tidak Aktif'],
                    ],
                    'genderOptions' => [
                        ['value' => 'male',   'label' => 'Laki-laki'],
                        ['value' => 'female', 'label' => 'Perempuan'],
                    ],
                ],
                'filters' => [
                    'search'        => $filters['search'] ?? '',
                    'outletId'      => $filters['outletId'] ?? null,
                    'phone'         => $filters['phone'] ?? null,
                    'gender'        => $filters['gender'] ?? null,
                    'isActive'      => $filters['isActive'] ?? null,
                    'startDate'     => $filters['startDate'] ?? null,
                    'endDate'       => $filters['endDate'] ?? null,
                    'sortBy'        => $filters['sortBy'] ?? 'created_at',
                    'sortDirection' => $filters['sortDirection'] ?? 'desc',
                ],
                'flash' => [
                    'success' => session('success'),
                    'error'   => session('error'),
                ],
            ]);
        } catch (Throwable $e) {
            Log::error('[CustomerController] Failed to load customers index', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'customer_controller_error',
            ]);

            return Inertia::render('Dashboard/Customers/Index', [
                'customers' => [
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
                    'outlets'       => [],
                    'statusOptions' => [],
                    'genderOptions' => [],
                ],
                'filters' => [],
                'flash'   => [
                    'error' => 'Gagal memuat data pelanggan. Silakan coba lagi.',
                ],
            ]);
        }
    }

    /**
     * Show the form for creating a new customer
     */
    public function create(): Response|RedirectResponse
    {
        try {
            $outlets = $this->outletService->getAll();

            return Inertia::render('Dashboard/Customers/Create', [
                'outlets' => OutletResource::collection($outlets)->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[CustomerController] Failed to load customer create form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'customer_controller_error',
            ]);

            return redirect()->route('customers.index')
                ->with('error', 'Gagal memuat formulir pembuatan pelanggan');
        }
    }

    /**
     * Store a newly created customer
     */
    public function store(StoreCustomerRequest $request): RedirectResponse
    {
        try {
            $customer = $this->customerService->store($request->validated());

            return redirect()->route('customers.index')
                ->with('success', "Pelanggan '{$customer->name}' berhasil dibuat");
        } catch (Throwable $e) {
            Log::error('[CustomerController] Failed to create customer via web', [
                'data'    => $request->validated(),
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'customer_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'Gagal membuat pelanggan: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified customer
     */
    public function show(Request $request, int $id): Response|RedirectResponse
    {
        try {
            $customer = $this->customerService->getById($id, [
                'outlet',
                'orders',
                'orders.orderItems',
                'orders.employee',
                'membershipContracts',
                'membershipContracts.membershipPlan',
                'customerSubscriptions',
                'customerSubscriptions.servicePackage',
            ]);

            return Inertia::render('Dashboard/Customers/Show', [
                'customer' => (new CustomerResource($customer))->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[CustomerController] Failed to show customer', [
                'customer_id' => $id,
                'error'       => $e->getMessage(),
                'user_id'     => Auth::id(),
                'type'        => 'customer_controller_error',
            ]);

            return redirect()->route('customers.index')
                ->with('error', 'Pelanggan tidak ditemukan');
        }
    }

    /**
     * Show the form for editing the specified customer
     */
    public function edit(int $id): Response|RedirectResponse
    {
        try {
            $customer = $this->customerService->getById($id);
            $outlets  = $this->outletService->getAll();

            return Inertia::render('Dashboard/Customers/Edit', [
                'customer' => (new CustomerResource($customer))->resolve(),
                'outlets'  => OutletResource::collection($outlets)->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[CustomerController] Failed to load customer edit form', [
                'customer_id' => $id,
                'error'       => $e->getMessage(),
                'user_id'     => Auth::id(),
                'type'        => 'customer_controller_error',
            ]);

            return redirect()->route('customers.index')
                ->with('error', 'Pelanggan tidak ditemukan');
        }
    }

    /**
     * Update the specified customer
     */
    public function update(UpdateCustomerRequest $request, int $id): RedirectResponse
    {
        try {
            $customer = $this->customerService->update($id, $request->validated());

            return redirect()->route('customers.index')
                ->with('success', "Pelanggan '{$customer->name}' berhasil diperbarui");
        } catch (Throwable $e) {
            Log::error('[CustomerController] Failed to update customer via web', [
                'customer_id' => $id,
                'data'        => $request->validated(),
                'error'       => $e->getMessage(),
                'user_id'     => Auth::id(),
                'type'        => 'customer_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'Gagal memperbarui pelanggan: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified customer
     */
    public function destroy(Request $request, int $id): RedirectResponse
    {
        try {
            $this->customerService->destroy($id);

            return redirect()->route('customers.index')
                ->with('success', "Pelanggan berhasil dihapus");
        } catch (Throwable $e) {
            Log::error('[CustomerController] Failed to delete customer via web', [
                'customer_id' => $id,
                'error'       => $e->getMessage(),
                'user_id'     => Auth::id(),
                'type'        => 'customer_controller_error',
            ]);

            return redirect()->back()
                ->with('error', 'Gagal menghapus pelanggan: ' . $e->getMessage());
        }
    }

    /**
     * Restore soft deleted customer
     */
    public function restore(Request $request, int $id): RedirectResponse
    {
        try {
            $customer = $this->customerService->restore($id);

            Log::info('[CustomerController] Customer restored via web interface', [
                'customer_id'   => $id,
                'customer_name' => $customer->name,
                'restored_by'   => $request->user()?->id,
                'type'          => 'customer_web_action',
            ]);

            return redirect()->route('customers.show', $customer->id)
                ->with('success', "Pelanggan '{$customer->name}' berhasil dipulihkan");
        } catch (Throwable $e) {
            Log::error('[CustomerController] Failed to restore customer via web', [
                'customer_id' => $id,
                'error'       => $e->getMessage(),
                'user_id'     => Auth::id(),
                'type'        => 'customer_controller_error',
            ]);

            return redirect()->back()
                ->with('error', 'Gagal memulihkan pelanggan: ' . $e->getMessage());
        }
    }

    /**
     * Permanently delete customer
     */
    public function forceDestroy(Request $request, int $id): RedirectResponse
    {
        try {
            $deleted = $this->customerService->forceDestroy($id);

            if ($deleted) {
                Log::info('[CustomerController] Customer permanently deleted via web interface', [
                    'customer_id' => $id,
                    'deleted_by'  => $request->user()?->id,
                    'type'        => 'customer_web_action',
                ]);

                return redirect()->route('customers.index')
                    ->with('success', 'Pelanggan berhasil dihapus permanen');
            }

            return redirect()->back()
                ->with('error', 'Gagal menghapus pelanggan secara permanen');
        } catch (Throwable $e) {
            Log::error('[CustomerController] Failed to force delete customer via web', [
                'customer_id' => $id,
                'error'       => $e->getMessage(),
                'user_id'     => Auth::id(),
                'type'        => 'customer_controller_error',
            ]);

            return redirect()->back()
                ->with('error', 'Gagal menghapus pelanggan secara permanen: ' . $e->getMessage());
        }
    }

    // Customer Subscription

    /**
     * Show form to create new customer subscription
     */
    public function createCustomerSubscription(int $customerId): Response|RedirectResponse
    {
        try {
            $customer = $this->customerService->getById($customerId, [
                'outlet',
            ]);

            $servicePackages = $this->servicePackageService->getAll(
                null,
                null,
                ['outletId' => $customer->outlet_id],
                ['servicePackageItems', 'servicePackageItems.laundryService']
            );

            return Inertia::render('Dashboard/Customers/CustomerSubscriptions/Create', [
                'customer'        => (new CustomerResource($customer))->resolve(),
                'servicePackages' => ServicePackageResource::collection($servicePackages)->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[CustomerController] Failed to load customer subscription create form', [
                'customer_id' => $customerId,
                'error'       => $e->getMessage(),
                'user_id'     => Auth::id(),
                'type'        => 'customer_controller_error',
            ]);

            return redirect()->route('customers.show', $customerId)
                ->with('error', 'Gagal memuat formulir pembelian paket');
        }
    }

    /**
     * Store new customer subscription
     */
    public function storeCustomerSubscription(
        int $customerId,
        StoreCustomerSubscriptionRequest $request
    ): RedirectResponse {
        try {
            $subscription = $this->customerService->storeCustomerSubscription(
                $customerId,
                $request->validated()
            );

            return redirect()->route('customers.show', $customerId)
                ->with('success', "Paket '{$subscription->servicePackage->name}' berhasil dibeli");
        } catch (Throwable $e) {
            Log::error('[CustomerController] Failed to create customer subscription', [
                'customer_id' => $customerId,
                'data'        => $request->validated(),
                'error'       => $e->getMessage(),
                'user_id'     => Auth::id(),
                'type'        => 'customer_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'Gagal membeli paket: ' . $e->getMessage());
        }
    }

    /**
     * Show customer subscription details
     */
    public function showCustomerSubscription(
        int $customerId,
        int $subscriptionId
    ): Response|RedirectResponse {
        try {
            $customer             = $this->customerService->getById($customerId, ['outlet']);
            $customerSubscription = $this->customerSubscriptionService->getById(
                $subscriptionId,
                [
                    'servicePackage',
                    'servicePackage.servicePackageItems',
                    'servicePackage.servicePackageItems.laundryService',
                    'customerQuotas',
                    'customerQuotas.laundryService',
                ]
            );

            return Inertia::render('Dashboard/Customers/CustomerSubscriptions/Show', [
                'customer'             => (new CustomerResource($customer))->resolve(),
                'customerSubscription' => (new CustomerSubscriptionResource($customerSubscription))->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[CustomerController] Failed to show customer subscription', [
                'customer_id'     => $customerId,
                'subscription_id' => $subscriptionId,
                'error'           => $e->getMessage(),
                'user_id'         => Auth::id(),
                'type'            => 'customer_controller_error',
            ]);

            return redirect()->route('customers.show', $customerId)
                ->with('error', 'Subscription tidak ditemukan');
        }
    }

    /**
     * Show form for editing customer subscription
     */
    public function editCustomerSubscription(
        int $customerId,
        int $subscriptionId
    ): Response|RedirectResponse {
        try {
            $customer             = $this->customerService->getById($customerId, ['outlet']);
            $customerSubscription = $this->customerSubscriptionService->getById(
                $subscriptionId,
                [
                    'servicePackage',
                    'servicePackage.servicePackageItems',
                    'servicePackage.servicePackageItems.laundryService',
                ]
            );

            return Inertia::render('Dashboard/Customers/CustomerSubscriptions/Edit', [
                'customer'             => (new CustomerResource($customer))->resolve(),
                'customerSubscription' => (new CustomerSubscriptionResource($customerSubscription))->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[CustomerController] Failed to load customer subscription edit form', [
                'customer_id'     => $customerId,
                'subscription_id' => $subscriptionId,
                'error'           => $e->getMessage(),
                'user_id'         => Auth::id(),
                'type'            => 'customer_controller_error',
            ]);

            return redirect()->route('customers.show', $customerId)
                ->with('error', 'Subscription tidak ditemukan');
        }
    }

    /**
     * Update customer subscription status
     */
    public function updateCustomerSubscription(
        int $customerId,
        int $subscriptionId,
        UpdateCustomerSubscriptionRequest $request
    ): RedirectResponse {
        try {
            $subscription = $this->customerService->updateCustomerSubscription(
                $customerId,
                $subscriptionId,
                $request->validated()
            );

            return redirect()->route('customers.customer-subscriptions.show', [
                'customer'     => $customerId,
                'subscription' => $subscriptionId,
            ])->with('success', 'Status subscription berhasil diperbarui');
        } catch (Throwable $e) {
            Log::error('[CustomerController] Failed to update customer subscription', [
                'customer_id'     => $customerId,
                'subscription_id' => $subscriptionId,
                'data'            => $request->validated(),
                'error'           => $e->getMessage(),
                'user_id'         => Auth::id(),
                'type'            => 'customer_controller_error',
            ]);

            return redirect()->back()
                ->with('error', 'Gagal memperbarui subscription: ' . $e->getMessage());
        }
    }

    /**
     * Delete customer subscription
     */
    public function destroyCustomerSubscription(
        int $customerId,
        int $subscriptionId
    ): RedirectResponse {
        try {
            $subscription = $this->customerSubscriptionService->getById($subscriptionId);

            if ((int) $subscription->customer_id !== (int) $customerId) {
                throw new Exception('Subscription does not belong to this customer');
            }

            $this->customerSubscriptionService->destroy($subscriptionId);

            return redirect()->route('customers.show', $customerId)
                ->with('success', 'Subscription berhasil dihapus');
        } catch (Throwable $e) {
            Log::error('[CustomerController] Failed to delete customer subscription', [
                'customer_id'     => $customerId,
                'subscription_id' => $subscriptionId,
                'error'           => $e->getMessage(),
                'user_id'         => Auth::id(),
                'type'            => 'customer_controller_error',
            ]);

            return redirect()->back()
                ->with('error', 'Gagal menghapus subscription: ' . $e->getMessage());
        }
    }

    // Membership Contract

    public function createMembershipContract(int $customerId): Response|RedirectResponse
    {
        try {
            $customer = $this->customerService->getById($customerId, [
                'outlet',
            ]);

            $membershipPlans = $this->membershipPlanService->getAll(
                filters: ['outletId' => $customer->outlet_id]
            );

            return Inertia::render('Dashboard/Customers/MembershipContracts/Create', [
                'customer'        => (new CustomerResource($customer))->resolve(),
                'membershipPlans' => MembershipPlanResource::collection($membershipPlans)->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[CustomerController] Failed to load membership contract create form', [
                'customer_id' => $customerId,
                'error'       => $e->getMessage(),
                'user_id'     => Auth::id(),
                'type'        => 'customer_controller_error',
            ]);

            return redirect()->route('customers.show', $customerId)
                ->with('error', 'Gagal memuat formulir pembuatan membership contract');
        }
    }

    /**
     * Store new membership contract
     */
    public function storeMembershipContract(
        int $customerId,
        StoreMembershipContractRequest $request
    ): RedirectResponse {
        try {
            $this->customerService->storeMembershipContract(
                $customerId,
                $request->validated()
            );

            return redirect()->route('customers.show', $customerId)
                ->with('success', "Membership contract berhasil dibuat untuk pelanggan");
        } catch (Throwable $e) {
            Log::error('[CustomerController] Failed to create membership contract', [
                'customer_id' => $customerId,
                'data'        => $request->validated(),
                'error'       => $e->getMessage(),
                'user_id'     => Auth::id(),
                'type'        => 'customer_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'Gagal membuat membership contract: ' . $e->getMessage());
        }
    }

    /**
     * Show membership contract details
     */
    public function showMembershipContract(
        int $customerId,
        int $membershipContractId
    ): Response|RedirectResponse {
        try {
            $customer = $this->customerService->getById($customerId, ['outlet']);
            $contract = $this->membershipContractService->getById($membershipContractId, [
                'customer',
                'outlet',
                'membershipPlan',
            ]);

            if ((int) $contract->customer_id !== (int) $customerId) {
                throw new Exception('Contract does not belong to this customer');
            }

            return Inertia::render('Dashboard/Customers/MembershipContracts/Show', [
                'customer' => (new CustomerResource($customer))->resolve(),
                'contract' => (new MembershipContractResource($contract))->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[CustomerController] Failed to show membership contract', [
                'customer_id' => $customerId,
                'contract_id' => $membershipContractId,
                'error'       => $e->getMessage(),
                'user_id'     => Auth::id(),
                'type'        => 'customer_controller_error',
            ]);

            return redirect()->route('customers.show', $customerId)
                ->with('error', 'Membership contract tidak ditemukan');
        }
    }

    /**
     * Show form for editing membership contract
     */
    public function editMembershipContract(
        int $customerId,
        int $membershipContractId
    ): Response|RedirectResponse {
        try {
            $customer = $this->customerService->getById($customerId, ['outlet']);
            $contract = $this->membershipContractService->getById($membershipContractId, [
                'customer',
                'outlet',
                'membershipPlan',
            ]);

            if ((int) $contract->customer_id !== (int) $customerId) {
                throw new Exception('Contract does not belong to this customer');
            }

            if ($contract->status !== 'active') {
                return redirect()->route('customers.show', $customerId)
                    ->with('error', 'Hanya kontrak aktif yang dapat diedit');
            }

            $membershipPlans = $this->membershipPlanService->getAll(
                filters: ['outletId' => $customer->outlet_id]
            );

            return Inertia::render('Dashboard/Customers/MembershipContracts/Edit', [
                'customer'        => (new CustomerResource($customer))->resolve(),
                'contract'        => (new MembershipContractResource($contract))->resolve(),
                'membershipPlans' => MembershipPlanResource::collection($membershipPlans)->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[CustomerController] Failed to load membership contract edit form', [
                'customer_id' => $customerId,
                'contract_id' => $membershipContractId,
                'error'       => $e->getMessage(),
                'user_id'     => Auth::id(),
                'type'        => 'customer_controller_error',
            ]);

            return redirect()->route('customers.show', $customerId)
                ->with('error', 'Membership contract tidak ditemukan');
        }
    }

    /**
     * Update the specified membership contract
     */
    public function updateMembershipContract(
        UpdateMembershipContractRequest $request,
        int $customerId,
        int $membershipContractId
    ): RedirectResponse {
        try {
            $contract = $this->membershipContractService->getById($membershipContractId);

            if ((int) $contract->customer_id !== (int) $customerId) {
                throw new Exception('Contract does not belong to this customer');
            }

            $this->membershipContractService->update($membershipContractId, $request->validated());

            return redirect()->route('customers.show', $customerId)
                ->with('success', 'Kontrak membership berhasil diperbarui');
        } catch (Throwable $e) {
            Log::error('[CustomerController] Failed to update membership contract', [
                'customer_id' => $customerId,
                'contract_id' => $membershipContractId,
                'data'        => $request->validated(),
                'error'       => $e->getMessage(),
                'user_id'     => Auth::id(),
                'type'        => 'customer_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'Gagal memperbarui membership contract: ' . $e->getMessage());
        }
    }

    /**
     * Delete membership contract
     */
    public function destroyMembershipContract(
        Request $request,
        int $customerId,
        int $contractId
    ): RedirectResponse {
        try {
            $this->customerService->destroyMembershipContract($customerId, $contractId);

            return redirect()->route('customers.show', $customerId)
                ->with('success', 'Membership contract berhasil dihapus');
        } catch (Throwable $e) {
            Log::error('[CustomerController] Failed to delete membership contract', [
                'customer_id' => $customerId,
                'contract_id' => $contractId,
                'error'       => $e->getMessage(),
                'user_id'     => Auth::id(),
                'type'        => 'customer_controller_error',
            ]);

            return redirect()->back()
                ->with('error', 'Gagal menghapus membership contract: ' . $e->getMessage());
        }
    }

    /**
     * Get filters from request
     */
    private function getFiltersFromRequest(Request $request): array
    {
        return [
            'search'    => $request->string('search')->toString(),
            'outletId'  => $request->has('outletId') && $request->filled('outletId')
                ? $request->integer('outletId')
                : null,
            'phone'     => $request->has('phone') && $request->filled('phone')
                ? $request->string('phone')->toString()
                : null,
            'gender'    => $request->has('gender') && $request->filled('gender')
                ? $request->string('gender')->toString()
                : null,
            'isActive'  => $request->has('isActive') && $request->filled('isActive')
                ? $request->boolean('isActive')
                : null,
            'withCounts'    => true,
            'sortBy'        => $request->string('sortBy', 'created_at')->toString(),
            'sortDirection' => $request->string('sortDirection', 'desc')->toString(),
            'page'          => $request->integer('page', 1),
            'perPage'       => $request->integer('perPage', 15),
        ];
    }
}
