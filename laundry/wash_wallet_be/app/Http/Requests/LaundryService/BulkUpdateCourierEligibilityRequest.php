<?php

namespace App\Http\Requests\LaundryService;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class BulkUpdateCourierEligibilityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Auth::check();
    }

    public function rules(): array
    {
        return [
            'services'                   => ['required', 'array', 'min:1'],
            'services.*.id'              => ['required', 'integer', 'min:1', 'exists:laundry_services,id'],
            'services.*.supportsCourier' => ['required', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'services.required'                   => 'Data layanan harus disertakan.',
            'services.array'                      => 'Format data layanan tidak valid.',
            'services.min'                        => 'Minimal satu layanan harus disertakan.',
            'services.*.id.required'              => 'ID layanan harus disertakan.',
            'services.*.id.exists'                => 'Layanan tidak ditemukan.',
            'services.*.supportsCourier.required' => 'Status kurir layanan harus disertakan.',
            'services.*.supportsCourier.boolean'  => 'Status kurir layanan harus berupa nilai benar atau salah.',
        ];
    }
}
