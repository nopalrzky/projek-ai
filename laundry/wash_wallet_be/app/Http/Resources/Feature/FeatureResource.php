<?php

namespace App\Http\Resources\Feature;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FeatureResource extends JsonResource
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
      'name' => (string) $this->name,
      'description' => $this->description ? (string) $this->description : null,
      'coinPrice' => (int) $this->coin_price,
      'isPaid' => (bool) $this->is_paid,
      'isActive' => (bool) $this->is_active,
      'sortOrder' => (int) $this->sort_order,
      'durationDays' => $this->duration_days ? (int) $this->duration_days : null,
      'createdAt' => $this->created_at?->toISOString(),
      'updatedAt' => $this->updated_at?->toISOString(),
    ];
  }
}
