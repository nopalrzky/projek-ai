<?php

declare(strict_types=1);

namespace App\Http\Resources\OwnerBankAccount;

use App\Http\Resources\WithdrawalBank\WithdrawalBankResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OwnerBankAccountResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                 => (int) $this->id,
            'userId'             => (int) $this->user_id,
            'withdrawalBankId'   => (int) $this->withdrawal_bank_id,
            'accountNumber'      => (string) $this->account_number,
            'accountHolderName'  => (string) $this->account_holder_name,
            'isDefault'          => (bool) $this->is_default,
            'isActive'           => (bool) $this->is_active,
            'bankName'           => $this->relationLoaded('withdrawalBank') ? (string) $this->withdrawalBank->bank_name : ($this->withdrawalBank?->bank_name ?? null),
            'adminFee'           => $this->relationLoaded('withdrawalBank') ? (float) $this->withdrawalBank->admin_fee : ($this->withdrawalBank?->admin_fee ?? 0.00),
            'withdrawalBank'     => WithdrawalBankResource::make($this->whenLoaded('withdrawalBank')),
            'createdAt'          => $this->created_at?->toISOString(),
            'updatedAt'          => $this->updated_at?->toISOString(),
        ];
    }
}
