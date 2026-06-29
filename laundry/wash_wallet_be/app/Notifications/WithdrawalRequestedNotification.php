<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\WalletWithdrawal;
use Illuminate\Notifications\Notification;

class WithdrawalRequestedNotification extends Notification
{
    public function __construct(private readonly WalletWithdrawal $withdrawal) {}

    public function via(mixed $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(mixed $notifiable): array
    {
        $ownerName = $this->withdrawal->user?->name ?? 'Owner';
        $amount = number_format((float) $this->withdrawal->requested_amount, 0, ',', '.');
        $netAmount = number_format((float) $this->withdrawal->net_amount, 0, ',', '.');

        return [
            'type'         => 'withdrawal_requested',
            'title'        => 'Permintaan Withdrawal Baru',
            'message'      => "{$ownerName} mengajukan withdrawal sebesar Rp {$amount} (Net: Rp {$netAmount}) ke {$this->withdrawal->bank_name}",
            'amount'       => (float) $this->withdrawal->requested_amount,
            'code'         => $this->withdrawal->code,
            'owner_name'   => $ownerName,
            'bank_name'    => $this->withdrawal->bank_name,
            'net_amount'   => (float) $this->withdrawal->net_amount,
            'request_id'   => (int) $this->withdrawal->id,
            'request_type' => 'wallet_withdrawal',
            'url'          => "/dashboard/admin/wallet-withdrawals/{$this->withdrawal->id}",
        ];
    }
}
