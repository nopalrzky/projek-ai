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
    Schema::create('deposits', function (Blueprint $table) {
      $table->id();
      $table->string('code')->unique();
      $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
      $table->foreignId('outlet_id')->constrained('outlets')->cascadeOnDelete();
      $table->foreignId('cashier_id')->constrained('users')->cascadeOnDelete();
      $table->foreignId('source_account_id')->constrained('accounts')->cascadeOnDelete();
      $table->foreignId('destination_account_id')->constrained('accounts')->cascadeOnDelete();
      $table->decimal('amount', 15, 2);
      $table->text('notes')->nullable();
      $table->string('attachment_path')->nullable();
      $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
      $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
      $table->timestamp('approved_at')->nullable();
      $table->text('rejection_reason')->nullable();
      $table->foreignId('journal_entry_id')->nullable()->constrained('journal_entries')->nullOnDelete();
      $table->timestamps();
      $table->softDeletes();
      $table->index('code');
      $table->index('status');
      $table->index(['owner_id', 'outlet_id', 'status']);
      $table->index('created_at');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('deposits');
  }
};
