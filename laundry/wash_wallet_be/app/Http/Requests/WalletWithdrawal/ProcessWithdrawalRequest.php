<?php

declare(strict_types=1);

namespace App\Http\Requests\WalletWithdrawal;

use Illuminate\Foundation\Http\FormRequest;

class ProcessWithdrawalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'proof'     => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'adminNote' => ['nullable', 'string', 'max:500'],
        ];
    }
}
