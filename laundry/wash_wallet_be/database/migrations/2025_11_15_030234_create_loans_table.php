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
        Schema::create('loans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->onDelete('restrict');
            $table->foreignId('source_account_id')->constrained('accounts');
            $table->decimal('amount', 15, 2);
            $table->decimal('remaining_amount', 15, 2);
            $table->decimal('installment_amount', 15, 2);
            $table->integer('total_installments')->default(1);
            $table->date('loan_date');
            $table->date('due_date')->nullable();
            $table->enum('status', ['ongoing', 'paid', 'bad_debt'])->default('ongoing');
            $table->enum('repayment_type', ['full', 'installment']);
            $table->integer('installment_period')->nullable();
            $table->text('note')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('loans');
    }
};
