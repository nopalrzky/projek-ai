<?php

namespace App\Http\Requests\Account;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class UpdateAccountRequest extends FormRequest
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
        $accountId = $this->route('account');
        $account = \App\Models\Account::findOrFail($accountId);
        $ownerId = $account->owner_id;

        return [
            'parentId' => [
                'nullable',
                'integer',
                'exists:accounts,id',
                Rule::notIn([$accountId]),
            ],
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('accounts', 'code')
                    ->where(function ($query) use ($ownerId) {
                        return $query->where('owner_id', $ownerId);
                    })
                    ->ignore($accountId),
            ],
            'name' => [
                'required',
                'string',
                'max:255',
            ],
            'slug' => [
                'nullable',
                'string',
                'max:255',
            ],
            'type' => [
                'required',
                'string',
                Rule::in(['asset', 'liability', 'equity', 'revenue', 'expense']),
            ],
            'isTransactional' => [
                'nullable',
                'boolean',
            ],
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'parentId' => 'akun induk',
            'code' => 'kode akun',
            'name' => 'nama akun',
            'slug' => 'slug',
            'type' => 'tipe akun',
            'isTransactional' => 'status transaksi',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'code.unique' => 'Kode akun sudah digunakan.',
            'code.required' => 'Kode akun wajib diisi.',
            'code.max' => 'Kode akun maksimal 50 karakter.',
            'name.required' => 'Nama akun wajib diisi.',
            'name.max' => 'Nama akun maksimal 255 karakter.',
            'type.required' => 'Tipe akun wajib dipilih.',
            'type.in' => 'Tipe akun harus salah satu dari: Aset, Kewajiban, Modal, Pendapatan, atau Beban.',
            'parentId.exists' => 'Akun induk tidak ditemukan.',
            'parentId.not_in' => 'Akun tidak dapat menjadi induk dari dirinya sendiri.',
        ];
    }
}
