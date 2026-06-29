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
        Schema::create('employee_process_commissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_process_id')
                ->constrained('employee_processes')
                ->onDelete('cascade');
            $table->enum('commission_type', ['per_item', 'per_kg', 'percentage', 'flat'])->default('per_item');
            $table->decimal('commission_value', 12, 2)->default(0);
            $table->boolean('has_target')->default(false);
            $table->unsignedInteger('target_threshold')->nullable();
            $table->decimal('bonus_amount', 12, 2)->nullable();
            $table->json('rules')->nullable();
            $table->date('effective_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
            $table->unique('employee_process_id');
            $table->index(['employee_process_id', 'is_active']);
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee_process_commissions');
    }
};
