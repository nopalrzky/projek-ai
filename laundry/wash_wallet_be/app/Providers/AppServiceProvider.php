<?php

namespace App\Providers;

use App\Models\Loan;
use App\Models\LoanLog;
use App\Models\Order;
use App\Models\FineLog;
use App\Models\Expense;
use App\Models\Prive;
use App\Models\Payroll;
use App\Models\Topup;
use App\Models\Withdrawal;
use App\Models\Deposit;
use App\Models\PettyCash;
use App\Observers\OrderObserver;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Order::observe(OrderObserver::class);
        Vite::prefetch(concurrency: 3);
        JsonResource::withoutWrapping();
        Relation::morphMap([
            'order' => Order::class,
            'order_package_usage' => Order::class,
            'loan' => Loan::class,
            'loan_log' => LoanLog::class,
            'fine_log' => FineLog::class,
            'expense' => Expense::class,
            'prive' => Prive::class,
            'payroll' => Payroll::class,
            'topup' => Topup::class,
            'withdrawal' => Withdrawal::class,
            'deposit' => Deposit::class,
            'petty_cash' => PettyCash::class,
        ]);


        if (config('database.default') === 'sqlite') {
            $databasePath = (string) config('database.connections.sqlite.database');

            try {
                $pdo = DB::connection()->getPdo();

                $pdo->exec('PRAGMA busy_timeout = 10000');

                $pdo->sqliteCreateFunction('acos',    fn($x) => acos($x),   1);
                $pdo->sqliteCreateFunction('cos',     fn($x) => cos($x),    1);
                $pdo->sqliteCreateFunction('sin',     fn($x) => sin($x),    1);
                $pdo->sqliteCreateFunction('radians', fn($x) => deg2rad($x), 1);
                $pdo->sqliteCreateFunction('sqrt',    fn($x) => sqrt($x),   1);

            } catch (\Exception $e) {
                Log::warning('[AppServiceProvider] SQLite init skipped: ' . $e->getMessage());
            }
        }
    }
}
