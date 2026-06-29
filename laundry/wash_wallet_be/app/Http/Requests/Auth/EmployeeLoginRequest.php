<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class EmployeeLoginRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'username' => ['required', 'string'],
      'password' => ['required', 'string'],
      'deviceName' => ['nullable', 'string'],
    ];
  }

  public function messages(): array
  {
    return [
      'username.required' => 'Username is required',
      'username.string' => 'Username must be a string',
      'password.required' => 'Password is required',
      'password.string' => 'Password must be a string',
      'device_name.string' => 'Device name must be a string',
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
