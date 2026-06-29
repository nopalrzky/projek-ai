<?php

namespace App\Http\Requests\Outlet\Fine;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class UpdateFineRequest extends FormRequest
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
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],
            'amount' => [
                'sometimes',
                'required',
                'numeric',
                'min:0',
                'max:999999999.99',
            ],
            'description' => [
                'nullable',
                'string',
                'max:1000',
            ],
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
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