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
        Schema::create('quota_usage_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_subscription_id')
                ->constrained('customer_subscriptions')
                ->onDelete('cascade');
            $table->foreignId('order_item_id')
                ->constrained('order_items')
                ->onDelete('cascade');
            $table->decimal('amount_used', 10, 2);
            $table->timestamps();

            // Indexes
            $table->index('customer_subscription_id');
            $table->index('order_item_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quota_usage_logs');
    }
};
