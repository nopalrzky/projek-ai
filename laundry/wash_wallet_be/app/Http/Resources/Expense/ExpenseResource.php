<?php

namespace App\Http\Resources\Expense;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\Outlet\OutletResource;
use App\Http\Resources\Employee\EmployeeResource;
use App\Http\Resources\User\UserResource;
use App\Http\Resources\Account\AccountResource;
use App\Http\Resources\JournalEntry\JournalEntryResource;

class ExpenseResource extends JsonResource
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
            'code' => (string) $this->code,
            'outletId' => (int) $this->outlet_id,
            'userId' => $this->user_id ? (int) $this->user_id : null,
            'employeeId' => $this->employee_id ? (int) $this->employee_id : null,
            'expenseAccountId' => (int) $this->expense_account_id,
            'sourceAccountId' => (int) $this->source_account_id,
            'amount' => (float) $this->amount,
            'date' => $this->date?->format('Y-m-d'),
            'description' => $this->description ? (string) $this->description : null,
            'attachment' => $this->attachment ? (string) $this->attachment : null,
            'attachmentUrl' => $this->attachment_url ? (string) $this->attachment_url : null,
            'hasAttachment' => (bool) $this->has_attachment,
            'status' => $this->status instanceof \BackedEnum ? $this->status->value : ($this->status ? (string) $this->status : null),
            'approvedBy' => $this->approved_by ? (int) $this->approved_by : null,
            'approvedAt' => $this->approved_at?->toISOString(),
            'rejectionReason' => $this->rejection_reason ? (string) $this->rejection_reason : null,
            'journalEntryId' => $this->journal_entry_id ? (int) $this->journal_entry_id : null,
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
            'deletedAt' => $this->deleted_at?->toISOString(),

            'formattedAmount' => 'Rp ' . number_format($this->amount, 0, ',', '.'),
            'formattedDate' => $this->date?->format('d M Y'),
            'statusLabel' => $this->getStatusLabel(),
            'statusColor' => $this->getStatusColor(),
            'isPending' => (bool) $this->isPending(),
            'isApproved' => (bool) $this->isApproved(),
            'isRejected' => (bool) $this->isRejected(),
            'canBeApproved' => (bool) $this->canBeApproved(),
            'canBeRejected' => (bool) $this->canBeRejected(),
            'canBeCancelled' => (bool) $this->canBeCancelled(),

            'outlet' => OutletResource::make($this->whenLoaded('outlet')),
            'employee' => EmployeeResource::make($this->whenLoaded('employee')),
            'user' => UserResource::make($this->whenLoaded('user')),
            'expenseAccount' => AccountResource::make($this->whenLoaded('expenseAccount')),
            'sourceAccount' => AccountResource::make($this->whenLoaded('sourceAccount')),
            'approver' => UserResource::make($this->whenLoaded('approvedBy')),
            'journalEntry' => JournalEntryResource::make($this->whenLoaded('journalEntry')),
        ];
    }
}
