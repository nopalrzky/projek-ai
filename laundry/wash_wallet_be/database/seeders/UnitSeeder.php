<?php

namespace Database\Seeders;

use App\Models\Unit;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class UnitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now();

        $units = [
            [
                'name' => 'Kilogram',
                'symbol' => 'kg',
                'description' => 'Satuan berat dalam kilogram',
                'deleted_at' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Pieces',
                'symbol' => 'pcs',
                'description' => 'Satuan per potong',
                'deleted_at' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Set',
                'symbol' => 'set',
                'description' => 'Satuan per set',
                'deleted_at' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Meter',
                'symbol' => 'm',
                'description' => 'Satuan panjang dalam meter',
                'deleted_at' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        Unit::upsert(
            $units,
            ['symbol'],
            ['name', 'description', 'deleted_at', 'updated_at']
        );
    }
}
