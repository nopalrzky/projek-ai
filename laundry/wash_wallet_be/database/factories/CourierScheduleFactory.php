<?php

namespace Database\Factories;

use App\Models\CourierSchedule;
use App\Models\Outlet;
use App\Models\OperationalDay;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CourierSchedule>
 */
class CourierScheduleFactory extends Factory
{
    protected $model = CourierSchedule::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'outlet_id' => Outlet::factory(),
            'operational_day_id' => function (array $attributes) {
                $dayOfWeek = $attributes['day_of_week'] ?? 'monday';
                $operationalDay = OperationalDay::where('outlet_id', $attributes['outlet_id'])
                    ->where('day_of_week', $dayOfWeek)
                    ->first();

                return $operationalDay ? $operationalDay->id : OperationalDay::factory()->create([
                    'outlet_id' => $attributes['outlet_id'],
                    'day_of_week' => $dayOfWeek,
                ])->id;
            },
            'day_of_week' => 'monday',
            'type' => 'pickup',
            'start_time' => '10:00',
            'end_time' => '12:00',
            'is_active' => true,
        ];
    }

    /**
     * Set type as pickup.
     */
    public function pickup(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'pickup',
        ]);
    }

    /**
     * Set type as delivery.
     */
    public function delivery(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'delivery',
        ]);
    }
}
