<?php

namespace App\Http\Requests\MembershipPlan;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMembershipPlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'outletId' => [
                'required',
                'integer',
                'exists:outlets,id'
            ],
            'name' => [
                'required',
                'string',
                'max:255',
                'min:3'
            ],
            'price' => [
                'required',
                'numeric',
                'min:0',
                'max:99999999999.99'
            ],
            'durationDays' => [
                'nullable',
                'integer',
                'min:1',
                'max:3650'
            ],
            'isActive' => [
                'boolean'
            ],
            'discountPercentage' => [
                'nullable',
                'numeric',
                'min:0',
                'max:100'
            ],
            'description' => [
                'nullable',
                'string',
                'max:1000'
            ],
            'level' => [
                'required',
                'integer',
                'min:1',
                'max:100',
                Rule::unique('membership_plans', 'level')
                    ->where('outlet_id', $this->input('outletId'))
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'outletId.required' => 'Outlet wajib dipilih.',
            'outletId.integer' => 'Outlet tidak valid.',
            'outletId.exists' => 'Outlet tidak ditemukan.',
            'name.required' => 'Nama paket membership wajib diisi.',
            'name.min' => 'Nama paket membership minimal 3 karakter.',
            'name.max' => 'Nama paket membership maksimal 255 karakter.',
            'price.required' => 'Harga wajib diisi.',
            'price.numeric' => 'Harga harus berupa angka.',
            'price.min' => 'Harga minimal 0.',
            'price.max' => 'Harga terlalu besar.',
            'durationDays.integer' => 'Durasi harus berupa angka.',
            'durationDays.min' => 'Durasi minimal 1 hari.',
            'durationDays.max' => 'Durasi maksimal 3650 hari (10 tahun).',
            'isActive.boolean' => 'Status paket tidak valid.',
            'discountPercentage.numeric' => 'Diskon harus berupa angka.',
            'discountPercentage.min' => 'Diskon minimal 0%.',
            'discountPercentage.max' => 'Diskon maksimal 100%.',
            'description.max' => 'Deskripsi maksimal 1000 karakter.',
            'level.required' => 'Level membership wajib diisi.',
            'level.integer' => 'Level membership harus berupa angka.',
            'level.min' => 'Level membership minimal 1.',
            'level.max' => 'Level membership maksimal 100.',
            'level.unique' => 'Paket membership dengan level ini sudah ada di outlet yang dipilih.',
        ];
    }

    public function attributes(): array
    {
        return [
            'outletId' => 'outlet',
            'name' => 'nama paket membership',
            'price' => 'harga',
            'durationDays' => 'durasi',
            'isActive' => 'status paket',
            'discountPercentage' => 'diskon',
            'description' => 'deskripsi',
            'level' => 'level membership',
        ];
    }
}
