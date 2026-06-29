<?php

namespace App\Http\Resources\Fine;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\FineLog\FineLogResource;
use App\Http\Resources\Outlet\OutletResource;

class FineResource extends JsonResource
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
            'outletId' => (int) $this->outlet_id,
            'name' => (string) $this->name,
            'description' => $this->description ? (string) $this->description : null,
            'amount' => (float) $this->amount,
            'outlet' => OutletResource::make($this->whenLoaded('outlet')),
            'fineLogs' => FineLogResource::collection($this->whenLoaded('fineLogs')),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
