<?php

namespace App\Http\Resources\Referral;

use App\Http\Resources\User\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReferralResource extends JsonResource
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
            'name' => $this->name ? (string) $this->name : null,
            'email' => $this->email ? (string) $this->email : null,
            'phone' => $this->phone ? (string) $this->phone : null,
            'status' => $this->status instanceof \BackedEnum ? $this->status->value : ($this->status ? (string) $this->status : null),
            'referralCode' => $this->referral_code ? (string) $this->referral_code : null,
            'referredBy' => $this->referred_by ? (int) $this->referred_by : null,
            'coinBalance' => $this->coin_balance !== null ? (int) $this->coin_balance : null,
            'rewardBalance' => $this->reward_balance !== null ? (int) $this->reward_balance : null,
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),

            'referrer' => UserResource::make($this->whenLoaded('referrer')),
            'referrals' => UserResource::collection($this->whenLoaded('referrals')),
            'referralsCount' => $this->whenLoaded('referrals', fn() => $this->referrals->count(), 0),
        ];
    }
}
