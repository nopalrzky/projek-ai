<?php

namespace Database\Seeders;

use App\Models\Process;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProcessSeeder extends Seeder
{
    public function run(): void
    {
        $processes = [
            [
                'name' => 'Pencucian',
                'description' => 'Proses pencucian pakaian menggunakan mesin cuci dengan deterjen yang sesuai dengan jenis kain.',
                'is_active' => true,
            ],
            [
                'name' => 'Pengeringan',
                'description' => 'Proses pengeringan pakaian yang telah dicuci menggunakan mesin pengering atau dijemur hingga kering.',
                'is_active' => true,
            ],
            [
                'name' => 'Penyetrikaan',
                'description' => 'Proses merapikan dan menghaluskan pakaian menggunakan setrika agar tampak rapi dan bebas kusut.',
                'is_active' => true,
            ],
            [
                'name' => 'Pelipatan',
                'description' => 'Proses melipat pakaian yang telah disetrika dengan rapi sesuai standar laundry.',
                'is_active' => true,
            ],
            [
                'name' => 'Pemeriksaan Kualitas',
                'description' => 'Proses pemeriksaan akhir untuk memastikan semua pakaian telah dicuci, disetrika, dan dilipat dengan baik.',
                'is_active' => true,
            ],
            [
                'name' => 'Siap Diambil',
                'description' => 'Pakaian telah siap dan dikemas untuk diambil oleh pelanggan.',
                'is_active' => true,
            ],
        ];

        DB::transaction(function () use ($processes) {
            foreach ($processes as $process) {
                Process::updateOrCreate(
                    ['name' => $process['name']],
                    [
                        'description' => $process['description'],
                        'is_active' => $process['is_active'],
                    ]
                );
            }
        });

        $this->command->info('Process seeder completed successfully!');
        $this->command->info('Total processes: ' . count($processes));
    }
}
