<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        $user = User::create([
            'name' => 'Admin',
            'email' => 'admin@washwallet.com',
            'referral_code' => 'REFADMIN',
            'username' => 'admin',
            'phone' => '081234567890',
            'password' => bcrypt('password'),
            'status' => 'active',
        ]);

        $user->assignRole('super_admin');
    }
}
