<?php

namespace App\Http\Resources\Order;

use App\Models\Order;
use App\Http\Resources\Customer\CustomerResource;
use App\Http\Resources\CustomerAccount\CustomerAccountResource;
use App\Http\Resources\CustomerAddress\CustomerAddressResource;
use App\Http\Resources\Employee\EmployeeResource;
use App\Http\Resources\OrderItem\OrderItemResource;
use App\Http\Resources\Outlet\OutletResource;
use App\Http\Resources\OrderReview\OrderReviewResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (int) $this->id,
            'orderNumber' => (string) $this->order_number,
            'source' => (string) $this->source,
            'sourceLabel' => (string) $this->getSourceLabel(),
            'status' => (string) $this->status,
            'statusLabel' => (string) $this->getStatusLabel(),
            'statusBadgeVariant' => (string) $this->getStatusBadgeVariant(),
            'deliveryType' => (string) $this->delivery_type,
            'deliveryTypeLabel' => (string) $this->getDeliveryTypeLabel(),
            'completionPercentage' => (int) $this->completion_percentage,
            'paymentStatus' => (string) $this->payment_status,
            'paymentStatusLabel' => (string) $this->getPaymentStatusLabel(),
            'paymentStatusBadgeVariant' => (string) $this->getPaymentStatusBadgeVariant(),
            'paymentMethod' => $this->payment_method ? (string) $this->payment_method : null,

            'customerId' => (int) $this->customer_id,
            'customerAccountId' => (int) $this->customer_account_id,
            'employeeId' => (int) $this->employee_id,
            'outletId' => (int) $this->outlet_id,
            'customerAddressId' => (int) $this->customer_address_id,
            'updatedBy' => (int) $this->updated_by,

            'customer' => $this->whenLoaded('customer', fn() => CustomerResource::make($this->customer)),
            'customerAccount' => $this->whenLoaded('customerAccount', fn() => CustomerAccountResource::make($this->customerAccount)),
            'employee' => $this->whenLoaded('employee', fn() => EmployeeResource::make($this->employee)),
            'outlet' => $this->whenLoaded('outlet', fn() => OutletResource::make($this->outlet)),
            'customerAddress' => $this->whenLoaded('customerAddress', fn() => CustomerAddressResource::make($this->customerAddress)),
            'statusUpdater' => $this->whenLoaded('statusUpdater', fn() => EmployeeResource::make($this->statusUpdater)),

            'subtotal' => (float) $this->subtotal,
            'formattedSubtotal' => (string) $this->getFormattedSubtotal(),
            'discountAmount' => (float) $this->discount_amount,
            'formattedDiscountAmount' => (string) $this->getFormattedDiscountAmount(),
            'taxAmount' => (float) $this->tax_amount,
            'formattedTaxAmount' => (string) $this->getFormattedTaxAmount(),
            'pickupFee' => (float) $this->pickup_fee,
            'formattedPickupFee' => (string) $this->getFormattedPickupFee(),
            'deliveryFee' => (float) $this->delivery_fee,
            'formattedDeliveryFee' => (string) $this->getFormattedDeliveryFee(),
            'totalAmount' => (float) $this->total_amount,
            'formattedTotalAmount' => (string) $this->getFormattedTotalAmount(),
            'paidAmount' => (float) $this->paid_amount,
            'formattedPaidAmount' => (string) $this->getFormattedPaidAmount(),
            'remainingAmount' => (float) $this->remaining_amount,
            'formattedRemainingAmount' => (string) $this->getFormattedRemainingAmount(),

            'midtransOrderId' => $this->midtrans_order_id ? (string) $this->midtrans_order_id : null,
            'midtransTransactionId' => $this->midtrans_transaction_id ? (string) $this->midtrans_transaction_id : null,
            'qrUrl' => $this->qr_url ? (string) $this->qr_url : null,

            'orderDate' => $this->order_date ? (string) $this->order_date : null,
            'formattedOrderDate' => (string) $this->getFormattedOrderDate(),
            'estimatedCompletion' => $this->estimated_completion?->toISOString(),
            'formattedEstimatedCompletion' => (string) $this->getFormattedEstimatedCompletion(),
            'actualCompletion' => $this->actual_completion?->toISOString(),
            'formattedActualCompletion' => (string) $this->getFormattedActualCompletion(),

            'pickupDate' => $this->pickup_date?->toISOString(),
            'formattedPickupDate' => (string) $this->getFormattedPickupDate(),
            'pickupAddress' => $this->pickup_address ? (string) $this->pickup_address : null,
            'pickupSchedule' => $this->pickup_schedule?->toISOString(),
            'formattedPickupSchedule' => (string) $this->getFormattedPickupSchedule(),

            'deliveryDate' => $this->delivery_date?->toISOString(),
            'formattedDeliveryDate' => (string) $this->getFormattedDeliveryDate(),
            'deliveryAddress' => $this->delivery_address ? (string) $this->delivery_address : null,
            'deliverySchedule' => $this->delivery_schedule?->toISOString(),
            'formattedDeliverySchedule' => (string) $this->getFormattedDeliverySchedule(),

            'lastStatusUpdate' => $this->last_status_update?->toISOString(),
            'formattedLastStatusUpdate' => (string) $this->getFormattedLastStatusUpdate(),

            'canPay' => (bool) $this->canAcceptPayment(),
            'canScheduleDelivery' => (bool) ($this->status === Order::STATUS_COMPLETED && ($this->payment_method === 'cod' || $this->payment_status === Order::PAYMENT_STATUS_PAID)),
            'requiresPaymentBeforeDelivery' => (bool) ($this->payment_method !== 'cod' && $this->payment_status !== Order::PAYMENT_STATUS_PAID),

            'notes' => $this->notes ? (string) $this->notes : null,
            'internalNotes' => $this->internal_notes ? (string) $this->internal_notes : null,
            'specialInstructions' => $this->special_instructions,

            'orderItems' => OrderItemResource::collection($this->whenLoaded('orderItems')),
            'orderItemsCount' => $this->whenLoaded('orderItems', fn() => $this->orderItems?->count() ?? 0),
            'orderStatusHistories' => OrderStatusHistoryResource::collection($this->whenLoaded('orderStatusHistories')),
            'orderPaymentLogs' => OrderPaymentLogResource::collection($this->whenLoaded('orderPaymentLogs')),
            'orderPaymentLogsCount' => $this->whenLoaded('orderPaymentLogs', fn() => $this->orderPaymentLogs?->count() ?? 0),
            'review' => $this->whenLoaded('review', fn() => OrderReviewResource::make($this->review)),
            'hasReview' => $this->whenLoaded('review', fn() => (bool) $this->review, false),
            'createdAt' => $this->created_at->toISOString(),
            'updatedAt' => $this->updated_at->toISOString(),
            'formattedCreatedAt' => (string) $this->getFormattedCreatedAt(),
            'formattedUpdatedAt' => (string) $this->getFormattedUpdatedAt(),
            'deletedAt' => $this->deleted_at?->toISOString(),
        ];
    }
}
