<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\CustomerSubscription;
use App\Models\LaundryService;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\OrderItem>
 */
class OrderItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $quantity = fake()->randomFloat(2, 1, 10);
        $unitPrice = fake()->numberBetween(8000, 35000);
        $subtotal = $quantity * $unitPrice;
        $discountAmount = fake()->boolean(30) ? $subtotal * fake()->randomFloat(2, 0.05, 0.15) : 0;
        $totalAmount = $subtotal - $discountAmount;

        $isPackageUsage = false;
        $paidAmount = $totalAmount;

        return [
            'order_id' => Order::factory(),
            'laundry_service_id' => LaundryService::factory(),
            'category_name' => fake()->randomElement(['Cuci Kering', 'Cuci Setrika', 'Dry Cleaning']),
            'laundry_service_name' => fake()->randomElement(['Cuci Baju', 'Cuci Celana', 'Cuci Bedcover']),
            'unit_name' => fake()->randomElement(['kg', 'pcs', 'set']),

            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'subtotal' => $subtotal,
            'discount_amount' => $discountAmount,
            'total_amount' => $totalAmount,

            'status' => fake()->randomElement([
                OrderItem::STATUS_PENDING,
                OrderItem::STATUS_PROCESSING,
                OrderItem::STATUS_DONE
            ]),

            'is_package_usage' => $isPackageUsage,
            'customer_subscription_id' => null,
            'quota_used' => null,
            'paid_amount' => $paidAmount,

            'item_notes' => fake()->boolean(25) ? fake()->sentence() : null,
        ];
    }

    /**
     * Indicate that the item is paid with cash (default)
     */
    public function paidWithCash(): static
    {
        return $this->state(fn(array $attributes) => [
            'is_package_usage' => false,
            'customer_subscription_id' => null,
            'quota_used' => null,
            'paid_amount' => $attributes['total_amount'],
        ]);
    }

    /**
     * Indicate that the item is paid with package/subscription
     */
    public function paidWithPackage(?int $subscriptionId = null): static
    {
        return $this->state(function (array $attributes) use ($subscriptionId) {
            $quantity = $attributes['quantity'];

            return [
                'is_package_usage' => true,
                'customer_subscription_id' => $subscriptionId ?? CustomerSubscription::factory(),
                'quota_used' => $quantity,
                'paid_amount' => 0,
            ];
        });
    }

    /**
     * Set production status to pending
     */
    public function pending(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => OrderItem::STATUS_PENDING,
        ]);
    }

    /**
     * Set production status to processing
     */
    public function processing(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => OrderItem::STATUS_PROCESSING,
        ]);
    }

    /**
     * Set production status to done
     */
    public function done(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => OrderItem::STATUS_DONE,
        ]);
    }

    /**
     * Add discount to item
     */
    public function withDiscount(float $percentage = null): static
    {
        return $this->state(function (array $attributes) use ($percentage) {
            $discountPercent = $percentage ?? fake()->randomFloat(2, 0.05, 0.20);
            $subtotal = $attributes['subtotal'];
            $discountAmount = $subtotal * $discountPercent;
            $totalAmount = $subtotal - $discountAmount;

            return [
                'discount_amount' => $discountAmount,
                'total_amount' => $totalAmount,
                'paid_amount' => $attributes['is_package_usage'] ? 0 : $totalAmount,
            ];
        });
    }

    /**
     * Set no discount
     */
    public function noDiscount(): static
    {
        return $this->state(function (array $attributes) {
            $subtotal = $attributes['subtotal'];

            return [
                'discount_amount' => 0,
                'total_amount' => $subtotal,
                'paid_amount' => $attributes['is_package_usage'] ? 0 : $subtotal,
            ];
        });
    }

    /**
     * Set specific quantity
     */
    public function withQuantity(float $quantity): static
    {
        return $this->state(function (array $attributes) use ($quantity) {
            $unitPrice = $attributes['unit_price'];
            $subtotal = $quantity * $unitPrice;
            $discountAmount = $attributes['discount_amount'];
            $totalAmount = $subtotal - $discountAmount;

            return [
                'quantity' => $quantity,
                'subtotal' => $subtotal,
                'total_amount' => $totalAmount,
                'paid_amount' => $attributes['is_package_usage'] ? 0 : $totalAmount,
                'quota_used' => $attributes['is_package_usage'] ? $quantity : null,
            ];
        });
    }

    /**
     * Set specific unit price
     */
    public function withUnitPrice(float $unitPrice): static
    {
        return $this->state(function (array $attributes) use ($unitPrice) {
            $quantity = $attributes['quantity'];
            $subtotal = $quantity * $unitPrice;
            $discountAmount = $attributes['discount_amount'];
            $totalAmount = $subtotal - $discountAmount;

            return [
                'unit_price' => $unitPrice,
                'subtotal' => $subtotal,
                'total_amount' => $totalAmount,
                'paid_amount' => $attributes['is_package_usage'] ? 0 : $totalAmount,
            ];
        });
    }

    /**
     * Add item notes
     */
    public function withNotes(string $notes = null): static
    {
        return $this->state(fn(array $attributes) => [
            'item_notes' => $notes ?? fake()->sentence(),
        ]);
    }

    /**
     * Set specific snapshot data
     */
    public function withSnapshot(array $snapshot): static
    {
        return $this->state(fn(array $attributes) => [
            'category_name' => $snapshot['category_name'] ?? $attributes['category_name'],
            'laundry_service_name' => $snapshot['laundry_service_name'] ?? $attributes['laundry_service_name'],
            'unit_name' => $snapshot['unit_name'] ?? $attributes['unit_name'],
        ]);
    }

    /**
     * Create for specific order
     */
    public function forOrder(int $orderId): static
    {
        return $this->state(fn(array $attributes) => [
            'order_id' => $orderId,
        ]);
    }

    /**
     * Create with specific laundry service
     */
    public function withLaundryService(int $laundryServiceId): static
    {
        return $this->state(fn(array $attributes) => [
            'laundry_service_id' => $laundryServiceId,
        ]);
    }
}
