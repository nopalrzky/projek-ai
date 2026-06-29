<?php

namespace App\Services;

class FeatureService extends BaseService
{
    public function __construct() {}

    public function getAll(array $filters = [], ?int $page = null, ?int $perPage = null)
    {
        // This method can be implemented to fetch features with filters and pagination
        // For now, it can return a static list or be left unimplemented
        return [];
    }

    public function getEcosystemPlatforms(): array
    {
        return [
            [
                'platform' => 'Web Dashboard',
                'target' => 'Untuk Owner/Manager',
                'description' => 'Dashboard terpusat untuk manage semua outlet, laporan real-time, dan business analytics.',
                'features' => [
                    'Multi-outlet management',
                    'Real-time reporting',
                    'Business intelligence'
                ],
                'icon' => 'Monitor',
                'status' => 'available',
                'device' => 'desktop'
            ],
            [
                'platform' => 'Aplikasi Kasir',
                'target' => 'Untuk Kasir Outlet',
                'description' => 'Mobile app untuk kasir mengelola transaksi, pelanggan, dan cetak nota thermal.',
                'features' => [
                    'POS transaksi real-time',
                    'Cetak nota thermal',
                    'Manajemen pelanggan'
                ],
                'icon' => 'ShoppingCart',
                'status' => 'available',
                'device' => 'mobile'
            ],
            [
                'platform' => 'Aplikasi Produksi',
                'target' => 'Untuk Staf Laundry',
                'description' => 'Mobile app untuk tim produksi tracking order per item dan update status laundry.',
                'features' => [
                    'Tracking order per item',
                    'Real-time status update',
                    'Process queue management'
                ],
                'icon' => 'Zap',
                'status' => 'available',
                'device' => 'mobile'
            ],
            [
                'platform' => 'Aplikasi Customer',
                'target' => 'Untuk Pelanggan Laundry',
                'description' => 'App untuk pelanggan tracking order, cek poin reward, dan riwayat transaksi.',
                'features' => [
                    'Track order status',
                    'Loyalty points',
                    'Transaction history'
                ],
                'icon' => 'Users',
                'status' => 'coming_soon',
                'device' => 'mobile'
            ]
        ];
    }


    public function getFeatureAvailability(): array
    {
        return [
            'operationalManagement' => [
                'status' => 'available',
                'pricingModel' => 'one-time-activation'
            ],
            'financialAccounting' => [
                'status' => 'available',
                'pricingModel' => 'one-time-activation'
            ],
            'hrPayroll' => [
                'status' => 'available',
                'pricingModel' => 'one-time-activation'
            ],
            'membership' => [
                'status' => 'available',
                'pricingModel' => 'one-time-activation'
            ],
            'affiliateProgram' => [
                'status' => 'available',
                'pricingModel' => 'one-time-activation'
            ]
        ];
    }
}
