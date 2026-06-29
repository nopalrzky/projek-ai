<?php

namespace App\Http\Requests\CustomerSubscription;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCustomerSubscriptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => [
                'sometimes',
                'required',
                'string',
                'in:active,exhausted,expired,cancelled',
            ],
            'note' => [
                'nullable',
                'string',
                'max:1000',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'Status harus diisi',
            'status.string' => 'Status harus berupa teks',
            'status.in' => 'Status tidak valid. Pilihan yang tersedia: active, exhausted, expired, cancelled',
            'note.string' => 'Catatan harus berupa teks',
            'note.max' => 'Catatan maksimal 1000 karakter',
        ];
    }

    public function attributes(): array
    {
        return [
            'status' => 'status',
            'note' => 'catatan',
        ];
    }

    protected function failedAuthorization(): void
    {
        abort(403, 'Anda tidak memiliki izin untuk memperbarui subscription pelanggan.');
    }
}
