<?php

namespace App\Http\Requests\Customer\MembershipContract;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMembershipContractRequest extends FormRequest
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
     */
    public function rules(): array
    {
        return [
            'membershipPlanId' => [
                'required',
                'integer',
                Rule::exists('membership_plans', 'id')
                    ->where('is_active', true),
            ],
            'startAt' => [
                'nullable',
                'date',
                'after_or_equal:today',
            ],
            'totalPaid' => [
                'nullable',
                'numeric',
                'min:0',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'membershipPlanId.required' => 'Paket membership harus dipilih.',
            'membershipPlanId.exists' => 'Paket membership tidak valid atau tidak aktif.',
            'startAt.date' => 'Tanggal mulai harus berupa tanggal yang valid.',
            'startAt.after_or_equal' => 'Tanggal mulai tidak boleh di masa lalu.',
            'totalPaid.numeric' => 'Total pembayaran harus berupa angka.',
            'totalPaid.min' => 'Total pembayaran tidak boleh negatif.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'membershipPlanId' => 'paket membership',
            'startAt' => 'tanggal mulai',
            'totalPaid' => 'total pembayaran',
        ];
    }

    /**
     * Handle a failed authorization attempt.
     */
    protected function failedAuthorization(): void
    {
        abort(403, 'Anda tidak memiliki izin untuk membuat membership.');
    }
}
