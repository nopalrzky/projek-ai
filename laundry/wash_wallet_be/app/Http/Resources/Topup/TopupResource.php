<?php

namespace App\Http\Resources\Topup;

use App\Http\Resources\Outlet\OutletResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\User\UserResource;

class TopupResource extends JsonResource
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
            'userId' => $this->user_id ? (int) $this->user_id : null,
            'outletId' => $this->outlet_id ? (int) $this->outlet_id : null,
            'amountMoney' => $this->amount_money !== null ? (int) $this->amount_money : null,
            'coinReceived' => $this->coin_received !== null ? (int) $this->coin_received : null,
            'status' => $this->status instanceof \BackedEnum ? $this->status->value : ($this->status ? (string) $this->status : null),
            'paymentStatus' => $this->payment_status ? (string) $this->payment_status : null,
            'paymentProvider' => $this->payment_provider ? (string) $this->payment_provider : null,
            'paymentReference' => $this->payment_reference ? (string) $this->payment_reference : null,
            'paymentMethod' => $this->payment_method ? (string) $this->payment_method : null,
            'paymentData'   => $this->payment_data,
            'expiredAt'     => $this->expired_at?->toISOString(),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
            'isMasterTopup' => $this->isMasterTopup(),
            'topupTypeLabel' => $this->topupTypeLabel(),
            'formattedAmountMoney' => $this->formattedAmountMoney(),
            'user' => UserResource::make($this->whenLoaded('user')),
            'outlet' => OutletResource::make($this->whenLoaded('outlet')),

        ];
    }
}
