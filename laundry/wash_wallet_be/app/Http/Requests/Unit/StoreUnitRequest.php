<?php

namespace App\Http\Requests\Unit;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUnitRequest extends FormRequest
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
        return [
            'name' => [
                'required',
                'string',
                'max:255',
                'min:2',
                Rule::unique('units', 'name')->whereNull('deleted_at')
            ],
            'symbol' => [
                'required',
                'string',
                'max:10',
                'min:1',
                Rule::unique('units', 'symbol')->whereNull('deleted_at')
            ],
            'description' => [
                'nullable',
                'string',
                'max:500'
            ],
            'isActive' => [
                'sometimes',
                'boolean'
            ],

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
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Trim and normalize name
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
    }

    /**
     * Handle a failed authorization attempt.
     */
    protected function failedAuthorization(): void
    {
        abort(403, 'You do not have permission to create units.');
    }
}
