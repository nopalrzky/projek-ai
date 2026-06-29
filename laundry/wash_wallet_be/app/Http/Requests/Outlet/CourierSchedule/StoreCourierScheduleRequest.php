<?php

namespace App\Http\Requests\Outlet\CourierSchedule;

use Illuminate\Foundation\Http\FormRequest;

class StoreCourierScheduleRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'dayOfWeek' => 'required|string|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
      'type'      => 'sometimes|string|in:pickup,delivery',
      'startTime' => 'required|date_format:H:i',
      'endTime'   => 'required|date_format:H:i|after:startTime',
      'isActive'  => 'nullable|boolean',
    ];
  }

  public function messages(): array
  {
    return [
      'dayOfWeek.required' => 'Hari dalam minggu harus diisi.',
      'dayOfWeek.in' => 'Hari dalam minggu tidak valid.',
      'startTime.required' => 'Waktu mulai harus diisi.',
      'startTime.date_format' => 'Format waktu mulai tidak valid.',
      'endTime.required' => 'Waktu selesai harus diisi.',
      'endTime.date_format' => 'Format waktu selesai tidak valid.',
      'endTime.after' => 'Waktu selesai harus setelah waktu mulai.',
      'type.required' => 'Jenis layanan harus diisi.',
      'type.in' => 'Jenis layanan tidak valid.',
    ];
  }
}
