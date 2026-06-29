<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

class WeightOrderRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'employeeId' => ['required', 'integer', 'exists:employees,id'],
      'notes' => ['nullable', 'string', 'max:1000'],
      'internalNotes' => ['nullable', 'string', 'max:1000'],
      'specialInstructions' => ['nullable', 'array'],
      'orderItems' => ['required', 'array', 'min:1'],
      'orderItems.*.laundryServiceId' => ['required', 'integer', 'exists:laundry_services,id'],
      'orderItems.*.quantity' => ['required', 'numeric', 'min:0.01'],
      'orderItems.*.itemNotes' => ['nullable', 'string', 'max:500'],
      'orderItems.*.discountAmount' => ['nullable', 'numeric', 'min:0'],
      'orderItems.*.isPackageUsage' => ['nullable', 'boolean'],
      'orderItems.*.customerSubscriptionId' => ['nullable', 'integer', 'exists:customer_subscriptions,id'],
      'orderItems.*.quotaUsed' => ['nullable', 'numeric', 'min:0'],
      'photo' => ['nullable', 'image', 'max:5120'],
    ];
  }

  public function attributes(): array
  {
    return [
      'customerId' => 'pelanggan',
      'employeeId' => 'karyawan',
      'notes' => 'catatan',
      'internalNotes' => 'catatan internal',
      'specialInstructions' => 'instruksi khusus',
      'orderItems' => 'item order',
      'orderItems.*.laundryServiceId' => 'layanan laundry',
      'orderItems.*.quantity' => 'jumlah',
      'orderItems.*.itemNotes' => 'catatan item',
      'orderItems.*.discountAmount' => 'diskon item',
      'orderItems.*.isPackageUsage' => 'penggunaan paket',
      'orderItems.*.customerSubscriptionId' => 'subscription pelanggan',
      'orderItems.*.quotaUsed' => 'quota terpakai',
    ];
  }

  public function messages(): array
  {
    return [
      'customerId.required' => 'Pelanggan harus dipilih',
      'customerId.exists' => 'Pelanggan tidak valid',
      'employeeId.required' => 'Karyawan harus dipilih',
      'employeeId.exists' => 'Karyawan tidak valid',
      'orderItems.required' => 'Minimal harus ada 1 item',
      'orderItems.min' => 'Minimal harus ada 1 item',
      'orderItems.*.laundryServiceId.required' => 'Layanan laundry harus dipilih',
      'orderItems.*.laundryServiceId.exists' => 'Layanan laundry tidak valid',
      'orderItems.*.quantity.required' => 'Jumlah harus diisi',
      'orderItems.*.quantity.min' => 'Jumlah minimal 0.01',
    ];
  }
}
