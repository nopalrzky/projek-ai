<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('owner_bank_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('withdrawal_bank_id')->constrained('withdrawal_banks')->cascadeOnDelete();
            $table->string('account_number', 50);
            $table->string('account_holder_name', 100);
            $table->boolean('is_default')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
            $table->unique(['user_id', 'withdrawal_bank_id', 'account_number'], 'owner_bank_accounts_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('owner_bank_accounts');
    }
};
