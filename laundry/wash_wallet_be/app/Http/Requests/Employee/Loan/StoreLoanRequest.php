<?php

namespace App\Http\Requests\Employee\Loan;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class StoreLoanRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'sourceAccountId' => [
        'required',
        'integer',
        Rule::exists('accounts', 'id')
          ->where('owner_id', Auth::id())
          ->where('type', 'asset')
          ->where('is_transactional', true),
      ],
      'amount' => ['required', 'numeric', 'min:1'],
      'installmentAmount' => ['nullable', 'numeric', 'min:0', 'max:' . $this->input('amount')],
      'loanDate' => ['required', 'date'],
      'dueDate' => ['nullable', 'date', 'after_or_equal:loanDate'],
      'note' => ['nullable', 'string', 'max:500'],
    ];
  }

  public function attributes(): array
  {
    return [
      'sourceAccountId' => 'sumber dana',
      'amount' => 'jumlah pinjaman',
      'installmentAmount' => 'jumlah cicilan',
      'loanDate' => 'tanggal pinjaman',
      'dueDate' => 'jatuh tempo',
      'note' => 'catatan',
    ];
  }
}
