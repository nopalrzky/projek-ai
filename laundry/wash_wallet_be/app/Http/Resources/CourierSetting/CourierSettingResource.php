<?php

namespace App\Http\Resources\CourierSetting;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CourierSettingResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'                     => (int) $this->id,
            'outletId'               => (int) $this->outlet_id,
            'isCourierEnabled'       => (bool) $this->is_courier_enabled,
            'pricingMethod'          => (string) $this->pricing_method,
            'flatFee'                => (float) $this->flat_fee,
            'baseFee'                => (float) $this->base_fee,
            'perKmFee'               => (float) $this->per_km_fee,
            'defaultPrice'           => (float) $this->default_price,
            'freeRadiusKm'           => $this->free_radius_km !== null ? (float) $this->free_radius_km : null,
            'minFee'                 => (float) $this->min_fee,
            'maxFee'                 => $this->max_fee !== null ? (float) $this->max_fee : null,
            'maxDistanceKm'          => $this->max_distance_km !== null ? (float) $this->max_distance_km : null,
            'surgeEnabled'           => (bool) $this->surge_enabled,
            'surgeMultiplier'        => (float) $this->surge_multiplier,
            'nightSurcharge'         => (float) $this->night_surcharge,
            'nightStartTime'         => $this->night_start_time ? (string) $this->night_start_time : null,
            'nightEndTime'           => $this->night_end_time ? (string) $this->night_end_time : null,
            'weekendSurcharge'       => (float) $this->weekend_surcharge,
            'merchantSubsidy'        => (float) $this->merchant_subsidy,
            'merchantSubsidyType'    => $this->merchant_subsidy_type ? (string) $this->merchant_subsidy_type : null,
            'freeShippingEnabled'    => (bool) $this->free_shipping_enabled,
            'unconditionalFreeShippingEnabled' => (bool) $this->unconditional_free_shipping_enabled,
            'freeShippingMode'       => $this->freeShippingMode(),
            'minOrderFreeShipping'   => $this->min_order_free_shipping !== null ? (float) $this->min_order_free_shipping : null,

            'pickupFee'              => (float) $this->pickup_fee,
            'deliveryFee'            => (float) $this->delivery_fee,

            'pricingTiers'           => CourierPricingTierResource::collection($this->whenLoaded('pricingTiers')),
            'pricingZones'           => CourierPricingZoneResource::collection($this->whenLoaded('pricingZones')),

            'createdAt'              => $this->created_at?->toISOString(),
            'updatedAt'              => $this->updated_at?->toISOString(),
        ];
    }
}
