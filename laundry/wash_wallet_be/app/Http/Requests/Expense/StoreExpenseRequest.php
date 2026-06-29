<?php

namespace App\Http\Requests\Expense;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class StoreExpenseRequest extends FormRequest
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
        $isEmployee = Auth::guard('sanctum')->check();

        return [
            'outletId' => [
                'required',
                'integer',
                Rule::exists('outlets', 'id')->whereNull('deleted_at'),
            ],
            'expenseAccountId' => [
                'required',
                'integer',
                Rule::exists('accounts', 'id')
                    ->where('type', 'expense')
                    ->whereNull('deleted_at'),
            ],
            'sourceAccountId' => [
                $isEmployee ? 'nullable' : 'required',
                'integer',
                Rule::exists('accounts', 'id')
                    ->where('type', 'asset')
                    ->where('is_transactional', true)
                    ->whereNull('deleted_at'),
            ],
            'amount' => [
                'required',
                'numeric',
                'min:1',
                'max:999999999.99',
            ],
            'date' => [
                'required',
                'date',
                'before_or_equal:today',
            ],
            'description' => [
                'nullable',
                'string',
                'max:500',
            ],
            'attachment' => [
                'nullable',
                'file',
                'image',
                'mimes:jpeg,jpg,png,gif,webp',
                'max:2048', // 2MB
            ],
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
            'expenseAccountId' => 'akun beban',
            'sourceAccountId' => 'akun sumber',
            'amount' => 'jumlah',
            'date' => 'tanggal',
            'description' => 'deskripsi',
            'attachment' => 'lampiran',
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
            'outletId.required' => 'Outlet harus dipilih.',
            'outletId.exists' => 'Outlet yang dipilih tidak valid.',
            'expenseAccountId.required' => 'Akun beban harus dipilih.',
            'expenseAccountId.exists' => 'Akun beban yang dipilih tidak valid atau bukan tipe "expense".',
            'sourceAccountId.required' => 'Akun sumber pembayaran harus dipilih (wajib untuk owner).',
            'sourceAccountId.exists' => 'Akun sumber yang dipilih tidak valid atau bukan tipe "asset".',
            'amount.required' => 'Jumlah pengeluaran harus diisi.',
            'amount.numeric' => 'Jumlah pengeluaran harus berupa angka.',
            'amount.min' => 'Jumlah pengeluaran minimal :min.',
            'amount.max' => 'Jumlah pengeluaran maksimal :max.',
            'date.required' => 'Tanggal pengeluaran harus diisi.',
            'date.date' => 'Format tanggal tidak valid.',
            'date.before_or_equal' => 'Tanggal pengeluaran tidak boleh melebihi hari ini.',
            'description.max' => 'Deskripsi maksimal :max karakter.',
            'attachment.file' => 'Lampiran harus berupa file.',
            'attachment.image' => 'Lampiran harus berupa gambar.',
            'attachment.mimes' => 'Format lampiran harus: :values.',
            'attachment.max' => 'Ukuran lampiran maksimal :max KB (2MB).',
        ];
    }
}
