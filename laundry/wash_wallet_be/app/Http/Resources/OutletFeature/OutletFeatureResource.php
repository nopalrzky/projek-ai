<?php

namespace App\Http\Resources\OutletFeature;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\Outlet\OutletResource;
use App\Http\Resources\Feature\FeatureResource;

class OutletFeatureResource extends JsonResource
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
            'featureId' => $this->feature_id ? (int) $this->feature_id : null,
            'status' => $this->status instanceof \BackedEnum ? $this->status->value : ($this->status ? (string) $this->status : null),
            'trialStartedAt' => $this->trial_started_at?->toISOString(),
            'trialExpiresAt' => $this->trial_expires_at?->toISOString(),
            'unlockedAt' => $this->unlocked_at?->toISOString(),
            'expiresAt' => $this->expires_at?->toISOString(),
            'coinSpent' => (int) $this->coin_spent,
            'autoRenewal' => (bool) $this->auto_renewal,
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),

            'outlet' => OutletResource::make($this->whenLoaded('outlet')),
            'feature' => FeatureResource::make($this->whenLoaded('feature')),
        ];
    }
}
