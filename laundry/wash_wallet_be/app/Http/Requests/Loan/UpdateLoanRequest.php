<?php

namespace App\Http\Requests\Loan;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;

class UpdateLoanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $user = Auth::user();
        $loanId = $this->route('loan');

        return [
            'employeeId' => ['sometimes', 'integer', 'exists:employees,id'],
            'sourceAccountId' => [
                'sometimes',
                'integer',
                Rule::exists('accounts', 'id')
                    ->where('owner_id', $user->id)
                    ->where('owner_type', get_class($user))
                    ->where('type', 'asset')
                    ->where('is_transactional', true)
            ],
            'amount' => ['sometimes', 'numeric', 'min:1', 'max:999999999.99'],
            'repaymentType' => ['sometimes', 'string', 'in:full,installment'],
            'installmentAmount' => [
                'nullable',
                'numeric',
                'min:1',
                'max:999999999.99',
                'lte:amount'
            ],
            'installmentPeriod' => ['required_if:repaymentType,installment', 'integer', 'min:1'],
            'loanDate' => ['sometimes', 'date', 'before_or_equal:today'],
            'startRepayment' => ['sometimes', 'date'],
            'note' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function attributes(): array
    {
        return [
            'employeeId' => 'karyawan',
            'sourceAccountId' => 'sumber dana',
            'amount' => 'jumlah kasbon',
            'repaymentType' => 'tipe pembayaran',
            'installmentAmount' => 'jumlah cicilan',
            'installmentPeriod' => 'periode cicilan',
            'loanDate' => 'tanggal kasbon',
            'startRepayment' => 'mulai pembayaran',
            'note' => 'catatan',
        ];
    }

    public function messages(): array
    {
        return [
            'employeeId.exists' => 'Karyawan tidak ditemukan.',
            'sourceAccountId.exists' => 'Sumber dana tidak valid atau tidak memiliki akses.',
            'amount.numeric' => 'Jumlah kasbon harus berupa angka.',
            'amount.min' => 'Jumlah kasbon minimal Rp 1.',
            'amount.max' => 'Jumlah kasbon maksimal Rp 999.999.999,99.',
            'repaymentType.in' => 'Tipe pembayaran tidak valid. Pilih: penuh atau cicilan.',
            'installmentAmount.numeric' => 'Jumlah cicilan harus berupa angka.',
            'installmentAmount.min' => 'Jumlah cicilan minimal Rp 1.',
            'installmentAmount.max' => 'Jumlah cicilan maksimal Rp 999.999.999,99.',
            'installmentAmount.lte' => 'Jumlah cicilan tidak boleh lebih besar dari jumlah kasbon.',
            'installmentPeriod.required_if' => 'Periode cicilan harus diisi jika tipe pembayaran cicilan.',
            'installmentPeriod.integer' => 'Periode cicilan harus berupa angka.',
            'installmentPeriod.min' => 'Periode cicilan minimal 1.',
            'loanDate.date' => 'Tanggal kasbon tidak valid.',
            'loanDate.before_or_equal' => 'Tanggal kasbon tidak boleh lebih dari hari ini.',
            'startRepayment.date' => 'Tanggal mulai pembayaran tidak valid.',
            'note.max' => 'Catatan maksimal 1000 karakter.',
        ];
    }

    protected function failedAuthorization(): void
    {
        abort(403, 'Anda tidak memiliki izin untuk mengubah kasbon.');
    }
}
