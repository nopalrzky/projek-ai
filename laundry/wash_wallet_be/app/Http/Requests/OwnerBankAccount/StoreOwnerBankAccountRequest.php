<?php

declare(strict_types=1);

namespace App\Http\Requests\OwnerBankAccount;

use Illuminate\Foundation\Http\FormRequest;

class StoreOwnerBankAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'withdrawalBankId'   => ['required', 'integer', 'exists:withdrawal_banks,id'],
            'accountNumber'      => ['required', 'string', 'max:50', 'regex:/^[0-9]+$/'],
            'accountHolderName'  => ['required', 'string', 'max:100'],
            'isDefault'          => ['nullable', 'boolean'],
        ];
    }
}
