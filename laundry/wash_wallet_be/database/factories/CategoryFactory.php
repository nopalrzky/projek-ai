<?php

namespace Database\Factories;

use App\Models\Outlet;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Category>
 */
class CategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categories = [
            'Cuci Kering',
            'Cuci Setrika',
            'Dry Cleaning',
            'Cuci Sepatu',
            'Cuci Karpet',
            'Cuci Boneka',
            'Express',
            'Reguler'
        ];

        $name = fake()->randomElement($categories);

        return [
            'outlet_id' => Outlet::factory(),
            'name' => $name,
            'description' => 'Kategori layanan ' . $name,
            'slug' => Str::slug($name) . '-' . fake()->numberBetween(1, 999),
            'is_active' => true,
        ];
    }
}
