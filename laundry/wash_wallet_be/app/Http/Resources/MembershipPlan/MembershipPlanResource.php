<?php

namespace App\Http\Resources\MembershipPlan;

use App\Http\Resources\MembershipContract\MembershipContractResource;
use App\Http\Resources\Outlet\OutletResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MembershipPlanResource extends JsonResource
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
            'outletId' => (int) $this->outlet_id,
            'name' => (string) $this->name,
            'price' => (float) $this->price,
            'durationDays' => (int) $this->duration_days,
            'isActive' => (bool) $this->is_active,
            'discountPercentage' => (float) $this->discount_percentage,
            'description' => $this->description ? (string) $this->description : null,
            'level' => $this->level !== null ? (int) $this->level : null,
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
            'outlet' => OutletResource::make($this->whenLoaded('outlet')),
            'membershipContracts' => MembershipContractResource::collection($this->whenLoaded('membershipContracts')),
            'membershipContractsCount' => $this->whenLoaded('membershipContracts', fn() => $this->membershipContracts?->count() ?? 0),
        ];
    }
}
