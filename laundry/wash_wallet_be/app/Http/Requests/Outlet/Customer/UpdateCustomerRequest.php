<?php

namespace App\Http\Requests\Outlet\Customer;

use Illuminate\Foundation\Http\FormRequest;


class UpdateCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
                'min:2'
            ],
            'email' => [
                'nullable',
                'email',
                'max:255'
            ],
            'phone' => [
                'nullable',
                'string',
                'max:20',
                'regex:/^[0-9+\-\s()]+$/'
            ],
            'gender' => [
                'nullable',
                'string',
                'in:male,female'
            ],
            'address' => [
                'nullable',
                'string',
                'max:500'
            ]
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama pelanggan wajib diisi.',
            'name.min' => 'Nama pelanggan minimal 2 karakter.',
            'name.max' => 'Nama pelanggan maksimal 255 karakter.',
            'email.email' => 'Format email tidak valid.',
            'phone.regex' => 'Format nomor telepon tidak valid.',
            'gender.in' => 'Jenis kelamin harus Pria atau Wanita.',
            'address.max' => 'Alamat maksimal 500 karakter.',
        ];
    }
}
