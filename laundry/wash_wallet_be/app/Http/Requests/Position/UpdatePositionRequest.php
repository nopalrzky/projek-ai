<?php

namespace App\Http\Requests\Position;

use App\Enums\Permission;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePositionRequest extends FormRequest
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
                'sometimes',
                'required',
                'integer',
                'exists:outlets,id',
                'min:1'
            ],
            'name' => [
                'sometimes',
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
            'isActive' => [
                'boolean'
            ],
            'permissions' => [
                'nullable',
                'array'
            ],
            'permissions.*' => [
                'string',
                Rule::enum(Permission::class)
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
            'name.unique' => 'Posisi dengan nama yang sama sudah ada di outlet ini.',
            'description.string' => 'Deskripsi harus berupa teks.',
            'description.max' => 'Deskripsi tidak boleh lebih dari :max karakter.',
            'isActive.boolean' => 'Status aktif harus berupa nilai benar atau salah.',
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
            'isActive' => 'status aktif',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $mergeData = [];

        // Convert outletId to integer if provided
        if ($this->has('outletId') && $this->outletId !== null) {
            $mergeData['outletId'] = $this->outletId ? (int) $this->outletId : null;
        }

        // Handle boolean isActive
        if ($this->has('isActive')) {
            $mergeData['isActive'] = $this->boolean('isActive');
        }

        // Trim string fields
        if ($this->has('name') && $this->name) {
            $mergeData['name'] = trim($this->name);
        }

        if ($this->has('description')) {
            $mergeData['description'] = $this->description ? trim($this->description) : null;
        }

        if (!empty($mergeData)) {
            $this->merge($mergeData);
        }
    }


    /**
     * Determine if the user is authorized to make this request with specific position.
     */
    public function authorizeWithPosition($position): bool
    {
        // Add authorization logic here if needed
        return true;
    }

    /**
     * Get only the fields that are being updated.
     */
    public function getUpdatedFields(): array
    {
        $updatedFields = [];

        if ($this->has('outletId')) {
            $updatedFields['outletId'] = $this->outletId;
        }

        if ($this->has('name')) {
            $updatedFields['name'] = $this->name;
        }

        if ($this->has('description')) {
            $updatedFields['description'] = $this->description;
        }

        if ($this->has('isActive')) {
            $updatedFields['isActive'] = $this->boolean('isActive');
        }

        if ($this->has('permissions')) {
            $updatedFields['permissions'] = $this->input('permissions');
        }

        return $updatedFields;
    }

    /**
     * Check if any updateable fields are present.
     */
    public function hasUpdateableFields(): bool
    {
        return $this->has(['outletId', 'name', 'description', 'isActive', 'permissions']);
    }
}
