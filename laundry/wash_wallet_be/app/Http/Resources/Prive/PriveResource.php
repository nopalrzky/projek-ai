<?php

namespace App\Http\Resources\Prive;

use App\Http\Resources\Account\AccountResource;
use App\Http\Resources\Outlet\OutletResource;
use App\Http\Resources\User\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PriveResource extends JsonResource
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
            'outletId' => $this->outlet_id ? (int) $this->outlet_id : null,
            'userId' => $this->user_id ? (int) $this->user_id : null,
            'sourceAccountId' => $this->source_account_id ? (int) $this->source_account_id : null,
            'equityAccountId' => $this->equity_account_id ? (int) $this->equity_account_id : null,
            'amount' => (float) $this->amount,
            'formattedAmount' => 'Rp ' . number_format($this->amount ?? 0, 0, ',', '.'),
            'date' => $this->date?->toISOString(),
            'description' => $this->description ? (string) $this->description : null,
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
            'deletedAt' => $this->deleted_at?->toISOString(),

            'outlet' => OutletResource::make($this->whenLoaded('outlet')),
            'user' => UserResource::make($this->whenLoaded('user')),
            'sourceAccount' => AccountResource::make($this->whenLoaded('sourceAccount')),
            'equityAccount' => AccountResource::make($this->whenLoaded('equityAccount')),
        ];
    }
}
