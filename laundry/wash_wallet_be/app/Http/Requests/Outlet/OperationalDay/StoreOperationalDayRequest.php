<?php

namespace App\Http\Requests\Outlet\OperationalDay;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOperationalDayRequest extends FormRequest
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
            'dayOfWeek' => [
                'required',
                'string',
                'in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
                Rule::unique('operational_days', 'day_of_week')
                    ->where('outlet_id', $this->route('outletId'))
            ],
            'isOpen' => [
                'required',
                'boolean'
            ],
            'openTime' => [
                'required_if:isOpen,true',
                'nullable',
                'date_format:H:i',
                'before:closeTime'
            ],
            'closeTime' => [
                'required_if:isOpen,true',
                'nullable',
                'date_format:H:i',
                'after:openTime'
            ]
        ];
    }

    /**
     * Get custom error messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'dayOfWeek.required' => 'Hari dalam seminggu harus diisi.',
            'dayOfWeek.in' => 'Hari dalam seminggu tidak valid.',
            'dayOfWeek.unique' => 'Jadwal untuk hari ini sudah ada.',

            'isOpen.required' => 'Status buka/tutup harus diisi.',
            'isOpen.boolean' => 'Status buka/tutup harus berupa true atau false.',

            'openTime.required_if' => 'Jam buka harus diisi jika outlet buka.',
            'openTime.date_format' => 'Format jam buka harus HH:MM.',
            'openTime.before' => 'Jam buka harus lebih awal dari jam tutup.',

            'closeTime.required_if' => 'Jam tutup harus diisi jika outlet buka.',
            'closeTime.date_format' => 'Format jam tutup harus HH:MM.',
            'closeTime.after' => 'Jam tutup harus lebih lambat dari jam buka.'
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
            'dayOfWeek' => 'hari dalam seminggu',
            'isOpen' => 'status buka/tutup',
            'openTime' => 'jam buka',
            'closeTime' => 'jam tutup'
        ];
    }
}
