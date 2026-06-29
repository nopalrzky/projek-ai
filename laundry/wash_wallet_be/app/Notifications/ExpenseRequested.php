<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ExpenseRequested extends Notification
{
    use Queueable;

    public $expense;

    /**
     * Create a new notification instance.
     */
    public function __construct($expense)
    {
        $this->expense = $expense;
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
            'type'         => 'expense',
            'title'        => 'Permintaan Pengeluaran',
            'message'      => "Kasir {$this->expense->cashier->name} mengajukan pengeluaran sebesar Rp " . number_format($this->expense->amount, 0, ',', '.'),
            'amount'       => $this->expense->amount,
            'code'         => $this->expense->code,
            'description'  => $this->expense->description,
            'outlet_name'  => $this->expense->outlet->name,
            'cashier_name' => $this->expense->cashier->name,
            'request_id'   => (int) $this->expense->id,
            'request_type' => 'expense',
            'url'          => '/dashboard/expenses/' . $this->expense->id,
        ];
    }
}
