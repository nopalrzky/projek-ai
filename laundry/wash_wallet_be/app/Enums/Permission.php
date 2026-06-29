<?php

namespace App\Enums;

enum Permission: string
{
    case OrderCreate     = 'order.create';
    case OrderView       = 'order.view';
    case OrderManage     = 'order.manage';
    case PaymentManage   = 'payment.manage';
    case ProductionView  = 'production.view';
    case ProductionManage = 'production.manage';
    case CourierView     = 'courier.view';
    case CourierManage   = 'courier.manage';
    case CustomerView    = 'customer.view';
    case CustomerManage  = 'customer.manage';
    case ServiceView     = 'service.view';
    case ServiceManage   = 'service.manage';

    /**
     * Get Indonesian label for the permission.
     */
    public function label(): string
    {
        return match ($this) {
            self::OrderCreate     => 'Buat Order',
            self::OrderView       => 'Lihat Order',
            self::OrderManage     => 'Kelola Order',
            self::PaymentManage   => 'Kelola Pembayaran',
            self::ProductionView  => 'Lihat Produksi',
            self::ProductionManage => 'Kelola Produksi',
            self::CourierView     => 'Lihat Kurir',
            self::CourierManage   => 'Kelola Kurir',
            self::CustomerView    => 'Lihat Customer',
            self::CustomerManage  => 'Kelola Customer',
            self::ServiceView     => 'Lihat Layanan',
            self::ServiceManage   => 'Kelola Layanan',
        };
    }

    /**
     * Get default permission keys for a given position slug.
     *
     * @param string $slug
     * @return array<string>
     */
    public static function defaultForSlug(string $slug): array
    {
        return match ($slug) {
            'kasir' => [
                self::OrderCreate->value,
                self::OrderView->value,
                self::OrderManage->value,
                self::PaymentManage->value,
                self::CustomerView->value,
                self::CustomerManage->value,
                self::ServiceView->value,
            ],
            'produksi' => [
                self::OrderView->value,
                self::ProductionView->value,
                self::ProductionManage->value,
            ],
            'kurir' => [
                self::OrderView->value,
                self::CourierView->value,
                self::CourierManage->value,
            ],
            default => [],
        };
    }
}
