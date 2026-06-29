<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Unit>
 */
class UnitFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $units = [
            ['name' => 'Kilogram', 'symbol' => 'kg', 'description' => 'Satuan berat dalam kilogram'],
            ['name' => 'Pieces', 'symbol' => 'pcs', 'description' => 'Satuan per potong'],
            ['name' => 'Set', 'symbol' => 'set', 'description' => 'Satuan per set'],
            ['name' => 'Meter', 'symbol' => 'm', 'description' => 'Satuan panjang dalam meter'],
        ];

        $unit = fake()->randomElement($units);

        return [
            'name' => $unit['name'] . ' ' . fake()->unique()->word(),
            'symbol' => $unit['symbol'] . '_' . fake()->unique()->word(),
            'description' => $unit['description'],
        ];
    }
}
