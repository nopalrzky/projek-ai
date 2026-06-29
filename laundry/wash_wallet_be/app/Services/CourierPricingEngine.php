<?php

namespace App\Services;

use App\DTOs\CourierPricingResult;
use App\Models\CourierSetting;
use App\Models\CustomerAddress;
use App\Models\MembershipContract;
use Illuminate\Support\Carbon;

/**
 * CourierPricingEngine - Core calculation logic for courier pricing.
 * This is a utility class, not extending BaseService.
 */
class CourierPricingEngine
{
    /**
     * Main calculation method.
     */
    public function calculate(
        CourierSetting $setting,
        float $distanceKm,
        ?float $orderTotal = null,
        ?int $customerId = null,
        ?CustomerAddress $address = null,
        ?Carbon $orderTime = null
    ): CourierPricingResult {
        $orderTime ??= now();
        $isServiceable = true;
        $rejectionReason = null;

        if ($setting->max_distance_km !== null && $distanceKm > $setting->max_distance_km) {
            $isServiceable = false;
            $rejectionReason = "Distance exceeds maximum service radius of {$setting->max_distance_km} km";
        }

        if ($isServiceable && $setting->unconditional_free_shipping_enabled) {
            return $this->createZeroFeeResult($setting, $distanceKm, 'unconditional_free_shipping');
        }

        if ($isServiceable && $setting->free_shipping_enabled) {
            if ($orderTotal !== null && $setting->min_order_free_shipping !== null && $orderTotal >= $setting->min_order_free_shipping) {
                return $this->createZeroFeeResult($setting, $distanceKm, 'free_shipping_global');
            }
        }

        if ($isServiceable && $customerId !== null) {
            $activeContract = MembershipContract::query()
                ->where('customer_id', $customerId)
                ->where('outlet_id', $setting->outlet_id)
                ->active()
                ->first();

            if ($activeContract && $activeContract->canUseFreeShipping()) {
                return $this->createZeroFeeResult($setting, $distanceKm, 'membership');
            }
        }

        $tierApplied = null;
        $calculationSource = null;
        $baseFee = $this->calculateBaseFee(
            $setting,
            $distanceKm,
            $address,
            $tierApplied,
            $calculationSource
        );

        $fee = (float) $baseFee;

        if ($setting->min_fee > 0 && $fee < $setting->min_fee) {
            $fee = (float) $setting->min_fee;
        }

        if ($setting->max_fee !== null && $fee > $setting->max_fee) {
            $fee = (float) $setting->max_fee;
        }

        if ($setting->surge_enabled && $setting->surge_multiplier > 1) {
            $fee *= (float) $setting->surge_multiplier;
        }

        $nightSurcharge = 0;
        if ($setting->night_surcharge > 0 && $setting->isNightTime($orderTime)) {
            $nightSurcharge = (float) $setting->night_surcharge;
            $fee += $nightSurcharge;
        }

        $weekendSurcharge = 0;
        if ($setting->weekend_surcharge > 0 && $setting->isWeekend($orderTime)) {
            $weekendSurcharge = (float) $setting->weekend_surcharge;
            $fee += $weekendSurcharge;
        }

        $subsidyAmount = 0;
        if ($setting->merchant_subsidy > 0) {
            if ($setting->merchant_subsidy_type === 'percentage') {
                $subsidyAmount = $fee * ($setting->merchant_subsidy / 100);
            } else {
                $subsidyAmount = (float) $setting->merchant_subsidy;
            }
            $subsidyAmount = min($subsidyAmount, $fee);
        }

        $customerPays = max(0, $fee - $subsidyAmount);

        return new CourierPricingResult([
            'distanceKm'        => $distanceKm,
            'baseFee'           => (float) $baseFee,
            'finalFee'          => (float) $fee,
            'customerPays'      => (float) $customerPays,
            'merchantSubsidy'   => (float) $subsidyAmount,
            'minFee'            => (float) $setting->min_fee,
            'maxFee'            => (float) $setting->max_fee,
            'surgeMultiplier'   => (float) ($setting->surge_enabled ? $setting->surge_multiplier : 1),
            'nightSurcharge'    => $nightSurcharge,
            'weekendSurcharge'  => $weekendSurcharge,
            'discountSource'    => null,
            'calculationSource' => $calculationSource,
            'isServiceable'     => $isServiceable,
            'pricingMethod'     => $setting->pricing_method,
            'tierApplied'       => $tierApplied,
            'rejectionReason'   => $rejectionReason,
        ]);
    }

