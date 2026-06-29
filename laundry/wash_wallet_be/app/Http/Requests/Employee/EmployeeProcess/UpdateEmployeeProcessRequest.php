<?php

namespace App\Http\Requests\Employee\EmployeeProcess;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEmployeeProcessRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'isActive' => ['required', 'boolean'],
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
      'isActive.required' => 'Status aktif harus diisi.',
      'isActive.boolean' => 'Format status tidak valid.',
      'commissionType.required_if' => 'Tipe komisi wajib diisi jika komisi diaktifkan.',
      'commissionType.in' => 'Tipe komisi tidak valid.',
      'commissionValue.required_if' => 'Nilai komisi wajib diisi jika komisi diaktifkan.',
      'commissionValue.numeric' => 'Nilai komisi harus berupa angka.',
      'commissionValue.min' => 'Nilai komisi tidak boleh negatif.',
      'hasTarget.required_if' => 'Status target wajib diisi jika komisi diaktifkan.',
      'hasTarget.boolean' => 'Format status target tidak valid.',
      'targetThreshold.required_if' => 'Target threshold wajib diisi jika target diaktifkan.',
      'targetThreshold.integer' => 'Target threshold harus berupa angka bulat.',
      'targetThreshold.min' => 'Target threshold tidak boleh negatif.',
      'bonusAmount.required_if' => 'Bonus amount wajib diisi jika target diaktifkan.',
      'bonusAmount.numeric' => 'Bonus amount harus berupa angka.',
      'bonusAmount.min' => 'Bonus amount tidak boleh negatif.',
    ];
  }

  protected function prepareForValidation(): void
  {
    $this->merge([
      'isActive' => filter_var($this->isActive, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? $this->isActive,
      'hasCommission' => filter_var($this->hasCommission, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? false,
      'hasTarget' => filter_var($this->hasTarget, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? false,
      'commissionValue' => $this->commissionValue ? (float) $this->commissionValue : $this->commissionValue,
      'targetThreshold' => $this->targetThreshold !== null && $this->targetThreshold !== '' ? (int) $this->targetThreshold : null,
      'bonusAmount' => $this->bonusAmount !== null && $this->bonusAmount !== '' ? (float) $this->bonusAmount : null,
    ]);
  }
}
