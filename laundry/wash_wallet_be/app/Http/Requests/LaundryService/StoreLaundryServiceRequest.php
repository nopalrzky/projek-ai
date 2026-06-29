<?php

namespace App\Http\Requests\LaundryService;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StoreLaundryServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Auth::check();
    }

    public function rules(): array
    {
        return [
            'categoryId' => [
                'required',
                'integer',
                'min:1',
                'exists:categories,id',
            ],
            'unitId' => [
                'required',
                'integer',
                'min:1',
            ],
            'name' => [
                'required',
                'string',
                'min:3',
                'max:255',
                'regex:/^[a-zA-Z0-9\s\+\-\&\(\)\.\/]+$/',
            ],
            'description' => [
                'nullable',
                'string',
                'max:500',
            ],
            'durationHours' => [
                'nullable',
                'integer',
                'min:0',
            ],
            'price' => [
                'nullable',
                'numeric',
                'min:0',
            ],
            'minQuantity' => [
                'nullable',
                'integer',
                'min:0',
            ],
            'laundryServiceProcesses' => [
                'nullable',
                'array',
            ],
            'supportsCourier' => [
                'nullable',
                'boolean',
            ],
            'laundryServiceProcesses.*.processId' => [
                'required_with:laundryServiceProcesses',
                'integer',
                'min:1',
                'exists:processes,id',
                'distinct',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'categoryId.required' => 'Kategori layanan harus dipilih.',
            'categoryId.integer' => 'Kategori layanan tidak valid.',
            'categoryId.exists' => 'Kategori layanan yang dipilih tidak ditemukan atau tidak aktif.',
            'categoryId.min' => 'Kategori layanan harus dipilih dengan benar.',
            'unitId.required' => 'Unit layanan harus dipilih.',
            'unitId.integer' => 'Unit layanan tidak valid.',
            'unitId.exists' => 'Unit layanan yang dipilih tidak ditemukan atau tidak aktif.',
            'unitId.min' => 'Unit layanan harus dipilih dengan benar.',
            'name.required' => 'Nama layanan laundry harus diisi.',
            'name.string' => 'Nama layanan laundry harus berupa teks.',
            'name.min' => 'Nama layanan laundry minimal 3 karakter.',
            'name.max' => 'Nama layanan laundry maksimal 255 karakter.',
            'name.regex' => 'Nama layanan laundry hanya boleh mengandung huruf, angka, spasi, dan simbol +, -, &, (, ), ., /',
            'description.string' => 'Deskripsi layanan harus berupa teks.',
            'description.max' => 'Deskripsi layanan maksimal 500 karakter.',
            'durationHours.integer' => 'Durasi layanan harus berupa angka bulat.',
            'durationHours.min' => 'Durasi layanan tidak boleh kurang dari 0.',
            'price.numeric' => 'Harga layanan harus berupa angka.',
            'price.min' => 'Harga layanan tidak boleh kurang dari 0.',
            'minQuantity.integer' => 'Kuantitas minimum harus berupa angka bulat.',
            'minQuantity.min' => 'Kuantitas minimum tidak boleh kurang dari 0.',
            'laundryServiceProcesses.array' => 'Proses layanan laundry harus berupa array.',
            'laundryServiceProcesses.*.processId.required_with' => 'ID proses harus diisi.',
            'laundryServiceProcesses.*.processId.integer' => 'ID proses tidak valid.',
            'laundryServiceProcesses.*.processId.exists' => 'Proses yang dipilih tidak ditemukan atau tidak aktif.',
            'laundryServiceProcesses.*.processId.distinct' => 'Proses yang sama tidak boleh dipilih lebih dari satu kali.',
            'supportsCourier.boolean' => 'Status layanan kurir harus berupa nilai benar atau salah.',
        ];
    }

    public function attributes(): array
    {
        return [
            'categoryId' => 'kategori layanan',
            'unitId' => 'unit layanan',
            'name' => 'nama layanan',
            'description' => 'deskripsi layanan',
            'durationHours' => 'durasi layanan',
            'price' => 'harga layanan',
            'minQuantity' => 'kuantitas minimum',
            'laundryServiceProcesses' => 'proses layanan',
            'laundryServiceProcesses.*.processId' => 'ID proses',
            'supportsCourier' => 'dukungan kurir',
        ];
    }
}
