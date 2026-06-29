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
    Schema::create('employee_processes', function (Blueprint $table) {
      $table->id();
      $table->foreignId('employee_id')
        ->constrained('employees')
        ->onDelete('cascade');
      $table->foreignId('process_id')
        ->constrained('processes')
        ->onDelete('cascade');
      $table->boolean('is_active')->default(true);
      $table->text('notes')->nullable();
      $table->timestamp('assigned_at')->useCurrent();
      $table->timestamps();
      $table->softDeletes();
      $table->index('employee_id');
      $table->index('process_id');
      $table->index('is_active');
      $table->unique(['employee_id', 'process_id', 'deleted_at'], 'employee_process_unique');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('employee_processes');
  }
};
