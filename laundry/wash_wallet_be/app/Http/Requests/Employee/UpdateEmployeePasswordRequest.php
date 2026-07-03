<?php

namespace App\Http\Requests\Employee;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class UpdateEmployeePasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'password' => [
                'required',
                'string',
                'min:8',
                'regex:/[a-z]/',
                'regex:/[A-Z]/',
            ],
            'passwordConfirmation' => [
                'required',
                'same:password',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'password.required' => 'Password wajib diisi.',
            'password.min' => 'Password minimal 8 karakter.',
            'password.regex' => 'Password harus mengandung kombinasi huruf besar, huruf kecil.',
            'passwordConfirmation.required' => 'Konfirmasi password wajib diisi.',
            'passwordConfirmation.same' => 'Konfirmasi password harus sama dengan password.',
        ];
    }

    public function attributes(): array
    {
        return [
            'password' => 'password',
            'passwordConfirmation' => 'konfirmasi password',
        ];
    }

    protected function failedValidation(\Illuminate\Contracts\Validation\Validator $validator)
    {
        Log::warning('Employee password update validation failed', [
            'errors' => $validator->errors()->toArray(),
            'employee_id' => $this->route('employee'),
            'user_id' => Auth::id(),
        ]);

        parent::failedValidation($validator);
    }
}
