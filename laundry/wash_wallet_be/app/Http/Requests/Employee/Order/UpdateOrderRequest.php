<?php

namespace App\Http\Requests\Employee\Order;

use Illuminate\Foundation\Http\FormRequest;

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
            'orderItems.*.laundryServiceId' => ['required_with:orderItems', 'integer', 'exists:laundry_services,id'],
            'orderItems.*.quantity' => ['required_with:orderItems', 'numeric', 'min:0.01'],
            'orderItems.*.discountAmount' => ['nullable', 'numeric', 'min:0'],
            'orderItems.*.productionStatus' => ['nullable', 'string', 'in:pending,in_progress,completed'],
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
            'orderItems.*.productionStatus' => 'production status',
            'orderItems.*.isPackageUsage' => 'package usage',
            'orderItems.*.customerSubscriptionId' => 'customer subscription',
            'orderItems.*.itemNotes' => 'item notes',
        ];
    }

    public function messages(): array
    {
        return [
            'customerId.exists' => 'The selected customer does not exist.',
            'orderType.in' => 'The order type must be regular, express, or same_day.',
            'paymentMethod.in' => 'The payment method must be cash, debit, credit, ewallet, or qris.',
            'paymentStatus.in' => 'The payment status must be pending, paid, partial, or paid_by_package.',
            'orderStatus.in' => 'The order status must be pending, processing, ready, completed, or cancelled.',
            'orderItems.min' => 'At least one order item is required.',
            'orderItems.*.laundryServiceId.required_with' => 'Laundry service is required for each order item.',
            'orderItems.*.laundryServiceId.exists' => 'The selected laundry service does not exist.',
            'orderItems.*.quantity.required_with' => 'Quantity is required for each order item.',
            'orderItems.*.quantity.min' => 'Quantity must be at least 0.01.',
            'orderItems.*.productionStatus.in' => 'Production status must be pending, in_progress, or completed.',
        ];
    }
}
