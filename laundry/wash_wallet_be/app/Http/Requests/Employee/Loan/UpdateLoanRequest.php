<?php

namespace App\Http\Requests\Employee\Loan;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateLoanRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'installmentAmount' => ['nullable', 'numeric', 'min:0'],
      'loanDate' => ['required', 'date'],
      'dueDate' => ['nullable', 'date', 'after_or_equal:loanDate'],
      'status' => ['required', 'string', Rule::in(['ongoing', 'paid', 'bad_debt'])],
      'note' => ['nullable', 'string', 'max:500'],
    ];
  }

  public function attributes(): array
  {
    return [
      'installmentAmount' => 'jumlah cicilan',
      'loanDate' => 'tanggal pinjaman',
      'dueDate' => 'jatuh tempo',
      'status' => 'status',
      'note' => 'catatan',
    ];
  }
}
