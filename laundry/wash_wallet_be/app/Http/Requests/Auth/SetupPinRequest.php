<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class SetupPinRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'pin' => ['required', 'string', 'numeric', 'digits:6'],
            'pin_confirmation' => ['required', 'string', 'same:pin'],
        ];
    }

    public function messages(): array
    {
        return [
            'pin.required' => 'PIN wajib diisi',
            'pin.numeric' => 'PIN harus berupa angka',
            'pin.digits' => 'PIN harus terdiri dari 6 digit',
            'pin_confirmation.required' => 'Konfirmasi PIN wajib diisi',
            'pin_confirmation.same' => 'Konfirmasi PIN tidak cocok',
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
