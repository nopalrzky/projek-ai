<?php

namespace Database\Factories;

use App\Models\Employee;
use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\OrderStatusHistory>
 */
class OrderStatusHistoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'employee_id' => Employee::factory(),
            'from_status' => fake()->randomElement([
                Order::STATUS_REQUESTED,
                Order::STATUS_ACCEPTED,
                Order::STATUS_PICKING_UP,
                Order::STATUS_PICKED_UP,
                null
            ]),
            'to_status' => Order::STATUS_IN_PROGRESS,
            'notes' => fake()->boolean(30) ? fake()->sentence() : null,
        ];
    }
}
