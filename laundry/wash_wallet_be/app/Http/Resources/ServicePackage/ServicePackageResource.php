<?php

namespace App\Http\Resources\ServicePackage;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\CustomerSubscription\CustomerSubscriptionResource;
use App\Http\Resources\Outlet\OutletResource;
use App\Http\Resources\ServicePackageItem\ServicePackageItemResource;

class ServicePackageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (int) $this->id,
            'name' => $this->name ? (string) $this->name : null,
            'description' => $this->description ? (string) $this->description : null,
            'price' => (float) $this->price,
            'validityDays' => $this->validity_days !== null ? (int) $this->validity_days : null,
            'isActive' => (bool) $this->is_active,

            'outlet' => OutletResource::make($this->whenLoaded('outlet')),

            'servicePackageItems' => ServicePackageItemResource::collection($this->whenLoaded('servicePackageItems')),

            'customerSubscriptions' => CustomerSubscriptionResource::collection($this->whenLoaded('customerSubscriptions')),

            'servicePackageItemsCount' => $this->whenLoaded('servicePackageItems', fn() => $this->servicePackageItems->count(), 0),

            'customerSubscriptionsCount' => $this->whenLoaded('customerSubscriptions', fn() => $this->customerSubscriptions->count(), 0),

            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
            'deletedAt' => $this->deleted_at?->toISOString(),
        ];
    }
}
