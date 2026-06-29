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
        Schema::create('service_package_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_package_id')
                ->constrained('service_packages')
                ->onDelete('cascade');
            $table->foreignId('laundry_service_id')
                ->constrained('laundry_services')
                ->onDelete('cascade');
            $table->decimal('quantity', 10, 2);
            $table->timestamps();

            $table->index('service_package_id');
            $table->index('laundry_service_id');

            $table->unique(['service_package_id', 'laundry_service_id'], 'unique_package_variant');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_package_items');
    }
};
