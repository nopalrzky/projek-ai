<?php

namespace App\Http\Requests\PettyCash;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StorePettyCashRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Auth::check();
    }

    public function rules(): array
    {
        return [
            'amount' => ['required', 'numeric', 'min:1'],
            'description' => ['required', 'string', 'max:1000'],
            'requestDate' => ['required', 'date'],
        ];
    }

    public function attributes(): array
    {
        return [
            'amount' => 'jumlah',
            'description' => 'deskripsi',
            'requestDate' => 'tanggal permintaan',
        ];
    }

    public function messages(): array
    {
        return [
            'amount.min' => 'Jumlah minimal Rp 1',
            'description.required' => 'Deskripsi harus diisi',
            'requestDate.required' => 'Tanggal permintaan harus diisi',
        ];
    }
}
