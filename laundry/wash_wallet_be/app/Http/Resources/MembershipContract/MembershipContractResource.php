<?php

namespace App\Http\Resources\MembershipContract;

use App\Http\Resources\Customer\CustomerResource;
use App\Http\Resources\Outlet\OutletResource;
use App\Http\Resources\MembershipPlan\MembershipPlanResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MembershipContractResource extends JsonResource
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
            'outletId' => (int) $this->outlet_id,
            'membershipPlanId' => (int) $this->membership_plan_id,
            'startAt' => $this->start_at?->toISOString(),
            'expiredAt' => $this->expired_at?->toISOString(),
            'status' => $this->status instanceof \BackedEnum ? $this->status->value : ($this->status ? (string) $this->status : null),
            'totalPaid' => (float) $this->total_paid,
            'formattedTotalPaid' => (string) $this->getFormattedTotalPaid(),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),

            'customer' => $this->whenLoaded('customer', fn() => CustomerResource::make($this->customer)),
            'outlet' => $this->whenLoaded('outlet', fn() => OutletResource::make($this->outlet)),
            'membershipPlan' => $this->whenLoaded('membershipPlan', fn() => MembershipPlanResource::make($this->membershipPlan)),

        ];
    }
}
