<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            [
                'key' => 'auto_wa_notification',
                'name' => 'Notifikasi WhatsApp Otomatis',
                'description' => 'Mengatur apakah sistem akan mengirimkan notifikasi WhatsApp secara otomatis kepada pelanggan saat status pesanan berubah.',
            ],
            [
                'key' => 'cod_enabled',
                'name' => 'Fitur Cash on Delivery (COD)',
                'description' => 'Mengatur ketersediaan metode pembayaran Cash on Delivery (Bayar di Tempat) untuk outlet.',
            ],
            [
                'key' => 'auto_accept_order',
                'name' => 'Auto Accept Order',
                'description' => 'Order dari customer-app dengan status requested yang tidak berubah selama 24 jam sejak dibuat akan diterima otomatis.',
            ],
            [
                'key' => 'auto_accept_lead_time_minutes',
                'name' => 'Lead Time Auto Accept Order (Menit)',
                'description' => 'Jumlah menit sebelum jadwal pickup kurir untuk mulai auto accept. Nilai 0 berarti tidak menggunakan lead time pickup (fallback ke 24 jam).',
            ],
            [
                'key' => 'auto_accept_max_distance_km',
                'name' => 'Batas Maksimal Jarak Auto Accept Order (KM)',
                'description' => 'Jarak maksimal dalam km antara alamat pickup customer dan outlet agar order boleh auto accepted. Nilai 0 berarti tidak ada batas jarak.',
            ],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
