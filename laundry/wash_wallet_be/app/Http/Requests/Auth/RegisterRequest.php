<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
  /**
   * Determine if the user is authorized to make this request.
   */
  public function authorize(): bool
  {
    return true;
  }

  /**
   * Get the validation rules that apply to the request.
   *
   * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
   */
  public function rules(): array
  {
    return [
      'username' => 'nullable|string|max:50|unique:users,username',
      'name' => 'required|string|max:100',
      'email' => 'required|email|max:255|unique:users,email',
      'address' => 'nullable|string|max:255',
      'phone' => 'required|string|max:20|unique:users,phone',
      'password' => 'required|string|min:8|confirm  ed',
      'referralCode' => 'nullable|string|size:8',
    ];
  }

  /**
   * Get custom messages for validator errors.
   *
   * @return array<string, string>
   */
  public function messages(): array
  {
    return [
      'username.unique' => 'Username sudah digunakan.',
      'name.required' => 'Nama lengkap wajib diisi.',
      'name.max' => 'Nama lengkap maksimal 100 karakter.',
      'email.required' => 'Email wajib diisi.',
      'email.email' => 'Format email tidak valid.',
      'email.unique' => 'Email sudah terdaftar.',
      'phone.required' => 'Nomor HP wajib diisi.',
      'phone.unique' => 'Nomor HP sudah terdaftar.',
      'address.max' => 'Alamat maksimal 255 karakter.',
      'password.required' => 'Password wajib diisi.',
      'password.min' => 'Password minimal 8 karakter.',
      'password.confirmed' => 'Konfirmasi password tidak cocok.',
      'referralCode.size' => 'Kode referral harus 8 karakter.',
    ];
  }

  /**
   * Get custom attributes for validator errors.
   *
   * @return array<string, string>
   */
  public function attributes(): array
  {
    return [
      'username' => 'username',
      'name' => 'nama lengkap',
      'email' => 'email',
      'phone' => 'nomor HP',
      'password' => 'password',
      'address' => 'alamat',
      'referralCode' => 'kode referral',
    ];
  }
}
