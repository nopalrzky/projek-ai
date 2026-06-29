<?php

namespace App\Http\Resources\OutletSetting;

use App\Http\Resources\Outlet\OutletResource;
use App\Http\Resources\Setting\SettingResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OutletSettingResource extends JsonResource
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
            'settingId' => (int) $this->setting_id,
            'value' => (string) $this->value,
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),

            'outlet' => OutletResource::make($this->whenLoaded('outlet')),
            'setting' => SettingResource::make($this->whenLoaded('setting')),
        ];
    }
}
