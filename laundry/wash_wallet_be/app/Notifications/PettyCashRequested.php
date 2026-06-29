<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PettyCashRequested extends Notification
{
    use Queueable;

    public $pettyCash;

    /**
     * Create a new notification instance.
     */
    public function __construct($pettyCash)
    {
        $this->pettyCash = $pettyCash;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(mixed $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(mixed $notifiable): array
    {
        return [
            'type'         => 'petty_cash',
            'title'        => 'Permintaan Kas Kecil',
            'message'      => "Kasir {$this->pettyCash->cashier->name} meminta kas kecil sebesar Rp " . number_format($this->pettyCash->amount, 0, ',', '.'),
            'amount'       => $this->pettyCash->amount,
            'code'         => $this->pettyCash->code,
            'outlet_name'  => $this->pettyCash->outlet->name,
            'cashier_name' => $this->pettyCash->cashier->name,
            'request_id'   => (int) $this->pettyCash->id,
            'request_type' => 'petty_cash',
            'url'          => '/dashboard/petty-cashes/' . $this->pettyCash->id,
        ];
    }
}
