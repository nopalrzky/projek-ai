<?php

namespace App\Http\Resources\CustomerAccount;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerAccountResource extends JsonResource
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
      'phone' => $this->phone ? (string) $this->phone : null,
      'name' => $this->name ? (string) $this->name : null,
      'email' => $this->email ? (string) $this->email : null,
      'gender' => $this->gender ? (string) $this->gender : null,
      'avatar' => $this->avatar ? (string) $this->avatar : null,
      'depositBalance' => (int) $this->deposit_balance,
      'dateOfBirth' => $this->date_of_birth?->toDateString(),
      'isVerified' => (bool) $this->is_verified,
      'isActive' => (bool) $this->is_active,
      'lastLoginAt' => $this->last_login_at?->toISOString(),
      'has_password' => !is_null($this->password),
    ];
  }
}
