<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\CustomerQuota;
use App\Models\CustomerSubscription;
use App\Models\Employee;
use App\Models\MembershipContract;
use App\Models\MembershipPlan;
use App\Models\Outlet;
use App\Models\ServicePackage;
use App\Models\User;
use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CustomerService extends BaseService
{
    public function __construct(
        protected Customer             $customer,
        protected CustomerQuota        $customerQuota,
        protected CustomerSubscription $customerSubscription,
        protected MembershipContract   $membershipContract,
        protected MembershipPlan       $membershipPlan,
        protected ServicePackage       $servicePackage,
        protected AccountingService    $accountingService,
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
        array $relations = ['outlet'],
        array $withCounts = []
    ): LengthAwarePaginator|Collection {
        try {
            $query = $this->customer->query();

            $this->applyTenantScope($query);
            $this->applyFilters($query, $filters);

            if (!empty($relations)) {
                $query->with($relations);
            }

            if (!empty($withCounts)) {
                $query->withCount($withCounts);
            }

            return $this->paginate($query, $perPage, $page);
        } catch (Exception $e) {
            Log::error('Failed to get customers', [
                'filters' => $filters,
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'customer_service_error',
            ]);
            throw $e;
        }
    }

    public function getStats(): array
    {
        try {
            $query = $this->customer->query();

            $this->applyTenantScope($query);

            $totalCustomers    = (clone $query)->count();
            $activeCustomers   = (clone $query)->where('is_active', true)->count();
            $inactiveCustomers = (clone $query)->where('is_active', false)->count();

            return [
                ['label' => 'Total Customers',    'value' => $totalCustomers,    'icon' => 'Users',     'variant' => 'primary'],
                ['label' => 'Active Customers',   'value' => $activeCustomers,   'icon' => 'UserCheck', 'variant' => 'success'],
                ['label' => 'Inactive Customers', 'value' => $inactiveCustomers, 'icon' => 'UserX',     'variant' => 'danger'],
            ];
        } catch (Exception $e) {
            Log::error('Failed to get customer stats', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'customer_service_error',
            ]);
            throw $e;
        }
    }

    public function getById(int $id, array $relations = ['outlet']): Customer
    {
        $query = $this->customer->byId($id);

        if (!empty($relations)) {
            $query->with($relations);
        }

        return $query->firstOrFail();
    }

    /*
    |--------------------------------------------------------------------------
    | Write Methods — Customer
    |--------------------------------------------------------------------------
    */

    public function store(array $data): Customer
    {
        return DB::transaction(function () use ($data) {
            try {
                $outletId = (int) $data['outletId'];
                $this->authorizeCustomerOutlet($outletId);

                $customer = $this->customer->create([
                    'outlet_id'     => $outletId,
                    'name'          => $data['name'],
                    'email'         => $data['email'] ?? null,
                    'phone'         => $data['phone'] ?? null,
                    'date_of_birth' => $data['dateOfBirth'] ?? null,
                    'gender'        => $data['gender'] ?? null,
                    'address'       => $data['address'] ?? null,
                    'is_active'     => true,
                ]);

                Log::info('Customer created successfully', [
                    'customer_id'   => $customer->id,
                    'customer_name' => $customer->name,
                    'outlet_id'     => $customer->outlet_id,
                    'user_id'       => Auth::id(),
                    'type'          => 'customer_service_action',
                ]);

                return $customer->fresh(['outlet']);
            } catch (Exception $e) {
                Log::error('Failed to create customer', [
                    'data'    => $data,
                    'error'   => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type'    => 'customer_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function update(int $id, array $data): Customer
    {
        return DB::transaction(function () use ($id, $data) {
            try {
                $customer = $this->customer->findOrFail($id);

                if (isset($data['name']))      $customer->name      = $data['name'];
                if (isset($data['email']))     $customer->email     = $data['email'];
                if (isset($data['phone']))     $customer->phone     = $data['phone'];
                if (isset($data['gender']))    $customer->gender    = $data['gender'];
                if (isset($data['outletId'])) $customer->outlet_id = $data['outletId'];
                if (isset($data['address']))   $customer->address   = $data['address'];
                if (isset($data['isActive']))  $customer->is_active = $data['isActive'];

                $customer->save();

                Log::info('Customer updated successfully', [
                    'customer_id' => $id,
                    'outlet_id'   => $customer->outlet_id,
                    'changes'     => array_keys($data),
                    'user_id'     => Auth::id(),
                    'type'        => 'customer_service_action',
                ]);

                return $customer->fresh(['outlet']);
            } catch (Exception $e) {
                Log::error('Failed to update customer', [
                    'customer_id' => $id,
                    'data'        => $data,
                    'error'       => $e->getMessage(),
                    'user_id'     => Auth::id(),
                    'type'        => 'customer_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function destroy(int $id): bool
    {
        $customer = $this->customer->findOrFail($id);
        $deleted  = $customer->delete();

        if ($deleted) {
            Log::info('Customer soft deleted successfully', [
                'customer_id' => $id,
                'outlet_id'   => $customer->outlet_id,
                'name'        => $customer->name,
                'user_id'     => Auth::id(),
                'type'        => 'customer_service_action',
            ]);
        }

        return $deleted;
    }

    public function restore(int $id): Customer
    {
        $customer = $this->customer->withTrashed()->findOrFail($id);

        if (!$customer->trashed()) {
            throw new Exception('Customer is not deleted');
        }

        $customer->restore();

        Log::info('Customer restored successfully', [
            'customer_id' => $id,
            'outlet_id'   => $customer->outlet_id,
            'name'        => $customer->name,
            'user_id'     => Auth::id(),
            'type'        => 'customer_service_action',
        ]);

        return $customer;
    }

    public function forceDestroy(int $id): bool
    {
        $customer = $this->customer->withTrashed()->findOrFail($id);

        if ($customer->hasOrders()) {
            throw new Exception('Cannot permanently delete customer that has associated orders');
        }

        $customerName = $customer->name;
        $outletId     = $customer->outlet_id;
        $deleted      = $customer->forceDelete();

        if ($deleted) {
            Log::info('Customer permanently deleted', [
                'customer_id' => $id,
                'outlet_id'   => $outletId,
                'name'        => $customerName,
                'user_id'     => Auth::id(),
                'type'        => 'customer_service_action',
            ]);
        }

        return $deleted;
    }

    /*
    |--------------------------------------------------------------------------
    | Write Methods — Customer Subscription
    |--------------------------------------------------------------------------
    */

    public function storeCustomerSubscription(int $customerId, array $data): CustomerSubscription
    {
        return DB::transaction(function () use ($customerId, $data) {
            try {
                $customer = $this->customer->byId($customerId)->firstOrFail();

                $servicePackage = $this->servicePackage
                    ->with('servicePackageItems.laundryService')
                    ->byId($data['servicePackageId'])
                    ->active()
                    ->firstOrFail();

                if ($servicePackage->outlet_id && (int) $servicePackage->outlet_id !== (int) $customer->outlet_id) {
                    throw new Exception('Paket layanan tidak tersedia untuk outlet pelanggan ini');
                }

                $purchaseDate = isset($data['purchaseDate'])
                    ? Carbon::parse($data['purchaseDate'])
                    : Carbon::now();

                $expiredAt = $servicePackage->validity_days
                    ? $purchaseDate->copy()->addDays($servicePackage->validity_days)
                    : null;

                $subscriptionCode = CustomerSubscription::generateCode();

                $subscription = $this->customerSubscription->create([
                    'customer_id'        => $customerId,
                    'service_package_id' => $servicePackage->id,
                    'subscription_code'  => $subscriptionCode,
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

                Log::info('Customer subscription created successfully', [
                    'subscription_id'    => $subscription->id,
                    'subscription_code'  => $subscriptionCode,
                    'customer_id'        => $customerId,
                    'service_package_id' => $servicePackage->id,
                    'price_paid'         => $data['pricePaid'],
                    'purchase_date'      => $purchaseDate->toDateString(),
                    'expired_at'         => $expiredAt?->toDateString(),
                    'quotas_count'       => $servicePackage->servicePackageItems->count(),
                    'created_by'         => Auth::id(),
                    'type'               => 'customer_subscription_action',
                ]);

                return $subscription->fresh(['servicePackage', 'customerQuotas.laundryService']);
            } catch (Exception $e) {
                Log::error('Failed to create customer subscription', [
                    'customer_id' => $customerId,
                    'data'        => $data,
                    'error'       => $e->getMessage(),
                    'user_id'     => Auth::id(),
                    'type'        => 'customer_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function updateCustomerSubscription(
        int $customerId,
        int $subscriptionId,
        array $data
    ): CustomerSubscription {
        return DB::transaction(function () use ($customerId, $subscriptionId, $data) {
            try {
                $subscription = $this->customerSubscription
                    ->byCustomerId($customerId)
                    ->byId($subscriptionId)
                    ->firstOrFail();

                $previousStatus = $subscription->status;

                $updateData = [];

                if (isset($data['status'])) {
                    $allowedStatuses = ['active', 'exhausted', 'expired', 'cancelled'];
                    if (!in_array($data['status'], $allowedStatuses)) {
                        throw new Exception('Status tidak valid');
                    }
                    $updateData['status'] = $data['status'];
                }

                if (!empty($updateData)) {
                    $subscription->update($updateData);
                }

                if (($updateData['status'] ?? null) === 'expired' && $previousStatus !== 'expired') {
                    $this->accountingService->recordPackageBreakage($subscription->fresh(['customerQuotas', 'servicePackage.outlet', 'servicePackage.servicePackageItems.laundryService']));
                }

                Log::info('Customer subscription updated successfully', [
                    'subscription_id' => $subscriptionId,
                    'customer_id'     => $customerId,
                    'changes'         => array_keys($updateData),
                    'updated_by'      => Auth::id(),
                    'type'            => 'customer_subscription_action',
                ]);

                return $subscription->fresh(['servicePackage']);
            } catch (Exception $e) {
                Log::error('Failed to update customer subscription', [
                    'subscription_id' => $subscriptionId,
                    'customer_id'     => $customerId,
                    'data'            => $data,
                    'error'           => $e->getMessage(),
                    'user_id'         => Auth::id(),
                    'type'            => 'customer_service_error',
                ]);
                throw $e;
            }
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Write Methods — Membership Contract
    |--------------------------------------------------------------------------
    */

    public function storeMembershipContract(int $customerId, array $data): MembershipContract
    {
        return DB::transaction(function () use ($customerId, $data) {
            try {
                $customer = $this->customer->byId($customerId)->firstOrFail();

                $plan = $this->membershipPlan
                    ->byId($data['membershipPlanId'])
                    ->byOutletId($customer->outlet_id)
                    ->firstOrFail();

                if (!$plan->is_active) {
                    throw new Exception('Selected membership plan is not active');
                }

                $startAt   = isset($data['startAt']) ? Carbon::parse($data['startAt']) : Carbon::now();
                $expiredAt = $startAt->copy()->addDays($plan->duration_days);

                $contract = $this->membershipContract->create([
                    'customer_id'       => $customerId,
                    'outlet_id'         => $customer->outlet_id,
                    'membership_plan_id' => $plan->id,
                    'start_at'          => $startAt,
                    'expired_at'        => $expiredAt,
                    'status'            => 'active',
                    'total_paid'        => $data['totalPaid'] ?? $plan->price,
                ]);

                Log::info('Membership contract created successfully', [
                    'contract_id'       => $contract->id,
                    'customer_id'       => $customerId,
                    'membership_plan_id' => $plan->id,
                    'start_at'          => $startAt->toDateString(),
                    'expired_at'        => $expiredAt->toDateString(),
                    'created_by'        => Auth::id(),
                    'type'              => 'membership_contract_action',
                ]);

                return $contract->fresh(['customer', 'outlet', 'membershipPlan']);
            } catch (Exception $e) {
                Log::error('Failed to create membership contract', [
                    'customer_id' => $customerId,
                    'data'        => $data,
                    'error'       => $e->getMessage(),
                    'user_id'     => Auth::id(),
                    'type'        => 'customer_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function destroyMembershipContract(int $customerId, int $contractId): bool
    {
        return DB::transaction(function () use ($customerId, $contractId) {
            try {
                $contract = $this->membershipContract
                    ->byId($contractId)
                    ->byCustomerId($customerId)
                    ->firstOrFail();

                if (!in_array($contract->status, ['cancelled', 'expired'])) {
                    throw new Exception('Can only delete cancelled or expired membership contracts');
                }

                $deleted = $contract->delete();

                if ($deleted) {
                    Log::info('Membership contract deleted successfully', [
                        'contract_id' => $contractId,
                        'customer_id' => $customerId,
                        'deleted_by'  => Auth::id(),
                        'type'        => 'membership_contract_action',
                    ]);
                }

                return $deleted;
            } catch (Exception $e) {
                Log::error('Failed to delete membership contract', [
                    'contract_id' => $contractId,
                    'customer_id' => $customerId,
                    'error'       => $e->getMessage(),
                    'user_id'     => Auth::id(),
                    'type'        => 'customer_service_error',
                ]);
                throw $e;
            }
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Private — Filters
    |--------------------------------------------------------------------------
    */

    private function applyFilters(Builder $query, array $filters = []): void
    {
        if (!empty($filters['search'])) {
            $query->search($filters['search']);
        }

        if (!empty($filters['outletId'])) {
            $query->byOutletId($filters['outletId']);
        }

        if (!empty($filters['phone'])) {
            $query->byPhone($filters['phone']);
        }

        if (!empty($filters['gender'])) {
            $query->byGender($filters['gender']);
        }

        if (isset($filters['isActive']) && $filters['isActive'] !== null) {
            $filters['isActive'] ? $query->active() : $query->inactive();
        }

        if (!empty($filters['startDate']) || !empty($filters['endDate'])) {
            $query->byRangeDate(
                $filters['startDate'] ?? null,
                $filters['endDate'] ?? null,
                'created_at'
            );
        }

        $query->sortBy(
            $filters['sortBy'] ?? 'created_at',
            $filters['sortDirection'] ?? 'desc'
        );
    }

    private function authorizeCustomerOutlet(int $outletId): void
    {
        $user = $this->resolveUser();
        $outlet = Outlet::query()->findOrFail($outletId);

        if ($user instanceof User) {
            if ($user->hasRole('super_admin')) {
                return;
            }

            if ($user->hasRole('owner') && $outlet->isOwner($user)) {
                return;
            }
        }

        if ($user instanceof Employee && in_array($outletId, $user->getAccessibleOutletIds(), true)) {
            return;
        }

        throw new Exception('Akses ditolak. Anda hanya dapat membuat pelanggan untuk outlet yang dapat Anda akses.');
    }
}
