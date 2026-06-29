<?php

namespace App\Http\Resources\CustomerQuota;

use App\Http\Resources\LaundryService\LaundryServiceResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\CustomerSubscription\CustomerSubscriptionResource;

class CustomerQuotaResource extends JsonResource
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
            'customerSubscriptionId' => (int) $this->customer_subscription_id,
            'laundryServiceId' => (int) $this->laundry_service_id,
            'totalQuota' => (float) $this->total_quota,
            'remainingQuota' => (float) $this->remaining_quota,
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),

            'customerSubscription' => CustomerSubscriptionResource::make($this->whenLoaded('customerSubscription')),

            'laundryService' => LaundryServiceResource::make($this->whenLoaded('laundryService'))

        ];
    }
}
