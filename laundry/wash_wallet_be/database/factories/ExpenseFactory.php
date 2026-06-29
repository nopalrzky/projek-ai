<?php

namespace Database\Factories;

use App\Models\Account;
use App\Models\Outlet;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Expense>
 */
class ExpenseFactory extends Factory
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
            'user_id' => null,
            'employee_id' => null,
            'expense_account_id' => function (array $attributes) {
                $outlet = Outlet::query()->findOrFail($attributes['outlet_id']);

                return Account::factory()->create([
                    'owner_id' => $outlet->owner_id,
                    'outlet_id' => $outlet->id,
                    'type' => 'expense',
                    'account_role' => null,
                    'is_transactional' => true,
                ])->id;
            },
            'source_account_id' => function (array $attributes) {
                $outlet = Outlet::query()->findOrFail($attributes['outlet_id']);

                return Account::factory()->create([
                    'owner_id' => $outlet->owner_id,
                    'outlet_id' => $outlet->id,
                    'type' => 'asset',
                    'account_role' => null,
                    'is_transactional' => true,
                ])->id;
            },
            'amount' => fake()->randomFloat(2, 10000, 500000),
            'code' => 'EXP-' . now()->format('Ymd') . '-' . str_pad((string) fake()->numberBetween(1, 9999), 4, '0', STR_PAD_LEFT),
            'date' => fake()->date(),
            'description' => fake()->sentence(),
            'attachment' => null,
            'status' => fake()->randomElement(['pending', 'approved', 'rejected']),
            'approved_by' => null,
            'approved_at' => null,
            'rejection_reason' => null,
            'journal_entry_id' => null,
        ];
    }

    public function pending(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'pending',
            'approved_by' => null,
            'approved_at' => null,
            'rejection_reason' => null,
        ]);
    }

    public function approved(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'approved',
            'approved_at' => now(),
            'rejection_reason' => null,
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'rejected',
            'approved_at' => null,
            'rejection_reason' => fake()->sentence(),
        ]);
    }
}
