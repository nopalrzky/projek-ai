<?php

namespace App\Http\Resources\OperationalDay;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\Outlet\OutletResource;

use App\Http\Resources\CourierSchedule\CourierScheduleResource;

class OperationalDayResource extends JsonResource
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
            'dayOfWeek' => (string) $this->day_of_week,
            'isOpen' => (bool) $this->is_open,
            'openTime' => $this->open_time ? (string) $this->open_time : null,
            'closeTime' => $this->close_time ? (string) $this->close_time : null,
            'notes' => $this->notes ? (string) $this->notes : null,
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
            'outlet' => OutletResource::make($this->whenLoaded('outlet')),
            'duration' => $this->getDuration(),
            'dayLabel' => $this->getDayLabel(),
            'status' => $this->getStatus(),
            'isConfigured' => (bool) $this->isConfigured(),
            'isCurrentlyOpen' => (bool) $this->isCurrentlyOpen(),
            'courierSchedules' => CourierScheduleResource::collection($this->whenLoaded('courierSchedules')),
        ];
    }
}
