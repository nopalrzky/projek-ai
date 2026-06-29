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
        Schema::create('courier_pricing_zones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('courier_setting_id')->constrained('courier_settings')->onDelete('cascade');
            $table->string('location_type');
            $table->string('location_id');
            $table->string('parent_district_id')->nullable();
            $table->string('location_name');
            $table->decimal('fee', 15, 2);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('courier_pricing_zones');
    }
};
