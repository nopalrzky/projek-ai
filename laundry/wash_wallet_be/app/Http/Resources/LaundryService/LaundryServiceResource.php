<?php

namespace App\Http\Resources\LaundryService;

use App\Http\Resources\Category\CategoryResource;
use App\Http\Resources\LaundryServiceProcess\LaundryServiceProcessResource;
use App\Http\Resources\Outlet\OutletResource;
use App\Http\Resources\ServicePackageItem\ServicePackageItemResource;
use App\Http\Resources\Unit\UnitResource;
use App\Http\Resources\OrderItem\OrderItemResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LaundryServiceResource extends JsonResource
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
            'categoryId' => (int) $this->category_id,
            'unitId' => (int) $this->unit_id,
            'name' => (string) $this->name,
            'description' => $this->description ? (string) $this->description : null,
            'price' => (float) $this->price,
            'durationHours' =>  (int) $this->duration_hours,
            'minQuantity' =>  (int) $this->min_quantity,
            'slug' => (string) $this->slug,
            'isActive' => (bool) $this->is_active,
            'supportsCourier' => (bool) $this->supports_courier,
            'courierSupportLabel' => $this->supports_courier ? null : 'Datang langsung ke outlet',
            'courierSupportMessage' => $this->supports_courier
                ? null
                : 'Layanan ini tidak tersedia untuk pickup/delivery. Silakan datang langsung ke outlet.',
            'averageRating' => (float) $this->average_rating,
            'totalReviews' => (int) $this->total_reviews,

            'category' => CategoryResource::make($this->whenLoaded('category')),
            'outlet' => OutletResource::make($this->when(
                $this->relationLoaded('category') && $this->category?->relationLoaded('outlet'),
                $this->category?->outlet
            )),
            'unit' => UnitResource::make($this->whenLoaded('unit')),
            'laundryServiceProcesses' => LaundryServiceProcessResource::collection($this->whenLoaded('laundryServiceProcesses')),
            'servicePackageItems' => ServicePackageItemResource::collection($this->whenLoaded('servicePackageItems')),
            'laundryServiceProcessesCount' => $this->whenLoaded('laundryServiceProcesses', fn() => $this->laundryServiceProcesses?->count() ?? 0),
            'servicePackageItemsCount' => $this->whenLoaded('servicePackageItems', fn() => $this->servicePackageItems?->count() ?? 0),
            'orderItems' => OrderItemResource::collection($this->whenLoaded('orderItems')),
            'orderItemsCount' => $this->when(
                isset($this->resource->order_items_count) || $this->relationLoaded('orderItems'),
                fn() => $this->resource->order_items_count
                    ?? ($this->relationLoaded('orderItems') ? $this->orderItems->count() : 0)
            ),

            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
            'deletedAt' => $this->deleted_at?->toISOString(),
        ];
    }
}
