<?php

namespace App\Http\Requests\MembershipContract;

use Illuminate\Foundation\Http\FormRequest;

class StoreMembershipContractRequest extends FormRequest
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
            'customerId' => [
                'required',
                'integer',
                'exists:customers,id'
            ],
            'outletId' => [
                'required',
                'integer',
                'exists:outlets,id'
            ],
            'membershipPlanId' => [
                'required',
                'integer',
                'exists:membership_plans,id'
            ],
            'startAt' => [
                'nullable',
                'date',
                'after_or_equal:today'
            ],
            'totalPaid' => [
                'nullable',
                'numeric',
                'min:0',
                'max:99999999999.99'
            ],
            'status' => [
                'nullable',
                'in:active,replaced,expired'
            ],
        ];
    }

    /**
     * Get custom error messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'customerId.required' => 'Pelanggan wajib dipilih.',
            'customerId.integer' => 'Pelanggan tidak valid.',
            'customerId.exists' => 'Pelanggan tidak ditemukan.',
            'outletId.required' => 'Outlet wajib dipilih.',
            'outletId.integer' => 'Outlet tidak valid.',
            'outletId.exists' => 'Outlet tidak ditemukan.',
            'membershipPlanId.required' => 'Paket membership wajib dipilih.',
            'membershipPlanId.integer' => 'Paket membership tidak valid.',
            'membershipPlanId.exists' => 'Paket membership tidak ditemukan.',
            'startAt.date' => 'Tanggal mulai tidak valid.',
            'startAt.after_or_equal' => 'Tanggal mulai tidak boleh sebelum hari ini.',
            'totalPaid.numeric' => 'Total pembayaran harus berupa angka.',
            'totalPaid.min' => 'Total pembayaran minimal 0.',
            'totalPaid.max' => 'Total pembayaran terlalu besar.',
            'status.in' => 'Status kontrak tidak valid.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'customerId' => 'pelanggan',
            'outletId' => 'outlet',
            'membershipPlanId' => 'paket membership',
            'startAt' => 'tanggal mulai',
            'totalPaid' => 'total pembayaran',
            'status' => 'status kontrak',
        ];
    }
}
