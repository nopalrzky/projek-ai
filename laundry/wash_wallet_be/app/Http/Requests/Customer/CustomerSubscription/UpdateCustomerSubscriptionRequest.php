<?php

namespace App\Http\Requests\Customer\CustomerSubscription;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCustomerSubscriptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => [
                'sometimes',
                'required',
                'string',
                'in:active,exhausted,expired,cancelled',
            ],
            'note' => [
                'nullable',
                'string',
                'max:1000',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'status.in' => 'Status tidak valid. Pilihan: active, exhausted, expired, cancelled',
        ];
    }
}