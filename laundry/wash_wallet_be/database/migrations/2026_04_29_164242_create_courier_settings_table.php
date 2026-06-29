<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('courier_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('outlet_id')->constrained('outlets')->onDelete('cascade');
            $table->boolean('is_courier_enabled')->default(true);
            $table->decimal('pickup_fee', 15, 2)->default(0);
            $table->decimal('delivery_fee', 15, 2)->default(0);
            $table->string('pricing_method')->default('flat_rate');

            $table->decimal('flat_fee', 15, 2)->default(0);
            $table->decimal('base_fee', 15, 2)->default(0);
            $table->decimal('per_km_fee', 15, 2)->default(0);
            $table->decimal('default_price', 15, 2)->default(0);
            $table->decimal('free_radius_km', 8, 2)->nullable();
            $table->decimal('min_fee', 15, 2)->default(0);
            $table->decimal('max_fee', 15, 2)->nullable();
            $table->decimal('max_distance_km', 8, 2)->nullable();

            $table->boolean('surge_enabled')->default(false);
            $table->decimal('surge_multiplier', 5, 2)->default(1.00);

            $table->decimal('night_surcharge', 15, 2)->default(0);
            $table->time('night_start_time')->nullable()->default('21:00');
            $table->time('night_end_time')->nullable()->default('06:00');

            $table->decimal('weekend_surcharge', 15, 2)->default(0);

            $table->decimal('merchant_subsidy', 15, 2)->default(0);
            $table->string('merchant_subsidy_type')->default('fixed_amount');

            $table->boolean('free_shipping_enabled')->default(false);
            $table->decimal('min_order_free_shipping', 15, 2)->nullable();
            $table->boolean('unconditional_free_shipping_enabled')->default(false);
            $table->timestamps();

            $table->unique('outlet_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('courier_settings');
    }
};
