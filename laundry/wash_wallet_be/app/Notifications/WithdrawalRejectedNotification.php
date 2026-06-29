<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\WalletWithdrawal;
use Illuminate\Notifications\Notification;

class WithdrawalRejectedNotification extends Notification
{
    public function __construct(private readonly WalletWithdrawal $withdrawal) {}

    public function via(mixed $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(mixed $notifiable): array
    {
        $amount = number_format((float) $this->withdrawal->requested_amount, 0, ',', '.');
        $reason = $this->withdrawal->admin_note ?? 'Tidak ada alasan spesifik';

        return [
            'type'         => 'withdrawal_rejected',
            'title'        => 'Withdrawal Ditolak',
            'message'      => "Permintaan penarikan saldo {$this->withdrawal->code} sebesar Rp {$amount} ditolak. Alasan: {$reason}",
            'amount'       => (float) $this->withdrawal->requested_amount,
            'code'         => $this->withdrawal->code,
            'request_id'   => (int) $this->withdrawal->id,
            'request_type' => 'wallet_withdrawal',
            'url'          => "/dashboard/wallet-withdrawals/{$this->withdrawal->id}",
        ];
    }
}
