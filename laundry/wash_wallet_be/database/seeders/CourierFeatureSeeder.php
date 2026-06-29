<?php

namespace Database\Seeders;

use App\Models\Feature;
use Illuminate\Database\Seeder;

class CourierFeatureSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Feature::updateOrCreate(
            ['key' => 'courier_schedule'],
            [
                'name'          => 'Layanan Antar-Jemput',
                'description'   => 'Aktifkan fitur pengambilan dan pengantaran cucian oleh kurir outlet.',
                'coin_price'    => 0,
                'is_paid'       => false,
                'is_active'     => true,
                'sort_order'    => 10,
                'duration_days' => 0,
            ]
        );
    }
}
