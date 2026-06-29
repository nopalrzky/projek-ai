<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Outlet>
 */
class OutletFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->company() . ' Laundry';
        $code = 'OUT' . fake()->unique()->numberBetween(1000, 9999);

        return [
            'owner_id' => User::factory(),
            'name' => $name,
            'code' => $code,
            'email' => strtolower(str_replace(' ', '', $code)) . '@laundry.com',
            'phone' => fake()->phoneNumber(),
            'province_id' => fake()->numberBetween(11, 94),
            'province_name' => fake()->state(),
            'city_id' => fake()->numberBetween(1101, 9471),
            'city_name' => fake()->city(),
            'district_id' => fake()->numberBetween(110101, 947199),
            'district_name' => fake()->citySuffix(),
            'village_id' => fake()->numberBetween(11010101, 94719999),
            'village_name' => fake()->streetName(),
            'street' => fake()->streetAddress(),
            'status' => 'active',
        ];
    }
}
