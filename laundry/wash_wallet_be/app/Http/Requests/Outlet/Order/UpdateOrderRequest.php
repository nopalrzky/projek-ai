<?php

namespace App\Http\Requests\Outlet\Order;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOrderRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'customerId' => ['sometimes', 'integer', 'exists:customers,id'],
      'employeeId' => ['sometimes', 'integer', 'exists:employees,id'],
      'orderType' => ['sometimes', 'string', 'in:regular,express,same_day'],
      'paymentMethod' => ['sometimes', 'string', 'in:cash,debit,credit,ewallet,qris'],
      'paymentStatus' => ['sometimes', 'string', 'in:pending,paid,partial,paid_by_package'],
      'orderStatus' => ['sometimes', 'string', 'in:pending,processing,ready,completed,cancelled'],
      'notes' => ['nullable', 'string', 'max:1000'],
      'internalNotes' => ['nullable', 'string', 'max:1000'],
      'specialInstructions' => ['nullable', 'array'],
      'discountAmount' => ['nullable', 'numeric', 'min:0'],
      'taxAmount' => ['nullable', 'numeric', 'min:0'],
      'paidAmount' => ['nullable', 'numeric', 'min:0'],
      'orderDate' => ['nullable', 'date'],
      'estimatedCompletion' => ['nullable', 'date'],
      'pickupDate' => ['nullable', 'date'],

      'orderItems' => ['sometimes', 'array', 'min:1'],
      'orderItems.*.laundryServiceId' => ['required', 'integer', 'exists:laundry_services,id'],
      'orderItems.*.quantity' => ['required', 'numeric', 'min:0.01'],
      'orderItems.*.discountAmount' => ['nullable', 'numeric', 'min:0'],
      'orderItems.*.isPackageUsage' => ['nullable', 'boolean'],
      'orderItems.*.customerSubscriptionId' => ['nullable', 'integer', 'exists:customer_subscriptions,id'],
      'orderItems.*.itemNotes' => ['nullable', 'string', 'max:500'],
    ];
  }

  public function attributes(): array
  {
    return [
      'customerId' => 'pelanggan',
      'employeeId' => 'karyawan',
      'orderType' => 'tipe order',
      'paymentMethod' => 'metode pembayaran',
      'paymentStatus' => 'status pembayaran',
      'orderStatus' => 'status order',
      'notes' => 'catatan',
      'internalNotes' => 'catatan internal',
      'specialInstructions' => 'instruksi khusus',
      'discountAmount' => 'jumlah diskon',
      'taxAmount' => 'jumlah pajak',
      'paidAmount' => 'jumlah dibayar',
      'orderDate' => 'tanggal order',
      'estimatedCompletion' => 'estimasi selesai',
      'pickupDate' => 'tanggal pickup',
      'orderItems' => 'item order',
      'orderItems.*.laundryServiceId' => 'layanan laundry',
      'orderItems.*.quantity' => 'jumlah',
      'orderItems.*.discountAmount' => 'diskon item',
      'orderItems.*.isPackageUsage' => 'penggunaan paket',
      'orderItems.*.customerSubscriptionId' => 'subscription pelanggan',
      'orderItems.*.itemNotes' => 'catatan item',
    ];
  }

  public function messages(): array
  {
    return [
      'customerId.exists' => 'Pelanggan tidak valid',
      'employeeId.exists' => 'Karyawan tidak valid',
      'orderType.in' => 'Tipe order tidak valid',
      'paymentMethod.in' => 'Metode pembayaran tidak valid',
      'paymentStatus.in' => 'Status pembayaran harus pending, paid, partial, atau paid_by_package',
      'orderStatus.in' => 'Status order tidak valid',
      'orderItems.min' => 'Minimal harus ada 1 item',
      'orderItems.*.laundryServiceId.required' => 'Layanan laundry harus dipilih',
      'orderItems.*.laundryServiceId.exists' => 'Layanan laundry tidak valid',
      'orderItems.*.quantity.required' => 'Jumlah harus diisi',
      'orderItems.*.quantity.min' => 'Jumlah minimal 0.01',
      'orderItems.*.customerSubscriptionId.exists' => 'Subscription tidak valid',
    ];
  }
}
