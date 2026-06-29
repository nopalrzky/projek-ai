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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->nullable()->constrained('employees')->onDelete('restrict');
            $table->foreignId('customer_id')->nullable()->constrained('customers')->onDelete('restrict');
            $table->foreignId('customer_account_id')->nullable()->constrained('customer_accounts')->onDelete('set null');
            $table->foreignId('outlet_id')->nullable()->constrained('outlets')->onDelete('restrict');
            $table->foreignId('customer_address_id')->nullable()->constrained('customer_addresses')->onDelete('set null');

            $table->string('order_number')->unique();
            $table->string('source')->default('cashier');
            $table->string('status')->default('ready_to_process');

            $table->decimal('subtotal', 15, 2)->default(0);
            $table->decimal('discount_amount', 15, 2)->default(0);
            $table->decimal('tax_amount', 15, 2)->default(0);
            $table->decimal('total_amount', 15, 2);
            $table->decimal('paid_amount', 15, 2)->default(0);
            $table->decimal('remaining_amount', 15, 2)->default(0);

            $table->enum('payment_status', [
                'not_yet_priced',
                'unpaid',
                'partial',
                'paid',
                'refunded',
                'paid_by_package',
                'cod'
            ])->default('unpaid');
            $table->string('payment_method', 50)->nullable();
            $table->string('delivery_type')->default('pickup');

            $table->string('midtrans_order_id', 255)->nullable();
            $table->string('midtrans_transaction_id', 255)->nullable();
            $table->text('qr_url')->nullable();

            $table->datetime('order_date');
            $table->datetime('estimated_completion')->nullable();
            $table->datetime('actual_completion')->nullable();
            $table->datetime('pickup_date')->nullable();
            $table->text('pickup_address')->nullable();
            $table->datetime('pickup_schedule')->nullable();
            $table->datetime('delivery_date')->nullable();
            $table->text('delivery_address')->nullable();
            $table->datetime('delivery_schedule')->nullable();
            $table->decimal('pickup_fee', 15, 2)->default(0);
            $table->decimal('delivery_fee', 15, 2)->default(0);

            $table->text('notes')->nullable();
            $table->text('internal_notes')->nullable();
            $table->json('special_instructions')->nullable();
            $table->timestamp('last_status_update')->nullable();
            $table->foreignId('updated_by')->nullable()->constrained('employees');

            $table->timestamps();
            $table->softDeletes();

            $table->index('order_number');
            $table->index('status');
            $table->index('payment_status');
            $table->index('order_date');
            $table->index('estimated_completion');
            $table->index(['customer_id', 'order_date']);
            $table->index(['employee_id', 'order_date']);
            $table->index('outlet_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
