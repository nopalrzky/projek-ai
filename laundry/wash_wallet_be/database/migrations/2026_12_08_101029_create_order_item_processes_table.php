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
        Schema::create('order_item_processes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_item_id')
                ->constrained('order_items')
                ->onDelete('cascade');
            $table->foreignId('laundry_service_process_id')
                ->constrained('laundry_service_processes')
                ->onDelete('cascade');
            $table->foreignId('employee_id')
                ->nullable()
                ->constrained('employees')
                ->onDelete('set null');
            $table->decimal('qty_processed', 10, 2)->default(0);
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->string('evidence_attachment')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('order_item_id');
            $table->index('laundry_service_process_id');
            $table->index('employee_id');
            $table->index('started_at');
            $table->index('completed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_item_processes');
    }
};
