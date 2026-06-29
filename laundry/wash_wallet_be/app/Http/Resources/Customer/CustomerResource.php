<?php

namespace App\Http\Resources\Customer;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\Outlet\OutletResource;
use App\Http\Resources\Order\OrderResource;
use App\Http\Resources\CustomerSubscription\CustomerSubscriptionResource;
use App\Http\Resources\MembershipContract\MembershipContractResource;

class CustomerResource extends JsonResource
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
            'outletId' => $this->outlet_id ? (int) $this->outlet_id : null,
            'name' => (string) $this->name,
            'email' => $this->email ? (string) $this->email : null,
            'phone' => $this->phone ? (string) $this->phone : null,
            'address' => $this->address ? (string) $this->address : null,
            'gender' => $this->gender ? (string) $this->gender : null,
            'dateOfBirth' => $this->date_of_birth,
            'isActive' => (bool) $this->is_active,
            'statusLabel' => $this->getStatusLabel(),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
            'deletedAt' => $this->deleted_at?->toISOString(),

            'outlet' => OutletResource::make($this->whenLoaded('outlet')),

            'orders' => OrderResource::collection($this->whenLoaded('orders')),

            'customerSubscriptions' => CustomerSubscriptionResource::collection($this->whenLoaded('customerSubscriptions')),

            'membershipContracts' => MembershipContractResource::collection($this->whenLoaded('membershipContracts')),

            'ordersCount' => $this->orders_count
                ?? $this->whenLoaded('orders', fn() => $this->orders?->count() ?? 0, 0),

            'customerSubscriptionsCount' => $this->customer_subscriptions_count
                ?? $this->whenLoaded('customerSubscriptions', fn() => $this->customerSubscriptions?->count() ?? 0, 0),

            'membershipContractsCount' => $this->membership_contracts_count
                ?? $this->whenLoaded('membershipContracts', fn() => $this->membershipContracts?->count() ?? 0, 0),

            'subscriptionsCount' => $this->customer_subscriptions_count
                ?? $this->when(
                    $this->resource->relationLoaded('customerSubscriptions'),
                    fn() => $this->customerSubscriptions?->count() ?? 0,
                    0
                ),

        ];
    }
}
