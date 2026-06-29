<?php

namespace App\Http\Requests\CustomerAddress;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCustomerAddressRequest extends FormRequest
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
      'label'          => ['sometimes', 'required', 'string', 'max:50'],
      'recipientName'  => ['sometimes', 'required', 'string', 'max:255'],
      'recipientPhone' => ['sometimes', 'required', 'string', 'max:20'],
      'street'         => ['sometimes', 'required', 'string'],
      'notes'          => ['sometimes', 'nullable', 'string', 'max:500'],
      'latitude'       => ['sometimes', 'nullable', 'numeric', 'between:-90,90'],
      'longitude'      => ['sometimes', 'nullable', 'numeric', 'between:-180,180'],
      'isPrimary'      => ['sometimes', 'boolean'],
      'villageName'    => ['sometimes', 'nullable', 'string', 'max:255'],
      'districtName'   => ['sometimes', 'nullable', 'string', 'max:255'],
      'regencyName'    => ['sometimes', 'nullable', 'string', 'max:255'],
      'provinceName'   => ['sometimes', 'nullable', 'string', 'max:255'],
      'villageId'      => ['sometimes', 'nullable', 'string', 'max:50'],
      'districtId'     => ['sometimes', 'nullable', 'string', 'max:50'],
      'regencyId'      => ['sometimes', 'nullable', 'string', 'max:50'],
      'provinceId'     => ['sometimes', 'nullable', 'string', 'max:50'],
    ];
  }

  /**
   * Get custom messages for validator errors.
   */
  public function messages(): array
  {
    return [
      'label.required'          => 'Label alamat wajib diisi.',
      'label.max'               => 'Label alamat maksimal 50 karakter.',
      'recipientName.required'  => 'Nama penerima wajib diisi.',
      'recipientName.max'       => 'Nama penerima maksimal 255 karakter.',
      'recipientPhone.required' => 'Nomor HP penerima wajib diisi.',
      'recipientPhone.max'      => 'Nomor HP penerima maksimal 20 karakter.',
      'street.required'         => 'Alamat jalan wajib diisi.',
      'notes.max'               => 'Catatan maksimal 500 karakter.',
      'latitude.numeric'        => 'Latitude harus berupa angka.',
      'latitude.between'        => 'Latitude harus berada di rentang -90 sampai 90.',
      'longitude.numeric'       => 'Longitude harus berupa angka.',
      'longitude.between'       => 'Longitude harus berada di rentang -180 sampai 180.',
      'isPrimary.boolean'       => 'isPrimary harus berupa true atau false.',
    ];
  }

  /**
   * Get custom attributes for validator errors.
   */
  public function attributes(): array
  {
    return [
      'label'          => 'label alamat',
      'recipientName'  => 'nama penerima',
      'recipientPhone' => 'nomor HP penerima',
      'street'         => 'alamat jalan',
      'notes'          => 'catatan',
      'latitude'       => 'latitude',
      'longitude'      => 'longitude',
      'isPrimary'      => 'is primary',
      'villageName'    => 'nama kelurahan',
      'districtName'   => 'nama kecamatan',
      'regencyName'    => 'nama kabupaten/kota',
      'provinceName'   => 'nama provinsi',
      'villageId'      => 'id kelurahan',
      'districtId'     => 'id kecamatan',
      'regencyId'      => 'id kabupaten/kota',
      'provinceId'     => 'id provinsi',
    ];
  }
}
