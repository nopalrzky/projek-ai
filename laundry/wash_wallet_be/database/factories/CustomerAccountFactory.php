<?php

namespace Database\Factories;

use App\Models\CustomerAccount;
use App\Models\Customer;
use App\Models\Outlet;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CustomerAccount>
 */
class CustomerAccountFactory extends Factory
{
    protected $model = CustomerAccount::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'phone' => '08' . $this->faker->unique()->numerify('#########'),
            'name' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'gender' => $this->faker->randomElement(['male', 'female']),
            'password' => 'password', 
            'is_verified' => true,
            'is_active' => true,
            'deposit_balance' => 0,
        ];
    }

    /**
     * State to create Customer records in different outlets for this customer account.
     */
    public function withCustomersInOutlets(array $outlets = []): static
    {
        return $this->afterCreating(function (CustomerAccount $customerAccount) use ($outlets) {
            if (empty($outlets)) {
                $outlets = Outlet::factory()->count(3)->create();
            }
            foreach ($outlets as $outlet) {
                Customer::factory()->create([
                    'customer_account_id' => $customerAccount->id,
                    'outlet_id' => $outlet->id,
                    'name' => $customerAccount->name,
                    'email' => $customerAccount->email,
                    'phone' => $customerAccount->phone,
                ]);
            }
        });
    }

    /**
     * State to set custom deposit balance.
     */
    public function withDeposit(int $amount): static
    {
        return $this->state(fn (array $attributes) => [
            'deposit_balance' => $amount,
        ]);
    }
}
