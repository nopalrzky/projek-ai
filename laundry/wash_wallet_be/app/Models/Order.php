<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Carbon\Carbon;

#[Table('orders')]
class Order extends Model
{
    use HasFactory, SoftDeletes;

    public bool $wasAutoAccepted = false;

    const STATUS_REQUESTED = 'requested';
    const STATUS_CANCELLED = 'cancelled';
    const STATUS_ACCEPTED = 'accepted';
    const STATUS_REJECTED = 'rejected';
    const STATUS_PICKING_UP = 'picking_up';
    const STATUS_PICKED_UP = 'picked_up';
    const STATUS_RECEIVED = 'received';
    const STATUS_WEIGHING = 'weighing';
    const STATUS_READY_TO_PROCESS = 'ready_to_process';
    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_READY = 'ready';
    const STATUS_DELIVERING = 'delivering';
    const STATUS_DELIVERED = 'delivered';
    const STATUS_COMPLETED = 'completed';
    const STATUS_PENDING_DROPOFF = 'pending_dropoff';

    const PAYMENT_STATUS_NOT_YET_PRICED = 'not_yet_priced';
    const PAYMENT_STATUS_UNPAID = 'unpaid';
    const PAYMENT_STATUS_PARTIAL = 'partial';
    const PAYMENT_STATUS_PAID = 'paid';
    const PAYMENT_STATUS_REFUNDED = 'refunded';
    const PAYMENT_STATUS_PAID_BY_PACKAGE = 'paid_by_package';
    const PAYMENT_STATUS_COD = 'cod';

    const SOURCE_CASHIER = 'cashier';
    const SOURCE_CUSTOMER_APP = 'customer_app';

    const DELIVERY_TYPE_PICKUP = 'pickup';
    const DELIVERY_TYPE_DELIVERY = 'delivery';

    protected $fillable = [
        'employee_id',
        'customer_id',
        'customer_account_id',
        'source',
        'order_number',
        'status',
        'subtotal',
        'discount_amount',
        'tax_amount',
        'total_amount',
        'paid_amount',
        'remaining_amount',
        'payment_status',
        'payment_method',
        'delivery_type',
        'midtrans_order_id',
        'midtrans_transaction_id',
        'qr_url',
        'order_date',
        'estimated_completion',
        'actual_completion',
        'pickup_date',
        'pickup_address',
        'pickup_schedule',
        'delivery_date',
        'delivery_address',
        'delivery_schedule',
        'pickup_fee',
        'delivery_fee',
        'notes',
        'internal_notes',
        'special_instructions',
        'last_status_update',
        'updated_by',
        'outlet_id',
        'customer_address_id',
    ];

    protected $hidden = [
        'deleted_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'subtotal'             => 'decimal:2',
            'discount_amount'      => 'decimal:2',
            'tax_amount'           => 'decimal:2',
            'total_amount'         => 'decimal:2',
            'paid_amount'          => 'decimal:2',
            'remaining_amount'     => 'decimal:2',
            'pickup_fee'           => 'decimal:2',
            'delivery_fee'         => 'decimal:2',
            'order_date'           => 'datetime',
            'estimated_completion' => 'datetime',
            'actual_completion'    => 'datetime',
            'pickup_date'          => 'datetime',
            'pickup_schedule'      => 'datetime',
            'delivery_date'        => 'datetime',
            'delivery_schedule'    => 'datetime',
            'last_status_update'   => 'datetime',
            'special_instructions' => 'array',
            'created_at'           => 'datetime',
            'updated_at'           => 'datetime',
            'deleted_at'           => 'datetime',
            'outlet_id'            => 'integer',
            'customer_address_id'  => 'integer',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Lifecycle Hooks
    |--------------------------------------------------------------------------
    */

    protected static function booted(): void
    {
        static::creating(function ($order) {
            if (empty($order->order_number)) {
                $order->order_number = static::generateOrderNumber();
            }

            if (empty($order->order_date)) {
                $order->order_date = now();
            }

            $order->remaining_amount = $order->total_amount - $order->paid_amount;
            $order->updatePaymentStatus();
        });

        static::updating(function ($order) {
            if ($order->isDirty(['paid_amount', 'total_amount'])) {
                $order->remaining_amount = $order->total_amount - $order->paid_amount;
                $order->updatePaymentStatus();
            }

            if ($order->isDirty('status')) {
                $order->last_status_update = now();
            }
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Accessors & Mutators
    |--------------------------------------------------------------------------
    */

    protected function completionPercentage(): Attribute
    {
        return Attribute::get(function () {
            $items = $this->orderItems;
            $total = $items->count();

            if ($total === 0) {
                return 0;
            }

            $completed = $items->filter(fn($item) => $item->status === OrderItem::STATUS_DONE)->count();

            return (int) round(($completed / $total) * 100);
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function customerAccount(): BelongsTo
    {
        return $this->belongsTo(CustomerAccount::class);
    }

    public function outlet(): BelongsTo
    {
        return $this->belongsTo(Outlet::class);
    }

    public function customerAddress(): BelongsTo
    {
        return $this->belongsTo(CustomerAddress::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function statusUpdater(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'updated_by');
    }

    public function orderStatusHistories(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class)->orderBy('created_at', 'desc');
    }

    public function orderPaymentLogs(): HasMany
    {
        return $this->hasMany(OrderPaymentLog::class)->orderBy('created_at', 'desc');
    }

    public function review(): HasOne
    {
        return $this->hasOne(OrderReview::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Status Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }

    public function scopeRequested(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_REQUESTED);
    }

    public function scopeAccepted(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_ACCEPTED);
    }

    public function scopePickingUp(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_PICKING_UP);
    }

    public function scopePickedUp(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_PICKED_UP);
    }

    public function scopeReceived(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_RECEIVED);
    }

    public function scopeWeighing(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_WEIGHING);
    }

    public function scopeReadyToProcess(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_READY_TO_PROCESS);
    }

    public function scopeInProgress(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_IN_PROGRESS);
    }

