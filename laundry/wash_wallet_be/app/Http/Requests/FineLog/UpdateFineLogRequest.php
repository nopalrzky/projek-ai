<?php

namespace App\Http\Requests\FineLog;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateFineLogRequest extends FormRequest
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
            'fineId' => [
                'sometimes',
                'required',
                'integer',
                Rule::exists('fines', 'id')->whereNull('deleted_at'),
            ],
            'date' => [
                'sometimes',
                'required',
                'date',
                'before_or_equal:today',
            ],
            'amount' => [
                'sometimes',
                'required',
                'numeric',
                'min:0',
                'max:999999999.99',
            ],
            'reason' => [
                'nullable',
                'string',
                'max:1000',
            ],
            'attachment' => [
                'nullable',
                'file',
                'mimes:jpg,jpeg,png,pdf',
                'max:5120', // 5MB
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
            'fineId' => 'jenis denda',
            'date' => 'tanggal',
            'amount' => 'jumlah denda',
            'reason' => 'alasan',
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
            'fineId.required' => 'Jenis denda harus dipilih.',
            'fineId.exists' => 'Jenis denda tidak ditemukan atau sudah dihapus.',
            'date.required' => 'Tanggal denda harus diisi.',
            'date.date' => 'Format tanggal tidak valid.',
            'date.before_or_equal' => 'Tanggal denda tidak boleh melebihi hari ini.',
            'amount.required' => 'Jumlah denda harus diisi.',
            'amount.numeric' => 'Jumlah denda harus berupa angka.',
            'amount.min' => 'Jumlah denda tidak boleh negatif.',
            'amount.max' => 'Jumlah denda terlalu besar (maksimal Rp 999.999.999,99).',
            'reason.string' => 'Alasan harus berupa teks.',
            'reason.max' => 'Alasan maksimal 1000 karakter.',
            'attachment.file' => 'Lampiran harus berupa file.',
            'attachment.mimes' => 'Format file harus jpg, jpeg, png, atau pdf.',
            'attachment.max' => 'Ukuran file maksimal 5MB.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Convert snake_case to camelCase if needed (for compatibility)
        if ($this->has('fine_id') && !$this->has('fineId')) {
            $this->merge(['fineId' => $this->input('fine_id')]);
        }
    }

    /**
     * Get the validated data from the request.
     *
     * @param  array|int|string|null  $key
     * @param  mixed  $default
     * @return mixed
     */
    public function validated($key = null, $default = null)
    {
        $validated = parent::validated($key, $default);

        // Ensure consistent output format
        if (is_null($key)) {
            return $validated;
        }

        return $validated;
    }
}