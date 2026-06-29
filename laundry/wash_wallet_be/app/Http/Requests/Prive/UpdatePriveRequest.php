<?php

namespace App\Http\Requests\Prive;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePriveRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->hasRole('owner');
    }

    public function rules(): array
    {
        return [
            'sourceAccountId' => [
                'sometimes',
                'required',
                'integer',
                Rule::exists('accounts', 'id')->where(function ($query) {
                    $query->where('owner_id', $this->user()->id)
                        ->where('type', 'asset')
                        ->where('is_transactional', true);
                }),
            ],
            'equityAccountId' => [
                'sometimes',
                'required',
                'integer',
                Rule::exists('accounts', 'id')->where(function ($query) {
                    $query->where('owner_id', $this->user()->id)
                        ->where('type', 'equity');
                }),
            ],
            'amount' => [
                'sometimes',
                'required',
                'numeric',
                'min:1',
                'max:999999999.99',
            ],
            'date' => [
                'sometimes',
                'required',
                'date',
                'before_or_equal:today',
            ],
            'description' => [
                'nullable',
                'string',
                'max:1000',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'sourceAccountId.required' => 'Akun sumber dana wajib dipilih',
            'sourceAccountId.exists' => 'Akun sumber dana tidak valid atau bukan akun transaksional',
            'equityAccountId.required' => 'Akun modal/prive wajib dipilih',
            'equityAccountId.exists' => 'Akun modal/prive tidak valid',
            'amount.required' => 'Jumlah penarikan wajib diisi',
            'amount.numeric' => 'Jumlah penarikan harus berupa angka',
            'amount.min' => 'Jumlah penarikan minimal Rp 1',
            'amount.max' => 'Jumlah penarikan maksimal Rp 999.999.999,99',
            'date.required' => 'Tanggal wajib diisi',
            'date.date' => 'Format tanggal tidak valid',
            'date.before_or_equal' => 'Tanggal tidak boleh lebih dari hari ini',
            'description.max' => 'Deskripsi maksimal 1000 karakter',
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('sourceAccountId')) {
            $this->merge(['source_account_id' => $this->sourceAccountId]);
        }
        if ($this->has('equityAccountId')) {
            $this->merge(['equity_account_id' => $this->equityAccountId]);
        }
    }
}
