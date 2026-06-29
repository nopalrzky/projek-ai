<?php

namespace App\Http\Controllers\Web;

use Illuminate\Routing\Attributes\Controllers\Middleware;

use App\Helpers\PaginationHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\CustomerSubscription\StoreCustomerSubscriptionRequest;
use App\Http\Requests\CustomerSubscription\UpdateCustomerSubscriptionRequest;
use App\Http\Resources\CustomerSubscription\CustomerSubscriptionResource;
use App\Http\Resources\Outlet\OutletResource;
use App\Services\CustomerService;
use App\Services\CustomerSubscriptionService;
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
class CustomerSubscriptionController extends Controller
{
    public function __construct(private readonly CustomerSubscriptionService $customerSubscriptionService, private readonly CustomerService $customerService, private readonly OutletService $outletService, private readonly ServicePackageService $servicePackageService) {}

    public function index(Request $request): Response
    {
        try {
            $filters = $this->getFilters($request);

            $customerSubscription = $this->customerSubscriptionService->getAll(
                $filters,
                $filters['page'],
                $filters['perPage'],
                ['customer', 'servicePackage', 'customerQuotas.laundryService']
            );

            $customers       = $this->customerService->getAll();
            $servicePackages = $this->servicePackageService->getAll();
            $statusOptions   = [
                ['value' => 'active',    'label' => 'Aktif'],
                ['value' => 'exhausted', 'label' => 'Habis'],
                ['value' => 'expired',   'label' => 'Kadaluarsa'],
            ];

            return Inertia::render('Dashboard/CustomerSubscriptions/Index', [
                'customerSubscriptions' => [
                    'data' => CustomerSubscriptionResource::collection($customerSubscription->items())->resolve(),
                    'meta' => PaginationHelper::format($customerSubscription, $request),
                ],
                'filterOptions' => [
                    'status'   => $statusOptions,
                    'customers' => $customers->map(fn($customer) => [
                        'value' => $customer->id,
                        'label' => $customer->name,
                    ])->toArray(),
                    'servicePackages' => $servicePackages->map(fn($package) => [
                        'value' => $package->id,
                        'label' => $package->name,
                    ])->toArray(),
                ],
                'filters' => [
                    'search'        => $filters['search'] ?? '',
                    'status'        => $filters['status'] ?? null,
                    'sortBy'        => $filters['sortBy'] ?? 'createdAt',
                    'sortDirection' => $filters['sortDirection'] ?? 'desc',
                ],
                'flash' => [
                    'success' => session('success'),
                    'error'   => session('error'),
                ],
            ]);
        } catch (Throwable $e) {
            Log::error('[CustomerSubscriptionController] Failed to load customer subscriptions index', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'customer_subscription_controller_error',
            ]);

            return Inertia::render('Dashboard/CustomerSubscriptions/Index', [
                'subscriptions' => ['data' => [], 'meta' => []],
                'filters'       => [],
                'flash'         => ['error' => 'Gagal memuat data subscription'],
            ]);
        }
    }

    public function create(): Response|RedirectResponse
    {
        try {
            $outlets = $this->outletService->getAll(relations: []);

            return Inertia::render('Dashboard/CustomerSubscriptions/Create', [
                'outlets' => OutletResource::collection($outlets)->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[CustomerSubscriptionController] Failed to load subscription create form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'customer_subscription_controller_error',
            ]);

            return redirect()->route('customer-subscriptions.index')
                ->with('error', 'Gagal memuat formulir pembuatan subscription');
        }
    }

    public function store(StoreCustomerSubscriptionRequest $request): RedirectResponse
    {
        try {
            $this->customerSubscriptionService->store(
                $request->validated()
            );

            return redirect()->route('customer-subscriptions.index')
                ->with('success', 'Deposit Pelanggan berhasil dibuat');
        } catch (Throwable $e) {
            Log::error('[CustomerSubscriptionController] Failed to create subscription', [
                'data'    => $request->validated(),
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'customer_subscription_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'Gagal membuat subscription: ' . $e->getMessage());
        }
    }

    public function show(int $id): Response|RedirectResponse
    {
        try {
            $subscription = $this->customerSubscriptionService->getById($id, [
                'customer',
                'servicePackage',
                'servicePackage.servicePackageItems.laundryService',
                'customerQuotas.laundryService',
                'quotaUsageLogs.orderItem',
                'quotaUsageLogs.orderItem.order',
                'quotaUsageLogs.orderItem.laundryService',
            ]);

            return Inertia::render('Dashboard/CustomerSubscriptions/Show', [
                'subscription' => (new CustomerSubscriptionResource($subscription))->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[CustomerSubscriptionController] Failed to show subscription', [
                'subscription_id' => $id,
                'error'           => $e->getMessage(),
                'user_id'         => Auth::id(),
                'type'            => 'customer_subscription_controller_error',
            ]);

            return redirect()->route('customer-subscriptions.index')
                ->with('error', 'Subscription tidak ditemukan');
        }
    }

    public function edit(int $id): Response|RedirectResponse
    {
        try {
            $subscription = $this->customerSubscriptionService->getById($id, [
                'customer',
                'servicePackage',
            ]);

            return Inertia::render('Dashboard/CustomerSubscriptions/Edit', [
                'subscription' => (new CustomerSubscriptionResource($subscription))->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[CustomerSubscriptionController] Failed to load subscription edit form', [
                'subscription_id' => $id,
                'error'           => $e->getMessage(),
                'user_id'         => Auth::id(),
                'type'            => 'customer_subscription_controller_error',
            ]);

            return redirect()->route('customer-subscriptions.index')
                ->with('error', 'Subscription tidak ditemukan');
        }
    }

    public function update(UpdateCustomerSubscriptionRequest $request, int $id): RedirectResponse
    {
        try {
            $subscription = $this->customerSubscriptionService->update($id, $request->validated());

            return redirect()->route('customer-subscriptions.show', $id)
                ->with('success', 'Subscription berhasil diperbarui');
        } catch (Throwable $e) {
            Log::error('[CustomerSubscriptionController] Failed to update subscription', [
                'subscription_id' => $id,
                'data'            => $request->validated(),
                'error'           => $e->getMessage(),
                'user_id'         => Auth::id(),
                'type'            => 'customer_subscription_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'Gagal memperbarui subscription: ' . $e->getMessage());
        }
    }

    public function destroy(int $id): RedirectResponse
    {
        try {
            $this->customerSubscriptionService->destroy($id);

            return redirect()->route('customer-subscriptions.index')
                ->with('success', 'Subscription berhasil dihapus');
        } catch (Throwable $e) {
            Log::error('[CustomerSubscriptionController] Failed to delete subscription', [
                'subscription_id' => $id,
                'error'           => $e->getMessage(),
                'user_id'         => Auth::id(),
                'type'            => 'customer_subscription_controller_error',
            ]);

            return redirect()->back()
                ->with('error', 'Gagal menghapus subscription: ' . $e->getMessage());
        }
    }

    private function getFilters(Request $request): array
    {
        return [
            'search'        => $request->string('search')->toString(),
            'status'        => $request->has('status') && $request->filled('status')
                ? $request->string('status')->toString()
                : null,
            'sortBy'        => $request->string('sortBy', 'createdAt')->toString(),
            'sortDirection' => $request->string('sortDirection', 'desc')->toString(),
            'page'          => $request->integer('page', 1),
            'perPage'       => $request->integer('perPage', 15),
        ];
    }
}
