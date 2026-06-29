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
        Schema::create('customer_topups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_account_id')->constrained('customer_accounts')->onDelete('cascade');
            $table->unsignedBigInteger('amount');
            $table->enum('status', ['pending', 'success', 'failed'])->default('pending');
            $table->enum('payment_status', ['pending', 'paid', 'expired', 'failed'])->default('pending');
            $table->string('payment_method', 50)->nullable();
            $table->string('payment_provider')->default('Midtrans');
            $table->json('payment_data')->nullable();
            $table->string('midtrans_order_id', 100)->nullable()->unique();
            $table->timestamp('expired_at')->nullable();
            $table->timestamps();

            $table->index(['customer_account_id', 'status']);
            $table->index(['midtrans_order_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customer_topups');
    }
};
