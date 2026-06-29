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
    Schema::create('customer_addresses', function (Blueprint $table) {
      $table->id();
      $table->foreignId('customer_account_id')
        ->constrained('customer_accounts')
        ->cascadeOnDelete();
      $table->string('label', 50);
      $table->string('recipient_name');
      $table->string('recipient_phone', 20);
      $table->text('street');
      $table->string('province_id')->nullable();
      $table->string('regency_id')->nullable();
      $table->string('district_id')->nullable();
      $table->string('village_id')->nullable();
      $table->string('province_name')->nullable();
      $table->string('regency_name')->nullable();
      $table->string('district_name')->nullable();
      $table->string('village_name')->nullable();
      $table->string('notes', 500)->nullable();
      $table->decimal('latitude', 10, 7)->nullable();
      $table->decimal('longitude', 10, 7)->nullable();
      $table->boolean('is_primary')->default(false);
      $table->timestamps();

      $table->index(['customer_account_id', 'is_primary']);
      $table->index(['customer_account_id', 'created_at']);
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('customer_addresses');
  }
};
