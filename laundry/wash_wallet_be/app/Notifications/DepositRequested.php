<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DepositRequested extends Notification
{
    use Queueable;

    public $deposit;

    /**
     * Create a new notification instance.
     */
    public function __construct($deposit)
    {
        $this->deposit = $deposit;
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
            'type'         => 'deposit',
            'title'        => 'Permintaan Setoran Kas',
            'message'      => "Kasir {$this->deposit->cashier->name} telah menyetor kas sebesar Rp " . number_format($this->deposit->amount, 0, ',', '.'),
            'amount'       => $this->deposit->amount,
            'code'         => $this->deposit->code,
            'outlet_name'  => $this->deposit->outlet->name,
            'cashier_name' => $this->deposit->cashier->name,
            'request_id'   => (int) $this->deposit->id,
            'request_type' => 'deposit',
            'url'          => '/dashboard/deposits/' . $this->deposit->id,
        ];
    }
}
