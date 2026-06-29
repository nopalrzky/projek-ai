<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

class ScheduleDeliveryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'courierScheduleId' => ['required', 'integer', 'exists:courier_schedules,id'],
            'deliveryDate'      => ['required', 'date'],
            'deliveryAddress'   => ['nullable', 'string', 'max:500'],
        ];
    }
}
