<?php

namespace App\Http\Requests\Deposit;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class UpdateDepositRequest extends FormRequest
{
  /**
   * Determine if the user is authorized to make this request.
   */
  public function authorize(): bool
  {
    return Auth::check();
  }

  /**
   * Get the validation rules that apply to the request.
   */
  public function rules(): array
  {
    return [
      'destination_account_id' => ['sometimes', 'integer', 'exists:accounts,id'],
      'amount' => ['sometimes', 'numeric', 'min:1'],
      'notes' => ['nullable', 'string', 'max:1000'],
      'attachment' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
    ];
  }

  /**
   * Get custom attributes for validator errors.
   */
  public function attributes(): array
  {
    return [
      'destination_account_id' => 'tujuan setoran',
      'amount' => 'jumlah setoran',
      'notes' => 'keterangan',
      'attachment' => 'bukti setoran',
    ];
  }

  /**
   * Get custom messages for validator errors.
   */
  public function messages(): array
  {
    return [
      'amount.min' => 'Jumlah setoran minimal Rp 1',
      'attachment.mimes' => 'Bukti setoran harus berupa file JPG, PNG, atau PDF',
      'attachment.max' => 'Ukuran bukti setoran maksimal 5MB',
    ];
  }
}
