<?php

namespace App\Http\Resources\Deposit;

use App\Http\Resources\Account\AccountResource;
use App\Http\Resources\Employee\EmployeeResource;
use App\Http\Resources\JournalEntry\JournalEntryResource;
use App\Http\Resources\Outlet\OutletResource;
use App\Http\Resources\User\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DepositResource extends JsonResource
{
  public function toArray(Request $request): array
  {
    return [
      'id' => (int) $this->id,
      'code' => (string) $this->code,
      'ownerId' => (int) $this->owner_id,
      'outletId' => (int) $this->outlet_id,
      'cashierId' => (int) $this->employee_id,
      'sourceAccountId' => (int) $this->source_account_id,
      'destinationAccountId' => (int) $this->destination_account_id,
      'amount' => (float) $this->amount,
      'formattedAmount' => 'Rp ' . number_format($this->amount, 0, ',', '.'),
      'notes' => $this->notes ? (string) $this->notes : null,
      'attachmentPath' => $this->attachment_path ? (string) $this->attachment_path : null,
      'attachmentUrl' => $this->attachment_path
        ? (string) asset('storage/' . $this->attachment_path)
        : null,
      'status' => (string) $this->status,
      'statusLabel' => (string) $this->getStatusLabel(),
      'statusColor' => (string) $this->getStatusColor(),
      'approvedBy' => $this->approved_by ? (int) $this->approved_by : null,
      'approvedAt' => $this->approved_at?->toISOString(),
      'approvedAtFormatted' => $this->approved_at ? (string) $this->approved_at->format('d M Y H:i') : null,
      'rejectionReason' => $this->rejection_reason ? (string) $this->rejection_reason : null,
      'journalEntryId' => $this->journal_entry_id ? (int) $this->journal_entry_id : null,
      'createdAt' => $this->created_at?->toISOString(),
      'updatedAt' => $this->updated_at?->toISOString(),
      'createdAtFormatted' => $this->created_at ? (string) $this->created_at->format('d M Y H:i') : null,
      'createdAtHuman' => $this->created_at ? (string) $this->created_at->diffForHumans() : null,

      'cashier' => EmployeeResource::make($this->whenLoaded('cashier')),

      'outlet' => OutletResource::make($this->whenLoaded('outlet')),

      'sourceAccount' => AccountResource::make($this->whenLoaded('sourceAccount')),

      'destinationAccount' => AccountResource::make($this->whenLoaded('destinationAccount')),

      'approvedByUser' => UserResource::make($this->whenLoaded('approvedBy')),

      'journalEntry' => JournalEntryResource::make($this->whenLoaded('journalEntry')),
    ];
  }
}
