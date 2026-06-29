<?php

namespace App\Http\Requests\ServicePackage;

use Illuminate\Foundation\Http\FormRequest;

class UpdateServicePackageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'validityDays' => ['nullable', 'integer', 'min:1'],
            'isActive' => ['boolean'],
            'servicePackageItems' => ['required', 'array', 'min:1'],
            'servicePackageItems.*.laundryServiceId' => ['required', 'integer', 'exists:laundry_services,id'],
            'servicePackageItems.*.quantity' => ['required', 'numeric', 'min:0.1'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama paket harus diisi',
            'name.max' => 'Nama paket maksimal 255 karakter',
            'price.required' => 'Harga paket harus diisi',
            'price.numeric' => 'Harga paket harus berupa angka',
            'price.min' => 'Harga paket minimal 0',
            'validityDays.integer' => 'Masa berlaku harus berupa angka',
            'validityDays.min' => 'Masa berlaku minimal 1 hari',
            'servicePackageItems.required' => 'Paket harus memiliki minimal satu layanan',
            'servicePackageItems.array' => 'Item layanan tidak valid',
            'servicePackageItems.min' => 'Paket harus memiliki minimal satu layanan',
            'servicePackageItems.*.laundryServiceId.required' => 'Layanan laundry harus dipilih',
            'servicePackageItems.*.laundryServiceId.exists' => 'Layanan laundry tidak ditemukan',
            'servicePackageItems.*.quantity.required' => 'Kuantitas layanan harus diisi',
            'servicePackageItems.*.quantity.numeric' => 'Kuantitas layanan harus berupa angka',
            'servicePackageItems.*.quantity.min' => 'Kuantitas layanan minimal 0.1',
        ];
    }
}
