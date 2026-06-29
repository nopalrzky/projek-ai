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
        Schema::create('customer_quotas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_subscription_id')
                ->constrained('customer_subscriptions')
                ->onDelete('cascade');
            $table->foreignId('laundry_service_id')
                ->constrained('laundry_services')
                ->onDelete('cascade');
            $table->decimal('total_quota', 10, 2);
            $table->decimal('remaining_quota', 10, 2);
            $table->timestamps();

            // Indexes
            $table->index('customer_subscription_id');
            $table->index('laundry_service_id');
            $table->index('remaining_quota');

            $table->unique(['customer_subscription_id', 'laundry_service_id'], 'unique_subscription_variant');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customer_quotas');
    }
};
