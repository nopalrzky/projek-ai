<?php

namespace App\Http\Requests\CustomerAddress;

use Illuminate\Foundation\Http\FormRequest;

class StoreCustomerAddressRequest extends FormRequest
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
      'label'          => ['required', 'string', 'max:50'],
      'recipientName'  => ['required', 'string', 'max:255'],
      'recipientPhone' => ['required', 'string', 'max:20'],
      'street'         => ['required', 'string'],
      'notes'          => ['nullable', 'string', 'max:500'],
      'latitude'       => ['nullable', 'numeric', 'between:-90,90'],
      'longitude'      => ['nullable', 'numeric', 'between:-180,180'],
      'isPrimary'      => ['nullable', 'boolean'],
      'villageName'    => ['nullable', 'string', 'max:255'],
      'districtName'   => ['nullable', 'string', 'max:255'],
      'regencyName'    => ['nullable', 'string', 'max:255'],
      'provinceName'   => ['nullable', 'string', 'max:255'],
      'villageId'      => ['nullable', 'string', 'max:50'],
      'districtId'     => ['nullable', 'string', 'max:50'],
      'regencyId'      => ['nullable', 'string', 'max:50'],
      'provinceId'     => ['nullable', 'string', 'max:50'],
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
