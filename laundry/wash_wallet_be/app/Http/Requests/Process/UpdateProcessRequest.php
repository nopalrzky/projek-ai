<?php

namespace App\Http\Requests\Process;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProcessRequest extends FormRequest
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
        $processId = $this->route('process');

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('processes', 'name')->ignore($processId),
            ],
            'description' => 'nullable|string|max:1000',
            'isActive' => 'nullable|boolean',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Process name is required.',
            'name.max' => 'Process name cannot exceed 255 characters.',
            'name.unique' => 'A process with this name already exists.',
            'description.max' => 'Description cannot exceed 1000 characters.',
            'isActive.boolean' => 'Status must be true or false.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'isActive' => 'status',
            'name' => 'process name',
            'description' => 'description',
        ];
    }
}
