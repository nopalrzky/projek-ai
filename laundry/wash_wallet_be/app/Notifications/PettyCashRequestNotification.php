<?php

namespace App\Notifications;

use App\Models\PettyCash;
use Illuminate\Notifications\Notification;

class PettyCashRequestNotification extends Notification
{
    public function __construct(private PettyCash $pettyCash) {}

    public function via(mixed $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(mixed $notifiable): array
    {
        $cashierName = $this->pettyCash->cashier?->name ?? 'Kasir';
        $outletName  = $this->pettyCash->outlet?->name ?? 'Outlet';
        $amount      = number_format($this->pettyCash->amount, 0, ',', '.');

        return [
            'type'         => 'petty_cash',
            'title'        => 'Permintaan Kas Kecil Baru',
            'message'      => "Kasir {$cashierName} dari {$outletName} mengajukan kas kecil sebesar Rp {$amount}",
            'amount'       => (int) $this->pettyCash->amount,
            'code'         => $this->pettyCash->code,
            'description'  => $this->pettyCash->description,
            'outlet_name'  => $outletName,
            'cashier_name' => $cashierName,
            'request_id'   => (int) $this->pettyCash->id,
            'request_type' => 'petty_cash',
            'url'          => '/dashboard/petty-cashes/' . $this->pettyCash->id,
        ];
    }
}
