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
        Schema::create('coin_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_number')->unique();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('outlet_id')->nullable()->constrained('outlets')->onDelete('set null');
            $table->enum('type', [
                'topup',
                'commission',
                'transfer_to_outlet',
                'outlet_spending',
                'auto_fallback',
                'withdrawal',
                'feature_unlock',
                'wa_notification',
                'print_receipt',
                'print_label',
            ]);
            $table->bigInteger('amount');
            $table->string('description')->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'outlet_id']);
            $table->index(['type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coin_transactions');
    }
};
