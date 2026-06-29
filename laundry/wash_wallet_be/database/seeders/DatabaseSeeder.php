<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(
            [
                SettingSeeder::class,
                ProcessSeeder::class,
                RolePermissionSeeder::class,
                SalarySeeder::class,
                UnitSeeder::class,
                LaundryBusinessSeeder::class,
                FeatureSeeder::class,
                PayrollTestSeeder::class,
                WithdrawalBankSeeder::class,
            ]
        );
    }
}
