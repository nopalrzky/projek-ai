<?php

namespace App\Http\Requests\Category\LaundryService;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class UpdateLaundryServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Auth::check();
    }

    public function rules(): array
    {
        return [
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
                'required',
                'integer',
                'min:1',
            ],
            'price' => [
                'required',
                'numeric',
                'min:0',
            ],
            'minQuantity' => [
                'required',
                'integer',
                'min:1',
            ],
            'isActive' => [
                'sometimes',
                'boolean',
            ],
            'laundryServiceProcesses' => [
                'nullable',
                'array',
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
            'unitId.required' => 'Unit layanan harus dipilih.',
            'unitId.integer' => 'Unit layanan tidak valid.',
            'unitId.min' => 'Unit layanan harus dipilih dengan benar.',
            'name.required' => 'Nama layanan laundry harus diisi.',
            'name.string' => 'Nama layanan laundry harus berupa teks.',
            'name.min' => 'Nama layanan laundry minimal 3 karakter.',
            'name.max' => 'Nama layanan laundry maksimal 255 karakter.',
            'name.regex' => 'Nama layanan laundry hanya boleh mengandung huruf, angka, spasi, dan simbol +, -, &, (, ), ., /',
            'description.string' => 'Deskripsi layanan harus berupa teks.',
            'description.max' => 'Deskripsi layanan maksimal 500 karakter.',
            'durationHours.required' => 'Durasi layanan harus diisi.',
            'durationHours.integer' => 'Durasi layanan harus berupa angka bulat.',
            'durationHours.min' => 'Durasi layanan minimal 1 jam.',
            'price.required' => 'Harga layanan harus diisi.',
            'price.numeric' => 'Harga layanan harus berupa angka.',
            'price.min' => 'Harga layanan tidak boleh kurang dari 0.',
            'minQuantity.required' => 'Kuantitas minimum harus diisi.',
            'minQuantity.integer' => 'Kuantitas minimum harus berupa angka bulat.',
            'minQuantity.min' => 'Kuantitas minimum minimal 1.',
            'isActive.boolean' => 'Status aktif layanan harus berupa true atau false.',
            'laundryServiceProcesses.array' => 'Proses layanan laundry harus berupa array.',
            'laundryServiceProcesses.*.processId.required_with' => 'ID proses harus diisi.',
            'laundryServiceProcesses.*.processId.integer' => 'ID proses tidak valid.',
            'laundryServiceProcesses.*.processId.exists' => 'Proses yang dipilih tidak ditemukan atau tidak aktif.',
            'laundryServiceProcesses.*.processId.distinct' => 'Proses yang sama tidak boleh dipilih lebih dari satu kali.',
        ];
    }

    public function attributes(): array
    {
        return [
            'unitId' => 'unit layanan',
            'name' => 'nama layanan',
            'description' => 'deskripsi layanan',
            'durationHours' => 'durasi layanan',
            'price' => 'harga layanan',
            'minQuantity' => 'kuantitas minimum',
            'isActive' => 'status aktif',
            'laundryServiceProcesses' => 'proses layanan',
            'laundryServiceProcesses.*.processId' => 'ID proses',
        ];
    }
}
