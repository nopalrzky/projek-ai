<?php

namespace App\Http\Requests\JournalEntry;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Account;
use App\Models\AccountingPeriod;
use App\Models\JournalEntry;

class UpdateJournalEntryRequest extends FormRequest
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
        $journalEntryRouteParam = $this->route('journal_entry');
        $journalEntryId = $journalEntryRouteParam instanceof JournalEntry
            ? $journalEntryRouteParam->id
            : $journalEntryRouteParam;
        $journalEntry = JournalEntry::findOrFail($journalEntryId);

        return [
            'date' => [
                'sometimes',
                'required',
                'date',
                'before_or_equal:today',
                function ($attribute, $value, $fail) use ($journalEntry) {
                    $period = AccountingPeriod::byOutletId($journalEntry->outlet_id)
                        ->containingDate($value)
                        ->first();

                    if ($period && $period->is_closed) {
                        $fail('The selected date is in a closed accounting period.');
                    }
                },
            ],
            'description' => [
                'sometimes',
                'nullable',
                'string',
                'max:1000',
            ],
            'referenceType' => [
                'sometimes',
                'nullable',
                'string',
                'max:100',
            ],
            'referenceId' => [
                'sometimes',
                'nullable',
                'integer',
                'min:1',
            ],

            'journalDetails' => [
                'sometimes',
                'required',
                'array',
                'min:2',
            ],
            'journalDetails.*.accountId' => [
                'required_with:journalDetails',
                'integer',
                function ($attribute, $value, $fail) use ($journalEntry) {
                    $account = Account::byId($value)
                        ->byOutletId($journalEntry->outlet_id)
                        ->active()
                        ->first();

                    if (!$account) {
                        $fail('The selected account is invalid or inactive.');
                    }
                },
            ],
            'journalDetails.*.debit' => [
                'required_with:journalDetails',
                'numeric',
                'min:0',
                'decimal:0,2',
            ],
            'journalDetails.*.credit' => [
                'required_with:journalDetails',
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

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
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

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'date.date' => 'Format tanggal tidak valid.',
            'date.before_or_equal' => 'Tanggal transaksi tidak boleh di masa depan.',

            'journalDetails.min' => 'Minimal harus ada 2 detail jurnal (debit dan kredit).',

            'journalDetails.*.accountId.required_with' => 'Akun wajib dipilih.',
            'journalDetails.*.accountId.integer' => 'ID akun tidak valid.',

            'journalDetails.*.debit.required_with' => 'Jumlah debit wajib diisi.',
            'journalDetails.*.debit.numeric' => 'Jumlah debit harus berupa angka.',
            'journalDetails.*.debit.min' => 'Jumlah debit tidak boleh negatif.',

            'journalDetails.*.credit.required_with' => 'Jumlah kredit wajib diisi.',
            'journalDetails.*.credit.numeric' => 'Jumlah kredit harus berupa angka.',
            'journalDetails.*.credit.min' => 'Jumlah kredit tidak boleh negatif.',

            'journalDetails.*.memo.max' => 'Catatan maksimal 500 karakter.',
        ];
    }
}
