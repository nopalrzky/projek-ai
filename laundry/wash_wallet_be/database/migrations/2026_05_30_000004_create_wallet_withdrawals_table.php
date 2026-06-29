<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wallet_withdrawals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('owner_bank_account_id')->nullable()->constrained('owner_bank_accounts')->nullOnDelete();
            $table->string('code')->unique();
            $table->decimal('requested_amount', 15, 2);
            $table->decimal('admin_fee', 15, 2);
            $table->decimal('net_amount', 15, 2);
            $table->enum('status', ['pending', 'processing', 'paid', 'rejected', 'cancelled']);
            $table->string('bank_name', 100);
            $table->string('bank_code', 20)->nullable();
            $table->string('account_number', 50);
            $table->string('account_holder_name', 100);
            $table->text('admin_note')->nullable();
            $table->string('proof_path')->nullable();
            $table->foreignId('processed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('processed_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['user_id', 'status']);
            $table->index(['status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wallet_withdrawals');
    }
};
