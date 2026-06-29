<?php

namespace App\Http\Resources\OrderReview;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderReviewResource extends JsonResource
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
            'orderId' => (int) $this->order_id,
            'outletId' => (int) $this->outlet_id,
            'rating' => (int) $this->rating,
            'comment' => $this->comment ? (string) $this->comment : null,
            'maskedName' => $this->masked_name ? (string) $this->masked_name : null,
            'createdAt' => $this->created_at->toISOString(),
            'formattedCreatedAt' => $this->created_at ? (string) $this->created_at->translatedFormat('d M Y') : null,
        ];
    }
}
