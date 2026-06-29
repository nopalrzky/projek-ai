<?php

namespace App\Http\Requests\FineLog;

use Illuminate\Foundation\Http\FormRequest;

class StoreFineLogRequest extends FormRequest
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
      'outletId' => ['required', 'integer', 'exists:outlets,id'],
      'employeeId' => ['required', 'integer', 'exists:employees,id'],
      'fineId' => ['required', 'integer', 'exists:fines,id'],
      'date' => ['required', 'date', 'before_or_equal:today'],
      'amount' => ['required', 'numeric', 'min:0.01', 'max:999999999.99'],
      'reason' => ['nullable', 'string', 'max:1000'],
      'attachment' => [
        'nullable',
        'file',
        'mimes:jpg,jpeg,png,pdf,webp,gif',
        'max:5120',
      ],
    ];
  }

  /**
   * Get custom attributes for validator errors.
   */
  public function attributes(): array
  {
    return [
      'outletId' => 'outlet',
      'employeeId' => 'karyawan',
      'fineId' => 'jenis denda',
      'date' => 'tanggal kejadian',
      'amount' => 'jumlah denda',
      'reason' => 'alasan',
      'attachment' => 'lampiran',
    ];
  }

  /**
   * Get custom messages for validator errors.
   */
  public function messages(): array
  {
    return [
      'outletId.required' => 'Outlet harus dipilih.',
      'outletId.exists' => 'Outlet yang dipilih tidak valid.',
      'employeeId.required' => 'Karyawan harus dipilih.',
      'employeeId.exists' => 'Karyawan yang dipilih tidak valid.',
      'fineId.required' => 'Jenis denda harus dipilih.',
      'fineId.exists' => 'Jenis denda yang dipilih tidak valid.',
      'date.required' => 'Tanggal kejadian harus diisi.',
      'date.before_or_equal' => 'Tanggal kejadian tidak boleh di masa depan.',
      'amount.required' => 'Jumlah denda harus diisi.',
      'amount.numeric' => 'Jumlah denda harus berupa angka.',
      'amount.min' => 'Jumlah denda minimal Rp 0,01.',
      'amount.max' => 'Jumlah denda maksimal Rp 999.999.999,99.',
      'reason.max' => 'Alasan maksimal 1000 karakter.',
      'attachment.file' => 'Lampiran harus berupa file.',
      'attachment.mimes' => 'Lampiran harus berformat: JPG, PNG, PDF, WEBP, atau GIF.',
      'attachment.max' => 'Ukuran lampiran maksimal 5MB.',
    ];
  }
}
