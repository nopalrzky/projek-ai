<?php

namespace App\Http\Requests\CustomerSubscription;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCustomerSubscriptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customerId' => [
                'required',
                'integer',
                Rule::exists('customers', 'id')
                    ->where('is_active', true)
                    ->whereNull('deleted_at'),
            ],
            'servicePackageId' => [
                'required',
                'integer',
                Rule::exists('service_packages', 'id')
                    ->where('is_active', true)
                    ->whereNull('deleted_at'),
            ],
            'pricePaid' => [
                'required',
                'numeric',
                'min:0',
                'max:999999999.99',
            ],
            'purchaseDate' => [
                'nullable',
                'date',
                'before_or_equal:today',
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
            'customerId.required' => 'Customer harus dipilih',
            'customerId.integer' => 'Customer tidak valid',
            'customerId.exists' => 'Customer tidak ditemukan atau tidak aktif',
            'servicePackageId.required' => 'Paket layanan harus dipilih',
            'servicePackageId.integer' => 'Paket layanan tidak valid',
            'servicePackageId.exists' => 'Paket layanan tidak ditemukan atau tidak aktif',
            'pricePaid.required' => 'Harga yang dibayar harus diisi',
            'pricePaid.numeric' => 'Harga yang dibayar harus berupa angka',
            'pricePaid.min' => 'Harga yang dibayar minimal Rp 0',
            'pricePaid.max' => 'Harga yang dibayar maksimal Rp 999.999.999,99',
            'purchaseDate.date' => 'Format tanggal pembelian tidak valid',
            'purchaseDate.before_or_equal' => 'Tanggal pembelian tidak boleh lebih dari hari ini',
            'note.string' => 'Catatan harus berupa teks',
            'note.max' => 'Catatan maksimal 1000 karakter',
        ];
    }

    public function attributes(): array
    {
        return [
            'customerId' => 'customer',
            'servicePackageId' => 'paket layanan',
            'pricePaid' => 'harga yang dibayar',
            'purchaseDate' => 'tanggal pembelian',
            'note' => 'catatan',
        ];
    }

    protected function failedAuthorization(): void
    {
        abort(403, 'Anda tidak memiliki izin untuk membuat subscription pelanggan.');
    }
}
