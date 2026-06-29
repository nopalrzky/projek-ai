<?php

namespace App\Http\Requests\LaundryService\LaundryServiceProcess;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLaundryServiceProcessRequest extends FormRequest
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
            'processId' => [
                'nullable',
                'integer',
                'exists:processes,id',
            ],
            'sequence' => [
                'nullable',
                'integer',
                'min:1',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'processId.integer' => 'Process ID must be an integer.',
            'processId.exists' => 'Selected process does not exist.',
            'sequence.integer' => 'Sequence must be an integer.',
            'sequence.min' => 'Sequence must be at least 1.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'processId' => 'process',
            'sequence' => 'sequence order',
        ];
    }
}
