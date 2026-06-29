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
        Schema::create('courier_pricing_tiers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('courier_setting_id')->constrained('courier_settings')->onDelete('cascade');
            $table->decimal('min_km', 8, 2);
            $table->decimal('max_km', 8, 2)->nullable();
            $table->decimal('fee', 15, 2);
            $table->decimal('per_km_fee', 15, 2)->default(0);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('courier_pricing_tiers');
    }
};
