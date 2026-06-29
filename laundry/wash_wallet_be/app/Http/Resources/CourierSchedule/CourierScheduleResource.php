<?php

namespace App\Http\Resources\CourierSchedule;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\Outlet\OutletResource;
use App\Services\CourierScheduleAvailabilityService;

class CourierScheduleResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $availability = app(CourierScheduleAvailabilityService::class)
            ->resolve($this->resource, $request->input('date'));

        return [
            'id'          => (int) $this->id,
            'outletId'    => $this->outlet_id ? (int) $this->outlet_id : null,
            'dayOfWeek'   => (string) $this->day_of_week,
            'dayLabel'    => $this->getDayLabel(),
            'type'        => (string) $this->type,
            'typeLabel'   => $this->getTypeLabel(),
            'startTime'   => $this->start_time ? $this->start_time->format('H:i') : null,
            'endTime'     => $this->end_time ? $this->end_time->format('H:i') : null,
            'isActive'    => (bool) $this->is_active,
            'isBookable'  => (bool) $availability['isBookable'],
            'availabilityStatus' => (string) $availability['availabilityStatus'],
            'availabilityLabel' => (string) $availability['availabilityLabel'],
            'unavailableReason' => $availability['unavailableReason'],
            'createdAt'   => $this->created_at?->toISOString(),
            'updatedAt'   => $this->updated_at?->toISOString(),

            'outlet'      => OutletResource::make($this->whenLoaded('outlet')),
        ];
    }
}
