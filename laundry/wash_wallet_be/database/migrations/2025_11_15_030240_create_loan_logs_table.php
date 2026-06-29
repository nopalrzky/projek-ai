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
        Schema::create('loan_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loan_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['disbursement', 'repayment'])->default('repayment');
            $table->foreignId('payroll_item_id')->nullable()->constrained('payroll_items')->onDelete('set null');
            $table->foreignId('deposit_account_id')->nullable()->constrained('accounts')->onDelete('restrict');
            $table->enum('source', ['cash', 'transfer', 'payroll'])->default('cash');
            $table->decimal('amount', 15, 2);
            $table->date('payment_date');
            $table->unsignedSmallInteger('scheduled_month')->nullable();
            $table->unsignedSmallInteger('scheduled_year')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('loan_logs');
    }
};
