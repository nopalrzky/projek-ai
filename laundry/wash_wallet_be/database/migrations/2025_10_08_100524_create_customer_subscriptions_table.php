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
        Schema::create('customer_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')
                ->constrained('customers')
                ->onDelete('cascade');
            $table->foreignId('service_package_id')
                ->constrained('service_packages')
                ->onDelete('cascade');
            $table->string('subscription_code')->unique();
            $table->decimal('price_paid', 15, 2);
            $table->timestamp('purchase_date');
            $table->timestamp('expired_at')->nullable();
            $table->enum('status', ['active', 'exhausted', 'expired'])->default('active');
            $table->timestamps();

            $table->index('customer_id');
            $table->index('service_package_id');
            $table->index('subscription_code');
            $table->index('status');
            $table->index('purchase_date');
            $table->index('expired_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customer_subscriptions');
    }
};
