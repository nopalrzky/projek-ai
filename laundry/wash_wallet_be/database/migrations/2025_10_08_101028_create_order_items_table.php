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
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->foreignId('laundry_service_id')
                ->constrained('laundry_services')->onDelete('restrict');
            $table->string('category_name');
            $table->string('laundry_service_name');
            $table->string('unit_name');
            $table->decimal('quantity', 10, 2);
            $table->decimal('unit_price', 15, 2);
            $table->decimal('subtotal', 15, 2);
            $table->decimal('discount_amount', 15, 2)->default(0);
            $table->decimal('total_amount', 15, 2);
            $table->enum('status', ['pending', 'processing', 'done'])->default('pending');
            $table->boolean('is_package_usage')->default(false);
            $table->foreignId('customer_subscription_id')
                ->nullable()
                ->constrained('customer_subscriptions')
                ->onDelete('set null');
            $table->decimal('quota_used', 10, 2)->nullable();
            $table->decimal('paid_amount', 15, 2)->default(0);
            $table->text('item_notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index('order_id');
            $table->index('laundry_service_id');
            $table->index('status');
            $table->index('is_package_usage');
            $table->index('customer_subscription_id');
            $table->index(['order_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
