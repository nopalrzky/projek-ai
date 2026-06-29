<?php

namespace App\Http\Requests\JournalEntry;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;

class StoreJournalEntryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {

        return [
            'outletId' => [
                'required',
                'integer',
                Rule::exists('outlets', 'id')->where(function ($query) {
                    $query->where('owner_id', Auth::user()->id)
                        ->whereNull('deleted_at');
                }),
            ],
            'date' => [
                'required',
                'date',
                'before_or_equal:today',
            ],
            'description' => [
                'nullable',
                'string',
                'max:1000',
            ],
            'referenceType' => [
                'nullable',
                'string',
                'max:100',
            ],
            'referenceId' => [
                'nullable',
                'integer',
                'min:1',
            ],
            'journalDetails' => [
                'required',
                'array',
                'min:2',
            ],
            'journalDetails.*.accountId' => [
                'required',
                'integer',
                'distinct',
            ],
            'journalDetails.*.debit' => [
                'required',
                'numeric',
                'min:0',
                'decimal:0,2',
            ],
            'journalDetails.*.credit' => [
                'required',
                'numeric',
                'min:0',
                'decimal:0,2',
            ],
            'journalDetails.*.memo' => [
                'nullable',
                'string',
                'max:500',
            ],
        ];
    }

    public function attributes(): array
    {
        return [
            'date' => 'tanggal transaksi',
            'description' => 'deskripsi',
            'referenceType' => 'tipe referensi',
            'referenceId' => 'ID referensi',
            'journalDetails' => 'detail jurnal',
            'journalDetails.*.accountId' => 'akun',
            'journalDetails.*.debit' => 'debit',
            'journalDetails.*.credit' => 'kredit',
            'journalDetails.*.memo' => 'catatan',
        ];
    }

    public function messages(): array
    {
        return [
            'date.required' => 'Tanggal transaksi wajib diisi.',
            'journalDetails.min' => 'Minimal harus ada 2 baris akun (Debit & Kredit).',
            'journalDetails.*.accountId.required' => 'Akun wajib dipilih.',
            'journalDetails.*.accountId.distinct' => 'Akun yang sama tidak boleh dipilih dua kali dalam satu jurnal.',
            'journalDetails.*.accountId.exists' => 'Akun tidak valid atau tidak aktif.',
        ];
    }
}