    public function scopeReady(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_READY);
    }

    public function scopeDelivering(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_DELIVERING);
    }

    public function scopeDelivered(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_DELIVERED);
    }

    public function scopeCancelled(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_CANCELLED);
    }

    public function scopeRejected(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_REJECTED);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->whereNotIn('status', [
            self::STATUS_COMPLETED,
            self::STATUS_CANCELLED,
            self::STATUS_REJECTED
        ]);
    }

    public function scopeCompleted(Builder $query): Builder
    {
        return $query->whereIn('status', [
            self::STATUS_COMPLETED,
            self::STATUS_DELIVERED
        ]);
    }

    public function scopeDeliveryType(Builder $query, string $type): Builder
    {
        return $query->where('delivery_type', $type);
    }

    /*
    |--------------------------------------------------------------------------
    | Payment Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeByPaymentStatus(Builder $query, string $paymentStatus): Builder
    {
        return $query->where('payment_status', $paymentStatus);
    }

    public function scopeUnpaid(Builder $query): Builder
    {
        return $query->where('payment_status', self::PAYMENT_STATUS_UNPAID);
    }

    public function scopePartialPaid(Builder $query): Builder
    {
        return $query->where('payment_status', self::PAYMENT_STATUS_PARTIAL);
    }

    public function scopePaid(Builder $query): Builder
    {
        return $query->where('payment_status', self::PAYMENT_STATUS_PAID);
    }

    public function scopePaidByPackage(Builder $query): Builder
    {
        return $query->where('payment_status', self::PAYMENT_STATUS_PAID_BY_PACKAGE);
    }

    public function scopeRefunded(Builder $query): Builder
    {
        return $query->where('payment_status', self::PAYMENT_STATUS_REFUNDED);
    }

    /*
    |--------------------------------------------------------------------------
    | Filter Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeById(Builder $query, int $id): Builder
    {
        return $query->where('id', $id);
    }

    public function scopeByIds(Builder $query, array $ids): Builder
    {
        return $query->whereIn('id', $ids);
    }

    public function scopeByOrderNumber(Builder $query, string $orderNumber): Builder
    {
        return $query->where('order_number', $orderNumber);
    }

    public function scopeByCustomerId(Builder $query, int $customerId): Builder
    {
        return $query->where('customer_id', $customerId);
    }

    public function scopeByEmployeeId(Builder $query, int $employeeId): Builder
    {
        return $query->where('employee_id', $employeeId);
    }

    public function scopeByOutletId(Builder $query, int $outletId): Builder
    {
        return $query->where('outlet_id', $outletId);
    }

    public function scopeByOutletIds(Builder $query, array $outletIds): Builder
    {
        return $query->whereIn('outlet_id', $outletIds);
    }

    public function scopeByCustomerAccountId(Builder $query, int $accountId): Builder
    {
        return $query->where('customer_account_id', $accountId);
    }

    public function scopeByOwnerId(Builder $query, int $ownerId): Builder
    {
        return $query->whereHas('employee.outlet', function ($q) use ($ownerId) {
            $q->where('owner_id', $ownerId);
        });
    }

    public function scopeByMidtransOrderId(Builder $query, string $midtransOrderId): Builder
    {
        return $query->where('midtrans_order_id', $midtransOrderId);
    }

    public function scopeByMidtransTransactionId(Builder $query, string $midtransTransactionId): Builder
    {
        return $query->where('midtrans_transaction_id', $midtransTransactionId);
    }

    public function scopeMinTotalAmount(Builder $query, float $amount): Builder
    {
        return $query->where('total_amount', '>=', $amount);
    }

    public function scopeMaxTotalAmount(Builder $query, float $amount): Builder
    {
        return $query->where('total_amount', '<=', $amount);
    }

    public function scopeMinPaidAmount(Builder $query, float $amount): Builder
    {
        return $query->where('paid_amount', '>=', $amount);
    }

    public function scopeMaxPaidAmount(Builder $query, float $amount): Builder
    {
        return $query->where('paid_amount', '<=', $amount);
    }

    public function scopeMinRemainingAmount(Builder $query, float $amount): Builder
    {
        return $query->where('remaining_amount', '>=', $amount);
    }

    public function scopeMaxRemainingAmount(Builder $query, float $amount): Builder
    {
        return $query->where('remaining_amount', '<=', $amount);
    }

    public function scopeOrderDateFrom(Builder $query, Carbon $date): Builder
    {
        return $query->where('order_date', '>=', $date);
    }

    public function scopeOrderDateTo(Builder $query, Carbon $date): Builder
    {
        return $query->where('order_date', '<=', $date);
    }

    public function scopePickupDateFrom(Builder $query, Carbon $date): Builder
    {
        return $query->where('pickup_date', '>=', $date);
    }

    public function scopePickupDateTo(Builder $query, Carbon $date): Builder
    {
        return $query->where('pickup_date', '<=', $date);
    }

    public function scopePickupScheduleFrom(Builder $query, Carbon $date): Builder
    {
        return $query->where('pickup_schedule', '>=', $date);
    }

    public function scopePickupScheduleTo(Builder $query, Carbon $date): Builder
    {
        return $query->where('pickup_schedule', '<=', $date);
    }

    public function scopeForCourierPickupDate(Builder $query, Carbon $date): Builder
    {
        $startOfDay = $date->copy()->startOfDay();
        $endOfDay   = $date->copy()->endOfDay();

        return $query
            ->where('source', self::SOURCE_CUSTOMER_APP)
            ->whereNotNull('pickup_schedule')
            ->where(function (Builder $q) use ($startOfDay, $endOfDay) {
                $q->whereBetween('pickup_schedule', [$startOfDay, $endOfDay])
                    ->orWhere('pickup_schedule', '<', $startOfDay);
            });
    }

    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->whereNested(function ($q) use ($search) {
            $q->where('order_number', 'like', "%{$search}%")
                ->orWhere('notes', 'like', "%{$search}%")
                ->orWhere('internal_notes', 'like', "%{$search}%")
                ->orWhereHas('customer', function ($customerQuery) use ($search) {
                    $customerQuery->where('name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
        });
    }

    public function scopeSortBy(Builder $query, string $column = 'orderDate', string $direction = 'desc'): Builder
    {
        $allowedColumns = [
            'orderNumber',
            'status',
            'paymentStatus',
            'totalAmount',
            'paidAmount',
            'remainingAmount',
            'orderDate',
            'estimatedCompletion',
            'actualCompletion',
            'pickupDate',
            'pickupSchedule',
            'createdAt',
            'updatedAt',
        ];

        $columnsMap = [
            'orderNumber'         => 'order_number',
            'paymentStatus'       => 'payment_status',
            'totalAmount'         => 'total_amount',
            'paidAmount'          => 'paid_amount',
            'remainingAmount'     => 'remaining_amount',
            'orderDate'           => 'order_date',
            'estimatedCompletion' => 'estimated_completion',
            'actualCompletion'    => 'actual_completion',
            'pickupDate'          => 'pickup_date',
            'pickupSchedule'      => 'pickup_schedule',
            'createdAt'           => 'created_at',
            'updatedAt'           => 'updated_at',
        ];

        if (!in_array($column, $allowedColumns)) {
            $column = 'orderDate';
        }

        $column = $columnsMap[$column] ?? $column;

        $direction = strtolower($direction) === 'asc' ? 'asc' : 'desc';
        $query->orderBy($column, $direction);

        return $query;
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function getStatusLabel(): string
    {
        return match ($this->status) {
            self::STATUS_REQUESTED        => 'Diajukan',
            self::STATUS_PENDING_DROPOFF  => 'Menunggu Drop-off',
            self::STATUS_CANCELLED        => 'Dibatalkan',
            self::STATUS_ACCEPTED         => 'Diterima',
            self::STATUS_REJECTED         => 'Ditolak',
            self::STATUS_PICKING_UP       => 'Sedang Dijemput',
            self::STATUS_PICKED_UP        => 'Sudah Diambil',
            self::STATUS_RECEIVED         => 'Di Outlet',
            self::STATUS_WEIGHING         => 'Ditimbang',
            self::STATUS_READY_TO_PROCESS => 'Siap Dikerjakan',
            self::STATUS_IN_PROGRESS      => 'Sedang Dikerjakan',
            self::STATUS_READY            => 'Siap Diantar',
            self::STATUS_DELIVERING       => 'Sedang Diantar',
            self::STATUS_DELIVERED        => 'Terkirim',
            self::STATUS_COMPLETED        => 'Selesai',
            default                       => 'Unknown',
        };
    }

    public function getStatusBadgeVariant(): string
    {
        return match ($this->status) {
            self::STATUS_REQUESTED        => 'warning',
            self::STATUS_PENDING_DROPOFF  => 'warning',
            self::STATUS_CANCELLED        => 'danger',
            self::STATUS_ACCEPTED         => 'info',
            self::STATUS_REJECTED         => 'danger',
            self::STATUS_PICKING_UP       => 'warning',
            self::STATUS_PICKED_UP        => 'warning',
            self::STATUS_RECEIVED         => 'info',
            self::STATUS_WEIGHING         => 'info',
            self::STATUS_READY_TO_PROCESS => 'info',
            self::STATUS_IN_PROGRESS      => 'primary',
            self::STATUS_READY            => 'success',
            self::STATUS_DELIVERING       => 'warning',
            self::STATUS_DELIVERED        => 'success',
            self::STATUS_COMPLETED        => 'success',
            default                       => 'default',
        };
    }

    public function getPaymentStatusLabel(): string
    {
        return match ($this->payment_status) {
            'not_yet_priced'  => 'Belum Diharga',
            'unpaid'          => 'Belum Dibayar',
            'partial'         => 'Dibayar Sebagian',
            'paid'            => 'Lunas',
            'paid_by_package' => 'Paket',
            'refunded'        => 'Refund',
            'cod'             => 'Bayar di Tempat',
            default           => 'Unknown',
        };
    }

    public function getPaymentStatusBadgeVariant(): string
    {
        return match ($this->payment_status) {
            'not_yet_priced'  => 'info',
            'unpaid'          => 'danger',
            'partial'         => 'warning',
            'paid'            => 'success',
            'paid_by_package' => 'primary',
            'refunded'        => 'info',
            'cod'             => 'primary',
            default           => 'light',
        };
    }

    public function getSourceLabel(): string
    {
        return match ($this->source) {
            self::SOURCE_CASHIER => 'Kasir',
            self::SOURCE_CUSTOMER_APP => 'Aplikasi Customer',
            default => 'Unknown',
        };
    }

    public function getDeliveryTypeLabel(): string
    {
        return match ($this->delivery_type) {
            self::DELIVERY_TYPE_PICKUP => 'Ambil di Outlet',
            self::DELIVERY_TYPE_DELIVERY => 'Diantar Kurir',
            default => 'Unknown',
        };
    }

    public function getFormattedSubtotal(): string
    {
        return 'Rp ' . number_format((float) $this->subtotal, 0, ',', '.');
    }

    public function getFormattedDiscountAmount(): string
    {
        return 'Rp ' . number_format((float) $this->discount_amount, 0, ',', '.');
    }

    public function getFormattedTaxAmount(): string
    {
        return 'Rp ' . number_format((float) $this->tax_amount, 0, ',', '.');
    }

    public function getFormattedTotalAmount(): string
    {
        return 'Rp ' . number_format((float) $this->total_amount, 0, ',', '.');
    }

    public function getFormattedPaidAmount(): string
    {
        return 'Rp ' . number_format((float) $this->paid_amount, 0, ',', '.');
    }

    public function getFormattedRemainingAmount(): string
    {
        return 'Rp ' . number_format((float) $this->remaining_amount, 0, ',', '.');
    }

    public function getFormattedOrderDate(): string
    {
        return $this->order_date ? $this->order_date->format('d M Y, H:i') : '-';
    }

    public function getFormattedEstimatedCompletion(): ?string
    {
        return $this->estimated_completion ? $this->estimated_completion->format('d M Y, H:i') : null;
    }

    public function getFormattedActualCompletion(): ?string
    {
        return $this->actual_completion ? $this->actual_completion->format('d M Y, H:i') : null;
    }

    public function getFormattedPickupDate(): ?string
    {
        return $this->pickup_date ? $this->pickup_date->format('d M Y, H:i') : null;
    }

    public function getFormattedDeliveryDate(): ?string
    {
        return $this->delivery_date ? $this->delivery_date->format('d M Y, H:i') : null;
    }

    public function getFormattedPickupFee(): string
    {
        return 'Rp ' . number_format((float) $this->pickup_fee, 0, ',', '.');
    }

    public function getFormattedDeliveryFee(): string
    {
        return 'Rp ' . number_format((float) $this->delivery_fee, 0, ',', '.');
    }

    public function getFormattedPickupSchedule(): ?string
    {
        return $this->pickup_schedule ? $this->pickup_schedule->format('d M Y, H:i') : null;
    }

    public function getFormattedDeliverySchedule(): ?string
    {
        return $this->delivery_schedule ? $this->delivery_schedule->format('d M Y, H:i') : null;
    }

    public function getFormattedLastStatusUpdate(): ?string
    {
        return $this->last_status_update ? $this->last_status_update->format('d M Y, H:i') : null;
    }

    public function getFormattedCreatedAt(): string
    {
        return $this->created_at->format('d M Y, H:i');
    }

    public function getFormattedUpdatedAt(): string
    {
        return $this->updated_at->format('d M Y, H:i');
    }

    public function canBeEdited(): bool
    {
        return in_array($this->status, [self::STATUS_REQUESTED, self::STATUS_READY_TO_PROCESS]);
    }

    public function canBeCancelled(): bool
    {
        return in_array($this->status, [self::STATUS_REQUESTED, self::STATUS_PENDING_DROPOFF, self::STATUS_ACCEPTED, self::STATUS_PICKING_UP, self::STATUS_PICKED_UP]);
    }

    public function canBeDeleted(): bool
    {
        return in_array($this->status, [
            self::STATUS_CANCELLED,
            self::STATUS_REJECTED,
            self::STATUS_COMPLETED,
            self::STATUS_DELIVERED
        ]);
    }

    public function canAcceptPayment(): bool
    {
        $payableStatuses = [
            self::STATUS_READY_TO_PROCESS,
            self::STATUS_IN_PROGRESS,
            self::STATUS_READY,
            self::STATUS_DELIVERING,
            self::STATUS_DELIVERED,
            self::STATUS_COMPLETED,
        ];

        return in_array($this->status, $payableStatuses)
            && in_array($this->payment_status, [
                self::PAYMENT_STATUS_UNPAID,
                self::PAYMENT_STATUS_PARTIAL,
            ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Private Helpers
    |--------------------------------------------------------------------------
    */

    protected function updatePaymentStatus(): void
    {
        if ($this->payment_status === self::PAYMENT_STATUS_PAID_BY_PACKAGE) {
            $this->paid_amount     = 0.0;
            $this->remaining_amount = 0.0;
            return;
        }
        if (in_array($this->payment_status, [
            self::PAYMENT_STATUS_NOT_YET_PRICED,
            self::PAYMENT_STATUS_REFUNDED
        ])) {
            return;
        }

        if ($this->paid_amount <= 0) {
            $this->payment_status = self::PAYMENT_STATUS_UNPAID;
        } elseif ($this->paid_amount >= $this->total_amount) {
            $this->payment_status = self::PAYMENT_STATUS_PAID;
        } else {
            $this->payment_status = self::PAYMENT_STATUS_PARTIAL;
        }
    }

    protected static function generateOrderNumber(): string
    {
        $prefix = 'ORD';
        $date   = now()->format('Ymd');

        $lastOrder = static::whereDate('created_at', now()->toDateString())
            ->orderBy('id', 'desc')
            ->first();

        if ($lastOrder && preg_match('/' . $prefix . '-' . $date . '-(\d+)/', $lastOrder->order_number, $matches)) {
            $lastNumber = (int) $matches[1];
            $newNumber  = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return $prefix . '-' . $date . '-' . str_pad((string) $newNumber, 4, '0', STR_PAD_LEFT);
    }
}
