<?php

namespace App\Services;

use App\Models\CustomerQuota;
use App\Models\CustomerSubscription;
use App\Models\ServicePackage;
use Carbon\Carbon;
use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CustomerSubscriptionService extends BaseService
{
    public function __construct(
        protected CustomerSubscription $customerSubscription,
        protected ServicePackage $servicePackage,
        protected AccountingService $accountingService,
    ) {}

    /*
    |--------------------------------------------------------------------------
    | Read Methods
    |--------------------------------------------------------------------------
    */

    public function getAll(
        array $filters = [],
        ?int $page = null,
        ?int $perPage = null,
        array $relations = ['customer', 'servicePackage', 'customerQuotas.laundryService', 'quotaUsageLogs']
    ): LengthAwarePaginator|Collection {
        try {
            $query = $this->customerSubscription->query();

            $this->applyTenantScope($query);
            $this->applyFilters($query, $filters);

            if (!empty($relations)) {
                $query->with($relations);
            }

            return $this->paginate($query, $perPage, $page);
        } catch (Exception $e) {
            Log::error('Failed to get customer subscriptions', [
                'filters' => $filters,
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'customer_subscription_service_error',
            ]);
            throw $e;
        }
    }

    public function getById(
        int $id,
        array $relations = ['customer', 'servicePackage', 'customerQuotas.laundryService', 'quotaUsageLogs']
    ): CustomerSubscription {
        try {
            $query = $this->customerSubscription->byId($id);

            if (!empty($relations)) {
                $query->with($relations);
            }

            return $query->firstOrFail();
        } catch (Exception $e) {
            Log::error('Failed to get customer subscription by ID', [
                'subscription_id' => $id,
                'error'           => $e->getMessage(),
                'user_id'         => Auth::id(),
                'type'            => 'customer_subscription_service_error',
            ]);
            throw $e;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Write Methods
    |--------------------------------------------------------------------------
    */

    public function store(array $data): CustomerSubscription
    {
        return DB::transaction(function () use ($data) {
            try {
                $servicePackage = $this->servicePackage
                    ->with('servicePackageItems.laundryService')
                    ->byId($data['servicePackageId'])
                    ->active()
                    ->firstOrFail();

                $purchaseDate = isset($data['purchaseDate'])
                    ? Carbon::parse($data['purchaseDate'])
                    : Carbon::now();

                $expiredAt = $servicePackage->validity_days
                    ? $purchaseDate->copy()->addDays($servicePackage->validity_days)
                    : null;

                $subscription = $this->customerSubscription->create([
                    'customer_id'        => $data['customerId'],
                    'service_package_id' => $servicePackage->id,
                    'subscription_code'  => $this->generateSubscriptionCode(),
                    'price_paid'         => $data['pricePaid'],
                    'purchase_date'      => $purchaseDate,
                    'expired_at'         => $expiredAt,
                    'status'             => 'active',
                ]);

                foreach ($servicePackage->servicePackageItems as $item) {
                    CustomerQuota::create([
                        'customer_subscription_id' => $subscription->id,
                        'laundry_service_id'       => $item->laundry_service_id,
                        'total_quota'              => $item->quantity,
                        'remaining_quota'          => $item->quantity,
                    ]);
                }

                $this->accountingService->recordCustomerSubscriptionSale($subscription);

                Log::info('Customer subscription created', [
                    'subscription_id'    => $subscription->id,
                    'customer_id'        => $data['customerId'],
                    'service_package_id' => $servicePackage->id,
                    'price_paid'         => $data['pricePaid'],
                    'created_by'         => Auth::id(),
                    'type'               => 'customer_subscription_action',
                ]);

                return $subscription->fresh(['servicePackage', 'customerQuotas.laundryService']);
            } catch (Exception $e) {
                Log::error('Failed to create customer subscription', [
                    'customer_id' => $data['customerId'],
                    'data'        => $data,
                    'error'       => $e->getMessage(),
                    'user_id'     => Auth::id(),
                    'type'        => 'customer_subscription_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function update(int $id, array $data): CustomerSubscription
    {
        return DB::transaction(function () use ($id, $data) {
            try {
                $subscription = $this->customerSubscription->byId($id)->firstOrFail();
                $previousStatus = $subscription->status;
                $updateData   = [];

                if (isset($data['status'])) {
                    $allowedStatuses = ['active', 'exhausted', 'expired', 'cancelled'];
                    if (!in_array($data['status'], $allowedStatuses)) {
                        throw new Exception('Status tidak valid');
                    }
                    $updateData['status'] = $data['status'];
                }

                if (isset($data['note'])) {
                    $updateData['note'] = $data['note'];
                }

                if (!empty($updateData)) {
                    $subscription->update($updateData);
                }

                if (($updateData['status'] ?? null) === 'expired' && $previousStatus !== 'expired') {
                    $this->accountingService->recordPackageBreakage($subscription->fresh(['customerQuotas', 'servicePackage.outlet', 'servicePackage.servicePackageItems.laundryService']));
                }

                Log::info('Customer subscription updated', [
                    'subscription_id' => $id,
                    'changes'         => array_keys($updateData),
                    'updated_by'      => Auth::id(),
                    'type'            => 'customer_subscription_action',
                ]);

                return $subscription->fresh(['servicePackage', 'customerQuotas.laundryService']);
            } catch (Exception $e) {
                Log::error('Failed to update customer subscription', [
                    'subscription_id' => $id,
                    'data'            => $data,
                    'error'           => $e->getMessage(),
                    'user_id'         => Auth::id(),
                    'type'            => 'customer_subscription_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function destroy(int $id): bool
    {
        try {
            $subscription = $this->customerSubscription->byId($id)->firstOrFail();

            if ($subscription->status === 'active') {
                throw new Exception('Cannot delete active subscription');
            }

            $deleted = $subscription->delete();

            if ($deleted) {
                Log::info('Customer subscription deleted', [
                    'subscription_id' => $id,
                    'deleted_by'      => Auth::id(),
                    'type'            => 'customer_subscription_action',
                ]);
            }

            return $deleted;
        } catch (Exception $e) {
            Log::error('Failed to delete customer subscription', [
                'subscription_id' => $id,
                'error'           => $e->getMessage(),
                'user_id'         => Auth::id(),
                'type'            => 'customer_subscription_service_error',
            ]);
            throw $e;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Private — Filters & Helpers
    |--------------------------------------------------------------------------
    */

    protected function applyFilters(Builder $query, array $filters = []): void
    {
        if (!empty($filters['search'])) {
            $query->search($filters['search']);
        }

        if (!empty($filters['status'])) {
            $query->byStatus($filters['status']);
        }

        if (!empty($filters['customerId'])) {
            $query->byCustomerId($filters['customerId']);
        }

        if (!empty($filters['servicePackageId'])) {
            $query->byServicePackageId($filters['servicePackageId']);
        }

        if (!empty($filters['minPurchaseDate'])) {
            $query->minPurchaseDate($filters['minPurchaseDate']);
        }

        if (!empty($filters['maxPurchaseDate'])) {
            $query->maxPurchaseDate($filters['maxPurchaseDate']);
        }

        if (!empty($filters['expiryAtFrom'])) {
            $query->expiredAtFrom($filters['expiryAtFrom']);
        }

        if (!empty($filters['expiryAtTo'])) {
            $query->expiredAtTo($filters['expiryAtTo']);
        }

        if (!empty($filters['minPricePaid'])) {
            $query->minPricePaid($filters['minPricePaid']);
        }

        if (!empty($filters['maxPricePaid'])) {
            $query->maxPricePaid($filters['maxPricePaid']);
        }

        $sortBy        = $filters['sortBy'] ?? 'createdAt';
        $sortDirection = $filters['sortDirection'] ?? 'desc';

        $query->sortBy($sortBy, $sortDirection);
    }

    private function generateSubscriptionCode(): string
    {
        do {
            $code   = 'SUB-' . now()->format('ymdHis') . '-' . strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 4));
            $exists = $this->customerSubscription->where('subscription_code', $code)->exists();
        } while ($exists);

        return $code;
    }
}
