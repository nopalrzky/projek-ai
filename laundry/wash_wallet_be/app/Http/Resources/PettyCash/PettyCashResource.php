<?php

namespace App\Http\Resources\PettyCash;

use App\Http\Resources\Account\AccountResource;
use App\Http\Resources\Employee\EmployeeResource;
use App\Http\Resources\JournalEntry\JournalEntryResource;
use App\Http\Resources\Outlet\OutletResource;
use App\Http\Resources\User\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PettyCashResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (int) $this->id,
            'code' => $this->code ? (string) $this->code : null,
            'ownerId' => $this->owner_id ? (int) $this->owner_id : null,
            'outletId' => $this->outlet_id ? (int) $this->outlet_id : null,
            'cashierId' => $this->cashier_id ? (int) $this->cashier_id : null,
            'sourceAccountId' => $this->source_account_id ? (int) $this->source_account_id : null,
            'amount' => (float) $this->amount,
            'formattedAmount' => 'Rp' . number_format($this->amount, 0, ',', '.'),
            'description' => $this->description ? (string) $this->description : null,
            'requestDate' => $this->request_date?->toISOString(),
            'requestDateFormatted' => $this->request_date?->format('d M Y'),
            'status' => $this->status instanceof \BackedEnum ? $this->status->value : ($this->status ? (string) $this->status : null),
            'statusLabel' => $this->getStatusLabel(),
            'statusColor' => $this->getStatusColor(),
            'approvedBy' => $this->approved_by ? (int) $this->approved_by : null,
            'approvedAt' => $this->approved_at?->toISOString(),
            'approvedAtFormatted' => $this->approved_at?->format('d M Y H:i'),
            'rejectionReason' => $this->rejection_reason ? (string) $this->rejection_reason : null,
            'journalEntryId' => $this->journal_entry_id ? (int) $this->journal_entry_id : null,
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
            'createdAtFormatted' => $this->created_at?->format('d M Y H:i'),
            'createdAtHuman' => $this->created_at?->diffForHumans(),

            'cashier' => EmployeeResource::make($this->whenLoaded('cashier')),
            'outlet' => OutletResource::make($this->whenLoaded('outlet')),
            'sourceAccount' => AccountResource::make($this->whenLoaded('sourceAccount')),
            'approvedByUser' => UserResource::make($this->whenLoaded('approvedBy')),
            'journalEntry' => JournalEntryResource::make($this->whenLoaded('journalEntry')),
        ];
    }
}
