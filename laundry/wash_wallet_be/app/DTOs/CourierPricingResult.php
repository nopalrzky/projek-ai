<?php

namespace App\DTOs;

class CourierPricingResult
{
    public float $distanceKm;
    public float $baseFee;
    public float $finalFee;
    public float $customerPays;
    public float $merchantSubsidy;
    public float $minFee;
    public float $maxFee;
    public float $surgeMultiplier;
    public float $nightSurcharge;
    public float $weekendSurcharge;
    public ?string $discountSource;
    public ?string $calculationSource;
    public bool $isServiceable;
    public string $pricingMethod;
    public ?string $tierApplied = null;
    public ?string $rejectionReason = null;

    public function __construct(array $data)
    {
        $this->distanceKm = (float) ($data['distanceKm'] ?? 0);
        $this->baseFee = (float) ($data['baseFee'] ?? 0);
        $this->finalFee = (float) ($data['finalFee'] ?? 0);
        $this->customerPays = (float) ($data['customerPays'] ?? 0);
        $this->merchantSubsidy = (float) ($data['merchantSubsidy'] ?? 0);
        $this->minFee = (float) ($data['minFee'] ?? 0);
        $this->maxFee = (float) ($data['maxFee'] ?? 0);
        $this->surgeMultiplier = (float) ($data['surgeMultiplier'] ?? 1);
        $this->nightSurcharge = (float) ($data['nightSurcharge'] ?? 0);
        $this->weekendSurcharge = (float) ($data['weekendSurcharge'] ?? 0);
        $this->discountSource = $data['discountSource'] ?? null;
        $this->calculationSource = $data['calculationSource'] ?? null;
        $this->isServiceable = (bool) ($data['isServiceable'] ?? true);
        $this->pricingMethod = $data['pricingMethod'] ?? 'flat';
        $this->tierApplied = $data['tierApplied'] ?? null;
        $this->rejectionReason = $data['rejectionReason'] ?? null;
    }

    public function toArray(): array
    {
        return [
            'distanceKm'       => $this->distanceKm,
            'baseFee'          => $this->baseFee,
            'finalFee'         => $this->finalFee,
            'customerPays'     => $this->customerPays,
            'merchantSubsidy'  => $this->merchantSubsidy,
            'minFee'           => $this->minFee,
            'maxFee'           => $this->maxFee,
            'surgeMultiplier'  => $this->surgeMultiplier,
            'nightSurcharge'   => $this->nightSurcharge,
            'weekendSurcharge' => $this->weekendSurcharge,
            'discountSource'   => $this->discountSource,
            'calculationSource' => $this->calculationSource,
            'isServiceable'    => $this->isServiceable,
            'pricingMethod'    => $this->pricingMethod,
            'tierApplied'      => $this->tierApplied,
            'rejectionReason'  => $this->rejectionReason,
        ];
    }
}
