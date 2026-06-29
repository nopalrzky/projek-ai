<?php

namespace App\Http\Controllers\Api;

use App\Helpers\PaginationHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\CustomerSubscription\StoreCustomerSubscriptionRequest;
use App\Http\Requests\CustomerSubscription\UpdateCustomerSubscriptionRequest;
use App\Http\Resources\CustomerSubscription\CustomerSubscriptionResource;
use App\Services\CustomerSubscriptionService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Throwable;

use Illuminate\Routing\Attributes\Controllers\Middleware;

#[Middleware('auth:sanctum')]
class CustomerSubscriptionController extends Controller
{
    public function __construct(
        private readonly CustomerSubscriptionService $customerSubscriptionService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $this->getFilters($request);

            $subscriptions = $this->customerSubscriptionService->getAll(
                filters: $filters,
                page: $filters['page'],
                perPage: $filters['perPage'],
                relations: [
                    'customer',
                    'servicePackage',
                    'customerQuotas.laundryService',
                ]
            );

            return $this->successResponse(
                CustomerSubscriptionResource::collection($subscriptions)->resolve(),
                'Customer subscriptions retrieved successfully',
                200,
                PaginationHelper::format($subscriptions, $request)
            );
        } catch (Throwable $e) {
            Log::error('[CustomerSubscriptionController] Failed to fetch customer subscriptions', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'customer_subscription_management',
            ]);

            return $this->errorResponse('Gagal memuat daftar langganan pelanggan', 500, $e);
        }
    }

    public function store(StoreCustomerSubscriptionRequest $request): JsonResponse
    {
        try {
            $subscription = $this->customerSubscriptionService->store($request->validated());

            return $this->successResponse(
                (new CustomerSubscriptionResource($subscription))->resolve(),
                'Customer subscription created successfully',
                201
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Pelanggan atau paket layanan tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[CustomerSubscriptionController] Failed to create customer subscription', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'customer_subscription_management',
            ]);

            return $this->errorResponse('Gagal membuat langganan pelanggan', 500, $e);
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            $subscription = $this->customerSubscriptionService->getById($id, [
                'customer',
                'servicePackage',
                'servicePackage.servicePackageItems.laundryService',
                'customerQuotas.laundryService',
                'quotaUsageLogs',
            ]);

            return $this->successResponse(
                (new CustomerSubscriptionResource($subscription))->resolve(),
                'Customer subscription retrieved successfully'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Langganan pelanggan tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[CustomerSubscriptionController] Failed to fetch customer subscription', [
                'error'           => $e->getMessage(),
                'user_id'         => Auth::id(),
                'type'            => 'customer_subscription_management',
                'subscription_id' => $id,
            ]);

            return $this->errorResponse('Gagal memuat langganan pelanggan', 500, $e);
        }
    }

    public function update(UpdateCustomerSubscriptionRequest $request, int $id): JsonResponse
    {
        try {
            $subscription = $this->customerSubscriptionService->update($id, $request->validated());

            return $this->successResponse(
                (new CustomerSubscriptionResource($subscription))->resolve(),
                'Customer subscription updated successfully'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Langganan pelanggan tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[CustomerSubscriptionController] Failed to update customer subscription', [
                'error'           => $e->getMessage(),
                'user_id'         => Auth::id(),
                'type'            => 'customer_subscription_management',
                'subscription_id' => $id,
            ]);

            return $this->errorResponse('Gagal memperbarui langganan pelanggan', 500, $e);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $deleted = $this->customerSubscriptionService->destroy($id);

            if ($deleted) {
                return $this->successResponse(null, 'Customer subscription deleted successfully');
            }

            return $this->errorResponse('Langganan pelanggan tidak ditemukan atau tidak dapat dihapus', 404);
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Langganan pelanggan tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[CustomerSubscriptionController] Failed to delete customer subscription', [
                'error'           => $e->getMessage(),
                'user_id'         => Auth::id(),
                'type'            => 'customer_subscription_management',
                'subscription_id' => $id,
            ]);

            return $this->errorResponse('Gagal menghapus langganan pelanggan', 500, $e);
        }
    }

    private function getFilters(Request $request): array
    {
        return [
            'search' => $request->string('search')->toString(),
            'status' => $request->has('status') && $request->filled('status')
                ? $request->string('status')->toString()
                : null,
            'customerId' => $request->has('customerId') && $request->filled('customerId')
                ? $request->integer('customerId')
                : null,
            'outletId' => $request->has('outletId') && $request->filled('outletId')
                ? $request->integer('outletId')
                : null,
            'servicePackageId' => $request->has('servicePackageId') && $request->filled('servicePackageId')
                ? $request->integer('servicePackageId')
                : null,
            'minPurchaseDate' => $request->has('minPurchaseDate') && $request->filled('minPurchaseDate')
                ? $request->date('minPurchaseDate')
                : null,
            'maxPurchaseDate' => $request->has('maxPurchaseDate') && $request->filled('maxPurchaseDate')
                ? $request->date('maxPurchaseDate')
                : null,
            'expiryAtFrom' => $request->has('expiryAtFrom') && $request->filled('expiryAtFrom')
                ? $request->date('expiryAtFrom')
                : null,
            'expiryAtTo' => $request->has('expiryAtTo') && $request->filled('expiryAtTo')
                ? $request->date('expiryAtTo')
                : null,
            'minPricePaid' => $request->has('minPricePaid') && $request->filled('minPricePaid')
                ? $request->float('minPricePaid')
                : null,
            'maxPricePaid' => $request->has('maxPricePaid') && $request->filled('maxPricePaid')
                ? $request->float('maxPricePaid')
                : null,
            'sortBy'        => $request->string('sortBy', 'createdAt')->toString(),
            'sortDirection' => $request->string('sortDirection', 'desc')->toString(),
            'page'          => $request->integer('page', 1),
            'perPage'       => $request->integer('perPage', 15),
        ];
    }
}
