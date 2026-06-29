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
        Schema::create('accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('outlet_id')->nullable()->constrained('outlets')->onDelete('cascade');
            $table->foreignId('parent_id')->nullable()->constrained('accounts')->onDelete('cascade');
            $table->string('code');
            $table->string('name');
            $table->string('slug')->nullable();
            $table->enum('type', ['asset', 'liability', 'equity', 'revenue', 'expense']);
            $table->enum('account_role', [
                'cash',
                'bank',
                'ewallet',
                'receivable',
                'loan',
                'fine',
                'revenue',
                'expense'
            ])->nullable();
            $table->tinyInteger('level')->default(1);
            $table->boolean('is_system')->default(false);
            $table->boolean('is_transactional')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
            $table->unique(['outlet_id', 'account_role'], 'unique_outlet_account_role');
            $table->unique(['owner_id', 'outlet_id', 'code'], 'unique_owner_outlet_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('accounts');
    }
};
