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
        Schema::create('topups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('outlet_id')->nullable()->constrained('outlets')->onDelete('cascade');
            $table->bigInteger('amount_money');
            $table->bigInteger('coin_received');
            $table->enum('status', ['pending', 'success', 'failed'])->default('pending');
            $table->enum('payment_status', ['pending', 'waiting', 'paid', 'failed', 'expired'])
                ->default('pending');
            $table->string('payment_provider')->nullable();
            $table->string('payment_method', 50)->nullable();
            $table->json('payment_data')->nullable();
            $table->string('payment_reference')->nullable();
            $table->string('midtrans_order_id', 100)->nullable()->unique();
            $table->timestamp('expired_at')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'status']);
            $table->index(['payment_reference']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('topups');
    }
};
