<?php

namespace App\Http\Requests\Outlet\Customer;

use Illuminate\Foundation\Http\FormRequest;

class UploadCustomerRequest extends FormRequest
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
      'file' => 'required|file|mimes:xlsx,csv,xls|max:' . config('import-export.max_file_size', 10240),
      'type' => [
        'required',
        'string',
        'in:customer',
      ],
    ];
  }

  /**
   * Get custom error messages for validator errors.
   */
  public function messages(): array
  {
    return [
      'file.required' => 'Please select a file to upload',
      'file.file' => 'The uploaded file is invalid',
      'file.mimes' => 'File must be Excel format (.xlsx, .xls, or .csv)',
      'file.max' => 'File size must not exceed 10MB',
      'type.required' => 'Import type is required',
      'type.in' => 'Invalid import type',
    ];
  }

  /**
   * Get custom attributes for validator errors.
   */
  public function attributes(): array
  {
    return [
      'file' => 'import file',
      'type' => 'import type',
    ];
  }
}
