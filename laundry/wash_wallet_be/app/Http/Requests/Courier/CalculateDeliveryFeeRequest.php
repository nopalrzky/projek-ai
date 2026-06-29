<?php

namespace App\Http\Requests\Courier;

use Illuminate\Foundation\Http\FormRequest;

class CalculateDeliveryFeeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'customerId' => 'nullable|integer|exists:customers,id',
            'customerAccountId' => 'nullable|integer|exists:customer_accounts,id',
            'customerAddressId'  => 'nullable|integer|exists:customer_addresses,id',
            'latitude'   => 'required|numeric',
            'longitude'  => 'required|numeric',
            'orderTotal' => 'nullable|numeric|min:0',
        ];
    }
}
