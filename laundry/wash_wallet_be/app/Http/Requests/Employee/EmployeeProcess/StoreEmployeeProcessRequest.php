<?php

namespace App\Http\Requests\Employee\EmployeeProcess;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEmployeeProcessRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    $employeeId = $this->route('employeeId');

    return [
      'processId' => [
        'required',
        'integer',
        'exists:processes,id',
        Rule::unique('employee_processes', 'process_id')
          ->where('employee_id', $employeeId)
          ->whereNull('deleted_at'),
      ],
      'hasCommission' => ['sometimes', 'boolean'],
      'commissionType' => [
        'required_if:hasCommission,true',
        'in:per_item,per_kg,percentage,flat',
      ],
      'commissionValue' => [
        'required_if:hasCommission,true',
        'numeric',
        'min:0',
      ],
      'hasTarget' => [
        'required_if:hasCommission,true',
        'boolean',
      ],
      'targetThreshold' => [
        'nullable',
        'required_if:hasTarget,true',
        'integer',
        'min:0',
      ],
      'bonusAmount' => [
        'nullable',
        'required_if:hasTarget,true',
        'numeric',
        'min:0',
      ],
    ];
  }

  public function messages(): array
  {
    return [
      'processId.required' => 'Proses harus dipilih.',
      'processId.integer' => 'Format proses tidak valid.',
      'processId.exists' => 'Proses yang dipilih tidak ditemukan.',
      'processId.unique' => 'Proses ini sudah diberikan kepada karyawan.',
      'commissionType.required_if' => 'Tipe komisi wajib diisi jika komisi diaktifkan.',
      'commissionType.in' => 'Tipe komisi tidak valid.',
      'commissionValue.required_if' => 'Nilai komisi wajib diisi jika komisi diaktifkan.',
      'commissionValue.numeric' => 'Nilai komisi harus berupa angka.',
      'commissionValue.min' => 'Nilai komisi tidak boleh kurang dari :min.',
      'hasTarget.required_if' => 'Status target wajib diisi jika komisi diaktifkan.',
      'hasTarget.boolean' => 'Format status target tidak valid.',
      'targetThreshold.required_if' => 'Target threshold wajib diisi jika target diaktifkan.',
      'targetThreshold.integer' => 'Target threshold harus berupa angka bulat.',
      'targetThreshold.min' => 'Target threshold tidak boleh kurang dari :min.',
      'bonusAmount.required_if' => 'Bonus amount wajib diisi jika target diaktifkan.',
      'bonusAmount.numeric' => 'Bonus amount harus berupa angka.',
      'bonusAmount.min' => 'Bonus amount tidak boleh kurang dari :min.',
    ];
  }

  protected function prepareForValidation(): void
  {
    $hasCommission = filter_var($this->input('hasCommission', false), FILTER_VALIDATE_BOOLEAN);

    $payload = [
      'hasCommission' => $hasCommission,
      'hasTarget' => filter_var($this->input('hasTarget', false), FILTER_VALIDATE_BOOLEAN),
    ];

    if ($this->has('processId') && is_string($this->processId)) {
      $payload['processId'] = (int) $this->processId;
    }

    if ($this->has('commissionValue') && $this->commissionValue !== null && $this->commissionValue !== '') {
      $payload['commissionValue'] = (float) $this->commissionValue;
    }

    if ($this->has('targetThreshold') && $this->targetThreshold !== null && $this->targetThreshold !== '') {
      $payload['targetThreshold'] = (int) $this->targetThreshold;
    }

    if ($this->has('bonusAmount') && $this->bonusAmount !== null && $this->bonusAmount !== '') {
      $payload['bonusAmount'] = (float) $this->bonusAmount;
    }

    $this->merge($payload);
  }
}
