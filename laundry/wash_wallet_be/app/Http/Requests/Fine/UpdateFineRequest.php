<?php

namespace App\Http\Requests\Fine;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFineRequest extends FormRequest
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
            //
            'outletId' => ['required', 'integer', 'exists:outlets,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'amount' => ['required', 'numeric', 'min:0', 'max:999999999.99'],
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'outletId' => 'outlet',
            'name' => 'nama denda',
            'amount' => 'jumlah denda',
            'description' => 'deskripsi',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'outletId.required' => ':attribute wajib diisi.',
            'outletId.exists' => ':attribute tidak valid.',

            'name.required' => ':attribute wajib diisi.',
            'name.string' => ':attribute harus berupa teks.',
            'name.max' => ':attribute maksimal :max karakter.',

            'amount.required' => ':attribute wajib diisi.',
            'amount.numeric' => ':attribute harus berupa angka.',
            'amount.min' => ':attribute minimal :min.',
            'amount.max' => ':attribute maksimal :max.',

            'description.string' => ':attribute harus berupa teks.',
            'description.max' => ':attribute maksimal :max karakter.',
        ];
    }
}
