<?php

namespace App\Http\Requests\Topup;

use Illuminate\Foundation\Http\FormRequest;

class StoreTopupRequest extends FormRequest
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
            'outletId' => [
                'nullable',
                'integer',
                'exists:outlets,id',
            ],
            'amountMoney' => [
                'required',
                'integer',
                'min:1000',
                'max:100000000',
            ],
            'paymentMethod' => [
                'required',
                'string',
                'in:bank_transfer,echannel,permata,gopay,qris,cstore,akulaku,kredivo',
            ],
            'bankCode' => [
                'nullable',
                'required_if:paymentMethod,bank_transfer',
                'string',
                'in:bca,bni,bri,cimb',
            ],
            'cstoreType' => [
                'nullable',
                'required_if:paymentMethod,cstore',
                'string',
                'in:alfamart,indomaret',
            ],
            'cardlessCreditType' => [
                'nullable',
                'required_if:paymentMethod,akulaku,kredivo',
                'string',
                'in:akulaku,kredivo',
            ],
            'paymentReference' => [
                'nullable',
                'string',
                'max:255',
                'unique:topups,payment_reference',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'outletId.exists' => 'Outlet tidak ditemukan.',
            'amountMoney.required' => 'Jumlah uang wajib diisi.',
            'amountMoney.min' => 'Jumlah uang minimal Rp 1.000.',
            'amountMoney.max' => 'Jumlah uang maksimal Rp 100.000.000.',
            'paymentMethod.required' => 'Metode pembayaran wajib dipilih.',
            'paymentMethod.in' => 'Metode pembayaran tidak valid.',
            'bankCode.required_if' => 'Pilihan bank wajib diisi untuk transfer bank.',
            'bankCode.in' => 'Pilihan bank tidak valid.',
            'cstoreType.required_if' => 'Pilihan toko wajib diisi untuk metode pembayaran di gerai.',
            'cstoreType.in' => 'Pilihan toko tidak valid.',
            'cardlessCreditType.required_if' => 'Silakan pilih provider cicilan tanpa kartu kredit.',
            'cardlessCreditType.in' => 'Provider cicilan tidak valid.',
            'paymentReference.max' => 'Referensi pembayaran maksimal 255 karakter.',
            'paymentReference.unique' => 'Referensi pembayaran sudah digunakan.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'outletId' => 'outlet',
            'amountMoney' => 'jumlah uang',
            'paymentMethod' => 'metode pembayaran',
            'bankCode' => 'kode bank',
            'paymentReference' => 'referensi pembayaran',
        ];
    }
}
