<?php

namespace App\Http\Resources\Affiliate;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AffiliateResource extends JsonResource
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
            'phone' => $this->phone ? (string) $this->phone : null,
            'email' => $this->email ? (string) $this->email : null,
            'joinedAt' => $this->created_at ? (string) $this->created_at->format('d M Y') : null,
            'totalCommission' => (int) ($this->totalCommission ?? $this->total_commission ?? 0),
            'status' => $this->status instanceof \BackedEnum ? $this->status->value : ($this->status ? (string) $this->status : null),
            'isActive' => (bool) $this->isActive(),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
