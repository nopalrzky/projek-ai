<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Account>
 */
class AccountFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'owner_id' => User::factory(),
            'outlet_id' => null,
            'parent_id' => null,
            'code' => 'ACC-' . fake()->unique()->numerify('######'),
            'name' => fake()->words(2, true),
            'slug' => fake()->unique()->slug(),
            'type' => fake()->randomElement(['asset', 'liability', 'equity', 'revenue', 'expense']),
            'account_role' => null,
            'level' => 1,
            'is_system' => false,
            'is_transactional' => true,
            'is_active' => true,
        ];
    }
}
