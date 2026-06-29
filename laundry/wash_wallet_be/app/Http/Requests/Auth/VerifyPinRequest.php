<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class VerifyPinRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'employee_id' => ['required_without:username', 'integer'],
            'username' => ['required_without:employee_id', 'string'],
            'pin' => ['required', 'string', 'numeric', 'digits:6'],
            'device_name' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'employee_id.required_without' => 'Employee ID atau username wajib diisi',
            'username.required_without' => 'Username atau employee ID wajib diisi',
            'pin.required' => 'PIN wajib diisi',
            'pin.numeric' => 'PIN harus berupa angka',
            'pin.digits' => 'PIN harus terdiri dari 6 digit',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422)
        );
    }
}
