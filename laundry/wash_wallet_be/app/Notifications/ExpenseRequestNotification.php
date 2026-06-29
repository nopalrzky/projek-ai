<?php

namespace App\Notifications;

use App\Models\Expense;
use Illuminate\Notifications\Notification;

class ExpenseRequestNotification extends Notification
{
    public function __construct(private Expense $expense) {}

    public function via(mixed $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(mixed $notifiable): array
    {
        $cashierName = $this->expense->employee?->name ?? 'Kasir';
        $outletName  = $this->expense->outlet?->name ?? 'Outlet';
        $amount      = number_format($this->expense->amount, 0, ',', '.');
        $description = $this->expense->description ? " - {$this->expense->description}" : '';

        return [
            'type'         => 'expense',
            'title'        => 'Permintaan Pengeluaran Baru',
            'message'      => "Kasir {$cashierName} dari {$outletName} mengajukan pengeluaran sebesar Rp {$amount}{$description}",
            'amount'       => (int) $this->expense->amount,
            'code'         => $this->expense->code,
            'outlet_name'  => $outletName,
            'cashier_name' => $cashierName,
            'description'  => $this->expense->description,
            'request_id'   => (int) $this->expense->id,
            'request_type' => 'expense',
            'url'          => '/dashboard/expenses/' . $this->expense->id,
        ];
    }
}
