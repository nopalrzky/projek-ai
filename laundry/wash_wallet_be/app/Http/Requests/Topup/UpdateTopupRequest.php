<?php

namespace App\Http\Requests\Topup;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTopupRequest extends FormRequest
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
        $topupId = $this->route('id');

        return [
            'amountMoney' => [
                'nullable',
                'integer',
                'min:1000',
                'max:100000000',
            ],
            'coinReceived' => [
                'nullable',
                'integer',
                'min:1',
            ],
            'status' => [
                'nullable',
                'string',
                Rule::in(['pending', 'success', 'failed']),
            ],
            'paymentStatus' => [
                'nullable',
                'string',
                Rule::in(['pending', 'paid', 'failed', 'expired']),
            ],
            'paymentProvider' => [
                'nullable',
                'string',
                'max:100',
            ],
            'paymentReference' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('topups', 'payment_reference')->ignore($topupId),
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'amountMoney.min' => 'Jumlah uang minimal Rp 1.000.',
            'amountMoney.max' => 'Jumlah uang maksimal Rp 100.000.000.',
            'coinReceived.min' => 'Jumlah coin minimal 1.',
            'status.in' => 'Status tidak valid. Pilih: pending, success, atau failed.',
            'paymentStatus.in' => 'Status pembayaran tidak valid.',
            'paymentProvider.max' => 'Nama payment provider maksimal 100 karakter.',
            'paymentReference.max' => 'Referensi pembayaran maksimal 255 karakter.',
            'paymentReference.unique' => 'Referensi pembayaran sudah digunakan.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'amountMoney' => 'jumlah uang',
            'coinReceived' => 'jumlah coin',
            'status' => 'status',
            'paymentStatus' => 'status pembayaran',
            'paymentProvider' => 'payment provider',
            'paymentReference' => 'referensi pembayaran',
        ];
    }
}
