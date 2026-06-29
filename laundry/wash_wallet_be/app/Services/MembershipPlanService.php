<?php

namespace App\Services;

use App\Models\MembershipPlan;
use App\Models\User;
use Exception;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MembershipPlanService extends BaseService
{
    public function __construct(protected MembershipPlan $membershipPlan) {}

    /**
     * Get all membership plans with pagination and filtering
     */
    public function getAll(
        ?array $filters = [],
        ?int $page = null,
        ?int $perPage = null,
        array $relations = ['outlet']
    ): LengthAwarePaginator|Collection {
        try {
            $query = $this->membershipPlan->query();

            $this->applyTenantScope($query);
            $this->applyFilters($query, $filters);

            if (! empty($relations)) {
                $query->with($relations);
            }

            return $this->paginate($query, $perPage, $page);
        } catch (Exception $e) {
            Log::error('Failed to get membership plans', [
                'filters' => $filters,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'type' => 'membership_plan_service_error',
            ]);
            throw $e;
        }
    }

    /**
     * Get membership plan by ID with access control
     */
    public function getById(int $id, array $relations = [
        'outlet',
        'membershipContracts',
        'membershipContracts.customer',
    ]): MembershipPlan
    {
        try {
            $query = $this->membershipPlan->query()->byId($id);

            if (! empty($relations)) {
                $query->with($relations);
            }

            return $query->firstOrFail();
        } catch (Exception $e) {
            Log::error('Failed to get membership plan by ID', [
                'id' => $id,
                'error' => $e->getMessage(),
                'type' => 'membership_plan_service_error',
            ]);
            throw $e;
        }
    }

    public function store(array $data): MembershipPlan
    {
        return DB::transaction(function () use ($data) {
            try {
                $existingPlan = $this->membershipPlan
                    ->byOutletId($data['outletId'])
                    ->level($data['level'])
                    ->first();

                if ($existingPlan) {
                    throw new Exception('Paket membership dengan level ' . $data['level'] . ' sudah ada di outlet ini.');
                }

                $membershipPlan = $this->membershipPlan->create([
                    'outlet_id' => $data['outletId'],
                    'name' => $data['name'],
                    'price' => $data['price'],
                    'level' => $data['level'],
                    'duration_days' => $data['durationDays'] ?? null,
                    'is_active' => $data['isActive'] ?? true,
                    'discount_percentage' => $data['discountPercentage'] ?? 0,
                    'description' => $data['description'] ?? null,
                    'free_shipping' => $data['freeShipping'] ?? false,
                    'free_shipping_quota' => $data['freeShippingQuota'] ?? null,
                    'free_shipping_validity_days' => $data['freeShippingValidityDays'] ?? null,
                ]);

                Log::info('Membership plan created successfully', [
                    'membership_plan_id' => $membershipPlan->id,
                    'outlet_id' => $membershipPlan->outlet_id,
                    'level' => $membershipPlan->level,
                ]);

                return $membershipPlan->load('outlet');
            } catch (Exception $e) {
                Log::error('Failed to create membership plan', [
                    'data' => $data,
                    'error' => $e->getMessage(),
                    'type' => 'membership_plan_service_error',
                ]);
                throw $e;
            }
        });
    }

    /**
     * Update existing membership plan
     */
    public function update(int $id, array $data): MembershipPlan
    {
        return DB::transaction(function () use ($id, $data) {
            try {

                $membershipPlan = $this->membershipPlan->byId($id)->firstOrFail();

                /** @var User $user */
                $user = Auth::user();

                // Verify access
                if (! $this->canUserModifyMembershipPlan($user, $membershipPlan)) {
                    throw new Exception('Access denied');
                }

                if (isset($data['level'])) {
                    $existingPlan = $this->membershipPlan
                        ->byOutletId($membershipPlan->outlet_id)
                        ->level($data['level'])
                        ->first();

                    if ($existingPlan) {
                        throw new Exception('Paket membership dengan level ' . $data['level'] . ' sudah ada di outlet ini.');
                    }
                }

                if (isset($data['name'])) {
                    $membershipPlan->name = $data['name'];
                }

                if (isset($data['price'])) {
                    $membershipPlan->price = $data['price'];
                }

                if (isset($data['level'])) {
                    $membershipPlan->level = $data['level'];
                }

                if (isset($data['durationDays'])) {
                    $membershipPlan->duration_days = $data['durationDays'];
                }

                if (isset($data['isActive'])) {
                    $membershipPlan->is_active = $data['isActive'];
                }

                if (isset($data['discountPercentage'])) {
                    $membershipPlan->discount_percentage = $data['discountPercentage'];
                }

                if (isset($data['description'])) {
                    $membershipPlan->description = $data['description'];
                }

                if (isset($data['freeShipping'])) {
                    $membershipPlan->free_shipping = $data['freeShipping'];
                }

                if (isset($data['freeShippingQuota'])) {
                    $membershipPlan->free_shipping_quota = $data['freeShippingQuota'];
                }

                if (isset($data['freeShippingValidityDays'])) {
                    $membershipPlan->free_shipping_validity_days = $data['freeShippingValidityDays'];
                }

                $membershipPlan->save();

                Log::info('Membership plan updated successfully', [
                    'membership_plan_id' => $membershipPlan->id,
                    'user_id' => $user->id,
                ]);

                return $membershipPlan->fresh(['outlet']);
            } catch (Exception $e) {
                Log::error('Failed to update membership plan', [
                    'id' => $id,
                    'data' => $data,
                    'error' => $e->getMessage(),
                    'type' => 'membership_plan_service_error',
                ]);
                throw $e;
            }
        });
    }

    /**
     * Delete membership plan (soft delete)
     */
    public function destroy(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            try {
                $membershipPlan = $this->getById($id);

                /** @var User $user */
                $user = Auth::user();

                if (! $this->canUserModifyMembershipPlan($user, $membershipPlan)) {
                    throw new Exception('Access denied');
                }

                if ($membershipPlan->membershipContracts()->where('status', 'active')->exists()) {
                    throw new Exception('Cannot delete membership plan with active subscriptions');
                }

                $deleted = $membershipPlan->delete();

                Log::info('Membership plan deleted successfully', [
                    'membership_plan_id' => $membershipPlan->id,
                    'user_id' => $user->id,
                ]);

                return $deleted;
            } catch (Exception $e) {
                Log::error('Failed to delete membership plan', [
                    'id' => $id,
                    'error' => $e->getMessage(),
                    'type' => 'membership_plan_service_error',
                ]);
                throw $e;
            }
        });
    }

    /**
     * Check if user can modify membership plan
     */
    private function canUserModifyMembershipPlan(User $user, MembershipPlan $membershipPlan): bool
    {
        if ($user->hasRole('super_admin')) {
            return true;
        }

        if ($user->hasRole('owner') && $membershipPlan->outlet->owner_id === $user->id) {
            return true;
        }

        return false;
    }

    /**
     * Apply filters to the query
     */
    private function applyFilters(Builder &$query, array $filters): void
    {
        if (! empty($filters['search'])) {
            $query->search($filters['search']);
        }

        if (isset($filters['isActive'])) {
            $query->status($filters['isActive']);
        }

        if (isset($filters['outletId'])) {
            $query->byOutletId($filters['outletId']);
        }

        if (isset($filters['minPrice'])) {
            $query->minPrice($filters['minPrice']);
        }

        if (isset($filters['maxPrice'])) {
            $query->maxPrice($filters['maxPrice']);
        }

        if (isset($filters['minDurationDays'])) {
            $query->minDurationDays($filters['minDurationDays']);
        }

        if (isset($filters['maxDurationDays'])) {
            $query->maxDurationDays($filters['maxDurationDays']);
        }

        if (isset($filters['minDiscountPercentage'])) {
            $query->minDiscountPercentage($filters['minDiscountPercentage']);
        }

        if (isset($filters['maxDiscountPercentage'])) {
            $query->maxDiscountPercentage($filters['maxDiscountPercentage']);
        }

        $sortBy = $filters['sortBy'] ?? 'createdAt';
        $sortOrder = $filters['sortOrder'] ?? 'desc';
        $query->sortBy($sortBy, $sortOrder);
    }
}
