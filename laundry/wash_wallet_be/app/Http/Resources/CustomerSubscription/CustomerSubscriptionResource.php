<?php

namespace App\Http\Resources\CustomerSubscription;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\Customer\CustomerResource;
use App\Http\Resources\ServicePackage\ServicePackageResource;
use App\Http\Resources\CustomerQuota\CustomerQuotaResource;
use App\Http\Resources\QuotaUsageLog\QuotaUsageLogResource;

class CustomerSubscriptionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (int) $this->id,
            'customerId' => (int) $this->customer_id,
            'servicePackageId' => (int) $this->service_package_id,
            'subscriptionCode' => (string) $this->subscription_code,
            'pricePaid' => (float) $this->price_paid,
            'purchaseDate' => $this->purchase_date?->toISOString(),
            'expiredAt' => $this->expired_at?->toISOString(),
            'status' => $this->status instanceof \BackedEnum ? $this->status->value : ($this->status ? (string) $this->status : null),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
            'remainingDays' => $this->getRemainingDays(),
            'isUnlimited' => $this->expired_at === null,
            'statusBadgeVariant' => $this->getStatusBadgeVariant(),
            'statusLabel' => $this->getStatusLabel(),

            'customer' => CustomerResource::make($this->whenLoaded('customer')),
            'servicePackage' => ServicePackageResource::make($this->whenLoaded('servicePackage')),
            'customerQuotas' => CustomerQuotaResource::collection($this->whenLoaded('customerQuotas')),
            'quotaUsageLogs' => QuotaUsageLogResource::collection($this->whenLoaded('quotaUsageLogs')),
        ];
    }
}
