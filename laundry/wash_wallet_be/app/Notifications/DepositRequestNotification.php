<?php

namespace App\Notifications;

use App\Models\Deposit;
use Illuminate\Notifications\Notification;

class DepositRequestNotification extends Notification
{
    public function __construct(private Deposit $deposit) {}

    public function via(mixed $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(mixed $notifiable): array
    {
        $cashierName = $this->deposit->cashier?->name ?? 'Kasir';
        $outletName  = $this->deposit->outlet?->name ?? 'Outlet';
        $amount      = number_format($this->deposit->amount, 0, ',', '.');

        return [
            'type'         => 'deposit',
            'title'        => 'Permintaan Setoran Kas Baru',
            'message'      => "Kasir {$cashierName} dari {$outletName} telah menyetor kas sebesar Rp {$amount}",
            'amount'       => $this->deposit->amount,
            'code'         => $this->deposit->code,
            'outlet_name'  => $outletName,
            'cashier_name' => $cashierName,
            'request_id'   => (int) $this->deposit->id,
            'request_type' => 'deposit',
            'url'          => '/dashboard/deposits/' . $this->deposit->id,
        ];
    }
}
