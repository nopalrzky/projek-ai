<?php

namespace App\Http\Resources\ServicePackageItem;

use Illuminate\Http\Request;
use App\Http\Resources\ServicePackage\ServicePackageResource;
use App\Http\Resources\LaundryService\LaundryServiceResource;
use Illuminate\Http\Resources\Json\JsonResource;

class ServicePackageItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (int) $this->id,
            'servicePackageId' => $this->service_package_id ? (int) $this->service_package_id : null,
            'laundryServiceId' => $this->laundry_service_id ? (int) $this->laundry_service_id : null,
            'quantity' => (float) $this->quantity,
            'servicePackage' => ServicePackageResource::make($this->whenLoaded('servicePackage')),
            'laundryService' => LaundryServiceResource::make($this->whenLoaded('laundryService')),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
