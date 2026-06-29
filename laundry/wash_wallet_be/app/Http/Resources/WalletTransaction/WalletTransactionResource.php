<?php

declare(strict_types=1);

namespace App\Http\Resources\WalletTransaction;

use App\Http\Resources\User\UserResource;
use App\Http\Resources\Outlet\OutletResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WalletTransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                  => (int) $this->id,
            'userId'              => (int) $this->user_id,
            'outletId'            => $this->outlet_id ? (int) $this->outlet_id : null,
            'orderId'             => $this->order_id ? (int) $this->order_id : null,
            'walletWithdrawalId'  => $this->wallet_withdrawal_id ? (int) $this->wallet_withdrawal_id : null,
            'transactionNumber'   => (string) $this->transaction_number,
            'type'                => (string) $this->type,
            'typeLabel'           => $this->getTypeLabel(),
            'amount'              => (float) $this->amount,
            'balanceBefore'       => (float) $this->balance_before,
            'balanceAfter'        => (float) $this->balance_after,
            'description'         => $this->description ? (string) $this->description : null,
            'isCredit'            => (bool) $this->isCredit(),
            'createdAt'           => $this->created_at?->toISOString(),
            'updatedAt'           => $this->updated_at?->toISOString(),
            'user'                => UserResource::make($this->whenLoaded('user')),
            'outlet'              => OutletResource::make($this->whenLoaded('outlet')),
        ];
    }

    private function getTypeLabel(): string
    {
        return match ($this->type) {
            'order_transfer_income'       => 'Pendapatan Transfer',
            'order_wallet_income'         => 'Pendapatan Wallet',
            'withdrawal_request'          => 'Permintaan Withdrawal',
            'withdrawal_rejected_refund'  => 'Refund Penolakan',
            'withdrawal_cancelled_refund' => 'Refund Pembatalan',
            'manual_adjustment'           => 'Penyesuaian Manual',
            default                       => $this->type,
        };
    }
}
