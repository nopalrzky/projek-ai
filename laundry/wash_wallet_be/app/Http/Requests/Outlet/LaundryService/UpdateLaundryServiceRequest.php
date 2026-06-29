<?php

namespace App\Http\Requests\Outlet\LaundryService;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class UpdateLaundryServiceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Auth::check();
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $outletId = $this->route('outlet');

        return [
            'categoryId' => [
                'sometimes',
                'required',
                'integer',
                'exists:categories,id',
            ],
            'unitId' => [
                'sometimes',
                'required',
                'integer',
                'exists:units,id',
            ],
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                'min:2',
            ],
            'description' => [
                'sometimes',
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
            'supportsCourier' => [
                'sometimes',
                'boolean',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
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
            'durationHours.required' => 'Durasi wajib diisi.',
            'minQuantity.required' => 'Kuantitas minimal wajib diisi.',
            'supportsCourier.boolean' => 'Status layanan kurir harus berupa true atau false.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
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
            'supportsCourier' => 'dukungan kurir',
        ];
    }
}
