<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

class StoreCustomerOrderRequest extends FormRequest
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
            'customerAccountId' => 'required|integer|exists:customer_accounts,id',
            'outletId'           => 'required|integer|exists:outlets,id',
            'paymentMethod'      => 'nullable|string|in:cod,transfer,wallet_balance',
            'pickupType'         => 'required|string|in:courier,self_pickup,self_dropoff',
            'notes'              => 'nullable|string|max:1000',
            'customerAddressId'  => 'required_if:pickupType,courier|nullable|integer|exists:customer_addresses,id',
            'pickupScheduleId'   => 'required_if:pickupType,courier|nullable|integer|exists:courier_schedules,id',
            'pickupDate'         => 'required_if:pickupType,courier|nullable|date|after_or_equal:today',
            'deliveryType'       => 'required|string|in:pickup,delivery',
            'orderItems'         => 'required|array|min:1',
            'orderItems.*.laundryServiceId' => 'required|integer|exists:laundry_services,id',
        ];
    }
}
