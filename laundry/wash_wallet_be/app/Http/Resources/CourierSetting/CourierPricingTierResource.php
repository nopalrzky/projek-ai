<?php

namespace App\Http\Resources\CourierSetting;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CourierPricingTierResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'               => (int) $this->id,
            'courierSettingId' => (int) $this->courier_setting_id,
            'minKm'            => (float) $this->min_km,
            'maxKm'            => $this->max_km !== null ? (float) $this->max_km : null,
            'fee'              => (float) $this->fee,
            'perKmFee'         => (float) $this->per_km_fee,
            'sortOrder'        => (int) $this->sort_order,
            'createdAt'        => $this->created_at?->toISOString(),
            'updatedAt'        => $this->updated_at?->toISOString(),
        ];
    }
}
