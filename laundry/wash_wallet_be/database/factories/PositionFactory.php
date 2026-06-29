<?php

namespace Database\Factories;

use App\Models\Outlet;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Position>
 */
class PositionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'outlet_id' => Outlet::factory(),
            'name' => fake()->jobTitle(),
            'description' => fake()->sentence(),
            'is_active' => true,
        ];
    }

    /**
     * Position for small outlet (basic positions)
     */
    public function forSmallOutlet(): static
    {
        return $this->state(function (array $attributes) {
            $positions = ['Kasir', 'Operator Laundry'];
            return [
                'name' => fake()->randomElement($positions),
                'description' => 'Posisi untuk outlet kecil',
            ];
        });
    }

    /**
     * Position for medium outlet
     */
    public function forMediumOutlet(): static
    {
        return $this->state(function (array $attributes) {
            $positions = ['Manager', 'Kasir', 'Operator Laundry', 'Quality Control'];
            return [
                'name' => fake()->randomElement($positions),
                'description' => 'Posisi untuk outlet menengah',
            ];
        });
    }

    /**
     * Position for large outlet
     */
    public function forLargeOutlet(): static
    {
        return $this->state(function (array $attributes) {
            $positions = ['Manager', 'Supervisor', 'HR', 'Kasir', 'Operator Laundry', 'Quality Control', 'Customer Service', 'Admin'];
            return [
                'name' => fake()->randomElement($positions),
                'description' => 'Posisi untuk outlet besar',
            ];
        });
    }
}
