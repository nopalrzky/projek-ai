<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('outlet_id')->nullable()->constrained('outlets')->nullOnDelete();
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->foreignId('wallet_withdrawal_id')->nullable()->constrained('wallet_withdrawals')->nullOnDelete();
            $table->string('transaction_number')->unique();
            $table->enum('type', [
                'order_transfer_income',
                'order_wallet_income',
                'withdrawal_request',
                'withdrawal_rejected_refund',
                'withdrawal_cancelled_refund',
                'manual_adjustment',
            ]);
            $table->decimal('amount', 15, 2);
            $table->decimal('gross_amount', 15, 2)->nullable();
            $table->decimal('fee_amount', 15, 2)->nullable();
            $table->decimal('net_amount', 15, 2)->nullable();
            $table->decimal('balance_before', 15, 2);
            $table->decimal('balance_after', 15, 2);
            $table->text('description')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'type']);
            $table->index(['order_id']);
            $table->index(['wallet_withdrawal_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wallet_transactions');
    }
};
