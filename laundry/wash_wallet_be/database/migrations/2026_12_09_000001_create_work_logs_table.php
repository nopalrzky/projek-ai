<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('work_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')
                ->constrained('employees')
                ->onDelete('cascade');
            $table->foreignId('order_item_process_id')
                ->nullable()
                ->constrained('order_item_processes')
                ->onDelete('cascade');
            $table->foreignId('employee_process_commission_id')
                ->constrained('employee_process_commissions')
                ->onDelete('cascade');
            $table->foreignId('payroll_item_id')
                ->nullable()
                ->constrained('payroll_items')
                ->onDelete('set null');
            $table->foreignId('process_id')
                ->nullable()
                ->constrained('processes')
                ->onDelete('restrict');
            $table->foreignId('employee_process_id')
                ->nullable()
                ->constrained('employee_processes')
                ->onDelete('cascade');
            $table->enum('commission_type', ['per_item', 'per_kg', 'percentage', 'flat']);
            $table->decimal('commission_value', 12, 2);
            $table->decimal('qty', 10, 2)->default(1);
            $table->decimal('base_amount', 12, 2)->default(0);
            $table->boolean('has_bonus')->default(false);
            $table->decimal('bonus_amount', 12, 2)->nullable();
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->unsignedInteger('achieved_count')->default(1);
            $table->unsignedSmallInteger('period_year');
            $table->unsignedTinyInteger('period_month');
            $table->timestamp('worked_at')->nullable();
            $table->timestamps();

            $table->index('order_item_process_id', 'wl_order_item_process_id_idx');
            $table->index('employee_process_commission_id', 'wl_employee_process_commission_id_idx');
            $table->index('payroll_item_id', 'wl_payroll_item_id_idx');
            $table->index('process_id', 'wl_process_id_idx');
            $table->index('employee_process_id', 'wl_employee_process_id_idx');
            $table->index(['employee_process_commission_id', 'period_year', 'period_month'], 'wl_commission_period_idx');
            $table->index('has_bonus', 'wl_has_bonus_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('work_logs');
    }
};