    private function calculateBaseFee(
        CourierSetting $setting,
        float $distanceKm,
        ?CustomerAddress $address,
        ?string &$tierApplied,
        ?string &$calculationSource
    ): float {
        return match ($setting->pricing_method) {
            'flat_rate' => $this->markCalculationSource(
                (float) $setting->flat_fee,
                'flat_rate',
                $calculationSource
            ),
            'distance_based' => $this->markCalculationSource(
                $this->calculateBasePerKm($setting, $distanceKm),
                'distance_based',
                $calculationSource
            ),
            'zone_based' => $this->calculateZoneBased($setting, $address, $tierApplied, $calculationSource),
            'tiered' => $this->calculateTiered($setting, $distanceKm, $tierApplied, $calculationSource),
            default => $this->markCalculationSource(
                (float) $setting->flat_fee,
                'flat_rate',
                $calculationSource
            ),
        };
    }

    private function markCalculationSource(float $fee, string $source, ?string &$calculationSource): float
    {
        $calculationSource = $source;

        return $fee;
    }

    private function calculateBasePerKm(CourierSetting $s, float $dist): float
    {
        $radius = (float) ($s->free_radius_km ?? 0);
        if ($radius > 0 && $dist <= $radius) {
            return 0.0;
        }

        $effectiveDist = $radius > 0 ? max(0, $dist - $radius) : $dist;

        return (float) $s->base_fee + ($effectiveDist * (float) $s->per_km_fee);
    }

    private function calculateTiered(
        CourierSetting $s,
        float $dist,
        ?string &$tierApplied,
        ?string &$calculationSource
    ): float {
        $tier = $s->pricingTiers()
            ->where('min_km', '<=', $dist)
            ->where(function ($q) use ($dist) {
                $q->where('max_km', '>=', $dist)
                    ->orWhereNull('max_km');
            })
            ->first();

        if ($tier) {
            $tierApplied = "Tier {$tier->min_km}-" . ($tier->max_km ?? 'inf') . " km";
            $calculationSource = 'tier';

            return (float) $tier->fee;
        }

        $calculationSource = 'default_price';

        return (float) $s->default_price;
    }

    private function calculateZoneBased(
        CourierSetting $s,
        ?CustomerAddress $address,
        ?string &$tierApplied,
        ?string &$calculationSource
    ): float {
        if (!$address) {
            $calculationSource = 'default_price';

            return (float) $s->default_price;
        }

        if ($address->village_id) {
            $zone = $s->pricingZones()
                ->where('location_type', 'village')
                ->where('location_id', $address->village_id)
                ->first();

            if ($zone) {
                $tierApplied = "Zone Kelurahan: {$zone->location_name}";
                $calculationSource = 'zone';

                return (float) $zone->fee;
            }
        }

        if ($address->district_id) {
            $zone = $s->pricingZones()
                ->where('location_type', 'district')
                ->where('location_id', $address->district_id)
                ->first();

            if ($zone) {
                $tierApplied = "Zone Kecamatan: {$zone->location_name}";
                $calculationSource = 'zone';

                return (float) $zone->fee;
            }
        }

        $calculationSource = 'default_price';

        return (float) $s->default_price;
    }

    private function createZeroFeeResult(CourierSetting $setting, float $distanceKm, string $source): CourierPricingResult
    {
        return new CourierPricingResult([
            'distanceKm'        => $distanceKm,
            'baseFee'           => 0,
            'finalFee'          => 0,
            'customerPays'      => 0,
            'merchantSubsidy'   => 0,
            'minFee'            => (float) $setting->min_fee,
            'maxFee'            => (float) $setting->max_fee,
            'surgeMultiplier'   => 1,
            'nightSurcharge'    => 0,
            'weekendSurcharge'  => 0,
            'discountSource'    => $source,
            'calculationSource' => $source,
            'isServiceable'     => true,
            'pricingMethod'     => $setting->pricing_method,
        ]);
    }
}
