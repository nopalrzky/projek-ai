<?php

namespace App\Http\Requests\Profile;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'name' => ['sometimes', 'required', 'string', 'max:255'],
      'phone' => ['sometimes', 'nullable', 'string', 'max:20'],
      'address' => ['sometimes', 'nullable', 'string', 'max:500'],
      'avatar' => ['sometimes', 'nullable', 'string', 'max:255'],
    ];
  }

  public function messages(): array
  {
    return [
      'name.required' => 'Nama harus diisi',
      'name.string' => 'Nama harus berupa teks',
      'name.max' => 'Nama maksimal 255 karakter',
      'phone.string' => 'Nomor telepon harus berupa teks',
      'phone.max' => 'Nomor telepon maksimal 20 karakter',
      'address.string' => 'Alamat harus berupa teks',
      'address.max' => 'Alamat maksimal 500 karakter',
      'avatar.string' => 'Avatar harus berupa teks',
      'avatar.max' => 'Avatar maksimal 255 karakter',
    ];
  }
}
