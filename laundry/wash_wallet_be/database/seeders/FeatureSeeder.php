<?php

namespace Database\Seeders;

use App\Models\Feature;
use Illuminate\Database\Seeder;

class FeatureSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $features = [
            [
                'key'           => 'outlet_activation',
                'name'          => 'Aktivasi Outlet',
                'description'   => 'Aktifkan outlet Anda untuk mulai menggunakan layanan WashWallet secara penuh.',
                'coin_price'    => 500,
                'duration_days' => 0,
                'trial_duration_days' => 14,
                'is_paid'       => true,
                'is_active'     => true,
                'sort_order'    => 0,
            ],
            [
                'key'           => 'membership',
                'name'          => 'Membership & Paket Langganan',
                'description'   => 'Kelola paket berlangganan dan kontrak membership pelanggan.',
                'coin_price'    => 500,
                'duration_days' => 30,
                'is_paid'       => true,
                'is_active'     => true,
                'sort_order'    => 10,
            ],
            [
                'key'           => 'hr_payroll',
                'name'          => 'HR & Penggajian',
                'description'   => 'Kehadiran, gaji, pinjaman, denda, dan payroll karyawan.',
                'coin_price'    => 750,
                'duration_days' => 30,
                'is_paid'       => true,
                'is_active'     => true,
                'sort_order'    => 20,
            ],
            [
                'key'           => 'accounting',
                'name'          => 'Akuntansi & Jurnal',
                'description'   => 'Jurnal umum, buku besar, dan laporan keuangan komprehensif.',
                'coin_price'    => 1000,
                'duration_days' => 30,
                'is_paid'       => true,
                'is_active'     => true,
                'sort_order'    => 30,
            ],
            [
                'key'           => 'loyalty_deposit',
                'name'          => 'Deposit & Loyalty',
                'description'   => 'Manajemen deposit saldo pelanggan dan loyalty points.',
                'coin_price'    => 300,
                'duration_days' => 30,
                'is_paid'       => true,
                'is_active'     => true,
                'sort_order'    => 40,
            ],
            [
                'key'           => 'petty_cash',
                'name'          => 'Kas Kecil (Petty Cash)',
                'description'   => 'Manajemen kas kecil outlet untuk operasional harian.',
                'coin_price'    => 50,
                'duration_days' => 30,
                'is_paid'       => true,
                'is_active'     => true,
                'sort_order'    => 50,
            ],
            [
                'key'           => 'process_tracking',
                'name'          => 'Tracking Proses Laundry',
                'description'   => 'Penugasan proses ke karyawan dan perhitungan komisi produksi.',
                'coin_price'    => 1500,
                'duration_days' => 30,
                'is_paid'       => true,
                'is_active'     => true,
                'sort_order'    => 60,
            ],
            [
                'key'           => 'wa_order_notification',
                'name'          => 'Notifikasi WhatsApp Order',
                'description'   => 'Kirim notifikasi WhatsApp otomatis ke pelanggan setelah order dibuat.',
                'coin_price'    => 50,
                'duration_days' => 30,
                'is_paid'       => true,
                'is_active'     => true,
                'sort_order'    => 70,
            ],
            [
                'key'           => 'print_receipt',
                'name'          => 'Cetak Struk / Nota',
                'description'   => 'Cetak struk pembayaran untuk customer setelah order dibuat.',
                'coin_price'    => 50,
                'duration_days' => 30,
                'is_paid'       => true,
                'is_active'     => true,
                'sort_order'    => 80,
            ],
            [
                'key'           => 'print_label',
                'name'          => 'Cetak Label Barang',
                'description'   => 'Cetak label yang ditempel pada barang cucian untuk keperluan identifikasi di proses produksi.',
                'coin_price'    => 50,
                'duration_days' => 30,
                'is_paid'       => true,
                'is_active'     => true,
                'sort_order'    => 90,
            ],
            [
                'key'           => 'outlet_exposure',
                'name'          => 'Ekspos Outlet',
                'description'   => 'Agar outlet Anda dapat ditemukan oleh pelanggan melalui aplikasi mobile Wash Wallet Customer.',
                'coin_price'    => 50,
                'duration_days' => 30,
                'is_paid'       => true,
                'is_active'     => true,
                'sort_order'    => 100,
            ],
            [
                'key'           => 'outlet_courier',
                'name'          => 'Layanan Kurir (Antar Jemput)',
                'description'   => 'Aktifkan layanan kurir untuk penjemputan dan pengantaran laundry pelanggan.',
                'coin_price'    => 0,
                'duration_days' => 0,
                'is_paid'       => false,
                'is_active'     => true,
                'sort_order'    => 110,
            ],
        ];

        foreach ($features as $feature) {
            Feature::updateOrCreate(['key' => $feature['key']], $feature);
        }
    }
}
