<?php

namespace App\Http\Requests\Order;

use App\Models\CustomerQuota;
use App\Models\CustomerSubscription;
use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customerId' => ['required', 'integer', 'exists:customers,id'],
            'employeeId' => ['required', 'integer', 'exists:employees,id'],
            'sourceAccountId' => [
                'nullable',
                'integer',
                'required_if:paymentMethod,transfer',
                'exists:accounts,id'
            ],
            'paymentMethod' => [
                'nullable',
                'string',
                'in:cash,transfer',
                'prohibited_if:paymentStatus,unpaid,paid_by_package'
            ],
            'paymentStatus' => [
                'required',
                'string',
                'in:unpaid,paid,partial,paid_by_package',
                function ($attribute, $value, $fail) {
                    if ($value !== 'paid_by_package') {
                        return;
                    }

                    $paidAmount = (float) ($this->input('paidAmount') ?? 0);
                    if ($paidAmount > 0) {
                        $fail('Jumlah dibayar harus 0 untuk status pembayaran ditanggung paket.');
                    }

                    if ($this->filled('paymentMethod')) {
                        $fail('Metode pembayaran tidak boleh diisi untuk status pembayaran ditanggung paket.');
                    }

                    $orderItems = $this->input('orderItems', []);
                    $hasPackageUsage = collect($orderItems)->contains(function ($item) {
                        return filter_var($item['isPackageUsage'] ?? false, FILTER_VALIDATE_BOOLEAN);
                    });

                    if (!$hasPackageUsage) {
                        $fail('Status pembayaran ditanggung paket hanya boleh digunakan jika ada item yang menggunakan paket.');
                    }
                },
            ],
            'notes' => ['nullable', 'string', 'max:1000'],
            'internalNotes' => ['nullable', 'string', 'max:1000'],
            'specialInstructions' => ['nullable', 'array'],
            'discountAmount' => ['nullable', 'numeric', 'min:0'],
            'taxAmount' => ['nullable', 'numeric', 'min:0'],
            'paidAmount' => [
                'nullable',
                'numeric',
                'min:0',
                'required_if:paymentStatus,paid,partial'
            ],
            'orderDate' => ['nullable', 'date'],
            'estimatedCompletion' => ['nullable', 'date'],

            'orderItems' => ['required', 'array', 'min:1'],
            'orderItems.*.laundryServiceId' => ['required', 'integer', 'exists:laundry_services,id'],
            'orderItems.*.quantity' => ['required', 'numeric', 'min:0.01'],
            'orderItems.*.discountAmount' => ['nullable', 'numeric', 'min:0'],
            'orderItems.*.isPackageUsage' => ['nullable', 'boolean'],
            'orderItems.*.customerSubscriptionId' => [
                'nullable',
                'integer',
                'exists:customer_subscriptions,id',
                'required_if:orderItems.*.isPackageUsage,true',
                function ($attribute, $value, $fail) {
                    $parts = explode('.', $attribute);
                    $index = $parts[1] ?? null;

                    if ($index === null) {
                        return;
                    }

                    $isPackageUsage = filter_var(
                        $this->input("orderItems.{$index}.isPackageUsage"),
                        FILTER_VALIDATE_BOOLEAN
                    );

                    if (!$isPackageUsage) {
                        return;
                    }

                    $customerId = (int) $this->input('customerId');

                    $subscription = CustomerSubscription::query()
                        ->where('id', (int) $value)
                        ->where('customer_id', $customerId)
                        ->active()
                        ->first();

                    if (!$subscription) {
                        $fail('Subscription tidak aktif atau tidak milik pelanggan yang dipilih.');
                    }
                }
            ],
            'orderItems.*.quotaUsed' => [
                'nullable',
                'numeric',
                'min:0',
                'required_if:orderItems.*.isPackageUsage,true',
                function ($attribute, $value, $fail) {
                    $parts = explode('.', $attribute);
                    $index = $parts[1] ?? null;

                    if ($index === null) {
                        return;
                    }

                    $isPackageUsage = filter_var(
                        $this->input("orderItems.{$index}.isPackageUsage"),
                        FILTER_VALIDATE_BOOLEAN
                    );

                    if (!$isPackageUsage) {
                        return;
                    }

                    $quotaUsed = (float) $value;
                    $quantity = (float) ($this->input("orderItems.{$index}.quantity") ?? 0);
                    $subscriptionId = (int) ($this->input("orderItems.{$index}.customerSubscriptionId") ?? 0);
                    $laundryServiceId = (int) ($this->input("orderItems.{$index}.laundryServiceId") ?? 0);

                    if ($quotaUsed <= 0) {
                        $fail('Quota yang digunakan harus lebih dari 0 jika menggunakan paket.');
                        return;
                    }

                    if ($quotaUsed > $quantity) {
                        $fail('Quota yang digunakan tidak boleh melebihi quantity item.');
                        return;
                    }

                    if ($subscriptionId <= 0 || $laundryServiceId <= 0) {
                        return;
                    }

                    $quota = CustomerQuota::query()
                        ->where('customer_subscription_id', $subscriptionId)
                        ->where('laundry_service_id', $laundryServiceId)
                        ->first();

                    if (!$quota) {
                        $fail('Quota untuk layanan ini tidak ditemukan pada subscription yang dipilih.');
                        return;
                    }

                    if ((float) $quota->remaining_quota < $quotaUsed) {
                        $fail('Quota tidak mencukupi untuk item ini.');
                    }
                },
            ],
            'orderItems.*.itemNotes' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * Calculate total amount from order items
     */
    protected function calculateTotalAmount(): float
    {
        $orderItems = $this->input('orderItems', []);
        $discountAmount = $this->input('discountAmount', 0);
        $taxAmount = $this->input('taxAmount', 0);

        $subtotal = 0;

        foreach ($orderItems as $item) {
            $subtotal += ($item['quantity'] ?? 0) * 10000;
        }

        return $subtotal - $discountAmount + $taxAmount;
    }

    public function attributes(): array
    {
        return [
            'customerId' => 'pelanggan',
            'employeeId' => 'karyawan',
            'paymentMethod' => 'metode pembayaran',
            'paymentStatus' => 'status pembayaran',
            'sourceAccountId' => 'akun sumber',
            'notes' => 'catatan',
            'internalNotes' => 'catatan internal',
            'specialInstructions' => 'instruksi khusus',
            'discountAmount' => 'jumlah diskon',
            'taxAmount' => 'jumlah pajak',
            'paidAmount' => 'jumlah dibayar',
            'orderDate' => 'tanggal order',
            'estimatedCompletion' => 'estimasi selesai',
            'orderItems' => 'item order',
            'orderItems.*.laundryServiceId' => 'layanan laundry',
            'orderItems.*.quantity' => 'jumlah',
            'orderItems.*.discountAmount' => 'diskon item',
            'orderItems.*.isPackageUsage' => 'penggunaan paket',
            'orderItems.*.customerSubscriptionId' => 'subscription pelanggan',
            'orderItems.*.itemNotes' => 'catatan item',
        ];
    }

    public function messages(): array
    {
        return [
            'customerId.required' => 'Pelanggan harus dipilih',
            'customerId.exists' => 'Pelanggan tidak valid',
            'employeeId.required' => 'Karyawan harus dipilih',
            'employeeId.exists' => 'Karyawan tidak valid',
            'sourceAccountId.exists' => 'Akun sumber tidak valid',
            'sourceAccountId.required_if' => 'Akun sumber harus dipilih untuk metode transfer',
            'paymentMethod.required' => 'Metode pembayaran harus dipilih',
            'paymentMethod.in' => 'Metode pembayaran tidak valid',
            'paymentMethod.prohibited_if' => 'Metode pembayaran tidak boleh diisi untuk status unpaid atau ditanggung paket',
            'paymentStatus.required' => 'Status pembayaran harus dipilih',
            'paymentStatus.in' => 'Status pembayaran tidak valid',
            'paidAmount.required_if' => 'Jumlah dibayar harus diisi untuk status paid atau partial',
            'paidAmount.min' => 'Jumlah dibayar minimal 0',
            'orderItems.required' => 'Minimal harus ada 1 item',
            'orderItems.min' => 'Minimal harus ada 1 item',
            'orderItems.*.laundryServiceId.required' => 'Layanan laundry harus dipilih',
            'orderItems.*.laundryServiceId.exists' => 'Layanan laundry tidak valid',
            'orderItems.*.quantity.required' => 'Jumlah harus diisi',
            'orderItems.*.quantity.min' => 'Jumlah minimal 0.01',
            'orderItems.*.customerSubscriptionId.exists' => 'Subscription tidak valid',
            'orderItems.*.customerSubscriptionId.required_if' => 'Subscription harus dipilih jika menggunakan paket',
            'orderItems.*.quotaUsed.required_if' => 'Quota yang digunakan wajib diisi jika menggunakan paket',
            'orderItems.*.quotaUsed.numeric' => 'Quota yang digunakan harus berupa angka',
            'orderItems.*.quotaUsed.min' => 'Quota yang digunakan minimal 0',
        ];
    }
}
