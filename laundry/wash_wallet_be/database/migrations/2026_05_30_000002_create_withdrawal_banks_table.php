<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('withdrawal_banks', function (Blueprint $table) {
            $table->id();
            $table->string('bank_name', 100);
            $table->string('bank_code', 20)->nullable();
            $table->decimal('admin_fee', 15, 2)->default(0);
            $table->decimal('min_withdrawal', 15, 2)->default(50000);
            $table->decimal('max_withdrawal', 15, 2)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('withdrawal_banks');
    }
};
