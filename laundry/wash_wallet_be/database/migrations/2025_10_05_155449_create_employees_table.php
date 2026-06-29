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
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('outlet_id')
                ->constrained('outlets')
                ->onDelete('cascade');
            $table->string('name');
            $table->string('username')->unique();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('avatar')->nullable();
            $table->string('password');
            $table->date('start_date')->nullable();
            $table->enum('gender', ['male', 'female'])->nullable()->default('male');
            $table->boolean('is_active')->default(true);
            $table->tinyInteger('cutoff_days')
                ->unsigned()
                ->default(30)
                ->comment('Cutoff days for payroll calculation');
            $table->timestamp('last_login_at')->nullable();

            $table->timestamps();
            $table->softDeletes();
            $table->index('outlet_id');
            $table->index('is_active');
            $table->index('start_date');
            $table->index(['outlet_id', 'is_active']);
            $table->index('username');
        });

        Schema::create('employee_password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
