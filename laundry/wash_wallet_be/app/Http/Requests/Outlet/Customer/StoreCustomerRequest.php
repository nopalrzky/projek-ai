<?php

namespace App\Http\Requests\Outlet\Customer;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCustomerRequest extends FormRequest
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
            'name' => [
                'required',
                'string',
                'max:255',
                'min:2',
            ],
            'email' => [
                'nullable',
                'email',
                'max:255',
            ],
            'phone' => [
                'nullable',
                'string',
                'max:20',
                'regex:/^[0-9+\-\s()]+$/',
            ],
            'address' => [
                'nullable',
                'string',
                'max:500'
            ],
            'gender' => [
                'nullable',
                'in:male,female',
            ],
            'isActive' => 'boolean',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama pelanggan wajib diisi.',
            'name.min' => 'Nama pelanggan minimal 2 karakter.',
            'name.max' => 'Nama pelanggan maksimal 255 karakter.',
            'email.email' => 'Format email tidak valid.',
            'phone.regex' => 'Format nomor telepon tidak valid.',
            'phone.unique' => 'Nomor telepon sudah digunakan pelanggan lain di outlet ini.',
            'gender.in' => 'Jenis kelamin harus salah satu dari: pria, wanita.',
            'address.max' => 'Alamat maksimal 500 karakter.',
            'notes.max' => 'Catatan maksimal 1000 karakter.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'name' => 'nama pelanggan',
            'email' => 'email',
            'phone' => 'nomor telepon',
            'gender' => 'jenis kelamin',
            'address' => 'alamat',
            'isActive' => 'status aktif',
        ];
    }
}
