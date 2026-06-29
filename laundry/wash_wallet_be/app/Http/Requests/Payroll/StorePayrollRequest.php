<?php

namespace App\Http\Requests\Payroll;

use Illuminate\Foundation\Http\FormRequest;

class StorePayrollRequest extends FormRequest
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
            'outletId' => 'required|integer|exists:outlets,id',
            'bankAccountId' => 'required|integer|exists:accounts,id',
            'paymentMethod' => 'required|in:transfer,cash,check',
            'paymentDate' => 'required|date|before_or_equal:today',
            'month' => 'required|integer|between:1,12',
            'year' => 'required|integer|min:2020',
            'note' => 'nullable|string|max:1000',
            'attachment' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'items' => 'required|array|min:1',
            'items.*.employeeId' => 'required|integer|exists:employees,id',
            'items.*.baseSalary' => 'required|numeric|min:0',
            'items.*.totalAllowance' => 'required|numeric|min:0',
            'items.*.totalCommission' => 'required|numeric|min:0',
            'items.*.totalOvertimeAllowance' => 'required|numeric|min:0',
            'items.*.totalFine' => 'required|numeric|min:0',
            'items.*.totalLoanDeduction' => 'required|numeric|min:0',
            'items.*.netSalary' => 'required|numeric',
            'items.*.loanId' => 'nullable|integer|exists:loans,id',
            'items.*.loanDeductionAmount' => 'required|numeric|min:0',
            'items.*.commissionLogIds' => 'nullable|array',
            'items.*.commissionLogIds.*' => 'integer|exists:work_logs,id',
            'items.*.fineLogIds' => 'nullable|array',
            'items.*.fineLogIds.*' => 'integer|exists:fine_logs,id',
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
            'outletId' => 'outlet',
            'bankAccountId' => 'sumber dana',
            'paymentMethod' => 'metode pembayaran',
            'paymentDate' => 'tanggal pembayaran',
            'month' => 'bulan',
            'year' => 'tahun',
            'note' => 'catatan',
            'attachment' => 'bukti transfer',
            'items' => 'data karyawan',
            'items.*.employeeId' => 'karyawan',
            'items.*.baseSalary' => 'gaji pokok',
            'items.*.totalAllowance' => 'total tunjangan',
            'items.*.totalCommission' => 'total komisi',
            'items.*.totalOvertimeAllowance' => 'total lembur',
            'items.*.totalFine' => 'total denda',
            'items.*.totalLoanDeduction' => 'total potongan kasbon',
            'items.*.netSalary' => 'gaji bersih',
            'items.*.loanId' => 'ID kasbon',
            'items.*.loanDeductionAmount' => 'jumlah potongan kasbon',
            'items.*.commissionLogIds' => 'ID log komisi',
            'items.*.fineLogIds' => 'ID log denda',
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
            'outletId.required' => 'Outlet harus dipilih',
            'outletId.exists' => 'Outlet tidak valid',
            'bankAccountId.required' => 'Sumber dana harus dipilih',
            'bankAccountId.exists' => 'Sumber dana tidak valid',
            'paymentMethod.required' => 'Metode pembayaran harus dipilih',
            'paymentMethod.in' => 'Metode pembayaran tidak valid',
            'paymentDate.required' => 'Tanggal pembayaran harus diisi',
            'paymentDate.date' => 'Tanggal pembayaran tidak valid',
            'paymentDate.before_or_equal' => 'Tanggal pembayaran tidak boleh melebihi hari ini',
            'attachment.file' => 'Bukti transfer harus berupa file',
            'attachment.mimes' => 'Bukti transfer harus berformat JPG, JPEG, PNG, atau PDF',
            'attachment.max' => 'Ukuran bukti transfer maksimal 5MB',
            'items.required' => 'Data karyawan harus diisi',
            'items.array' => 'Data karyawan tidak valid',
            'items.min' => 'Minimal harus ada 1 karyawan',
        ];
    }
}
