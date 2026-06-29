<?php

namespace App\Http\Resources\CourierSetting;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CourierPricingZoneResource extends JsonResource
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
            'locationType'     => (string) $this->location_type,
            'locationId'       => (int) $this->location_id,
            'locationName'     => (string) $this->location_name,
            'parentDistrictId' => $this->parent_district_id ? (int) $this->parent_district_id : null,
            'fee'              => (float) $this->fee,
            'sortOrder'        => (int) $this->sort_order,
            'createdAt'        => $this->created_at?->toISOString(),
            'updatedAt'        => $this->updated_at?->toISOString(),
        ];
    }
}
