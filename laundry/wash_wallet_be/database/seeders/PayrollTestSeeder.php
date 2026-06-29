<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\Employee;
use App\Models\EmployeeProcess;
use App\Models\EmployeeSalary;
use App\Models\Fine;
use App\Models\FineLog;
use App\Models\Loan;
use App\Models\Outlet;
use App\Models\WorkLog;
use App\Models\Salary;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class PayrollTestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🌱 Seeding payroll test data...');

        $monthlySalary = Salary::byType('monthly')->first();
        $dailySalary   = Salary::byType('daily')->first();

        if (!$monthlySalary || !$dailySalary) {
            $this->command->error('❌ Run SalarySeeder first!');
            return;
        }

        $period      = Carbon::create(2026, 4, 1);
        $periodStart = $period->copy()->startOfMonth()->toDateString();
        $periodEnd   = $period->copy()->endOfMonth()->toDateString();

        $outlets = Outlet::with(['employees'])->get()->unique('owner_id')->take(5);

        foreach ($outlets as $outlet) {
            $employees = $outlet->employees()->active()->take(2)->get();

            if ($employees->isEmpty()) {
                $this->command->warn("  Outlet {$outlet->name}: no active employees, skipping.");
                continue;
            }

            $this->command->info("  Processing outlet: {$outlet->name}");

            foreach ($employees as $index => $employee) {
                $this->seedEmployeeSalary($employee, $monthlySalary, $dailySalary, $index);
                $this->seedFineLog($employee, $outlet, $periodStart, $periodEnd, $index);

                if ($index === 0) {
                    $this->seedLoan($employee, $outlet);
                    $this->seedReferralLog($employee, $period);
                }

                $this->command->info("    ✓ {$employee->name} seeded with payroll components.");
            }
        }

        $this->command->info('✅ PayrollTestSeeder completed!');
    }

    private function seedEmployeeSalary(Employee $employee, Salary $monthly, Salary $daily, int $index): void
    {
        $baseSalaryAmount = $index === 0 ? 4000000 : 3000000;
        $dailyAmount      = $index === 0 ? 25000 : 15000;

        EmployeeSalary::firstOrCreate(
            ['employee_id' => $employee->id, 'salary_id' => $monthly->id],
            ['amount' => $baseSalaryAmount, 'status' => 'active']
        );

        EmployeeSalary::firstOrCreate(
            ['employee_id' => $employee->id, 'salary_id' => $daily->id],
            ['amount' => $dailyAmount, 'status' => 'active']
        );
    }

    private function seedFineLog(Employee $employee, Outlet $outlet, string $start, string $end, int $index): void
    {
        $fineNames = ['Terlambat Masuk', 'Merusak Peralatan', 'Pulang Lebih Awal'];
        $fineName = $fineNames[$index % 3];
        $fineAmount = ($index + 1) * 25000;

        $fine = Fine::firstOrCreate(
            ['outlet_id' => $outlet->id, 'name' => $fineName],
            ['amount' => $fineAmount, 'description' => 'Denda otomatis dari seeder']
        );

        FineLog::firstOrCreate(
            [
                'employee_id' => $employee->id,
                'fine_id'     => $fine->id,
                'date'        => Carbon::parse($start)->addDays(rand(1, 20))->toDateString(),
                'amount'      => $fine->amount,
                'reason'      => 'Pelanggaran disiplin (seeder)',
            ],
        );
    }

    private function seedLoan(Employee $employee, Outlet $outlet): void
    {
        $account = Account::byOutletId($outlet->id)
            ->byAccountRole('cash')
            ->first();

        if (!$account) return;

        $hasLoan = Loan::byEmployeeId($employee->id)->byStatus('ongoing')->exists();

        if (!$hasLoan) {
            Loan::create([
                'employee_id'        => $employee->id,
                'source_account_id'  => $account->id,
                'amount'             => 1000000,
                'remaining_amount'   => 1000000,
                'installment_amount' => 500000,
                'total_installments' => 2,
                'loan_date'          => Carbon::create(2026, 3, 15)->toDateString(),
                'due_date'           => Carbon::create(2026, 5, 15)->toDateString(),
                'status'             => 'ongoing',
                'repayment_type'     => 'installment',
                'installment_period' => 2,
                'note'               => 'Kasbon modal kerja (seeder)',
            ]);
        }
    }

    private function seedReferralLog(Employee $employee, Carbon $period): void
    {
        $ep = EmployeeProcess::byEmployeeId($employee->id)
            ->active()
            ->whereHas('commission')
            ->with('commission')
            ->first();

        if (!$ep || !$ep->commission) return;

        for ($i = 1; $i <= 3; $i++) {
            WorkLog::create([
                'employee_id'                    => $employee->id,
                'order_item_process_id'          => null,
                'employee_process_commission_id' => $ep->commission->id,
                'employee_process_id'            => $ep->id,
                'process_id'                     => $ep->process_id,
                'payroll_item_id'                => null,
                'commission_type'                => $ep->commission->commission_type,
                'commission_value'               => $ep->commission->commission_value,
                'qty'                            => rand(1, 10),
                'base_amount'                    => 100000,
                'has_bonus'                      => false,
                'bonus_amount'                   => null,
                'total_amount'                   => $ep->commission->commission_value * rand(1, 5),
                'achieved_count'                 => rand(1, 10),
                'period_year'                    => $period->year,
                'period_month'                   => $period->month,
                'worked_at'                      => now(),
            ]);
        }
    }
}
