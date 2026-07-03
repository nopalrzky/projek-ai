<?php

namespace App\Http\Requests\Position;

use App\Services\PositionService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePositionRequest extends FormRequest
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
     */
    public function rules(): array
    {
        return [
            'outletId' => [
                'required',
                'integer',
                'exists:outlets,id',
                'min:1'
            ],
            'name' => [
                'required',
                'string',
                'max:255',
                'min:3'
            ],
            'description' => [
                'nullable',
                'string',
                'max:1000'
            ],
            'permissions' => [
                'nullable',
                'array'
            ],
            'permissions.*' => [
                'string',
                Rule::in(app(PositionService::class)->getPermissionKeys()),
            ]

        ];
    }

    /**
     * Get custom error messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'outletId.required' => 'Outlet wajib dipilih.',
            'outletId.integer' => 'Outlet harus berupa ID yang valid.',
            'outletId.exists' => 'Outlet yang dipilih tidak ditemukan.',
            'outletId.min' => 'Outlet tidak valid.',
            'name.required' => 'Nama posisi wajib diisi.',
            'name.string' => 'Nama posisi harus berupa teks.',
            'name.min' => 'Nama posisi minimal 3 karakter.',
            'name.max' => 'Nama posisi tidak boleh lebih dari :max karakter.',
            'description.string' => 'Deskripsi harus berupa teks.',
            'description.max' => 'Deskripsi tidak boleh lebih dari :max karakter.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'outletId' => 'outlet',
            'name' => 'nama posisi',
            'description' => 'deskripsi',
        ];
    }
}
