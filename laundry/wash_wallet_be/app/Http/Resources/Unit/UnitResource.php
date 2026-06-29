<?php

namespace App\Http\Resources\Unit;

use App\Http\Resources\LaundryService\LaundryServiceResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UnitResource extends JsonResource
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
            'name' => $this->name ? (string) $this->name : null,
            'symbol' => $this->symbol ? (string) $this->symbol : null,
            'description' => $this->description ? (string) $this->description : null,
            'laundryServices' => LaundryServiceResource::collection($this->whenLoaded('laundryServices')),
            'laundryServicesCount' => $this->whenLoaded('laundryServices', fn() => $this->laundryServices->count(), 0),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
            'deletedAt' => $this->deleted_at?->toISOString(),
        ];
    }
}
