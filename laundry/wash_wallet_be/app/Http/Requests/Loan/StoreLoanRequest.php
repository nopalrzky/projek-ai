<?php

namespace App\Http\Requests\Loan;

use Illuminate\Foundation\Http\FormRequest;

class StoreLoanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'outletId' => ['required', 'integer', 'exists:outlets,id'],
            'employeeId' => ['required', 'integer', 'exists:employees,id'],
            'sourceAccountId' => [
                'required',
                'integer',
                'exists:accounts,id',
            ],
            'amount' => ['required', 'numeric', 'min:1', 'max:999999999.99'],
            'repaymentType' => ['required', 'string', 'in:full,installment'],
            'installmentMode' => ['required_if:repaymentType,installment', 'nullable', 'string', 'in:auto,custom'],
            'installmentPeriod' => [
                'nullable',
                'integer',
                'min:1',
                'max:120',
                'required_if:repaymentType,installment',
            ],
            'installmentSchedule' => [
                'nullable',
                'array',
                'required_if:installmentMode,custom',
            ],
            'installmentSchedule.*.month' => ['required_with:installmentSchedule', 'integer', 'min:1', 'max:12'],
            'installmentSchedule.*.year'  => ['required_with:installmentSchedule', 'integer', 'min:2020', 'max:2099'],
            'installmentSchedule.*.amount' => ['required_with:installmentSchedule', 'numeric', 'min:1'],
            'loanDate' => ['nullable', 'date', 'before_or_equal:today'],
            'dueDate' => ['required', 'date', 'after_or_equal:loanDate'],
            'note' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            if ($this->repaymentType === 'installment' && $this->installmentMode === 'custom') {
                $schedule = $this->installmentSchedule ?? [];
                $period = (int) $this->installmentPeriod;
                $amount = (float) $this->amount;

                if (count($schedule) !== $period) {
                    $validator->errors()->add('installmentSchedule', "Jumlah jadwal cicilan (" . count($schedule) . ") harus sama dengan periode cicilan ({$period}).");
                }

                $totalScheduled = array_sum(array_column($schedule, 'amount'));
                if (abs($totalScheduled - $amount) > 0.01) {
                    $validator->errors()->add('installmentSchedule', "Total jadwal cicilan (Rp " . number_format($totalScheduled, 0, ',', '.') . ") harus sama dengan jumlah kasbon (Rp " . number_format($amount, 0, ',', '.') . "). Selisih: Rp " . number_format($amount - $totalScheduled, 0, ',', '.') . ".");
                }

                $periods = [];
                foreach ($schedule as $index => $item) {
                    $key = "{$item['year']}-{$item['month']}";
                    if (isset($periods[$key])) {
                        $validator->errors()->add("installmentSchedule.{$index}", "Bulan dan tahun pada baris ke-" . ($index + 1) . " duplikat.");
                    }
                    $periods[$key] = true;
                }
            }
        });
    }

    public function attributes(): array
    {
        return [
            'outletId' => 'outlet',
            'employeeId' => 'karyawan',
            'sourceAccountId' => 'sumber dana',
            'amount' => 'jumlah kasbon',
            'repaymentType' => 'tipe pembayaran',
            'installmentMode' => 'mode cicilan',
            'installmentAmount' => 'jumlah cicilan',
            'installmentPeriod' => 'periode cicilan',
            'installmentSchedule' => 'jadwal cicilan',
            'loanDate' => 'tanggal kasbon',
            'dueDate' => 'tanggal jatuh tempo',
            'note' => 'catatan',
        ];
    }

    public function messages(): array
    {
        return [
            'outletId.required' => 'Outlet harus dipilih.',
            'outletId.exists' => 'Outlet tidak ditemukan.',
            'employeeId.required' => 'Karyawan harus dipilih.',
            'employeeId.exists' => 'Karyawan tidak ditemukan.',
            'sourceAccountId.required' => 'Sumber dana harus dipilih.',
            'sourceAccountId.exists' => 'Sumber dana tidak ditemukan atau tidak valid.',
            'amount.required' => 'Jumlah kasbon harus diisi.',
            'amount.numeric' => 'Jumlah kasbon harus berupa angka.',
            'amount.min' => 'Jumlah kasbon minimal Rp 1.',
            'amount.max' => 'Jumlah kasbon maksimal Rp 999.999.999,99.',
            'repaymentType.required' => 'Tipe pembayaran harus dipilih.',
            'repaymentType.in' => 'Tipe pembayaran tidak valid. Pilih: full atau installment.',
            'installmentMode.required_if' => 'Mode cicilan harus dipilih jika tipe pembayaran cicilan.',
            'installmentAmount.required_if' => 'Jumlah cicilan harus diisi jika tipe pembayaran cicilan.',
            'installmentAmount.numeric' => 'Jumlah cicilan harus berupa angka.',
            'installmentAmount.min' => 'Jumlah cicilan minimal Rp 1.',
            'installmentAmount.max' => 'Jumlah cicilan maksimal Rp 999.999.999,99.',
            'installmentAmount.lte' => 'Jumlah cicilan tidak boleh lebih besar dari jumlah kasbon.',
            'installmentPeriod.required_if' => 'Periode cicilan harus diisi jika tipe pembayaran cicilan.',
            'installmentPeriod.integer' => 'Periode cicilan harus berupa angka.',
            'installmentPeriod.min' => 'Periode cicilan minimal 1 bulan.',
            'installmentPeriod.max' => 'Periode cicilan maksimal 120 bulan.',
            'installmentSchedule.required_if' => 'Jadwal cicilan harus diisi jika menggunakan mode kustom.',
            'loanDate.date' => 'Tanggal kasbon tidak valid.',
            'loanDate.before_or_equal' => 'Tanggal kasbon tidak boleh lebih dari hari ini.',
            'dueDate.required' => 'Tanggal jatuh tempo harus diisi.',
            'dueDate.date' => 'Tanggal jatuh tempo tidak valid.',
            'dueDate.after_or_equal' => 'Tanggal jatuh tempo tidak boleh sebelum tanggal kasbon.',
            'note.max' => 'Catatan maksimal 1000 karakter.',
        ];
    }

    protected function failedAuthorization(): void
    {
        abort(403, 'Anda tidak memiliki izin untuk membuat kasbon.');
    }
}
