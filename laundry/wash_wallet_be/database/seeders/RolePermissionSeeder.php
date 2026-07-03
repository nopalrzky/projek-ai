<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;
use App\Models\User;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Role::firstOrCreate(['name' => User::ROLE_OWNER]);
        Role::firstOrCreate(['name' => User::ROLE_SUPER_ADMIN]);

        $this->migrateCashierPositionPermissions();
    }

    private function migrateCashierPositionPermissions(): void
    {
        $mapping = [
            'order.view' => ['cashier_dashboard.view', 'order.view'],
            'order.create' => ['order.create'],
            'order.manage' => [
                'order.update',
                'order.delete',
                'order.accept',
                'order.reject',
                'order.start',
                'order.complete',
                'order.weigh',
                'order.wa_notification.preview',
                'order.wa_notification.send',
            ],
            'payment.manage' => [
                'account.view',
                'order.payment.manage',
                'deposit.view',
                'deposit.create',
                'deposit.update',
                'petty_cash.view',
                'petty_cash.create',
                'petty_cash.update',
                'expense.view',
                'expense.create',
                'expense.update',
            ],
            'customer.view' => [
                'customer.view',
                'customer_subscription.view',
                'membership_plan.view',
                'membership_contract.view',
            ],
            'customer.manage' => [
                'customer.create',
                'customer.update',
                'customer.delete',
                'customer_subscription.create',
                'customer_subscription.update',
                'customer_subscription.delete',
                'membership_contract.create',
            ],
            'service.view' => [
                'category.view',
                'laundry_service.view',
                'service_package.view',
                'unit.view',
            ],
            'service.manage' => [
                'category.create',
                'category.update',
                'category.delete',
                'laundry_service.create',
                'laundry_service.update',
                'laundry_service.delete',
            ],
        ];

        DB::transaction(function () use ($mapping) {
            $now = now();

            foreach ($mapping as $oldKey => $newKeys) {
                $positionIds = DB::table('position_permissions')
                    ->where('permission_key', $oldKey)
                    ->pluck('position_id');

                foreach ($positionIds as $positionId) {
                    $permissions = array_map(
                        fn(string $newKey) => [
                            'position_id' => $positionId,
                            'permission_key' => $newKey,
                            'created_at' => $now,
                            'updated_at' => $now,
                        ],
                        $newKeys
                    );

                    DB::table('position_permissions')->insertOrIgnore($permissions);
                }

                DB::table('position_permissions')
                    ->where('permission_key', $oldKey)
                    ->delete();
            }
        });
    }
}
