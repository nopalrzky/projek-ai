<?php

declare(strict_types=1);

namespace App\Http\Requests\WithdrawalBank;

use Illuminate\Foundation\Http\FormRequest;

class StoreWithdrawalBankRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'bankName'       => ['required', 'string', 'max:100'],
            'bankCode'       => ['nullable', 'string', 'max:20'],
            'adminFee'       => ['required', 'numeric', 'min:0'],
            'minWithdrawal'  => ['required', 'numeric', 'min:0'],
            'maxWithdrawal'  => ['nullable', 'numeric', 'min:0', 'gt:minWithdrawal'],
            'isActive'       => ['nullable', 'boolean'],
        ];
    }
}
