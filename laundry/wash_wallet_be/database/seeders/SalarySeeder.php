<?php

namespace Database\Seeders;

use App\Models\Salary;
use Illuminate\Database\Seeder;

class SalarySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $salaries = [
            [
                'name' => 'Gaji Bulanan',
                'description' => 'Gaji pokok yang diterima setiap bulan.',
                'type' => 'monthly',
            ],
            [
                'name' => 'Gaji Harian',
                'description' => 'Gaji berdasarkan kehadiran per hari.',
                'type' => 'daily',
            ],
            [
                'name' => 'Tunjangan Makan',
                'description' => 'Tunjangan makan setiap kehadiran.',
                'type' => 'daily',
            ],
            [
                'name' => 'Tunjangan Transportasi',
                'description' => 'Tunjangan transport per shift.',
                'type' => 'daily',
            ],
            [
                'name' => 'Lembur',
                'description' => 'Tambahan gaji jika bekerja melewati jam kerja.',
                'type' => 'overtime',
            ],
        ];

        foreach ($salaries as $salary) {
            Salary::updateOrCreate(
                ['name' => $salary['name']],
                $salary
            );
        }
    }
}
