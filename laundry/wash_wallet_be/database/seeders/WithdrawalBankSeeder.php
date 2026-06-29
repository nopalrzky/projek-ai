<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\WithdrawalBank;
use Illuminate\Database\Seeder;

class WithdrawalBankSeeder extends Seeder
{
    public function run(): void
    {
        $banks = [
            [
                'bank_name'      => 'BCA',
                'bank_code'      => '014',
                'admin_fee'      => 0.00,
                'min_withdrawal' => 50000.00,
                'max_withdrawal' => null,
                'is_active'      => true,
            ],
            [
                'bank_name'      => 'Mandiri',
                'bank_code'      => '008',
                'admin_fee'      => 2500.00,
                'min_withdrawal' => 50000.00,
                'max_withdrawal' => null,
                'is_active'      => true,
            ],
            [
                'bank_name'      => 'BNI',
                'bank_code'      => '009',
                'admin_fee'      => 2500.00,
                'min_withdrawal' => 50000.00,
                'max_withdrawal' => null,
                'is_active'      => true,
            ],
            [
                'bank_name'      => 'BRI',
                'bank_code'      => '002',
                'admin_fee'      => 2500.00,
                'min_withdrawal' => 50000.00,
                'max_withdrawal' => null,
                'is_active'      => true,
            ],
            [
                'bank_name'      => 'CIMB Niaga',
                'bank_code'      => '022',
                'admin_fee'      => 6500.00,
                'min_withdrawal' => 50000.00,
                'max_withdrawal' => null,
                'is_active'      => true,
            ],
            [
                'bank_name'      => 'Permata',
                'bank_code'      => '013',
                'admin_fee'      => 6500.00,
                'min_withdrawal' => 50000.00,
                'max_withdrawal' => null,
                'is_active'      => true,
            ],
        ];

        foreach ($banks as $bank) {
            WithdrawalBank::query()->updateOrCreate(
                ['bank_name' => $bank['bank_name']],
                $bank
            );
        }
    }
}
