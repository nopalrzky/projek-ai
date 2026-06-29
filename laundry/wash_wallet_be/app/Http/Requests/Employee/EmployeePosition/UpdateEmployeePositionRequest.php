<?php

namespace App\Http\Requests\Employee\EmployeePosition;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEmployeePositionRequest extends FormRequest
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
    $employeeId = $this->route('employeeId');
    $employeePositionId = $this->route('employeePositionId');

    return [
      'positionId' => [
        'required',
        'integer',
        'exists:positions,id',
        // Ensure position not already assigned to this employee (except current)
        Rule::unique('employee_positions', 'position_id')
          ->where('employee_id', $employeeId)
          ->ignore($employeePositionId)
          ->whereNull('deleted_at'),
      ],
      'isActive' => [
        'required',
        'boolean',
      ],
    ];
  }

  /**
   * Get custom attributes for validator errors.
   */
  public function attributes(): array
  {
    return [
      'positionId' => 'posisi',
      'isActive' => 'status aktif',
    ];
  }

  /**
   * Get custom messages for validator errors.
   */
  public function messages(): array
  {
    return [
      'positionId.required' => 'Posisi harus dipilih.',
      'positionId.integer' => 'Format posisi tidak valid.',
      'positionId.exists' => 'Posisi yang dipilih tidak ditemukan.',
      'positionId.unique' => 'Posisi ini sudah diberikan kepada karyawan.',

      'isActive.required' => 'Status aktif harus dipilih.',
      'isActive.boolean' => 'Status aktif harus berupa aktif atau tidak aktif.',
    ];
  }

  /**
   * Prepare the data for validation.
   */
  protected function prepareForValidation(): void
  {
    // Convert string boolean to actual boolean
    if ($this->has('isActive')) {
      $this->merge([
        'isActive' => filter_var($this->isActive, FILTER_VALIDATE_BOOLEAN),
      ]);
    }

    // Convert string number to integer
    if ($this->has('positionId') && is_string($this->positionId)) {
      $this->merge([
        'positionId' => (int) $this->positionId,
      ]);
    }
  }
}
