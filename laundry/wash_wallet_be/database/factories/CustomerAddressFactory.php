<?php

namespace Database\Factories;

use App\Models\CustomerAddress;
use App\Models\CustomerAccount;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CustomerAddress>
 */
class CustomerAddressFactory extends Factory
{
    protected $model = CustomerAddress::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'customer_account_id' => CustomerAccount::factory(),
            'label' => $this->faker->randomElement(['Rumah', 'Kantor', 'Kost']),
            'recipient_name' => $this->faker->name(),
            'recipient_phone' => '08' . $this->faker->numerify('#########'),
            'street' => $this->faker->streetAddress(),
            'province_id' => '11',
            'regency_id' => '1101',
            'district_id' => '1101010',
            'village_id' => '1101010001',
            'province_name' => 'ACEH',
            'regency_name' => 'KABUPATEN ACEH SELATAN',
            'district_name' => 'BAKONGAN',
            'village_name' => 'KEUDE BAKONGAN',
            'notes' => $this->faker->sentence(),
            'latitude' => $this->faker->latitude(),
            'longitude' => $this->faker->longitude(),
            'is_primary' => false,
        ];
    }

    /**
     * Set address as primary.
     */
    public function primary(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_primary' => true,
        ]);
    }
}
