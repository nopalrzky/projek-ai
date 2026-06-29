<?php

namespace App\Http\Resources\Employee;

use App\Http\Resources\Outlet\OutletResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LoginEmployeeResource extends JsonResource
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
            'name' => (string) $this->name,
            'username' => (string) $this->username,
            'email' => $this->email ? (string) $this->email : null,
            'phone' => $this->phone ? (string) $this->phone : null,
            'gender' => $this->gender ? (string) $this->gender : null,
            'address' => $this->address ? (string) $this->address : null,
            'startDate' => $this->start_date ? (string) $this->start_date->format('Y-m-d') : null,
            'endDate' => $this->end_date ? (string) $this->end_date->format('Y-m-d') : null,
            'isActive' => (bool) $this->is_active,
            'outletId' => (int) $this->outlet_id,
            'cutoffDays' => (int) $this->cutoff_days,
            'lastLoginAt' => $this->last_login_at?->toISOString(),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),

            'outlet' => OutletResource::make($this->whenLoaded('outlet')),

            'accessibleOutlets' => $this->when(true, function () {
                $map = $this->getOutletPositionMap();
                $accessible = [];
                foreach ($map as $outletId => $positions) {
                    $firstPos = $positions->first();
                    $outletName = $firstPos && $firstPos->relationLoaded('outlet') && $firstPos->outlet
                        ? $firstPos->outlet->name
                        : 'Outlet ' . $outletId;

                    $posData = [];
                    foreach ($positions as $pos) {
                        $posData[] = [
                            'positionId'   => (int) $pos->id,
                            'positionName' => (string) $pos->name,
                            'slug'         => (string) $pos->slug,
                            'permissions'  => $pos->relationLoaded('permissions') ? $pos->getPermissionKeys() : [],
                        ];
                    }

                    $accessible[] = [
                        'outletId'   => (int) $outletId,
                        'outletName' => (string) $outletName,
                        'positions'  => $posData,
                    ];
                }
                return $accessible;
            }),

            'allPermissions' => $this->when(true, function () {
                $flatPermissions = [];
                if ($this->relationLoaded('positions')) {
                    foreach ($this->positions as $pos) {
                        if ($pos->relationLoaded('permissions')) {
                            $flatPermissions = array_merge($flatPermissions, $pos->getPermissionKeys());
                        }
                    }
                }
                return array_values(array_unique($flatPermissions));
            }),

            'hasPin' => (bool) !empty($this->pin_hash),
            'formattedGender' => (string) $this->getFormattedGender(),
            'formattedStatus' => (string) ($this->is_active ? 'Aktif' : 'Nonaktif'),
            'statusColor' => (string) ($this->is_active ? 'success' : 'error'),
        ];
    }
}
