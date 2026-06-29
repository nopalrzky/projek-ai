<?php

namespace App\Http\Requests\Feature;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFeatureRequest extends FormRequest
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
      'name' => [
        'required',
        'string',
        'max:150',
        'min:2',
      ],
      'description' => [
        'nullable',
        'string',
        'max:500'
      ],
      'coinPrice' => [
        'required',
        'integer',
        'min:0'
      ],
      'isPaid' => [
        'sometimes',
        'boolean'
      ],
      'isActive' => [
        'sometimes',
        'boolean'
      ],
      'sortOrder' => [
        'sometimes',
        'integer',
        'min:0'
      ],
      'durationDays' => [
        'nullable',
        'integer',
        'min:1'
      ],
    ];
  }

  /**
   * Get the error messages for the defined validation rules.
   */
  public function messages(): array
  {
    return [
      'name.required' => 'Nama fitur wajib diisi.',
      'coinPrice.required' => 'Harga koin wajib diisi.',
    ];
  }
}
