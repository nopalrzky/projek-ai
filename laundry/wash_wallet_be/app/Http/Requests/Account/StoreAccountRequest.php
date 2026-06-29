<?php

namespace App\Http\Requests\Account;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAccountRequest extends FormRequest
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
            'parentId' => [
                'nullable',
                'integer',
                'exists:accounts,id',
            ],
            'code' => [
                'required',
                'string',
                'max:50',

            ],
            'name' => [
                'required',
                'string',
                'max:255',
            ],
            'type' => [
                'required',
                'string',
                Rule::in(['asset', 'liability', 'equity', 'revenue', 'expense']),
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
            'type' => 'tipe akun',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'code.unique' => 'Kode akun sudah digunakan untuk pemilik ini.',
            'code.required' => 'Kode akun wajib diisi.',
            'code.max' => 'Kode akun maksimal 50 karakter.',
            'name.required' => 'Nama akun wajib diisi.',
            'name.max' => 'Nama akun maksimal 255 karakter.',
            'type.required' => 'Tipe akun wajib dipilih.',
            'type.in' => 'Tipe akun harus salah satu dari: Aset, Kewajiban, Modal, Pendapatan, atau Beban.',
            'parentId.exists' => 'Akun induk tidak ditemukan.',
        ];
    }
}
