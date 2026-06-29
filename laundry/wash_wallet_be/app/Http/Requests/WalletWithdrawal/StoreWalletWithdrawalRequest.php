<?php

declare(strict_types=1);

namespace App\Http\Requests\WalletWithdrawal;

use Illuminate\Foundation\Http\FormRequest;

class StoreWalletWithdrawalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ownerBankAccountId' => ['required', 'integer', 'exists:owner_bank_accounts,id'],
            'requestedAmount'    => ['required', 'numeric', 'min:1'],
        ];
    }
}
