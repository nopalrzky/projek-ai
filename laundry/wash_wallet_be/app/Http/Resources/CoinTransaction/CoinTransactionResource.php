<?php

namespace App\Http\Resources\CoinTransaction;

use App\Http\Resources\Outlet\OutletResource;
use App\Http\Resources\User\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CoinTransactionResource extends JsonResource
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
            'userId' => (int) $this->user_id,
            'outletId' => $this->outlet_id ? (int) $this->outlet_id : null,
            'type' => (string) $this->type,
            'typeLabel' => $this->getTypeLabel(),
            'amount' => (int) $this->amount,
            'referenceType' => $this->reference_type ? (string) $this->reference_type : null,
            'referenceId' => $this->reference_id ? (int) $this->reference_id : null,
            'description' => $this->description ? (string) $this->description : null,
            'transactionNumber' => $this->transaction_number ? (string) $this->transaction_number : null,
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
            'user' => UserResource::make($this->whenLoaded('user')),
            'outlet' => OutletResource::make($this->whenLoaded('outlet')),
        ];
    }

    /**
     * Get transaction type label
     */
    private function getTypeLabel(): string
    {
        return match ($this->type) {
            'topup' => 'Topup',
            'commission' => 'Commission',
            'deduction' => 'Deduction',
            'refund' => 'Refund',
            default => ucfirst($this->type),
        };
    }
}
