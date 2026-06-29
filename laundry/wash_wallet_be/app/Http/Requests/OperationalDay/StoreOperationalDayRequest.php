<?php

namespace App\Http\Requests\OperationalDay;

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
            'day_of_week' => [
                'required',
                'string',
                'in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
                Rule::unique('operational_days', 'day_of_week')
                    ->where('outlet_id', $this->route('outlet'))
            ],
            'is_open' => [
                'required',
                'boolean'
            ],
            'open_time' => [
                'required_if:is_open,true',
                'nullable',
                'date_format:H:i',
                'before:close_time'
            ],
            'close_time' => [
                'required_if:is_open,true',
                'nullable',
                'date_format:H:i',
                'after:open_time'
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
            'day_of_week.required' => 'Hari dalam seminggu harus diisi.',
            'day_of_week.in' => 'Hari dalam seminggu tidak valid.',
            'day_of_week.unique' => 'Jadwal untuk hari ini sudah ada.',

            'is_open.required' => 'Status buka/tutup harus diisi.',
            'is_open.boolean' => 'Status buka/tutup harus berupa true atau false.',

            'open_time.required_if' => 'Jam buka harus diisi jika outlet buka.',
            'open_time.date_format' => 'Format jam buka harus HH:MM.',
            'open_time.before' => 'Jam buka harus lebih awal dari jam tutup.',

            'close_time.required_if' => 'Jam tutup harus diisi jika outlet buka.',
            'close_time.date_format' => 'Format jam tutup harus HH:MM.',
            'close_time.after' => 'Jam tutup harus lebih lambat dari jam buka.'
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
            'day_of_week' => 'hari dalam seminggu',
            'is_open' => 'status buka/tutup',
            'open_time' => 'jam buka',
            'close_time' => 'jam tutup'
        ];
    }

    /**
     * Configure the validator instance.
     *
     * @param  \Illuminate\Validation\Validator  $validator
     * @return void
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Additional validation for business logic
            if ($this->is_open && $this->open_time && $this->close_time) {
                // Convert time to minutes for easier comparison
                $openMinutes = $this->timeToMinutes($this->open_time);
                $closeMinutes = $this->timeToMinutes($this->close_time);

                // Check if duration is at least 1 hour
                if (($closeMinutes - $openMinutes) < 60) {
                    $validator->errors()->add(
                        'close_time',
                        'Durasi operasional minimal 1 jam.'
                    );
                }

                // Check if operation hours are within reasonable range (5:00 - 23:59)
                if ($openMinutes < 300) { // 5:00 AM
                    $validator->errors()->add(
                        'open_time',
                        'Jam buka tidak boleh lebih awal dari 05:00.'
                    );
                }

                if ($closeMinutes > 1439) { // 23:59
                    $validator->errors()->add(
                        'close_time',
                        'Jam tutup tidak boleh lebih lambat dari 23:59.'
                    );
                }
            }
        });
    }

    /**
     * Convert time string to minutes since midnight
     *
     * @param string $time
     * @return int
     */
    private function timeToMinutes(string $time): int
    {
        [$hours, $minutes] = explode(':', $time);
        return (int)$hours * 60 + (int)$minutes;
    }

    /**
     * Prepare the data for validation.
     *
     * @return void
     */
    protected function prepareForValidation()
    {
        // Ensure outlet_id is available from route parameter
        $this->merge([
            'outlet_id' => $this->route('outlet')
        ]);

        // Convert string boolean to actual boolean if needed
        if ($this->has('is_open') && is_string($this->is_open)) {
            $this->merge([
                'is_open' => filter_var($this->is_open, FILTER_VALIDATE_BOOLEAN)
            ]);
        }

        // Set open_time and close_time to null if outlet is closed
        if (!$this->is_open) {
            $this->merge([
                'open_time' => null,
                'close_time' => null
            ]);
        }
    }
}
