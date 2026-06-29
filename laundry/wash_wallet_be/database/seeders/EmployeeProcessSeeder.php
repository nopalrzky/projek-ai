<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\EmployeeProcess;
use App\Models\EmployeeProcessCommission;
use App\Models\Process;
use Illuminate\Database\Seeder;

class EmployeeProcessSeeder extends Seeder
{
  /**
   * Seed employee process assignments and commissions
   * 
   * This demonstrates the new system where:
   * 1. Employees are assigned to processes they can work on
   * 2. Optionally, they can have commissions for specific processes
   */
  public function run(): void
  {
    // Only consider employees who are assigned the 'produksi' position
    $employees = Employee::whereHas('positions', function ($q) {
      $q->where('slug', 'produksi')
        ->wherePivot('is_active', true);
    })->limit(5)->get();

    $processes = Process::limit(6)->get();

    if ($employees->isEmpty() || $processes->isEmpty()) {
      $this->command->warn('No employees or processes found. Please seed employees and processes first.');
      return;
    }

    $this->command->info('Assigning processes to employees...');

    if ($employees->count() > 0) {
      $seniorEmployee = $employees->first();
      $this->command->info("Setting up {$seniorEmployee->name} as senior employee...");

      foreach ($processes as $index => $process) {
        $ep = EmployeeProcess::assignToEmployee($seniorEmployee->id, $process->id, [
          'notes' => 'Senior employee - dapat mengerjakan semua proses',
        ]);

        if ($index < 3) {
          EmployeeProcessCommission::updateOrCreate(
            [
              'employee_process_id' => $ep->id,
            ],
            [
              'commission_type' => 'per_item',
              'commission_value' => 5000 - ($index * 1000),
              'is_active' => true,
              'effective_date' => now(),
            ]
          );
        }
      }

      $this->command->info("✓ {$seniorEmployee->name}: {$processes->count()} processes, 3 with commission");
    }

    if ($employees->count() > 1) {
      $specialist = $employees->get(1);
      $this->command->info("Setting up {$specialist->name} as specialist...");

      // Only assign first 2 processes (e.g., Pencucian & Pengeringan)
      foreach ($processes->take(2) as $process) {
        $ep = EmployeeProcess::assignToEmployee($specialist->id, $process->id, [
          'notes' => 'Spesialis untuk proses ini',
        ]);

        // High commission because specialist
        EmployeeProcessCommission::updateOrCreate(
          [
            'employee_process_id' => $ep->id,
          ],
          [
            'commission_type' => 'per_item',
            'commission_value' => 7000,
            'has_target' => true,
            'target_threshold' => 50,
            'bonus_amount' => 100000,
            'is_active' => true,
            'effective_date' => now(),
          ]
        );
      }

      $this->command->info("✓ {$specialist->name}: 2 processes (specialist), all with commission + target");
    }

    // Example 3: Junior Employee - Can do all but no commission
    if ($employees->count() > 2) {
      $junior = $employees->get(2);
      $this->command->info("Setting up {$junior->name} as junior employee...");

      // Assign all processes but as beginner
      foreach ($processes as $process) {
        EmployeeProcess::assignToEmployee($junior->id, $process->id, [
          'notes' => 'Karyawan baru - masih belajar',
        ]);
      }

      // No commission for junior

      $this->command->info("✓ {$junior->name}: {$processes->count()} processes, NO commission");
    }

    // Example 4: Mid-level Employee - Some processes, percentage commission
    if ($employees->count() > 3) {
      $midLevel = $employees->get(3);
      $this->command->info("Setting up {$midLevel->name} as mid-level employee...");

      // Assign middle processes
      foreach ($processes->skip(1)->take(4) as $process) {
        $ep = EmployeeProcess::assignToEmployee($midLevel->id, $process->id, [
          'notes' => 'Karyawan dengan pengalaman moderat',
        ]);

        // Percentage-based commission
        EmployeeProcessCommission::updateOrCreate(
          [
            'employee_process_id' => $ep->id,
          ],
          [
            'commission_type' => 'percentage',
            'commission_value' => 5, // 5% dari harga
            'is_active' => true,
            'effective_date' => now(),
          ]
        );
      }

      $this->command->info("✓ {$midLevel->name}: 4 processes, all with 5% commission");
    }

    // Example 5: Part-time Employee - Limited processes, fixed commission
    if ($employees->count() > 4) {
      $partTime = $employees->get(4);
      $this->command->info("Setting up {$partTime->name} as part-time employee...");

      // Assign only last 3 processes
      foreach ($processes->skip(3)->take(3) as $process) {
        $ep = EmployeeProcess::assignToEmployee($partTime->id, $process->id, [
          'notes' => 'Part-time - shift malam',
        ]);

        // Fixed commission per completion
        EmployeeProcessCommission::updateOrCreate(
          [
            'employee_process_id' => $ep->id,
          ],
          [
            'commission_type' => 'fixed',
            'commission_value' => 15000, // Rp 15.000 per proses selesai
            'is_active' => true,
            'effective_date' => now(),
          ]
        );
      }

      $this->command->info("✓ {$partTime->name}: 3 processes, fixed Rp 15.000 commission");
    }

    // Statistics
    $totalAssignments = EmployeeProcess::count();
    $totalCommissions = EmployeeProcessCommission::count();
    $employeesWithProcesses = EmployeeProcess::distinct('employee_id')->count('employee_id');
    $employeesWithCommissions = EmployeeProcessCommission::distinct('employee_id')->count('employee_id');

    $this->command->info('');
    $this->command->info('=== Summary ===');
    $this->command->info("Total Process Assignments: {$totalAssignments}");
    $this->command->info("Total Commission Configs: {$totalCommissions}");
    $this->command->info("Employees with Processes: {$employeesWithProcesses}");
    $this->command->info("Employees with Commissions: {$employeesWithCommissions}");
    $this->command->info('');
    $this->command->info('✓ Employee process system seeded successfully!');
  }
}
