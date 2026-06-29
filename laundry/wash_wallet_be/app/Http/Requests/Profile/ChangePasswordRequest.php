<?php

namespace App\Http\Requests\Profile;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class ChangePasswordRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'current_password' => ['required', 'current_password'],
      'password' => ['required', 'confirmed', Password::defaults()],
    ];
  }

  public function messages(): array
  {
    return [
      'current_password.required' => 'Password saat ini harus diisi',
      'current_password.current_password' => 'Password saat ini tidak sesuai',
      'password.required' => 'Password baru harus diisi',
      'password.confirmed' => 'Konfirmasi password tidak sesuai',
    ];
  }
}
