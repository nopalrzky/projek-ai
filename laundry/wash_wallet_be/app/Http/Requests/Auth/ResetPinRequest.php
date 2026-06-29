<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class ResetPinRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'current_pin'      => ['required', 'string', 'numeric', 'digits:6'],
            'pin'              => ['required', 'string', 'numeric', 'digits:6'],
            'pin_confirmation' => ['required', 'string', 'same:pin'],
        ];
    }

    public function messages(): array
    {
        return [
            'current_pin.required'  => 'PIN saat ini wajib diisi',
            'current_pin.numeric'   => 'PIN saat ini harus berupa angka',
            'current_pin.digits'    => 'PIN saat ini harus terdiri dari 6 digit',
            'pin.required'          => 'PIN baru wajib diisi',
            'pin.numeric'           => 'PIN baru harus berupa angka',
            'pin.digits'            => 'PIN baru harus terdiri dari 6 digit',
            'pin_confirmation.same' => 'Konfirmasi PIN baru tidak cocok',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422)
        );
    }
}
