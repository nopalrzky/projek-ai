<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\Employee;
use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;
use Carbon\Carbon;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = Carbon::now()->subMonths(3); 
        $endDate = Carbon::now()->subDays(1);     
        if ($startDate->gte($endDate)) {
            $startDate = $endDate->copy()->subDays(30);
        }

        $orderDate = fake()->dateTimeBetween($startDate, $endDate);

        // Calculate estimated completion (1-5 days from order date)
        $estimatedCompletion = Carbon::parse($orderDate)
            ->addDays(fake()->numberBetween(1, 5));

        // Generate financial data
        $subtotal = fake()->numberBetween(50000, 500000);
        $discountAmount = fake()->numberBetween(0, (int)($subtotal * 0.2)); // Max 20% discount
        $taxAmount = $subtotal * 0.1; // 10% tax
        $totalAmount = $subtotal - $discountAmount + $taxAmount;

        // Generate payment data
        $paidAmount = fake()->numberBetween(0, (int)$totalAmount);
        $remainingAmount = $totalAmount - $paidAmount;

        $paymentStatus = match (true) {
            $paidAmount == 0 => Order::PAYMENT_STATUS_UNPAID,
            $remainingAmount <= 0 => Order::PAYMENT_STATUS_PAID,
            default => Order::PAYMENT_STATUS_PARTIAL
        };

        // Generate status
        $status = fake()->randomElement([
            Order::STATUS_REQUESTED,
            Order::STATUS_ACCEPTED,
            Order::STATUS_PICKING_UP,
            Order::STATUS_PICKED_UP,
            Order::STATUS_RECEIVED,
            Order::STATUS_WEIGHING,
            Order::STATUS_READY_TO_PROCESS,
            Order::STATUS_IN_PROGRESS,
            Order::STATUS_READY,
            Order::STATUS_DELIVERING,
            Order::STATUS_DELIVERED,
            Order::STATUS_COMPLETED,
            Order::STATUS_CANCELLED,
            Order::STATUS_REJECTED,
        ]);

        // Generate completion dates based on status
        $actualCompletion = null;
        $pickupDate = null;

        if (in_array($status, [Order::STATUS_READY, Order::STATUS_DELIVERING, Order::STATUS_DELIVERED, Order::STATUS_COMPLETED])) {
            $actualCompletion = fake()->dateTimeBetween($orderDate, $estimatedCompletion);

            if (in_array($status, [Order::STATUS_DELIVERED, Order::STATUS_COMPLETED])) {
                $pickupDate = fake()->dateTimeBetween($actualCompletion, Carbon::parse($actualCompletion)->addDays(3));
            }
        }

        // Generate special instructions (JSON)
        $specialInstructions = fake()->boolean(15) ? [
            fake()->randomElement([
                'Handle with care',
                'Extra rinse cycle',
                'No bleach',
                'Air dry only',
                'Separate colors',
                'Gentle wash',
                'Express service',
                'Pickup before 5 PM'
            ])
        ] : null;

        return [
            'employee_id' => Employee::factory(),
            'customer_id' => Customer::factory(),
            'order_number' => $this->generateOrderNumber($orderDate),
            'status' => $status,
            'subtotal' => $subtotal,
            'discount_amount' => $discountAmount,
            'tax_amount' => $taxAmount,
            'total_amount' => $totalAmount,
            'paid_amount' => $paidAmount,
            'remaining_amount' => $remainingAmount,
            'payment_status' => $paymentStatus,
            'order_date' => $orderDate,
            'estimated_completion' => $estimatedCompletion,
            'actual_completion' => $actualCompletion,
            'pickup_date' => $pickupDate,
            'notes' => fake()->boolean(30) ? fake()->sentence() : null,
            'internal_notes' => fake()->boolean(20) ? fake()->sentence() : null,
            'special_instructions' => $specialInstructions,
            'last_status_update' => $orderDate,
            'updated_by' => null, // Will be set to employee_id in seeder
        ];
    }

    /**
     * Generate unique order number - PERBAIKAN: Handle DateTime object
     */
    private function generateOrderNumber($orderDate): string
    {
        // Convert DateTime object to string format
        if ($orderDate instanceof \DateTime) {
            $datePrefix = $orderDate->format('Ymd');
        } else {
            // Fallback for string dates
            $datePrefix = date('Ymd', strtotime($orderDate));
        }

        $randomSuffix = fake()->unique()->numberBetween(1000, 9999);
        return "ORD{$datePrefix}{$randomSuffix}";
    }

    /**
     * Order from specific date range
     */
    public function betweenDates($startDate, $endDate): static
    {
        return $this->state(function (array $attributes) use ($startDate, $endDate) {
            $orderDate = fake()->dateTimeBetween($startDate, $endDate);
            $estimatedCompletion = Carbon::parse($orderDate)->addDays(fake()->numberBetween(1, 5));

            return [
                'order_date' => $orderDate,
                'estimated_completion' => $estimatedCompletion,
                'order_number' => $this->generateOrderNumber($orderDate),
                'last_status_update' => $orderDate,
            ];
        });
    }

    /**
     * Recent orders (last month)
     */
    public function recent(): static
    {
        return $this->betweenDates(
            Carbon::now()->subMonth(),
            Carbon::now()->subDay()
        );
    }

    public function requested(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => Order::STATUS_REQUESTED,
            'actual_completion' => null,
            'pickup_date' => null,
        ]);
    }

    /**
     * Accepted orders
     */
    public function accepted(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => Order::STATUS_ACCEPTED,
            'actual_completion' => null,
            'pickup_date' => null,
        ]);
    }

    /**
     * Ready to process orders
     */
    public function readyToProcess(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => Order::STATUS_READY_TO_PROCESS,
            'actual_completion' => null,
            'pickup_date' => null,
        ]);
    }

    /**
     * In progress orders
     */
    public function inProgress(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => Order::STATUS_IN_PROGRESS,
            'actual_completion' => null,
            'pickup_date' => null,
        ]);
    }

    /**
     * Ready orders
     */
    public function ready(): static
    {
        return $this->state(function (array $attributes) {
            $actualCompletion = fake()->dateTimeBetween($attributes['order_date'], $attributes['estimated_completion']);

            return [
                'status' => Order::STATUS_READY,
                'actual_completion' => $actualCompletion,
                'pickup_date' => null,
                'last_status_update' => $actualCompletion,
            ];
        });
    }

    /**
     * Completed/Delivered orders
     */
    public function delivered(): static
    {
        return $this->state(function (array $attributes) {
            $actualCompletion = fake()->dateTimeBetween($attributes['order_date'], $attributes['estimated_completion']);
            $pickupDate = fake()->dateTimeBetween($actualCompletion, Carbon::parse($actualCompletion)->addDays(3));

            return [
                'status' => Order::STATUS_DELIVERED,
                'actual_completion' => $actualCompletion,
                'pickup_date' => $pickupDate,
                'last_status_update' => $pickupDate,
            ];
        });
    }

    /**
     * Completed orders
     */
    public function completed(): static
    {
        return $this->state(function (array $attributes) {
            $actualCompletion = fake()->dateTimeBetween($attributes['order_date'], $attributes['estimated_completion']);
            $pickupDate = fake()->dateTimeBetween($actualCompletion, Carbon::parse($actualCompletion)->addDays(3));

            return [
                'status' => Order::STATUS_COMPLETED,
                'actual_completion' => $actualCompletion,
                'pickup_date' => $pickupDate,
                'last_status_update' => $pickupDate,
            ];
        });
    }

    /**
     * Cancelled orders
     */
    public function cancelled(): static
    {
        return $this->state(function (array $attributes) {
            $cancelDate = fake()->dateTimeBetween($attributes['order_date'], $attributes['estimated_completion']);

            return [
                'status' => Order::STATUS_CANCELLED,
                'actual_completion' => null,
                'pickup_date' => null,
                'last_status_update' => $cancelDate,
                'internal_notes' => fake()->randomElement([
                    'Customer requested cancellation',
                    'Payment issues',
                    'Unable to process items',
                    'Customer no-show'
                ]),
            ];
        });
    }

    /**
     * Rejected orders
     */
    public function rejected(): static
    {
        return $this->state(function (array $attributes) {
            $rejectDate = fake()->dateTimeBetween($attributes['order_date'], $attributes['estimated_completion']);

            return [
                'status' => Order::STATUS_REJECTED,
                'actual_completion' => null,
                'pickup_date' => null,
                'last_status_update' => $rejectDate,
                'internal_notes' => fake()->randomElement([
                    'Items too damaged',
                    'Service not available',
                    'Outside service area',
                    'Customer suspicious'
                ]),
            ];
        });
    }

    /**
     * Picking up orders
     */
    public function pickingUp(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => Order::STATUS_PICKING_UP,
                'actual_completion' => null,
                'pickup_date' => null,
            ];
        });
    }

    /**
     * Fully paid orders
     */
    public function paid(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'payment_status' => Order::PAYMENT_STATUS_PAID,
                'paid_amount' => $attributes['total_amount'],
                'remaining_amount' => 0,
            ];
        });
    }

    /**
     * Unpaid orders
     */
    public function unpaid(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'payment_status' => Order::PAYMENT_STATUS_UNPAID,
                'paid_amount' => 0,
                'remaining_amount' => $attributes['total_amount'],
            ];
        });
    }

    /**
     * Partially paid orders
     */
    public function partiallyPaid(): static
    {
        return $this->state(function (array $attributes) {
            $paidAmount = $attributes['total_amount'] * fake()->randomFloat(2, 0.1, 0.9); // 10%-90% paid

            return [
                'payment_status' => Order::PAYMENT_STATUS_PARTIAL,
                'paid_amount' => $paidAmount,
                'remaining_amount' => $attributes['total_amount'] - $paidAmount,
            ];
        });
    }

    /**
     * Refunded orders
     */
    public function refunded(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'payment_status' => Order::PAYMENT_STATUS_REFUNDED,
                'status' => Order::STATUS_CANCELLED,
                'paid_amount' => 0,
                'remaining_amount' => 0,
                'internal_notes' => 'Order refunded - ' . fake()->sentence(),
            ];
        });
    }

    /**
     * Express orders (completed in 1 day)
     */
    public function express(): static
    {
        return $this->state(function (array $attributes) {
            $estimatedCompletion = Carbon::parse($attributes['order_date'])->addDay();

            return [
                'estimated_completion' => $estimatedCompletion,
                'special_instructions' => ['Express service - 24 hours'],
                'subtotal' => $attributes['subtotal'] * 1.5, // Express premium
                'total_amount' => ($attributes['subtotal'] * 1.5) - $attributes['discount_amount'] + $attributes['tax_amount'],
            ];
        });
    }

    /**
     * High value orders
     */
    public function highValue(): static
    {
        return $this->state(function (array $attributes) {
            $subtotal = fake()->numberBetween(800000, 2000000); // 800k - 2M
            $discountAmount = fake()->numberBetween(0, (int)($subtotal * 0.1)); // Max 10% discount for high value
            $taxAmount = $subtotal * 0.1;
            $totalAmount = $subtotal - $discountAmount + $taxAmount;

            return [
                'subtotal' => $subtotal,
                'discount_amount' => $discountAmount,
                'tax_amount' => $taxAmount,
                'total_amount' => $totalAmount,
                'remaining_amount' => $totalAmount - $attributes['paid_amount'],
            ];
        });
    }
}
