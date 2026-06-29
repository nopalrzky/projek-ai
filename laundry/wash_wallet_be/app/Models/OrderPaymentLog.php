<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Table('order_payment_logs')]
class OrderPaymentLog extends Model
{
    use HasFactory;

    const METHOD_CASH     = 'cash';
    const METHOD_TRANSFER = 'transfer';
    const METHOD_QRIS     = 'qris';
    const METHOD_DEBIT    = 'debit';

    protected $fillable = [
        'order_id',
        'employee_id',
        'amount',
        'payment_method',
        'reference_number',
        'notes',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount'     => 'decimal:2',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function getPaymentMethodLabel(): string
    {
        return match ($this->payment_method) {
            self::METHOD_CASH     => 'Tunai',
            self::METHOD_TRANSFER => 'Transfer',
            self::METHOD_QRIS     => 'QRIS',
            self::METHOD_DEBIT    => 'Kartu Debit',
            default               => 'Lainnya',
        };
    }

    public function getFormattedAmount(): string
    {
        return 'Rp ' . number_format((float) $this->amount, 0, ',', '.');
    }

    /**
     * Check if the payment log can be deleted based on the accounting period.
     */
    public function canBeDeletedByPeriod(): bool
    {
        $outletId = $this->order->outlet_id;

        $closedPeriodExists = AccountingPeriod::query()
            ->byOutletId($outletId)
            ->closed()
            ->where('start_date', '<=', $this->created_at->toDateString())
            ->where('end_date', '>=', $this->created_at->toDateString())
            ->exists();

        return !$closedPeriodExists;
    }
}
