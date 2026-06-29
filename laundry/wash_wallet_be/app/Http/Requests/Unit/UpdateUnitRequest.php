<?php

namespace App\Http\Requests\Unit;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUnitRequest extends FormRequest
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
        $unitId = $this->route('unit') ?? $this->route('id');

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                'min:2',
                Rule::unique('units', 'name')
                    ->ignore($unitId)
                    ->whereNull('deleted_at')
            ],
            'symbol' => [
                'required',
                'string',
                'max:10',
                'min:1',
                Rule::unique('units', 'symbol')
                    ->ignore($unitId)
                    ->whereNull('deleted_at')
            ],
            'description' => [
                'nullable',
                'string',
                'max:500'
            ],
            'is_active' => [
                'boolean'
            ]
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama unit wajib diisi.',
            'name.unique' => 'Nama unit sudah digunakan.',
            'name.min' => 'Nama unit minimal 2 karakter.',
            'name.max' => 'Nama unit maksimal 255 karakter.',
            'symbol.required' => 'Symbol unit wajib diisi.',
            'symbol.unique' => 'Symbol unit sudah digunakan.',
            'symbol.min' => 'Symbol unit minimal 1 karakter.',
            'symbol.max' => 'Symbol unit maksimal 10 karakter.',
            'description.max' => 'Deskripsi maksimal 500 karakter.',
            'is_active.boolean' => 'Status unit tidak valid.'
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'name' => 'nama unit',
            'symbol' => 'symbol unit',
            'description' => 'deskripsi',
            'is_active' => 'status unit'
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->name) {
            $this->merge(['name' => trim($this->name)]);
        }

        // Trim and uppercase symbol
        if ($this->symbol) {
            $this->merge(['symbol' => strtoupper(trim($this->symbol))]);
        }

        // Trim description
        if ($this->description) {
            $this->merge(['description' => trim($this->description)]);
        }

        // Ensure is_active is boolean
        $this->merge([
            'is_active' => $this->boolean('is_active', true)
        ]);
    }

    /**
     * Handle a failed authorization attempt.
     */
    protected function failedAuthorization(): void
    {
        abort(403, 'You do not have permission to update units.');
    }

    /**
     * Get the validated data from the request with proper naming.
     */
    public function validated($key = null, $default = null)
    {
        $validated = parent::validated($key, $default);

        // Convert back to camelCase for service layer
        if (isset($validated['is_active'])) {
            $validated['isActive'] = $validated['is_active'];
            unset($validated['is_active']);
        }

        return $validated;
    }
}
