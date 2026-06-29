<?php

namespace App\Http\Requests\Customer\CustomerSubscription;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCustomerSubscriptionRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'servicePackageId' => [
        'required',
        'integer',
        Rule::exists('service_packages', 'id')
          ->where('is_active', true)
          ->whereNull('deleted_at'),
      ],
      'pricePaid' => [
        'required',
        'numeric',
        'min:0',
        'max:999999999.99',
      ],
      'purchaseDate' => [
        'nullable',
        'date',
        'before_or_equal:today',
      ],
      'note' => [
        'nullable',
        'string',
        'max:1000',
      ],
    ];
  }

  public function messages(): array
  {
    return [
      'servicePackageId.required' => 'Paket layanan harus dipilih',
      'servicePackageId.exists' => 'Paket layanan tidak valid atau tidak aktif',
      'pricePaid.required' => 'Harga yang dibayar harus diisi',
      'pricePaid.numeric' => 'Harga yang dibayar harus berupa angka',
      'pricePaid.min' => 'Harga yang dibayar minimal Rp 0',
      'purchaseDate.date' => 'Tanggal pembelian tidak valid',
      'purchaseDate.before_or_equal' => 'Tanggal pembelian tidak boleh lebih dari hari ini',
    ];
  }
}
