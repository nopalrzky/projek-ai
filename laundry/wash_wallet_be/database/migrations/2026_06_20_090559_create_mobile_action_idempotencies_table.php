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
        Schema::create('mobile_action_idempotencies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->foreignId('outlet_id')->nullable()->constrained('outlets')->onDelete('set null');
            $table->string('action', 100);
            $table->string('client_request_id', 100);
            $table->string('request_hash', 64)->nullable();
            $table->string('status', 50)->default('processing');
            $table->integer('response_code')->nullable();
            $table->json('response_body')->nullable();
            $table->timestamps();

            $table->unique(['employee_id', 'action', 'client_request_id'], 'idx_idempotency_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mobile_action_idempotencies');
    }
};
