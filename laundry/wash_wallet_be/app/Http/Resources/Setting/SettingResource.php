<?php

namespace App\Http\Resources\Setting;

use App\Http\Resources\OutletSetting\OutletSettingResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SettingResource extends JsonResource
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
            'key' => (string) $this->key,
            'name' => $this->name ? (string) $this->name : null,
            'description' => $this->description ? (string) $this->description : null,
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),

            'outletSettings' => OutletSettingResource::collection($this->whenLoaded('outletSettings')),
            'outletSettingsCount' => $this->whenLoaded('outletSettings', fn() => $this->outletSettings?->count() ?? 0),
        ];
    }
}
