<?php

namespace App\Http\Requests\Outlet\CourierSchedule;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCourierScheduleRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'dayOfWeek' => ['sometimes', 'string', 'in:monday,tuesday,wednesday,thursday,friday,saturday,sunday'],
      'startTime' => ['sometimes', 'date_format:H:i'],
      'endTime' => ['sometimes', 'date_format:H:i', 'after:startTime'],
      'isActive' => ['boolean'],
    ];
  }

  public function messages(): array
  {
    return [
      'dayOfWeek.in' => 'Hari dalam minggu tidak valid.',
      'startTime.date_format' => 'Format waktu mulai tidak valid.',
      'endTime.date_format' => 'Format waktu selesai tidak valid.',
      'endTime.after' => 'Waktu selesai harus setelah waktu mulai.',
    ];
  }
}
