<?php

namespace Database\Factories;

use App\Models\LaundryService;
use App\Models\Process;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\LaundryServiceProcess>
 */
class LaundryServiceProcessFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'laundry_service_id' => LaundryService::factory(),
            'process_id' => Process::factory(),
            'sequence' => fake()->numberBetween(1, 5),
        ];
    }
}
