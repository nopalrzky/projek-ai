<?php

namespace App\Http\Resources\QuotaUsageLog;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuotaUsageLogResource extends JsonResource
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
      'customerSubscriptionId' => (int) $this->customer_subscription_id,
      'orderItemId' => $this->order_item_id ? (int) $this->order_item_id : null,
      'amountUsed' => (float) $this->amount_used,
      'createdAt' => $this->created_at?->toISOString(),
      'updatedAt' => $this->updated_at?->toISOString(),

      'orderNumber' => $this->when(
        $this->relationLoaded('orderItem')
          && $this->orderItem
          && $this->orderItem->relationLoaded('order'),
        fn() => $this->orderItem?->order?->order_number,
      ),
      'laundryServiceName' => $this->when(
        $this->relationLoaded('orderItem')
          && $this->orderItem
          && $this->orderItem->relationLoaded('laundryService'),
        fn() => $this->orderItem?->laundryService?->name ?? $this->orderItem?->laundry_service_name,
      ),
      'orderItemQuantity' => $this->when(
        $this->relationLoaded('orderItem') && $this->orderItem,
        fn() => (float) ($this->orderItem?->quantity ?? 0),
      ),
    ];
  }
}
