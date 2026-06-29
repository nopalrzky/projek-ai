<?php

namespace App\Http\Requests\Outlet;

use Illuminate\Foundation\Http\FormRequest;

class NearbyOutletRequest extends FormRequest
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
   */
  public function rules(): array
  {
    return [
      'latitude' => 'required|numeric|between:-90,90',
      'longitude' => 'required|numeric|between:-180,180',
      'radius' => 'nullable|numeric|min:0',
    ];
  }

  /**
   * Get custom error messages for validator errors.
   */
  public function messages(): array
  {
    return [
      'latitude.required' => 'Latitude wajib diisi.',
      'latitude.numeric' => 'Latitude harus berupa angka.',
      'latitude.between' => 'Latitude harus antara -90 dan 90.',
      'longitude.required' => 'Longitude wajib diisi.',
      'longitude.numeric' => 'Longitude harus berupa angka.',
      'longitude.between' => 'Longitude harus antara -180 dan 180.',
      'radius.numeric' => 'Radius harus berupa angka.',
      'radius.min' => 'Radius tidak boleh negatif.',
    ];
  }

  /**
   * Get custom attributes for validator errors.
   */
  public function attributes(): array
  {
    return [
      'latitude' => 'latitude',
      'longitude' => 'longitude',
      'radius' => 'radius',
    ];
  }
}
