<?php

namespace App\Http\Requests\Outlet\CourierSetting;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCourierSettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->filled('nightStartTime')) {
            $this->merge([
                'nightStartTime' => substr((string) $this->nightStartTime, 0, 5),
            ]);
        }

        if ($this->filled('nightEndTime')) {
            $this->merge([
                'nightEndTime' => substr((string) $this->nightEndTime, 0, 5),
            ]);
        }

        if ($this->has('zones') && is_array($this->zones)) {
            $zones = $this->zones;
            foreach ($zones as $key => $zone) {
                if (isset($zone['locationId'])) {
                    $zones[$key]['locationId'] = (string) $zone['locationId'];
                }
                if (isset($zone['parentDistrictId'])) {
                    $zones[$key]['parentDistrictId'] = $zone['parentDistrictId'] !== null ? (string) $zone['parentDistrictId'] : null;
                }
            }
            $this->merge(['zones' => $zones]);
        }
    }

    public function rules(): array
    {
        return [
            'outletId' => ['required', 'integer'],
            'courierSettingId' => ['nullable', 'integer'],
            'pricingMethod' => ['required', 'string', 'in:flat_rate,distance_based,zone_based,tiered'],
            'flatFee'       => ['nullable', 'numeric', 'min:0'],
            'baseFee'       => ['nullable', 'numeric', 'min:0'],
            'perKmFee'      => ['nullable', 'numeric', 'min:0'],
            'defaultPrice'  => ['nullable', 'numeric', 'min:0'],
            'freeRadiusKm'  => ['nullable', 'numeric', 'min:0'],
            'minFee'        => ['nullable', 'numeric', 'min:0'],
            'maxFee'        => ['nullable', 'numeric', 'min:0'],
            'maxDistanceKm' => ['nullable', 'numeric', 'min:0'],

            'surgeEnabled'    => ['nullable', 'boolean'],
            'surgeMultiplier' => ['nullable', 'numeric', 'min:1'],

            'nightSurcharge' => ['nullable', 'numeric', 'min:0'],
            'nightStartTime' => ['nullable', 'date_format:H:i'],
            'nightEndTime'   => ['nullable', 'date_format:H:i'],

            'weekendSurcharge' => ['nullable', 'numeric', 'min:0'],

            'merchantSubsidy'     => ['nullable', 'numeric', 'min:0'],
            'merchantSubsidyType' => ['nullable', 'string', 'in:fixed_amount,percentage'],

            'freeShippingMode' => ['nullable', 'string', 'in:none,min_order,all'],
            'freeShippingEnabled'  => ['nullable', 'boolean'],
            'unconditionalFreeShippingEnabled' => ['nullable', 'boolean'],
            'minOrderFreeShipping' => ['nullable', 'numeric', 'min:0', 'required_if:freeShippingMode,min_order'],

            'disabledDays' => ['nullable', 'array'],
            'disabledDays.*' => ['string', 'in:monday,tuesday,wednesday,thursday,friday,saturday,sunday'],

            'tiers'               => ['nullable', 'array'],
            'tiers.*.id'          => ['nullable', 'integer'],
            'tiers.*.minKm'       => ['required_with:tiers', 'numeric', 'min:0'],
            'tiers.*.maxKm'       => ['nullable', 'numeric', 'gt:tiers.*.minKm'],
            'tiers.*.fee'          => ['required_with:tiers', 'numeric', 'min:0'],
            'tiers.*.perKmFee'    => ['nullable', 'numeric', 'min:0'],
            'tiers.*.sortOrder'   => ['nullable', 'integer'],

            'zones'               => ['nullable', 'array'],
            'zones.*.id'          => ['nullable', 'integer'],
            'zones.*.locationType' => ['required_with:zones', 'string', 'in:regency,district,village'],
            'zones.*.locationId'   => ['required_with:zones', 'string'],
            'zones.*.locationName' => ['required_with:zones', 'string'],
            'zones.*.fee'           => ['required_with:zones', 'numeric', 'min:0'],
            'zones.*.sortOrder'    => ['nullable', 'integer'],
            'zones.*.parentDistrictId' => ['nullable', 'string'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $pricingMethod = $this->input('pricingMethod');
            $defaultPrice = $this->input('defaultPrice');

            if (in_array($pricingMethod, ['zone_based', 'tiered'], true) && ($defaultPrice === null || $defaultPrice === '')) {
                $validator->errors()->add(
                    'defaultPrice',
                    'Default price wajib diisi untuk strategi harga ini.'
                );
            }
        });
    }
}
