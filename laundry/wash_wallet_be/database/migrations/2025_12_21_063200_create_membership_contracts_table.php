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
        Schema::create('membership_contracts', function (Blueprint $table) {
            $table->id();

            $table->foreignId('customer_id')
                ->constrained('customers')
                ->onDelete('cascade');

            $table->foreignId('outlet_id')
                ->constrained('outlets')
                ->onDelete('cascade');

            $table->foreignId('membership_plan_id')
                ->constrained('membership_plans')
                ->onDelete('restrict');

            $table->dateTime('start_at');
            $table->dateTime('expired_at')->nullable();

            $table->enum('status', ['active', 'expired'])
                ->default('active')
                ->index();

            $table->integer('free_shipping_used')->default(0);
            $table->dateTime('free_shipping_expires_at')->nullable();


            $table->decimal('total_paid', 12, 2)->default(0);

            $table->timestamps();

            $table->index(['customer_id', 'status']);
            $table->index(['outlet_id', 'status']);
            $table->index(['membership_plan_id', 'status']);

            $table->index('start_at');
            $table->index('expired_at');

            $table->unique(
                ['customer_id', 'membership_plan_id', 'status'],
                'unique_active_membership_plan_per_customer'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('membership_contracts');
    }
};
