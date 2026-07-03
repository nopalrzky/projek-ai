<?php

namespace App\Services;

use App\Models\MembershipContract;
use App\Models\MembershipPlan;
use App\Models\User;
use Carbon\Carbon;
use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MembershipContractService extends BaseService
{
    public function __construct(
        protected MembershipContract $membershipContract,
        protected MembershipPlan $membershipPlan,
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
        array $relations = ['customer', 'outlet', 'membershipPlan']
    ): LengthAwarePaginator|Collection {
        try {
            $query = $this->membershipContract->query();

            $this->applyTenantScope($query);
            $this->applyFilters($query, $filters);

            if (!empty($relations)) {
                $query->with($relations);
            }

            return $this->paginate($query, $perPage, $page);
        } catch (Exception $e) {
            Log::error('Failed to get membership contracts', [
                'filters' => $filters,
                'error'   => $e->getMessage(),
                'type'    => 'membership_contract_service_error',
            ]);
            throw $e;
        }
    }

    public function getById(
        int $id,
        array $relations = ['customer', 'outlet', 'membershipPlan']
    ): MembershipContract {
        try {
            $query = $this->membershipContract->byId($id);

            if (!empty($relations)) {
                $query->with($relations);
            }

            return $query->firstOrFail();
        } catch (Exception $e) {
            Log::error('Failed to get membership contract by ID', [
                'id'    => $id,
                'error' => $e->getMessage(),
                'type'  => 'membership_contract_service_error',
            ]);
            throw $e;
        }
    }

    public function getMembershipContractById(
        int $id,
        array $relations = ['customer', 'outlet', 'membershipPlan']
    ): MembershipContract {
        return $this->getById($id, $relations);
    }

    /*
    |--------------------------------------------------------------------------
    | Write Methods
    |--------------------------------------------------------------------------
    */

    public function store(array $data): MembershipContract
    {
        return DB::transaction(function () use ($data) {
            try {
                $membershipPlan = $this->membershipPlan->byId($data['membershipPlanId'])->firstOrFail();

                $startAt   = isset($data['startAt']) ? Carbon::parse($data['startAt']) : now();
                $expiredAt = $membershipPlan->duration_days
                    ? $startAt->copy()->addDays($membershipPlan->duration_days)
                    : null;

                $contract = $this->membershipContract->create([
                    'customer_id'              => $data['customerId'],
                    'outlet_id'                => $data['outletId'],
                    'membership_plan_id'       => $data['membershipPlanId'],
                    'start_at'                 => $startAt,
                    'expired_at'               => $expiredAt,
                    'status'                   => $data['status'] ?? 'active',
                    'total_paid'               => $data['totalPaid'] ?? $membershipPlan->price,
                    'free_shipping_used'       => 0,
                    'free_shipping_expires_at' => $membershipPlan->free_shipping_validity_days 
                        ? $startAt->copy()->addDays($membershipPlan->free_shipping_validity_days)
                        : $expiredAt,
                ]);

                Log::info('Membership contract created successfully', [
                    'contract_id'        => $contract->id,
                    'customer_id'        => $contract->customer_id,
                    'membership_plan_id' => $contract->membership_plan_id,
                    'outlet_id'          => $contract->outlet_id,
                    'user_id'            => Auth::id(),
                    'type'               => 'membership_contract_action',
                ]);

                return $contract->load(['customer', 'outlet', 'membershipPlan']);
            } catch (Exception $e) {
                Log::error('Failed to create membership contract', [
                    'data'  => $data,
                    'error' => $e->getMessage(),
                    'type'  => 'membership_contract_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function update(int $id, array $data): MembershipContract
    {
        return DB::transaction(function () use ($id, $data) {
            try {
                $membershipContract = $this->membershipContract->byId($id)->firstOrFail();

                /** @var User $user */
                $user = Auth::user();

                if (!$this->canUserModifyMembershipContract($user, $membershipContract)) {
                    throw new Exception('Access denied');
                }

                if (isset($data['membershipPlanId']) && $data['membershipPlanId'] !== $membershipContract->membership_plan_id) {
                    $membershipPlan = $this->membershipPlan->byId($data['membershipPlanId'])->firstOrFail();

                    if ($membershipPlan->duration_days) {
                        $startAt          = isset($data['startAt']) ? Carbon::parse($data['startAt']) : $membershipContract->start_at;
                        $data['expiredAt'] = $startAt->copy()->addDays($membershipPlan->duration_days);
                    } else {
                        $data['expiredAt'] = null;
                    }
                }

                $membershipContract->update([
                    'customer_id'        => $data['customerId']        ?? $membershipContract->customer_id,
                    'outlet_id'          => $data['outletId']          ?? $membershipContract->outlet_id,
                    'membership_plan_id' => $data['membershipPlanId']  ?? $membershipContract->membership_plan_id,
                    'start_at'           => $data['startAt']           ?? $membershipContract->start_at,
                    'expired_at'         => $data['expiredAt']         ?? $membershipContract->expired_at,
                    'status'             => $data['status']            ?? $membershipContract->status,
                    'total_paid'         => $data['totalPaid']         ?? $membershipContract->total_paid,
                ]);

                Log::info('Membership contract updated successfully', [
                    'contract_id' => $membershipContract->id,
                    'user_id'     => $user->id,
                    'type'        => 'membership_contract_action',
                ]);

                return $membershipContract->fresh(['customer', 'outlet', 'membershipPlan']);
            } catch (Exception $e) {
                Log::error('Failed to update membership contract', [
                    'id'    => $id,
                    'data'  => $data,
                    'error' => $e->getMessage(),
                    'type'  => 'membership_contract_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function destroy(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            try {
                $membershipContract = $this->membershipContract->byId($id)->firstOrFail();

                /** @var User $user */
                $user = Auth::user();

                if (!$this->canUserModifyMembershipContract($user, $membershipContract)) {
                    throw new Exception('Access denied');
                }

                if ($membershipContract->replacedContracts()->exists()) {
                    throw new Exception('Cannot delete contract that is referenced by other contracts');
                }

                $membershipContract->delete();

                Log::info('Membership contract deleted successfully', [
                    'contract_id' => $membershipContract->id,
                    'user_id'     => $user->id,
                    'type'        => 'membership_contract_action',
                ]);

                return true;
            } catch (Exception $e) {
                Log::error('Failed to delete membership contract', [
                    'id'    => $id,
                    'error' => $e->getMessage(),
                    'type'  => 'membership_contract_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function useFreeShipping(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            try {
                $contract = $this->membershipContract->findOrFail($id);
                if ($contract->canUseFreeShipping()) {
                    $contract->useFreeShipping();
                    return true;
                }
                return false;
            } catch (Exception $e) {
                Log::error('Failed to use free shipping on contract', [
                    'contract_id' => $id,
                    'error'       => $e->getMessage(),
                ]);
                return false;
            }
        });
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

        if (!empty($filters['customerId'])) {
            $query->byCustomerId($filters['customerId']);
        }

        if (!empty($filters['outletId'])) {
            $query->byOutletId($filters['outletId']);
        }

        if (!empty($filters['membershipPlanId'])) {
            $query->byMembershipPlanId($filters['membershipPlanId']);
        }

        if (!empty($filters['status'])) {
            $query->status($filters['status']);
        }

        if (!empty($filters['startDateFrom'])) {
            $query->startDateFrom($filters['startDateFrom']);
        }

        if (!empty($filters['startDateTo'])) {
            $query->startDateTo($filters['startDateTo']);
        }

        if (!empty($filters['expiredDateFrom'])) {
            $query->expiredDateFrom($filters['expiredDateFrom']);
        }

        if (!empty($filters['expiredDateTo'])) {
            $query->expiredDateTo($filters['expiredDateTo']);
        }

        if (!empty($filters['totalPaidMin'])) {
            $query->totalPaidMin($filters['totalPaidMin']);
        }

        if (!empty($filters['totalPaidMax'])) {
            $query->totalPaidMax($filters['totalPaidMax']);
        }

        $sortBy        = $filters['sortBy'] ?? 'createdAt';
        $sortDirection = $filters['sortDirection'] ?? 'desc';

        $query->sortBy($sortBy, $sortDirection);
    }

    private function canUserModifyMembershipContract(User $user, MembershipContract $contract): bool
    {
        if ($user->hasRole('super_admin')) {
            return true;
        }

        if ($user->hasRole('owner') && (int) $contract->outlet->owner_id === (int) $user->id) {
            return true;
        }

        return false;
    }
}
