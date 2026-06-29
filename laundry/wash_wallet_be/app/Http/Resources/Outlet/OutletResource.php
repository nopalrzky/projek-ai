<?php

namespace App\Http\Resources\Outlet;

use App\Http\Resources\Category\CategoryResource;
use App\Http\Resources\Customer\CustomerResource;
use App\Http\Resources\Employee\EmployeeResource;
use App\Http\Resources\Fine\FineResource;
use App\Http\Resources\LaundryService\LaundryServiceResource;
use App\Http\Resources\MembershipPlan\MembershipPlanResource;
use App\Http\Resources\OperationalDay\OperationalDayResource;
use App\Http\Resources\Position\PositionResource;
use App\Http\Resources\CourierSchedule\CourierScheduleResource;
use App\Http\Resources\OutletFeature\OutletFeatureResource;
use App\Http\Resources\CourierSetting\CourierSettingResource;
use App\Http\Resources\ServicePackage\ServicePackageResource;
use App\Http\Resources\OutletSetting\OutletSettingResource;
use App\Http\Resources\User\UserResource;
use App\Services\OperationalStatusService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OutletResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (int) $this->id,
            'ownerId' => $this->owner_id ? (int) $this->owner_id : null,
            'name' => (string) $this->name,
            'code' => $this->code ? (string) $this->code : null,
            'phone' => $this->phone ? (string) $this->phone : null,
            'email' => $this->email ? (string) $this->email : null,
            'description' => $this->description ? (string) $this->description : null,
            'status' => $this->status instanceof \BackedEnum ? $this->status->value : ($this->status ? (string) $this->status : null),
            'coinBalance' => (int) $this->coin_balance,
            'provinceId' => $this->province_id ? (int) $this->province_id : null,
            'provinceName' => $this->province_name ? (string) $this->province_name : null,
            'cityId' => $this->city_id ? (int) $this->city_id : null,
            'cityName' => $this->city_name ? (string) $this->city_name : null,
            'districtId' => $this->district_id ? (int) $this->district_id : null,
            'districtName' => $this->district_name ? (string) $this->district_name : null,
            'villageId' => $this->village_id ? (int) $this->village_id : null,
            'villageName' => $this->village_name ? (string) $this->village_name : null,
            'street' => $this->street ? (string) $this->street : null,
            'latitude' => $this->latitude ? (float) $this->latitude : null,
            'longitude' => $this->longitude ? (float) $this->longitude : null,
            'distance' => $this->distance !== null ? (float) $this->distance : null,

            'fullAddress' => (string) $this->getFullAddress(),
            'statusLabel' => $this->status === 'active' ? 'Aktif' : 'Nonaktif',
            'isActivated' => (bool) ($this->status === 'active'),
            'hasActiveExposure' => (bool) $this->hasActiveExposure(),
            'isExposureExpired' => (bool) $this->isExposureExpired(),
            'isCurrentlyOpen' => (bool) $this->isCurrentlyOpen(),
            'timezone' => $this->timezone ?? 'Asia/Jakarta',
            
            $this->mergeWhen($this->relationLoaded('operationalDays'), function () {
                $statusService = app(OperationalStatusService::class);
                $status = $statusService->resolve($this->resource);
                return [
                    'operationalStatus' => $status['operationalStatus'],
                    'operationalStatusLabel' => $status['operationalStatusLabel'],
                    'operationalStatusMessage' => $status['operationalStatusMessage'],
                    'todayHours' => $status['todayHours'],
                    'weeklyHours' => $status['weeklyHours'],
                    'nextOpenAt' => $status['nextOpenAt'],
                    'nextCloseAt' => $status['nextCloseAt'],
                    'canCreateOrderNow' => $status['canCreateOrderNow'],
                    'orderDisabledReason' => $status['orderDisabledReason'],
                    'nextOpenDay' => null,
                ];
            }),

            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
            'deletedAt' => $this->deleted_at?->toISOString(),

            'averageRating' => $this->whenLoaded('orderReviews', fn() => (float) round($this->orderReviews->where('is_published', true)->avg('rating') ?? 0, 1), 0.0),
            'totalReviews' => $this->whenLoaded('orderReviews', fn() => (int) $this->orderReviews->where('is_published', true)->count(), 0),

            'owner' => UserResource::make($this->whenLoaded('owner')),

            'categories' => CategoryResource::collection($this->whenLoaded('categories')),
            'customers' => CustomerResource::collection($this->whenLoaded('customers')),
            'employees' => EmployeeResource::collection($this->whenLoaded('employees')),
            'fines' => FineResource::collection($this->whenLoaded('fines')),
            'laundryServices' => LaundryServiceResource::collection($this->whenLoaded('laundryServices')),
            'membershipPlans' => MembershipPlanResource::collection($this->whenLoaded('membershipPlans')),
            'operationalDays' => OperationalDayResource::collection($this->whenLoaded('operationalDays')),
            'positions' => PositionResource::collection($this->whenLoaded('positions')),
            'servicePackages' => ServicePackageResource::collection($this->whenLoaded('servicePackages')),
            'courierSchedules' => CourierScheduleResource::collection($this->whenLoaded('courierSchedules')),
            'outletFeatures' => OutletFeatureResource::collection($this->whenLoaded('outletFeatures')),
            'courierSetting' => CourierSettingResource::make($this->whenLoaded('courierSetting')),

            'categoriesCount' => $this->whenLoaded('categories', fn() => (int) $this->categories->count()),
            'customersCount' => $this->whenLoaded('customers', fn() => (int) $this->customers->count()),
            'employeesCount' => $this->whenLoaded('employees', fn() => (int) $this->employees->count()),
            'finesCount' => $this->whenLoaded('fines', fn() => (int) $this->fines->count()),
            'laundryServicesCount' => $this->whenLoaded('laundryServices', fn() => (int) $this->laundryServices->count()),
            'operationalDaysCount' => $this->whenLoaded('operationalDays', fn() => (int) $this->operationalDays->count()),
            'membershipPlansCount' => $this->whenLoaded('membershipPlans', fn() => (int) $this->membershipPlans->count()),
            'positionsCount' => $this->whenLoaded('positions', fn() => (int) $this->positions->count()),
            'ordersCount' => $this->whenLoaded('orders', fn() => (int) $this->orders->count()),
            'expensesCount' => $this->whenLoaded('expenses', fn() => (int) $this->expenses->count()),
            'journalEntriesCount' => $this->whenLoaded('journalEntries', fn() => (int) $this->journalEntries->count()),
            'servicePackagesCount' => $this->whenLoaded('servicePackages', fn() => (int) $this->servicePackages->count()),
            'courierSchedulesCount' => $this->whenLoaded('courierSchedules', fn() => (int) $this->courierSchedules->count()),
            'outletFeaturesCount' => $this->whenLoaded('outletFeatures', fn() => (int) $this->outletFeatures->count()),

            'activationStatus' => $this->whenLoaded('outletFeatures', function () {
                $feature = $this->outletFeatures->firstWhere(fn($f) => $f->feature?->key === 'outlet_activation');

                if (!$feature) {
                    $eligibility = app(\App\Services\OutletFeatureService::class)->getTrialEligibility($this->id);
                    return [
                        'status'                  => 'inactive',
                        'trialStartedAt'          => null,
                        'trialExpiresAt'          => null,
                        'unlockedAt'              => null,
                        'expiresAt'               => null,
                        'trialRemainingDays'      => 0,
                        'trialEligible'           => $eligibility['eligible'],
                        'trialEligibilityCode'    => $eligibility['code'],
                        'trialEligibilityMessage' => $eligibility['message'],
                        'trialDurationDays'       => $eligibility['trialDurationDays'],
                    ];
                }

                $eligibility = app(\App\Services\OutletFeatureService::class)->getTrialEligibility($this->id);

                return [
                    'status'                  => (string) $feature->status,
                    'trialStartedAt'          => $feature->trial_started_at?->toISOString(),
                    'trialExpiresAt'          => $feature->trial_expires_at?->toISOString(),
                    'unlockedAt'              => $feature->unlocked_at?->toISOString(),
                    'expiresAt'               => $feature->expires_at?->toISOString(),
                    'trialRemainingDays'      => (int) $feature->getTrialRemainingDays(),
                    'trialEligible'           => $eligibility['eligible'],
                    'trialEligibilityCode'    => $eligibility['code'],
                    'trialEligibilityMessage' => $eligibility['message'],
                    'trialDurationDays'       => $eligibility['trialDurationDays'],
                ];
            }),
            'exposureStatus' => $this->whenLoaded('outletFeatures', function () {
                $feature = $this->outletFeatures->firstWhere(fn($f) => $f->feature?->key === 'outlet_exposure');

                return $feature ? [
                    'status' => (string) $feature->status,
                    'expiresAt' => $feature->expires_at?->toISOString(),
                    'unlockedAt' => $feature->unlocked_at?->toISOString(),
                    'autoRenewal' => (bool) $feature->auto_renewal,
                ] : null;
            }),
            'outletSettings' => OutletSettingResource::collection($this->whenLoaded('outletSettings')),
            'isCourierActive' => $this->whenLoaded('outletFeatures', function () {
                return $this->outletFeatures->contains(fn($f) => $f->feature?->key === 'courier_schedule' && ($f->status === 'unlocked' || $f->status === 'trial'));
            }),
            'isCourierEnabled' => $this->whenLoaded('outletFeatures', function () {
                $featureActive = $this->outletFeatures->contains(
                    fn($f) => $f->feature?->key === 'courier_schedule' && ($f->status === 'unlocked' || $f->status === 'trial')
                );
                if (!$featureActive) {
                    return false;
                }
                return $this->relationLoaded('courierSetting') && $this->courierSetting
                    ? (bool) $this->courierSetting->is_courier_enabled
                    : false;
            }, false),
            'hasFreeShipping' => $this->relationLoaded('courierSetting') && $this->courierSetting
                ? (bool) $this->courierSetting->unconditional_free_shipping_enabled
                : false,
            'hasUnconditionalFreeShipping' => $this->relationLoaded('courierSetting') && $this->courierSetting
                ? (bool) $this->courierSetting->unconditional_free_shipping_enabled
                : false,
        ];
    }
}
