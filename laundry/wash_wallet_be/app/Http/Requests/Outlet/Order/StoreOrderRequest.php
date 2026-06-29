<?php

namespace App\Http\Requests\Outlet\Order;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOrderRequest extends FormRequest
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
      'customerId' => ['required', 'integer', 'exists:customers,id'],
      'employeeId' => ['required', 'integer', 'exists:employees,id'],
      'orderType' => ['required', 'string', 'in:regular,express,same_day'],
      'paymentMethod' => ['required', 'string', 'in:cash,debit,credit,ewallet,qris'],
      'paymentStatus' => ['required', 'string', 'in:pending,paid,partial,paid_by_package'],
      'orderStatus' => ['required', 'string', 'in:pending,processing,ready,completed,cancelled'],
      'notes' => ['nullable', 'string', 'max:1000'],
      'internalNotes' => ['nullable', 'string', 'max:1000'],
      'specialInstructions' => ['nullable', 'array'],
      'discountAmount' => ['nullable', 'numeric', 'min:0'],
      'taxAmount' => ['nullable', 'numeric', 'min:0'],
      'paidAmount' => ['nullable', 'numeric', 'min:0'],
      'orderDate' => ['nullable', 'date'],
      'estimatedCompletion' => ['nullable', 'date'],

      'orderItems' => ['required', 'array', 'min:1'],
      'orderItems.*.laundryServiceId' => ['required', 'integer', 'exists:laundry_services,id'],
      'orderItems.*.quantity' => ['required', 'numeric', 'min:0.01'],
      'orderItems.*.discountAmount' => ['nullable', 'numeric', 'min:0'],
      'orderItems.*.isPackageUsage' => ['nullable', 'boolean'],
      'orderItems.*.customerSubscriptionId' => ['nullable', 'integer', 'exists:customer_subscriptions,id'],
      'orderItems.*.itemNotes' => ['nullable', 'string', 'max:500'],
    ];
  }

  /**
   * Get custom attributes for validator errors.
   */
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
      'orderItems.*.quantity' => 'kuantitas',
      'orderItems.*.discountAmount' => 'jumlah diskon item',
      'orderItems.*.isPackageUsage' => 'penggunaan paket',
      'orderItems.*.customerSubscriptionId' => 'langganan pelanggan',
      'orderItems.*.itemNotes' => 'catatan item',
    ];
  }

  /**
   * Get custom messages for validator errors.
   */
  public function messages(): array
  {
    return [
      'customerId.required' => 'Pelanggan harus dipilih',
      'customerId.exists' => 'Pelanggan tidak valid',
      'employeeId.required' => 'Karyawan harus dipilih',
      'employeeId.exists' => 'Karyawan tidak valid',
      'orderType.required' => 'Tipe order harus dipilih',
      'orderType.in' => 'Tipe order tidak valid',
      'paymentMethod.required' => 'Metode pembayaran harus dipilih',
      'paymentMethod.in' => 'Metode pembayaran tidak valid',
      'paymentStatus.required' => 'Status pembayaran harus dipilih',
      'paymentStatus.in' => 'Status pembayaran harus pending, paid, partial, atau paid_by_package',
      'orderStatus.required' => 'Status order harus dipilih',
      'orderStatus.in' => 'Status order tidak valid',
      'orderItems.required' => 'Minimal harus ada 1 item',
      'orderItems.min' => 'Minimal harus ada 1 item',
      'orderItems.*.laundryServiceId.required' => 'Layanan laundry harus dipilih',
      'orderItems.*.laundryServiceId.exists' => 'Layanan laundry tidak valid',
      'orderItems.*.quantity.required' => 'Jumlah harus diisi',
      'orderItems.*.quantity.min' => 'Jumlah minimal 0.01',
      'orderItems.*.customerSubscriptionId.exists' => 'Subscription tidak valid',
    ];
  }
}
