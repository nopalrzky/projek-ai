<?php

namespace Database\Factories;

use App\Models\Outlet;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Employee>
 */
class EmployeeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->name();
        $firstName = explode(' ', $name)[0];
        $username = strtolower($firstName) . fake()->unique()->numberBetween(100, 999);

        return [
            'outlet_id' => Outlet::factory(),
            'name' => $name,
            'username' => $username,
            'password' => Hash::make('password'),
            'phone' => fake()->phoneNumber(),
            'address' => fake()->address(),
            'date_of_birth' => fake()->date('Y-m-d', '-50 years'),
            'avatar' => null,
            'gender' => fake()->randomElement(['male', 'female']),
            'start_date' => fake()->dateTimeBetween('-2 years', 'now'),
            'is_active' => true,
            'last_login_at' => fake()->boolean(60) ? fake()->dateTimeBetween('-1 month', 'now') : null,
        ];
    }

    /**
     * Inactive employee
     */
    public function inactive(): static
    {
        return $this->state(fn(array $attributes) => [
            'is_active' => false,
            'last_login_at' => fake()->dateTimeBetween('-6 months', '-1 month'),
        ]);
    }

    /**
     * Recently hired employee
     */
    public function recentHire(): static
    {
        return $this->state(fn(array $attributes) => [
            'start_date' => fake()->dateTimeBetween('-3 months', 'now'),
            'last_login_at' => fake()->dateTimeBetween('-1 week', 'now'),
        ]);
    }

    /**
     * Configure the factory
     */
    public function configure()
    {
        return $this->afterCreating(function ($employee) {});
    }
}
