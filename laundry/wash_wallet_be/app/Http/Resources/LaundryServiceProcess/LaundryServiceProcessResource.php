<?php

namespace App\Http\Resources\LaundryServiceProcess;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\Process\ProcessResource;
use App\Http\Resources\LaundryService\LaundryServiceResource;

class LaundryServiceProcessResource extends JsonResource
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
            'laundryServiceId' => (int) $this->laundry_service_id,
            'processId' => (int) $this->process_id,
            'sequence' => (int) $this->sequence,
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
            'process' => ProcessResource::make($this->whenLoaded('process')),
            'laundryService' => LaundryServiceResource::make($this->whenLoaded('laundryService')),
        ];
    }
}
