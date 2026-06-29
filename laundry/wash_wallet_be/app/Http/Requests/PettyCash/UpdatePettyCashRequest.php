<?php

namespace App\Http\Requests\PettyCash;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class UpdatePettyCashRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Auth::check();
    }

    public function rules(): array
    {
        return [
            'amount' => ['sometimes', 'numeric', 'min:1'],
            'description' => ['sometimes', 'string', 'max:1000'],
            'requestDate' => ['sometimes', 'date'],
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
        ];
    }
}
