<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\WalletWithdrawal;
use Illuminate\Notifications\Notification;

class WithdrawalPaidNotification extends Notification
{
    public function __construct(private readonly WalletWithdrawal $withdrawal) {}

    public function via(mixed $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(mixed $notifiable): array
    {
        $amount = number_format((float) $this->withdrawal->requested_amount, 0, ',', '.');
        $netAmount = number_format((float) $this->withdrawal->net_amount, 0, ',', '.');

        return [
            'type'         => 'withdrawal_paid',
            'title'        => 'Withdrawal Berhasil Ditransfer',
            'message'      => "Permintaan penarikan saldo {$this->withdrawal->code} sebesar Rp {$amount} (Net: Rp {$netAmount}) telah berhasil ditransfer.",
            'amount'       => (float) $this->withdrawal->requested_amount,
            'code'         => $this->withdrawal->code,
            'request_id'   => (int) $this->withdrawal->id,
            'request_type' => 'wallet_withdrawal',
            'url'          => "/dashboard/wallet-withdrawals/{$this->withdrawal->id}",
        ];
    }
}
