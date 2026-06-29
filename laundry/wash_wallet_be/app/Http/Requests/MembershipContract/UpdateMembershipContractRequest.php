<?php

namespace App\Http\Requests\MembershipContract;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMembershipContractRequest extends FormRequest
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
                'sometimes',
                'required',
                'integer',
                'exists:customers,id'
            ],
            'outletId' => [
                'sometimes',
                'required',
                'integer',
                'exists:outlets,id'
            ],
            'membershipPlanId' => [
                'sometimes',
                'required',
                'integer',
                'exists:membership_plans,id'
            ],
            'startAt' => [
                'nullable',
                'date'
            ],
            'expiredAt' => [
                'nullable',
                'date',
                'after:startAt'
            ],
            'totalPaid' => [
                'nullable',
                'numeric',
                'min:0',
                'max:99999999999.99'
            ],
            'status' => [
                'sometimes',
                'in:active,replaced,expired'
            ],
            'upgradeFromId' => [
                'nullable',
                'integer',
                'exists:membership_contracts,id'
            ],
            'replacedById' => [
                'nullable',
                'integer',
                'exists:membership_contracts,id'
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
            'expiredAt.date' => 'Tanggal berakhir tidak valid.',
            'expiredAt.after' => 'Tanggal berakhir harus setelah tanggal mulai.',
            'totalPaid.numeric' => 'Total pembayaran harus berupa angka.',
            'totalPaid.min' => 'Total pembayaran minimal 0.',
            'totalPaid.max' => 'Total pembayaran terlalu besar.',
            'status.in' => 'Status kontrak tidak valid.',
            'upgradeFromId.integer' => 'Kontrak upgrade tidak valid.',
            'upgradeFromId.exists' => 'Kontrak upgrade tidak ditemukan.',
            'replacedById.integer' => 'Kontrak pengganti tidak valid.',
            'replacedById.exists' => 'Kontrak pengganti tidak ditemukan.',
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
            'expiredAt' => 'tanggal berakhir',
            'totalPaid' => 'total pembayaran',
            'status' => 'status kontrak',
            'upgradeFromId' => 'kontrak upgrade',
            'replacedById' => 'kontrak pengganti',
        ];
    }
}
