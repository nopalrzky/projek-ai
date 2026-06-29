<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Table('employees')]
class Employee extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'outlet_id',
        'name',
        'username',
        'password',
        'pin_hash',
        'phone',
        'address',
        'date_of_birth',
        'avatar',
        'gender',
        'start_date',
        'is_active',
        'cutoff_days',
        'last_login_at',
        'pin_set_at',
    ];

    protected $hidden = [
        'password',
        'pin_hash',
        'remember_token',
        'deleted_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active'     => 'boolean',
            'start_date'    => 'date',
            'date_of_birth' => 'date',
            'cutoff_days'   => 'integer',
            'last_login_at' => 'datetime',
            'created_at'    => 'datetime',
            'updated_at'    => 'datetime',
            'deleted_at'    => 'datetime',
            'password'      => 'hashed',
            'pin_set_at'    => 'datetime',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Boot
    |--------------------------------------------------------------------------
    */

    protected static function booted(): void
    {
        static::creating(function (self $employee) {
            $employee->is_active   ??= true;
            $employee->cutoff_days ??= 30;
            $employee->start_date  ??= now()->format('Y-m-d');
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function outlet(): BelongsTo
    {
        return $this->belongsTo(Outlet::class);
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    public function employeePositions(): HasMany
    {
        return $this->hasMany(EmployeePosition::class);
    }

    public function employeeProcesses(): HasMany
    {
        return $this->hasMany(EmployeeProcess::class);
    }

    public function deviceTokens(): HasMany
    {
        return $this->hasMany(EmployeeDeviceToken::class);
    }

    public function employeeSalaries(): HasMany
    {
        return $this->hasMany(EmployeeSalary::class);
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class);
    }

    public function fineLogs(): HasMany
    {
        return $this->hasMany(FineLog::class);
    }

    public function loans(): HasMany
    {
        return $this->hasMany(Loan::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function positions(): BelongsToMany
    {
        return $this->belongsToMany(Position::class, 'employee_positions', 'employee_id', 'position_id')
            ->whereNull('employee_positions.deleted_at');
    }

    public function allPositions(): BelongsToMany
    {
        return $this->belongsToMany(Position::class, 'employee_positions', 'employee_id', 'position_id');
    }

    public function processes(): BelongsToMany
    {
        return $this->belongsToMany(Process::class, 'employee_processes')
            ->withPivot(['is_active', 'notes', 'assigned_at'])
            ->withTimestamps()
            ->wherePivot('is_active', true);
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeInactive(Builder $query): Builder
    {
        return $query->where('is_active', false);
    }

    public function scopeById(Builder $query, int $id): Builder
    {
        return $query->where('id', $id);
    }

    public function scopeByIds(Builder $query, array $ids): Builder
    {
        return $query->whereIn('id', $ids);
    }

    public function scopeByOutletId(Builder $query, int $outletId): Builder
    {
        return $query->where('outlet_id', $outletId);
    }

    public function scopeByOwnerId(Builder $query, int $ownerId): Builder
    {
        return $query->whereHas('outlet', function (Builder $q) use ($ownerId) {
            $q->where('owner_id', $ownerId);
        });
    }

    public function scopeByUsername(Builder $query, string $username): Builder
    {
        return $query->where('username', $username);
    }

    public function scopeByPositionId(Builder $query, int $positionId): Builder
    {
        return $query->whereHas('positions', function (Builder $q) use ($positionId) {
            $q->where('positions.id', $positionId);
        });
    }

    public function scopeByProcessId(Builder $query, int $processId): Builder
    {
        return $query->whereHas('employeeProcesses', function (Builder $q) use ($processId) {
            $q->where('process_id', $processId);
        });
    }

    public function scopeBySalaryId(Builder $query, int $salaryId): Builder
    {
        return $query->whereHas('employeeSalaries', function (Builder $q) use ($salaryId) {
            $q->where('employee_salaries.id', $salaryId);
        });
    }

    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->whereNested(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
                ->orWhere('username', 'like', "%{$search}%")
                ->orWhere('phone', 'like', "%{$search}%")
                ->orWhere('address', 'like', "%{$search}%");
        });
    }

    public function scopeSortBy(Builder $query, string $column = 'createdAt', string $direction = 'desc'): Builder
    {
        $allowedColumns = [
            'name',
            'username',
            'phone',
            'startDate',
            'isActive',
            'createdAt',
            'updatedAt',
        ];

        $columnMap = [
            'startDate' => 'start_date',
            'isActive'  => 'is_active',
            'createdAt' => 'created_at',
            'updatedAt' => 'updated_at',
        ];

        if (!in_array($column, $allowedColumns)) {
            $column = 'createdAt';
        }

        $column    = $columnMap[$column] ?? $column;
        $direction = strtolower($direction) === 'asc' ? 'asc' : 'desc';

        $query->orderBy($column, $direction);

        return $query;
    }

    /*
    |--------------------------------------------------------------------------
    | Accessors & Mutators
    |--------------------------------------------------------------------------
    */

    public function getAge(): ?int
    {
        return $this->date_of_birth
            ? (int) now()->diffInYears($this->date_of_birth)
            : null;
    }

    public function getFormattedGender(): string
    {
        return match (strtolower($this->gender ?? '')) {
            'l', 'male', 'laki-laki', 'm' => 'Laki-laki',
            'p', 'female', 'perempuan', 'f' => 'Perempuan',
            default => $this->gender ? ucfirst($this->gender) : '-',
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Business Logic
    |--------------------------------------------------------------------------
    */

    public function canWorkOnProcess(int $processId): bool
    {
        return $this->employeeProcesses()
            ->where('process_id', $processId)
            ->where('is_active', true)
            ->exists();
    }

    public function isEligibleForProduction(?int $outletId = null): bool
    {
        if (!$this->is_active) {
            return false;
        }

        $outletId ??= $this->outlet_id;

        return $this->positions()
            ->where('employee_positions.is_active', true)
            ->where('positions.is_active', true)
            ->where('positions.outlet_id', $outletId)
            ->where('positions.slug', 'produksi')
            ->exists();
    }

    public function assignPosition(int $positionId, bool $isActive = true): void
    {
        $this->validatePositionOwnership($positionId);
        $this->positions()->attach($positionId, [
            'is_active'  => $isActive,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function assignPositions(array $positionIds, bool $isActive = true): void
    {
        $syncData = [];
        foreach ($positionIds as $positionId) {
            $this->validatePositionOwnership($positionId);
            $syncData[$positionId] = [
                'is_active'  => $isActive,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        $this->positions()->syncWithoutDetaching($syncData);
    }

    public function syncPositions(array $positionIds, bool $isActive = true): array
    {
        $syncData = [];
        foreach ($positionIds as $positionId) {
            $this->validatePositionOwnership($positionId);
            $syncData[$positionId] = [
                'is_active'  => $isActive,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        return $this->positions()->sync($syncData);
    }

    public function detachPosition(int $positionId): int
    {
        return $this->positions()->updateExistingPivot($positionId, [
            'deleted_at' => now(),
        ]);
    }

    public function restorePosition(int $positionId): int
    {
        return $this->allPositions()->updateExistingPivot($positionId, [
            'deleted_at' => null,
        ]);
    }

    public function assignProcess(int $processId, array $options = []): EmployeeProcess
    {
        if (!$this->isEligibleForProduction($this->outlet_id)) {
            throw new \Exception('Employee tidak memiliki posisi produksi aktif.');
        }

        return EmployeeProcess::assignToEmployee($this->id, $processId, $options);
    }

    public function assignProcesses(array $processIds, array $options = []): int
    {
        if (!$this->isEligibleForProduction($this->outlet_id)) {
            throw new \Exception('Employee tidak memiliki posisi produksi aktif.');
        }

        return EmployeeProcess::bulkAssignToEmployee($this->id, $processIds, $options);
    }

    public function removeProcess(int $processId): bool
    {
        return EmployeeProcess::removeFromEmployee($this->id, $processId);
    }

    public function getAssignedProcesses(bool $activeOnly = true): \Illuminate\Database\Eloquent\Collection
    {
        return EmployeeProcess::getEmployeeProcesses($this->id, $activeOnly);
    }

    public function setProcessCommission(int $processId, array $commissionData): EmployeeProcessCommission
    {
        if (!$this->isEligibleForProduction($this->outlet_id)) {
            throw new \Exception('Employee tidak memiliki posisi produksi aktif.');
        }

        if (!$this->canWorkOnProcess($processId)) {
            throw new \Exception("Employee must be assigned to process before setting commission.");
        }

        $employeeProcess = EmployeeProcess::byEmployeeId($this->id)
            ->byProcessId($processId)
            ->first();

        if (!$employeeProcess) {
            throw new \Exception("EmployeeProcess record not found.");
        }

        return EmployeeProcessCommission::updateOrCreate(
            ['employee_process_id' => $employeeProcess->id],
            array_merge([
                'is_active'      => true,
                'effective_date' => now(),
            ], $commissionData)
        );
    }

    public function removeProcessCommission(int $processId): bool
    {
        $employeeProcess = EmployeeProcess::byEmployeeId($this->id)
            ->byProcessId($processId)
            ->first();

        if (!$employeeProcess || !$employeeProcess->commission) {
            return false;
        }

        return $employeeProcess->commission->delete();
    }

    public function hasProcessCommission(int $processId): bool
    {
        $employeeProcess = EmployeeProcess::byEmployeeId($this->id)
            ->byProcessId($processId)
            ->first();

        return $employeeProcess
            && $employeeProcess->commission
            && $employeeProcess->commission->is_active;
    }

    public function getProcessCommissionAmount(int $processId): ?float
    {
        $employeeProcess = EmployeeProcess::byEmployeeId($this->id)
            ->byProcessId($processId)
            ->first();

        if (!$employeeProcess || !$employeeProcess->commission || !$employeeProcess->commission->is_active) {
            return null;
        }

        return $employeeProcess->commission->commission_value;
    }

    /*
    |--------------------------------------------------------------------------
    | Multi-Outlet RBAC Helper Methods
    |--------------------------------------------------------------------------
    */

    public function getAccessibleOutletIds(): array
    {
        return $this->positions()
            ->where('employee_positions.is_active', true)
            ->where('positions.is_active', true)
            ->pluck('positions.outlet_id')
            ->unique()
            ->values()
            ->toArray();
    }

    public function hasPermissionOnOutlet(string $permission, int $outletId): bool
    {
        if (!$this->is_active) {
            return false;
        }

        return $this->positions()
            ->where('employee_positions.is_active', true)
            ->where('positions.is_active', true)
            ->where('positions.outlet_id', $outletId)
            ->whereHas('permissions', function (Builder $q) use ($permission) {
                $q->where('permission_key', $permission);
            })
            ->exists();
    }

    public function getPermissionsForOutlet(int $outletId): array
    {
        if (!$this->is_active) {
            return [];
        }

        return PositionPermission::whereIn('position_id', function ($query) use ($outletId) {
            $query->select('position_id')
                ->from('employee_positions')
                ->join('positions', 'positions.id', '=', 'employee_positions.position_id')
                ->where('employee_positions.employee_id', $this->id)
                ->where('employee_positions.is_active', true)
                ->where('positions.is_active', true)
                ->where('positions.outlet_id', $outletId)
                ->whereNull('employee_positions.deleted_at');
        })
            ->pluck('permission_key')
            ->unique()
            ->toArray();
    }

    public function getOutletPositionMap(): \Illuminate\Support\Collection
    {
        return $this->positions()
            ->where('employee_positions.is_active', true)
            ->where('positions.is_active', true)
            ->with(['permissions', 'outlet'])
            ->get()
            ->groupBy('outlet_id');
    }

    public function isKurirOnOutlet(int $outletId): bool
    {
        return $this->positions()
            ->where('employee_positions.is_active', true)
            ->where('positions.is_active', true)
            ->where('positions.outlet_id', $outletId)
            ->where('positions.slug', 'kurir')
            ->exists();
    }

    public function hasCourierPermissionOnOutlet(int $outletId): bool
    {
        return $this->positions()
            ->where('employee_positions.is_active', true)
            ->where('positions.is_active', true)
            ->where('positions.outlet_id', $outletId)
            ->whereHas('permissions', function (Builder $q) {
                $q->whereIn('permission_key', [
                    \App\Enums\Permission::CourierView->value,
                    \App\Enums\Permission::CourierManage->value,
                ]);
            })
            ->exists();
    }

    private function validatePositionOwnership(int $positionId): void
    {
        $position = Position::with('permissions')->find($positionId);

        if (!$position) {
            throw new \InvalidArgumentException("Position ID {$positionId} not found.");
        }

        if (!$position->hasCourierPermission() && $position->outlet_id !== $this->outlet_id) {
            throw new \InvalidArgumentException(
                "Position tanpa permission kurir hanya boleh diberikan pada outlet utama employee."
            );
        }

        if ($position->hasCourierPermission() && $position->outlet_id !== $this->outlet_id) {
            $ownerId = Outlet::where('id', $this->outlet_id)->value('owner_id');

            if ($ownerId === null) {
                throw new \InvalidArgumentException('Employee outlet not found.');
            }

            $ownerOutletIds = Outlet::where('owner_id', $ownerId)->pluck('id')->toArray();

            if (!in_array($position->outlet_id, $ownerOutletIds, true)) {
                throw new \InvalidArgumentException(
                    "Position kurir harus berasal dari outlet milik owner yang sama."
                );
            }
        }
    }
}
