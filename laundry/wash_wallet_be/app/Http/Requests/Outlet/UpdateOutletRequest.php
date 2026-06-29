<?php

namespace App\Http\Requests\Outlet;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOutletRequest extends FormRequest
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
        $outletId = $this->route('outlet');

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                'min:3'
            ],
            'email' => [
                'nullable',
                'email',
                'max:255',
                Rule::unique('outlets', 'email')
                    ->ignore($outletId)
                    ->whereNull('deleted_at')
            ],
            'phone' => [
                'nullable',
                'string',
                'max:20',
                'regex:/^[0-9+\-\s()]+$/'
            ],
            'provinceId' => [
                "nullable",
                'integer',
                'min:1'
            ],
            'provinceName' => [
                'nullable',
                'string',
                'max:255'
            ],
            'cityId' => [
                'nullable',
                'integer',
                'min:1'
            ],
            'cityName' => [
                'nullable',
                'string',
                'max:255'
            ],
            'districtId' => [
                'nullable',
                'integer',
                'min:1'
            ],
            'districtName' => [
                'nullable',
                'string',
                'max:255'
            ],
            'villageId' => [
                'nullable',
                'integer',
                'min:1'
            ],
            'villageName' => [
                'nullable',
                'string',
                'max:255'
            ],
            'street' => [
                'nullable',
                'string',
                'max:500'
            ],
            'latitude' => [
                'nullable',
                'numeric',
                'between:-90,90'
            ],
            'longitude' => [
                'nullable',
                'numeric',
                'between:-180,180'
            ],
            'isActive' => [
                'boolean'
            ]
        ];
    }

    /**
     * Get custom error messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama outlet wajib diisi.',
            'name.min' => 'Nama outlet minimal 3 karakter.',
            'name.max' => 'Nama outlet maksimal 255 karakter.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah digunakan oleh outlet lain.',
            'phone.regex' => 'Format nomor telepon tidak valid.',
            'phone.max' => 'Nomor telepon maksimal 20 karakter.',
            'provinceId.integer' => 'Provinsi tidak valid.',
            'provinceId.min' => 'Provinsi tidak valid.',
            'provinceName.string' => 'Nama provinsi tidak valid.',
            'provinceName.max' => 'Nama provinsi maksimal 255 karakter.',
            'cityId.integer' => 'Kota/Kabupaten tidak valid.',
            'cityId.min' => 'Kota/Kabupaten tidak valid.',
            'cityName.string' => 'Nama kota/kabupaten tidak valid.',
            'cityName.max' => 'Nama kota/kabupaten maksimal 255 karakter.',
            'districtId.integer' => 'Kecamatan tidak valid.',
            'districtId.min' => 'Kecamatan tidak valid.',
            'districtName.string' => 'Nama kecamatan tidak valid.',
            'districtName.max' => 'Nama kecamatan maksimal 255 karakter.',
            'villageId.integer' => 'Kelurahan/Desa tidak valid.',
            'villageId.min' => 'Kelurahan/Desa tidak valid.',
            'villageName.string' => 'Nama kelurahan/desa tidak valid.',
            'villageName.max' => 'Nama kelurahan/desa maksimal 255 karakter.',
            'street.max' => 'Alamat jalan maksimal 500 karakter.',
            'latitude.numeric' => 'Latitude harus berupa angka.',
            'latitude.between' => 'Latitude harus di antara -90 dan 90.',
            'longitude.numeric' => 'Longitude harus berupa angka.',
            'longitude.between' => 'Longitude harus di antara -180 dan 180.',
            'isActive.boolean' => 'Status outlet tidak valid.'
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'name' => 'nama outlet',
            'email' => 'email outlet',
            'phone' => 'nomor telepon',
            'provinceId' => 'provinsi',
            'provinceName' => 'nama provinsi',
            'cityId' => 'kota/kabupaten',
            'cityName' => 'nama kota/kabupaten',
            'districtId' => 'kecamatan',
            'districtName' => 'nama kecamatan',
            'villageId' => 'kelurahan/desa',
            'villageName' => 'nama kelurahan/desa',
            'street' => 'alamat jalan',
            'latitude' => 'latitude',
            'longitude' => 'longitude',
            'isActive' => 'status outlet'
        ];
    }
}
