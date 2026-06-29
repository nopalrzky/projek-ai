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
        try {
            Schema::table('orders', function (Blueprint $table) {
                $table->index(['outlet_id', 'order_date', 'status', 'payment_status'], 'idx_orders_dashboard_stats');
            });
        } catch (\Exception $e) {}
        try {
            Schema::table('orders', function (Blueprint $table) {
                $table->index(['status', 'updated_at'], 'idx_orders_status_updated');
            });
        } catch (\Exception $e) {}
        try {
            Schema::table('orders', function (Blueprint $table) {
                $table->index(['estimated_completion', 'status'], 'idx_orders_est_completion_status');
            });
        } catch (\Exception $e) {}

        try {
            Schema::table('expenses', function (Blueprint $table) {
                $table->index(['outlet_id', 'date', 'status'], 'idx_expenses_dashboard');
            });
        } catch (\Exception $e) {}

        try {
            Schema::table('deposits', function (Blueprint $table) {
                $table->index(['outlet_id', 'status'], 'idx_deposits_dashboard');
            });
        } catch (\Exception $e) {}

        try {
            Schema::table('petty_cashes', function (Blueprint $table) {
                $table->index(['outlet_id', 'status'], 'idx_petty_cashes_dashboard');
            });
        } catch (\Exception $e) {}

        try {
            Schema::table('wallet_withdrawals', function (Blueprint $table) {
                $table->index(['user_id', 'status'], 'idx_wallet_withdrawals_dashboard');
            });
        } catch (\Exception $e) {}

        try {
            Schema::table('customer_subscriptions', function (Blueprint $table) {
                $table->index(['status', 'expired_date'], 'idx_cust_subscriptions_status_expired');
            });
        } catch (\Exception $e) {}

        try {
            Schema::table('membership_contracts', function (Blueprint $table) {
                $table->index(['status', 'expired_at'], 'idx_memb_contracts_status_expired');
            });
        } catch (\Exception $e) {}
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex('idx_orders_dashboard_stats');
            $table->dropIndex('idx_orders_status_updated');
            $table->dropIndex('idx_orders_est_completion_status');
        });

        Schema::table('expenses', function (Blueprint $table) {
            $table->dropIndex('idx_expenses_dashboard');
        });

        Schema::table('deposits', function (Blueprint $table) {
            $table->dropIndex('idx_deposits_dashboard');
        });

        Schema::table('petty_cashes', function (Blueprint $table) {
            $table->dropIndex('idx_petty_cashes_dashboard');
        });

        Schema::table('wallet_withdrawals', function (Blueprint $table) {
            $table->dropIndex('idx_wallet_withdrawals_dashboard');
        });

        Schema::table('customer_subscriptions', function (Blueprint $table) {
            $table->dropIndex('idx_cust_subscriptions_status_expired');
        });

        Schema::table('membership_contracts', function (Blueprint $table) {
            $table->dropIndex('idx_memb_contracts_status_expired');
        });
    }
};
