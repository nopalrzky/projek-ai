<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
class MigrateGlobalCustomerAccounts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'migrate:global-customer-accounts';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Migrate existing customers to global customer accounts based on phone number';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting migration of customers to global accounts...');

        $customers = DB::table('customers')
            ->whereNotNull('phone')
            ->where('phone', '!=', '')
            ->get();

        $count = 0;
        $linked = 0;

        foreach ($customers as $customer) {
            $phone = $this->normalizePhone($customer->phone);

            $account = DB::table('customer_accounts')->where('phone', $phone)->first();

            if (!$account) {
                $accountId = DB::table('customer_accounts')->insertGetId([
                    'phone' => $phone,
                    'name' => $customer->name,
                    'is_verified' => false,
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $count++;
            } else {
                $accountId = $account->id;
            }

            DB::table('customers')
                ->where('id', $customer->id)
                ->update(['customer_account_id' => $accountId]);

            $linked++;
        }

        $this->info("Migration completed!");
        $this->info("Created $count new global accounts.");
        $this->info("Linked $linked customers to global accounts.");
    }

    /**
     * Basic phone normalization
     */
    private function normalizePhone($phone)
    {
        $phone = preg_replace('/[^0-9]/', '', $phone);

        if (str_starts_with($phone, '0')) {
            $phone = '62' . substr($phone, 1);
        }

        return $phone;
    }
}
