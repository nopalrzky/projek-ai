<?php

namespace App\Http\Resources\JournalDetail;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\Account\AccountResource;

class JournalDetailResource extends JsonResource
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
            'journalEntryId' => (int) $this->journal_entry_id,
            'accountId' => (int) $this->account_id,
            'debit' => (float) $this->debit,
            'credit' => (float) $this->credit,
            'memo' => $this->memo ? (string) $this->memo : null,

            'account' => AccountResource::make($this->whenLoaded('account')),

            // Timestamps
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
