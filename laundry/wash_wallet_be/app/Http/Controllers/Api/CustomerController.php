<?php

namespace App\Http\Controllers\Api;

use App\Helpers\PaginationHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\CustomerSubscription\StoreCustomerSubscriptionRequest;
use App\Http\Requests\Customer\CustomerSubscription\UpdateCustomerSubscriptionRequest;
use App\Http\Requests\Customer\MembershipContract\StoreMembershipContractRequest;
use App\Http\Requests\Customer\StoreCustomerRequest;
use App\Http\Requests\Customer\UpdateCustomerRequest;
use App\Http\Resources\Customer\CustomerResource;
use App\Services\CustomerService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Throwable;

use Illuminate\Routing\Attributes\Controllers\Middleware;

#[Middleware('auth:sanctum')]
class CustomerController extends Controller
{
    public function __construct(
        private readonly CustomerService $customerService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $this->getFilters($request);

            $customers = $this->customerService->getAll(
                filters: $filters,
                page: $filters['page'],
                perPage: $filters['perPage'],
                relations: ['outlet'],
                withCounts: ['orders', 'membershipContracts', 'customerSubscriptions'],
            );

            Log::info('[CustomerController] Customers fetched', [
                'filters'         => $filters,
                'user_id'         => Auth::id(),
                'type'            => 'customer_management',
                'customers_count' => $customers->total(),
            ]);

            return $this->successResponse(
                CustomerResource::collection($customers)->resolve(),
                'Customer retrieved successfully',
                200,
                PaginationHelper::format($customers, $request)
            );
        } catch (Throwable $e) {
            Log::error('[CustomerController] Failed to fetch customers', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'customer_management',
            ]);

            return $this->errorResponse('Gagal memuat daftar pelanggan', 500, $e);
        }
    }

    public function store(StoreCustomerRequest $request): JsonResponse
    {
        try {
            $customer = $this->customerService->store($request->validated());

            return $this->successResponse(
                (new CustomerResource($customer))->resolve(),
                'Customer created successfully',
                201
            );
        } catch (Throwable $e) {
            Log::error('[CustomerController] Failed to create customer', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'customer_management',
            ]);

            return $this->errorResponse('Gagal membuat data pelanggan', 500, $e);
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            $customer = $this->customerService->getById($id, [
                'outlet',
                'orders',
                'orders.orderItems',
                'membershipContracts' => function ($query) {
                    $query->with('membershipPlan');
                },
                'customerSubscriptions' => function ($query) {
                    $query->with(
                        'servicePackage',
                        'servicePackage.servicePackageItems.laundryService',
                        'servicePackage.servicePackageItems.laundryService.category',
                    );
                },
            ]);

            return $this->successResponse(
                (new CustomerResource($customer))->resolve(),
                'Customer retrieved successfully'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Pelanggan tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[CustomerController] Failed to fetch customer', [
                'error'       => $e->getMessage(),
                'user_id'     => Auth::id(),
                'type'        => 'customer_management',
                'customer_id' => $id,
            ]);

            return $this->errorResponse('Gagal memuat data pelanggan', 500, $e);
        }
    }

    public function update(UpdateCustomerRequest $request, int $id): JsonResponse
    {
        try {
            $customer = $this->customerService->update($id, $request->validated());

            return $this->successResponse(
                (new CustomerResource($customer->load(['outlet'])))->resolve(),
                'Customer updated successfully'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Pelanggan tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[CustomerController] Failed to update customer', [
                'error'       => $e->getMessage(),
                'user_id'     => Auth::id(),
                'type'        => 'customer_management',
                'customer_id' => $id,
            ]);

            return $this->errorResponse('Gagal memperbarui data pelanggan', 500, $e);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $deleted = $this->customerService->destroy($id);

            if ($deleted) {
                return $this->successResponse(null, 'Customer deleted successfully');
            }

            return $this->errorResponse('Pelanggan tidak ditemukan atau tidak dapat dihapus', 404);
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Pelanggan tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[CustomerController] Failed to delete customer', [
                'error'       => $e->getMessage(),
                'user_id'     => Auth::id(),
                'type'        => 'customer_management',
                'customer_id' => $id,
            ]);

            return $this->errorResponse('Gagal menghapus data pelanggan', 500, $e);
        }
    }

    public function storeMembershipContract(int $customerId, StoreMembershipContractRequest $request): JsonResponse
    {
        try {
            $customer = $this->customerService->getById($customerId);
            $this->customerService->storeMembershipContract($customerId, $request->validated());

            return $this->successResponse(
                (new CustomerResource($customer->load(['membershipContracts.membershipPlan'])))->resolve(),
                'Membership contract created successfully',
                201
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Pelanggan tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[CustomerController] Failed to create membership contract', [
                'error'       => $e->getMessage(),
                'user_id'     => Auth::id(),
                'type'        => 'customer_management',
                'customer_id' => $customerId,
            ]);

            return $this->errorResponse('Gagal membuat kontrak keanggotaan', 500, $e);
        }
    }

    public function storeCustomerSubscription(int $customerId, StoreCustomerSubscriptionRequest $request): JsonResponse
    {
        try {
            $customer = $this->customerService->getById($customerId);
            $this->customerService->storeCustomerSubscription(
                $customerId,
                $request->validated()
            );

            return $this->successResponse(
                (new CustomerResource($customer->load(['customerSubscriptions.servicePackage'])))->resolve(),
                'Customer subscription created successfully',
                201
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Pelanggan tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[CustomerController] Failed to create customer subscription', [
                'error'       => $e->getMessage(),
                'user_id'     => Auth::id(),
                'type'        => 'customer_management',
                'customer_id' => $customerId,
            ]);

            return $this->errorResponse('Gagal membuat langganan pelanggan', 500, $e);
        }
    }

    public function updateCustomerSubscription(
        int $customerId,
        int $customerSubscriptionId,
        UpdateCustomerSubscriptionRequest $request
    ): JsonResponse {
        try {
            $subscription = $this->customerService->updateCustomerSubscription(
                $customerId,
                $customerSubscriptionId,
                $request->validated()
            );

            return $this->successResponse(
                (new CustomerResource($subscription->load(['servicePackage'])))->resolve(),
                'Customer subscription updated successfully'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Pelanggan atau langganan tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[CustomerController] Failed to update customer subscription', [
                'error'           => $e->getMessage(),
                'user_id'         => Auth::id(),
                'type'            => 'customer_management',
                'customer_id'     => $customerId,
                'subscription_id' => $customerSubscriptionId,
            ]);

            return $this->errorResponse('Gagal memperbarui langganan pelanggan', 500, $e);
        }
    }

    private function getFilters(Request $request): array
    {
        return [
            'search' => $request->string('search')->toString(),
            'outletId' => $request->has('outletId') && $request->filled('outletId')
                ? $request->integer('outletId')
                : null,
            'phone' => $request->has('phone') && $request->filled('phone')
                ? $request->string('phone')->toString()
                : null,
            'gender' => $request->has('gender') && $request->filled('gender')
                ? $request->string('gender')->toString()
                : null,
            'isActive' => $request->has('isActive') && $request->filled('isActive')
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
