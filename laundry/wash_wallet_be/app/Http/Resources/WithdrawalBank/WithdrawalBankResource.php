<?php

declare(strict_types=1);

namespace App\Http\Resources\WithdrawalBank;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WithdrawalBankResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => (int) $this->id,
            'bankName'       => (string) $this->bank_name,
            'bankCode'       => $this->bank_code ? (string) $this->bank_code : null,
            'adminFee'       => (float) $this->admin_fee,
            'minWithdrawal'  => (float) $this->min_withdrawal,
            'maxWithdrawal'  => $this->max_withdrawal ? (float) $this->max_withdrawal : null,
            'isActive'       => (bool) $this->is_active,
            'createdAt'      => $this->created_at?->toISOString(),
            'updatedAt'      => $this->updated_at?->toISOString(),
        ];
    }
}
