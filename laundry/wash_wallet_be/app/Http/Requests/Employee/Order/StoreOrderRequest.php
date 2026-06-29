<?php

namespace App\Http\Requests\Employee\Order;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'customerId' => ['required', 'integer', 'exists:customers,id'],
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
      'pickupDate' => ['nullable', 'date'],

      'orderItems' => ['required', 'array', 'min:1'],
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
      'customerId' => 'customer',
      'orderType' => 'order type',
      'paymentMethod' => 'payment method',
      'paymentStatus' => 'payment status',
      'orderStatus' => 'order status',
      'notes' => 'notes',
      'internalNotes' => 'internal notes',
      'specialInstructions' => 'special instructions',
      'discountAmount' => 'discount amount',
      'taxAmount' => 'tax amount',
      'paidAmount' => 'paid amount',
      'orderDate' => 'order date',
      'estimatedCompletion' => 'estimated completion',
      'pickupDate' => 'pickup date',
      'orderItems' => 'order items',
      'orderItems.*.laundryServiceId' => 'laundry service',
      'orderItems.*.quantity' => 'quantity',
      'orderItems.*.discountAmount' => 'item discount amount',
      'orderItems.*.isPackageUsage' => 'package usage',
      'orderItems.*.customerSubscriptionId' => 'customer subscription',
      'orderItems.*.itemNotes' => 'item notes',
    ];
  }

  public function messages(): array
  {
    return [
      'customerId.required' => 'Customer is required.',
      'customerId.exists' => 'The selected customer does not exist.',
      'orderType.required' => 'Order type is required.',
      'orderType.in' => 'The order type must be regular, express, or same_day.',
      'paymentMethod.required' => 'Payment method is required.',
      'paymentMethod.in' => 'The payment method must be cash, debit, credit, ewallet, or qris.',
      'paymentStatus.required' => 'Payment status is required.',
      'paymentStatus.in' => 'The payment status must be pending, paid, partial, or paid_by_package.',
      'orderStatus.required' => 'Order status is required.',
      'orderStatus.in' => 'The order status must be pending, processing, ready, completed, or cancelled.',
      'orderItems.required' => 'Order items are required.',
      'orderItems.min' => 'At least one order item is required.',
      'orderItems.*.laundryServiceId.required' => 'Laundry service is required for each order item.',
      'orderItems.*.laundryServiceId.exists' => 'The selected laundry service does not exist.',
      'orderItems.*.quantity.required' => 'Quantity is required for each order item.',
      'orderItems.*.quantity.min' => 'Quantity must be at least 0.01.',
    ];
  }
}
