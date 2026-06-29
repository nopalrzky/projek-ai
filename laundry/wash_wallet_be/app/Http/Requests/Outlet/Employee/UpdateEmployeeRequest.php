<?php

namespace App\Http\Requests\Outlet\Employee;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $employeeId = $this->route('employee');

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                'min:2'
            ],
            'username' => [
                'required',
                'string',
                'max:50',
                'min:3',
                'regex:/^[a-zA-Z0-9_.-]+$/',
                Rule::unique('employees', 'username')
                    ->ignore($employeeId)
                    ->whereNull('deleted_at')
            ],
            'avatar' => [
                'nullable',
                'file',
                'image',
                'mimes:jpeg,jpg,png,webp',
                'max:2048',
            ],
            'phone' => [
                'nullable',
                'string',
                'max:20',
                'regex:/^[0-9+\-\s()]+$/'
            ],
            'address' => [
                'nullable',
                'string',
                'max:500'
            ],
            'gender' => [
                'nullable',
                'string',
                'in:male,female'
            ],
            'birthDate' => [
                'nullable',
                'date',
                'before:today'
            ],
            'startDate' => [
                'required',
                'date',
                'before_or_equal:today'
            ],
            'isActive' => [
                'boolean'
            ],
            'cutoffDays' => [
                'required',
                'integer',
                'min:1',
                'max:365'
            ]
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama Karyawan wajib diisi.',
            'name.min' => 'Nama Karyawan minimal 2 karakter.',
            'name.max' => 'Nama Karyawan maksimal 255 karakter.',
            'username.required' => 'Username wajib diisi.',
            'username.min' => 'Username minimal 3 karakter.',
            'username.max' => 'Username maksimal 50 karakter.',
            'username.regex' => 'Username hanya boleh mengandung huruf, angka, titik, strip, dan underscore.',
            'username.unique' => 'Username sudah digunakan.',
            'avatar.file' => 'Avatar harus berupa file.',
            'avatar.image' => 'Avatar harus berupa gambar.',
            'avatar.mimes' => 'Avatar harus berformat JPEG, JPG, PNG, atau WEBP.',
            'avatar.max' => 'Ukuran avatar maksimal 2MB.',
            'phone.regex' => 'Format nomor telepon tidak valid.',
            'phone.max' => 'Nomor telepon maksimal 20 karakter.',
            'address.max' => 'Alamat maksimal 500 karakter.',
            'gender.in' => 'Jenis kelamin harus Pria atau Wanita.',
            'birthDate.date' => 'Format tanggal lahir tidak valid.',
            'birthDate.before' => 'Tanggal lahir harus sebelum hari ini.',
            'startDate.required' => 'Tanggal mulai kerja wajib diisi.',
            'startDate.date' => 'Format tanggal mulai tidak valid.',
            'startDate.before_or_equal' => 'Tanggal mulai tidak boleh lebih dari hari ini.',
            'cutoffDays.required' => 'Hari cutoff wajib diisi.',
            'cutoffDays.integer' => 'Hari cutoff harus berupa angka.',
            'cutoffDays.min' => 'Hari cutoff minimal 1 hari.',
            'cutoffDays.max' => 'Hari cutoff maksimal 365 hari.',
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => 'nama Karyawan',
            'username' => 'username',
            'avatar' => 'foto profil',
            'phone' => 'nomor telepon',
            'address' => 'alamat',
            'gender' => 'jenis kelamin',
            'birthDate' => 'tanggal lahir',
            'startDate' => 'tanggal mulai',
            'isActive' => 'status aktif',
            'cutoffDays' => 'hari cutoff'
        ];
    }
}
