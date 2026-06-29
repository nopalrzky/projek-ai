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
        Schema::create('laundry_services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            $table->foreignId('unit_id')->constrained('units')->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->unsignedInteger('duration_hours')->default(24);
            $table->unsignedInteger('min_quantity')->default(1);
            $table->decimal('price', 15, 2);
            $table->string('slug');
            $table->boolean('is_active')->default(true);
            $table->boolean('supports_courier')->default(false);
            $table->softDeletes();
            $table->timestamps();
            $table->index(['category_id', 'is_active']);
            $table->unique(['category_id', 'name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('laundry_services');
    }
};
