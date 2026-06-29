<?php

namespace App\Http\Resources\Category;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\Outlet\OutletResource;
use App\Http\Resources\LaundryService\LaundryServiceResource;

class CategoryResource extends JsonResource
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
            'outletId' => $this->outlet_id ? (int) $this->outlet_id : null,
            'name' => (string) $this->name,
            'slug' => (string) $this->slug,
            'description' => $this->description ? (string) $this->description : null,
            'isActive' => (bool) $this->is_active,
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
            'deletedAt' => $this->deleted_at?->toISOString(),
            'outlet' => OutletResource::make($this->whenLoaded('outlet')),
            'laundryServices' => LaundryServiceResource::collection($this->whenLoaded('laundryServices')),
            'laundryServicesCount' => $this->whenLoaded('laundryServices', fn() => $this->laundryServices?->count() ?? 0),

        ];
    }
}
