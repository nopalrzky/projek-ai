<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $customerId = $this->route('customer');
        $outletId = $this->input('outletId');

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                'min:2',
            ],
            'outletId' => [
                'required',
                'integer',
                'exists:outlets,id',
            ],
            'email' => [
                'nullable',
                'email',
                'max:255',
                Rule::unique('customers', 'email')
                    ->where('outlet_id', $outletId)
                    ->ignore($customerId)
                    ->whereNull('deleted_at'),
            ],
            'phone' => [
                'nullable',
                'string',
                'max:20',
                'regex:/^[0-9+\-\s()]+$/',
                Rule::unique('customers', 'phone')
                    ->where('outlet_id', $outletId)
                    ->ignore($customerId)
                    ->whereNull('deleted_at'),
            ],
            'gender' => [
                'nullable',
                'string',
                'in:male,female',
            ],
            'address' => [
                'nullable',
                'string',
                'max:500',
            ],
            'isActive' => [
                'required',
                'boolean',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama pelanggan wajib diisi.',
            'name.min' => 'Nama pelanggan minimal 2 karakter.',
            'name.max' => 'Nama pelanggan maksimal 255 karakter.',
            'outletId.required' => 'Outlet wajib dipilih.',
            'outletId.integer' => 'Outlet tidak valid.',
            'outletId.exists' => 'Outlet yang dipilih tidak ditemukan.',
            'email.email' => 'Format email tidak valid.',
            'email.max' => 'Email maksimal 255 karakter.',
            'email.unique' => 'Email sudah digunakan pelanggan lain di outlet ini.',
            'phone.regex' => 'Format nomor telepon tidak valid. Gunakan angka, +, -, spasi, atau tanda kurung.',
            'phone.max' => 'Nomor telepon maksimal 20 karakter.',
            'phone.unique' => 'Nomor telepon sudah digunakan pelanggan lain di outlet ini.',
            'gender.in' => 'Jenis kelamin harus salah satu dari: Laki-laki, Perempuan.',
            'address.max' => 'Alamat lengkap maksimal 500 karakter.',
            'isActive.required' => 'Status aktif wajib ditentukan.',
            'isActive.boolean' => 'Status aktif harus berupa true atau false.',
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => 'nama pelanggan',
            'outletId' => 'outlet',
            'email' => 'email',
            'phone' => 'nomor telepon',
            'gender' => 'jenis kelamin',
            'address' => 'alamat',
            'isActive' => 'status aktif',
        ];
    }

    protected function failedAuthorization(): void
    {
        abort(403, 'Anda tidak memiliki izin untuk memperbarui pelanggan.');
    }
}
