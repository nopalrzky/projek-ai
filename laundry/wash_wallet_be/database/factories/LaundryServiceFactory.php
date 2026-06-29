<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Unit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\LaundryService>
 */
class LaundryServiceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'category_id' => Category::factory(),
            'unit_id' => Unit::factory(),
            'name' => fake()->unique()->words(fake()->numberBetween(2, 4), true),
            'description' => fake()->sentence(),
            'duration_hours' => fake()->numberBetween(12, 72),
            'price' => fake()->randomFloat(2, 10000, 100000),
            'min_quantity' => fake()->numberBetween(1, 5),
            'is_active' => true,
            'supports_courier' => false,
        ];
    }
}
