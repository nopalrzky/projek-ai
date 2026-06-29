<?php

namespace App\Http\Requests\Outlet\LaundryService;

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
                'exists:categories,id',
            ],
            'unitId' => [
                'required',
                'integer',
                'exists:units,id',
            ],
            'name' => [
                'required',
                'string',
                'max:255',
                'min:2',
            ],
            'description' => [
                'nullable',
                'string',
                'max:1000',
            ],
            'isActive' => [
                'sometimes',
                'boolean',
            ],
            'price' => [
                'required',
                'numeric',
                'min:0',
            ],
            'durationHours' => [
                'required',
                'integer',
                'min:1',
            ],
            'minQuantity' => [
                'required',
                'integer',
                'min:1',
            ],
            'laundryServiceProcesses' => [
                'nullable',
                'array',
            ],
            'supportsCourier' => [
                'sometimes',
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
            'categoryId.required' => 'Kategori wajib dipilih.',
            'categoryId.exists' => 'Kategori yang dipilih tidak valid.',
            'unitId.required' => 'Unit wajib dipilih.',
            'unitId.exists' => 'Unit yang dipilih tidak valid.',
            'name.required' => 'Nama layanan wajib diisi.',
            'name.string' => 'Nama layanan harus berupa teks.',
            'name.max' => 'Nama layanan maksimal 255 karakter.',
            'name.min' => 'Nama layanan minimal 2 karakter.',
            'description.string' => 'Deskripsi harus berupa teks.',
            'description.max' => 'Deskripsi maksimal 1000 karakter.',
            'isActive.boolean' => 'Status aktif harus berupa true atau false.',
            'price.required' => 'Harga wajib diisi.',
            'price.numeric' => 'Harga harus berupa angka.',
            'price.min' => 'Harga minimal adalah 0.',
            'durationHours.required' => 'Durasi wajib diisi.',
            'durationHours.integer' => 'Durasi harus berupa angka bulat.',
            'durationHours.min' => 'Durasi minimal adalah 1 jam.',
            'minQuantity.required' => 'Kuantitas minimal wajib diisi.',
            'minQuantity.integer' => 'Kuantitas minimal harus berupa angka bulat.',
            'minQuantity.min' => 'Kuantitas minimal minimal adalah 1.',
            'laundryServiceProcesses.array' => 'Proses layanan laundry harus berupa array.',
            'laundryServiceProcesses.*.processId.required_with' => 'ID proses harus diisi.',
            'laundryServiceProcesses.*.processId.integer' => 'ID proses tidak valid.',
            'laundryServiceProcesses.*.processId.exists' => 'Proses yang dipilih tidak ditemukan atau tidak aktif.',
            'laundryServiceProcesses.*.processId.distinct' => 'Proses yang sama tidak boleh dipilih lebih dari satu kali.',
            'supportsCourier.boolean' => 'Status layanan kurir harus berupa true atau false.',
        ];
    }

    public function attributes(): array
    {
        return [
            'categoryId' => 'kategori',
            'unitId' => 'unit',
            'name' => 'nama layanan',
            'description' => 'deskripsi',
            'isActive' => 'status aktif',
            'price' => 'harga',
            'durationHours' => 'durasi',
            'minQuantity' => 'kuantitas minimal',
            'laundryServiceProcesses' => 'proses layanan',
            'laundryServiceProcesses.*.processId' => 'ID proses',
            'supportsCourier' => 'dukungan kurir',
        ];
    }
}
