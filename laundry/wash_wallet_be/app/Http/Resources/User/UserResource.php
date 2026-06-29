<?php

namespace App\Http\Resources\User;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;
use App\Http\Resources\Outlet\OutletResource;
use App\Http\Resources\ReferralLog\ReferralLogResource;

class UserResource extends JsonResource
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
            'username' => $this->username ? (string) $this->username : null,
            'email' => $this->email ? (string) $this->email : null,
            'avatar' => $this->avatar ? (string) $this->avatar : null,
            'phone' => $this->phone ? (string) $this->phone : null,
            'address' => $this->address ? (string) $this->address : null,
            'status' => $this->status instanceof \BackedEnum ? $this->status->value : ($this->status ? (string) $this->status : null),
            'coinBalance' => $this->coin_balance !== null ? (int) $this->coin_balance : null,
            'walletBalance' => $this->wallet_balance !== null ? (float) $this->wallet_balance : null,
            'rewardBalance' => $this->reward_balance !== null ? (int) $this->reward_balance : null,
            'referralCode' => $this->referral_code ? (string) $this->referral_code : null,
            'referredBy' => $this->referred_by ? (int) $this->referred_by : null,
            'bankAccountName' => $this->bank_account_name ? (string) $this->bank_account_name : null,
            'bankAccountNumber' => $this->bank_account_number ? (string) $this->bank_account_number : null,
            'bankName' => $this->bank_name ? (string) $this->bank_name : null,
            'lastLoginAt' => $this->last_login_at?->toISOString(),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
            'totalCommission' => $this->whenLoaded('commissionLogs', fn() => (int) $this->getTotalCommission(), 0),

            'referrer' => $this->whenLoaded('referrer', fn() => UserResource::make($this->referrer)),
            'commissionLogs' => ReferralLogResource::collection($this->whenLoaded('commissionLogs')),
            'outlets' => OutletResource::collection($this->whenLoaded('outlets')),
            'referrals' => UserResource::collection($this->whenLoaded('referrals')),

            'outletsCount' => $this->whenLoaded('outlets', fn() => $this->outlets->count(), 0),
            'referralsCount' => $this->whenLoaded('referrals', fn() => $this->referrals->count(), 0),
            'commissionLogsCount' => $this->whenLoaded('commissionLogs', fn() => $this->commissionLogs->count(), 0),
            'roles' => $this->getRoleNames(),
            'isOwner' => $this->isOwner(),

        ];
    }
}
