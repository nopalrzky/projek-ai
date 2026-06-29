<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Table('employee_processes')]
class EmployeeProcess extends Model
{
  use HasFactory, SoftDeletes;

  protected $fillable = [
    'employee_id',
    'process_id',
    'is_active',
    'notes',
    'assigned_at',
  ];

  protected $hidden = [
    'deleted_at',
  ];

  protected function casts(): array
  {
    return [
      'employee_id' => 'integer',
      'process_id' => 'integer',
      'is_active' => 'boolean',
      'assigned_at' => 'datetime',
      'created_at' => 'datetime',
      'updated_at' => 'datetime',
      'deleted_at' => 'datetime',
    ];
  }

  /**
   * ============================================================
   * ATTRIBUTES (Auto-convert snake_case to camelCase)
   * ============================================================
   */

  protected function employeeId(): Attribute
  {
    return Attribute::make(
      get: fn($value, $attributes) => $attributes['employee_id'] ?? null,
      set: fn($value) => ['employee_id' => $value],
    );
  }

  protected function processId(): Attribute
  {
    return Attribute::make(
      get: fn($value, $attributes) => $attributes['process_id'] ?? null,
      set: fn($value) => ['process_id' => $value],
    );
  }

  protected function isActive(): Attribute
  {
    return Attribute::make(
      get: fn($value, $attributes) => (bool) ($attributes['is_active'] ?? true),
      set: fn($value) => ['is_active' => (bool) $value],
    );
  }

  /**
   * ============================================================
   * RELATIONSHIPS
   * ============================================================
   */

  /**
   * Get the employee that owns this process assignment
   */
  public function employee(): BelongsTo
  {
    return $this->belongsTo(Employee::class);
  }

  /**
   * Get the process
   */
  public function process(): BelongsTo
  {
    return $this->belongsTo(Process::class);
  }

  /**
   * Get the commission for this employee-process assignment (optional)
   */
  public function commission(): HasOne
  {
    return $this->hasOne(EmployeeProcessCommission::class, 'employee_process_id');
  }

  /**
   * ============================================================
   * QUERY SCOPES
   * ============================================================
   */

  /**
   * Scope: Active assignments only
   */
  public function scopeActive(Builder $query): Builder
  {
    return $query->where('is_active', true);
  }

  /**
   * Scope: Inactive assignments
   */
  public function scopeInactive(Builder $query): Builder
  {
    return $query->where('is_active', false);
  }

  /**
   * Scope: Filter by employee ID
   */
  public function scopeByEmployeeId(Builder $query, int $employeeId): Builder
  {
    return $query->where('employee_id', $employeeId);
  }

  /**
   * Scope: Filter by process ID
   */
  public function scopeByProcessId(Builder $query, int $processId): Builder
  {
    return $query->where('process_id', $processId);
  }

  /**
   * Scope: With all relationships
   */
  public function scopeWithAll(Builder $query): Builder
  {
    return $query->with(['employee', 'process', 'commission']);
  }

  /**
   * Scope: Search
   */
  public function scopeSearch(Builder $query, string $search): Builder
  {
    return $query->whereNested(function ($q) use ($search) {
      $q->whereHas('employee', function ($q2) use ($search) {
        $q2->where('name', 'like', "%{$search}%");
      })->orWhereHas('process', function ($q2) use ($search) {
        $q2->where('name', 'like', "%{$search}%");
      })->orWhere('notes', 'like', "%{$search}%");
    });
  }

  /**
   * Scope: Sort by
   */
  public function scopeSortBy(Builder $query, string $column = 'assigned_at', string $direction = 'desc'): Builder
  {
    $allowedColumns = [
      'id',
      'employeeId',
      'processId',
      'isActive',
      'assignedAt',
      'createdAt',
      'updatedAt',
    ];

    if (!in_array($column, $allowedColumns)) {
      $column = 'assignedAt';
    }

    $columnMap = [
      'employeeId' => 'employee_id',
      'processId' => 'process_id',
      'isActive' => 'is_active',
      'assignedAt' => 'assigned_at',
      'createdAt' => 'created_at',
      'updatedAt' => 'updated_at',
    ];

    $column = $columnMap[$column] ?? $column;
    $direction = strtolower($direction) === 'asc' ? 'asc' : 'desc';
    $query->orderBy($column, $direction);

    return $query;
  }

  /**
   * ============================================================
   * HELPER METHODS
   * ============================================================
   */

  /**
   * Check if employee can work on this process
   */
  public function canWork(): bool
  {
    return $this->is_active;
  }

  /**
   * Check if this assignment has commission
   */
  public function hasCommission(): bool
  {
    return $this->commission()->exists();
  }

  /**
   * Get commission amount for this assignment (if any)
   */
  public function getCommissionAmount(): ?float
  {
    return $this->commission?->commission_value;
  }

  /**
   * Activate this assignment
   */
  public function activate(): bool
  {
    return $this->update(['is_active' => true]);
  }

  /**
   * Deactivate this assignment
   */
  public function deactivate(): bool
  {
    return $this->update(['is_active' => false]);
  }

  /**
   * ============================================================
   * STATIC HELPER METHODS
   * ============================================================
   */

  /**
   * Check if employee can work on a specific process
   */
  public static function canEmployeeWorkOn(int $employeeId, int $processId): bool
  {
    return static::where('employee_id', $employeeId)
      ->where('process_id', $processId)
      ->where('is_active', true)
      ->exists();
  }

  /**
   * Get all processes that an employee can work on
   */
  public static function getEmployeeProcesses(int $employeeId, bool $activeOnly = true): \Illuminate\Database\Eloquent\Collection
  {
    $query = static::where('employee_id', $employeeId);

    if ($activeOnly) {
      $query->where('is_active', true);
    }

    return $query->with(['process'])->get();
  }

  /**
   * Get all employees who can work on a specific process
   */
  public static function getEmployeesForProcess(int $processId, bool $activeOnly = true): \Illuminate\Database\Eloquent\Collection
  {
    $query = static::where('process_id', $processId);

    if ($activeOnly) {
      $query->where('is_active', true);
    }

    return $query->with(['employee'])->get();
  }

  /**
   * Assign process to employee
   */
  public static function assignToEmployee(int $employeeId, int $processId, array $options = []): self
  {
    $employee = Employee::find($employeeId);
    if (!$employee || !$employee->isEligibleForProduction($employee->outlet_id)) {
      throw new \Exception('Employee tidak memiliki posisi produksi aktif.');
    }

    return static::updateOrCreate(
      [
        'employee_id' => $employeeId,
        'process_id' => $processId,
      ],
      array_merge([
        'is_active' => true,
        'assigned_at' => now(),
      ], $options)
    );
  }

  /**
   * Bulk assign processes to employee
   */
  public static function bulkAssignToEmployee(int $employeeId, array $processIds, array $options = []): int
  {
    $count = 0;

    foreach ($processIds as $processId) {
      static::assignToEmployee($employeeId, $processId, $options);
      $count++;
    }

    return $count;
  }

  /**
   * Remove process from employee
   */
  public static function removeFromEmployee(int $employeeId, int $processId): bool
  {
    $assignment = static::where('employee_id', $employeeId)
      ->where('process_id', $processId)
      ->first();

    return $assignment ? $assignment->delete() : false;
  }
}
