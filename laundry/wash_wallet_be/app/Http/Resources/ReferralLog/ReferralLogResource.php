<?php

namespace App\Http\Resources\ReferralLog;

use App\Http\Resources\Topup\TopupResource;
use App\Http\Resources\User\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReferralLogResource extends JsonResource
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
            'referrerId' => (int) $this->referrer_id,
            'referredUserId' => (int) $this->referred_user_id,
            'topupId' => $this->topup_id ? (int) $this->topup_id : null,
            'commissionCoin' => (int) $this->commission_coin,
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),

            'referrer' => UserResource::make($this->whenLoaded('referrer')),
            'referredUser' => UserResource::make($this->whenLoaded('referredUser')),
            'topup' => TopupResource::make($this->whenLoaded('topup')),
        ];
    }
}
