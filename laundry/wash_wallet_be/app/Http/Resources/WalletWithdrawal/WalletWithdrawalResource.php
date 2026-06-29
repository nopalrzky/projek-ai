<?php

declare(strict_types=1);

namespace App\Http\Resources\WalletWithdrawal;

use App\Http\Resources\User\UserResource;
use App\Http\Resources\OwnerBankAccount\OwnerBankAccountResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class WalletWithdrawalResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                  => (int) $this->id,
            'userId'              => (int) $this->user_id,
            'ownerBankAccountId' => $this->owner_bank_account_id ? (int) $this->owner_bank_account_id : null,
            'code'                => (string) $this->code,
            'requestedAmount'     => (float) $this->requested_amount,
            'adminFee'            => (float) $this->admin_fee,
            'netAmount'           => (float) $this->net_amount,
            'status'              => (string) $this->status,
            'statusLabel'         => $this->getStatusLabel(),
            'statusColor'         => $this->getStatusColor(),
            'bankName'            => (string) $this->bank_name,
            'bankCode'            => $this->bank_code ? (string) $this->bank_code : null,
            'accountNumber'       => (string) $this->account_number,
            'accountHolderName'   => (string) $this->account_holder_name,
            'adminNote'           => $this->admin_note ? (string) $this->admin_note : null,
            'proofPath'           => $this->proof_path ? (string) $this->proof_path : null,
            'proofUrl'            => $this->proof_path ? Storage::disk('public')->url($this->proof_path) : null,
            'processedBy'         => $this->processed_by ? (int) $this->processed_by : null,
            'processedAt'         => $this->processed_at?->toISOString(),
            'paidAt'              => $this->paid_at?->toISOString(),
            'rejectedAt'          => $this->rejected_at?->toISOString(),
            'cancelledAt'         => $this->cancelled_at?->toISOString(),
            'createdAt'           => $this->created_at?->toISOString(),
            'updatedAt'           => $this->updated_at?->toISOString(),
            'user'                => UserResource::make($this->whenLoaded('user')),
            'ownerBankAccount'   => OwnerBankAccountResource::make($this->whenLoaded('ownerBankAccount')),
            'processedByUser'     => UserResource::make($this->whenLoaded('processedByUser')),
        ];
    }

    private function getStatusLabel(): string
    {
        return match ($this->status) {
            'pending'    => 'Menunggu',
            'processing' => 'Diproses',
            'paid'       => 'Dibayar',
            'rejected'   => 'Ditolak',
            'cancelled'  => 'Dibatalkan',
            default      => $this->status,
        };
    }

    private function getStatusColor(): string
    {
        return match ($this->status) {
            'pending'    => 'warning',
            'processing' => 'info',
            'paid'       => 'success',
            'rejected'   => 'danger',
            'cancelled'  => 'secondary',
            default      => 'primary',
        };
    }
}
