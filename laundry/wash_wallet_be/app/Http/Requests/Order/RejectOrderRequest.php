<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

class RejectOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'employeeId' => ['nullable', 'integer', 'exists:employees,id'],
            'reason'     => ['nullable', 'string', 'max:500'],
        ];
    }
}
