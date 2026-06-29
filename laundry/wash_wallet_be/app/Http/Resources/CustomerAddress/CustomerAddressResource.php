<?php

namespace App\Http\Resources\CustomerAddress;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerAddressResource extends JsonResource
{
  /**
   * Transform the resource into an array.
   *
   * @return array<string, mixed>
   */
  public function toArray(Request $request): array
  {
    return [
      'id'             => (int) $this->id,
      'label'          => (string) $this->label,
      'recipientName'  => (string) $this->recipient_name,
      'recipientPhone' => (string) $this->recipient_phone,
      'street'         => (string) $this->street,
      'notes'          => $this->notes ? (string) $this->notes : null,
      'latitude'       => $this->latitude !== null ? (float) $this->latitude : null,
      'longitude'      => $this->longitude !== null ? (float) $this->longitude : null,
      'isPrimary'      => (bool) $this->is_primary,
      'villageId'      => $this->village_id ? (int) $this->village_id : null,
      'districtId'     => $this->district_id ? (int) $this->district_id : null,
      'regencyId'      => $this->regency_id ? (int) $this->regency_id : null,
      'provinceId'     => $this->province_id ? (int) $this->province_id : null,
      'villageName'    => $this->village_name ? (string) $this->village_name : null,
      'districtName'   => $this->district_name ? (string) $this->district_name : null,
      'regencyName'    => $this->regency_name ? (string) $this->regency_name : null,
      'provinceName'   => $this->province_name ? (string) $this->province_name : null,
      'createdAt'      => $this->created_at?->toISOString(),
      'updatedAt'      => $this->updated_at?->toISOString(),
    ];
  }
}
