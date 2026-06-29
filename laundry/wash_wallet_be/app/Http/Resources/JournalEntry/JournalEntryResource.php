<?php

namespace App\Http\Resources\JournalEntry;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\Outlet\OutletResource;
use App\Http\Resources\JournalDetail\JournalDetailResource;

class JournalEntryResource extends JsonResource
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
            'transactionNumber' => (string) $this->transaction_number,
            'date' => $this->date?->format('Y-m-d'),
            'description' => $this->description ? (string) $this->description : null,
            'referenceType' => $this->reference_type ? (string) $this->reference_type : null,
            'referenceId' => $this->reference_id ? (int) $this->reference_id : null,
            'isManual' => (bool) $this->is_manual,
            'totalAmount' => (float) $this->total_amount,

            'canBeEdited' => (bool) $this->canBeEdited(),
            'canBeDeleted' => (bool) $this->canBeDeleted(),

            // Relationships
            'outlet' => OutletResource::make($this->whenLoaded('outlet')),
            'journalDetails' => JournalDetailResource::collection($this->whenLoaded('journalDetails')),
            'reference' => $this->when(
                $this->relationLoaded('reference') && $this->reference,
                fn() => $this->reference
            ),

            // Timestamps
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
            'deletedAt' => $this->when(
                $this->deleted_at,
                fn() => $this->deleted_at?->toISOString()
            ),
        ];
    }

    /**
     * Get additional data that should be returned with the resource array.
     *
     * @return array<string, mixed>
     */
    public function with(Request $request): array
    {
        return [
            'meta' => [
                'timestamp' => now()->toISOString(),
            ],
        ];
    }
}
