<?php

namespace App\Http\Requests\Employee;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class UpdateEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {

        return [
            'positionIds' => [
                'nullable',
                'array'
            ],
            'positionIds.*' => [
                'integer',
                'exists:positions,id'
            ],

            'employeeSalaries' => [
                'nullable',
                'array'
            ],
            'employeeSalaries.*.salaryId' => [
                'required',
                'integer',
                'exists:salaries,id'
            ],
            'employeeSalaries.*.amount' => [
                'required',
                'numeric',
                'min:0'
            ],

            'employeeProcessCommissions' => [
                'nullable',
                'array'
            ],
            'employeeProcessCommissions.*.processId' => [
                'required',
                'integer',
                'exists:processes,id'
            ],
            'employeeProcessCommissions.*.commissionType' => [
                'required',
                'string',
                'in:per_item,per_kg,percentage,flat'
            ],
            'employeeProcessCommissions.*.commissionValue' => [
                'required',
                'numeric',
                'min:0',
                function ($attribute, $value, $fail) {
                    $index = explode('.', $attribute)[1];
                    $commissionType = $this->input("employeeProcessCommissions.{$index}.commissionType");

                    if ($commissionType === 'percentage' && $value > 100) {
                        $fail('Nilai persentase tidak boleh lebih dari 100%.');
                    }
                }
            ],
            'employeeProcessCommissions.*.hasTarget' => [
                'required',
                'boolean'
            ],
            'employeeProcessCommissions.*.targetThreshold' => [
                'nullable',
                'required_if:employeeProcessCommissions.*.hasTarget,true',
                'integer',
                'min:0'
            ],
            'employeeProcessCommissions.*.bonusAmount' => [
                'nullable',
                'required_if:employeeProcessCommissions.*.hasTarget,true',
                'numeric',
                'min:0'
            ],
            'employeeProcessCommissions.*.effectiveDate' => [
                'nullable',
                'date'
            ],
            'employeeProcessCommissions.*.isActive' => [
                'required',
                'boolean'
            ],

            'name' => [
                'required',
                'string',
                'max:255',
                'min:2'
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
            'positionIds.array' => 'Format posisi tidak valid.',
            'positionIds.*.exists' => 'Salah satu posisi yang dipilih tidak valid.',

            'employeeSalaries.array' => 'Format data gaji tidak valid.',
            'employeeSalaries.*.salaryId.required' => 'Jenis gaji wajib dipilih.',
            'employeeSalaries.*.salaryId.exists' => 'Jenis gaji yang dipilih tidak valid.',
            'employeeSalaries.*.status.required' => 'Status gaji wajib dipilih.',
            'employeeSalaries.*.status.in' => 'Status gaji harus aktif atau nonaktif.',
            'employeeSalaries.*.amount.required' => 'Jumlah gaji wajib diisi.',
            'employeeSalaries.*.amount.numeric' => 'Jumlah gaji harus berupa angka.',
            'employeeSalaries.*.amount.min' => 'Jumlah gaji tidak boleh negatif.',

            'employeeProcessCommissions.array' => 'Format data komisi proses tidak valid.',
            'employeeProcessCommissions.*.processId.required' => 'Proses wajib dipilih.',
            'employeeProcessCommissions.*.processId.exists' => 'Proses yang dipilih tidak valid.',
            'employeeProcessCommissions.*.commissionType.required' => 'Tipe komisi wajib dipilih.',
            'employeeProcessCommissions.*.commissionType.in' => 'Tipe komisi harus per_item, per_kg, percentage, atau flat.',
            'employeeProcessCommissions.*.commissionValue.required' => 'Nilai komisi wajib diisi.',
            'employeeProcessCommissions.*.commissionValue.numeric' => 'Nilai komisi harus berupa angka.',
            'employeeProcessCommissions.*.commissionValue.min' => 'Nilai komisi tidak boleh negatif.',
            'employeeProcessCommissions.*.hasTarget.required' => 'Status target wajib diisi.',
            'employeeProcessCommissions.*.hasTarget.boolean' => 'Status target harus ya atau tidak.',
            'employeeProcessCommissions.*.targetThreshold.required_if' => 'Target threshold wajib diisi jika memiliki target.',
            'employeeProcessCommissions.*.targetThreshold.integer' => 'Target threshold harus berupa angka bulat.',
            'employeeProcessCommissions.*.targetThreshold.min' => 'Target threshold tidak boleh negatif.',
            'employeeProcessCommissions.*.bonusAmount.required_if' => 'Bonus amount wajib diisi jika memiliki target.',
            'employeeProcessCommissions.*.bonusAmount.numeric' => 'Bonus amount harus berupa angka.',
            'employeeProcessCommissions.*.bonusAmount.min' => 'Bonus amount tidak boleh negatif.',
            'employeeProcessCommissions.*.effectiveDate.date' => 'Format tanggal efektif tidak valid.',
            'employeeProcessCommissions.*.isActive.required' => 'Status komisi wajib diisi.',
            'employeeProcessCommissions.*.isActive.boolean' => 'Status komisi harus aktif atau nonaktif.',

            'name.required' => 'Nama Karyawan wajib diisi.',
            'name.min' => 'Nama Karyawan minimal 2 karakter.',
            'name.max' => 'Nama Karyawan maksimal 255 karakter.',

            'avatar.file' => 'Avatar harus berupa file.',
            'avatar.image' => 'Avatar harus berupa gambar.',
            'avatar.mimes' => 'Avatar harus berformat JPEG, JPG, PNG, atau WEBP.',
            'avatar.max' => 'Ukuran avatar maksimal 2MB.',
            'phone.regex' => 'Format nomor telepon tidak valid.',
            'phone.max' => 'Nomor telepon maksimal 20 karakter.',
            'address.max' => 'Alamat maksimal 500 karakter.',
            'gender.in' => 'Jenis kelamin harus Pria atau Wanita.',
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
            'outletId' => 'outlet',
            'positionIds' => 'posisi',
            'employeeSalaries' => 'gaji karyawan',
            'employeeSalaries.*.salaryId' => 'jenis gaji',
            'employeeSalaries.*.status' => 'status gaji',
            'employeeSalaries.*.amount' => 'jumlah gaji',
            'employeeProcessCommissions' => 'komisi proses karyawan',
            'employeeProcessCommissions.*.processId' => 'proses',
            'employeeProcessCommissions.*.commissionType' => 'tipe komisi',
            'employeeProcessCommissions.*.commissionValue' => 'nilai komisi',
            'employeeProcessCommissions.*.hasTarget' => 'memiliki target',
            'employeeProcessCommissions.*.targetThreshold' => 'target threshold',
            'employeeProcessCommissions.*.bonusAmount' => 'bonus amount',
            'employeeProcessCommissions.*.effectiveDate' => 'tanggal efektif',
            'employeeProcessCommissions.*.isActive' => 'status komisi',
            'name' => 'nama Karyawan',
            'avatar' => 'foto profil',
            'phone' => 'nomor telepon',
            'address' => 'alamat',
            'gender' => 'jenis kelamin',
            'startDate' => 'tanggal mulai',
            'isActive' => 'status aktif',
            'cutoffDays' => 'hari cutoff'
        ];
    }

    protected function failedValidation(\Illuminate\Contracts\Validation\Validator $validator)
    {
        Log::warning('Employee update validation failed', [
            'errors' => $validator->errors()->toArray(),
            'employee_id' => $this->route('employee'),
            'user_id' => Auth::id(),
        ]);

        parent::failedValidation($validator);
    }
}
