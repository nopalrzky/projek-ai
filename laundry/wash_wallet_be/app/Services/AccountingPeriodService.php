<?php

namespace App\Services;

use App\Models\AccountingPeriod;
use Carbon\Carbon;
use Exception;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AccountingPeriodService extends BaseService
{
    public function __construct(
        protected AccountingPeriod $accountingPeriod
    ) {}

    /**
     * Get all accounting periods with filters
     */
    public function getAll(array $filters = []): Collection
    {
        try {
            $query = $this->accountingPeriod->query();

            if (isset($filters['outletId'])) {
                $query->byOutletId($filters['outletId']);
            }

            if (isset($filters['is_closed'])) {
                $query->where('is_closed', $filters['is_closed']);
            }

            if (!empty($filters['search'])) {
                $query->where(function (Builder $q) use ($filters) {
                    $q->whereDate('start_date', 'like', "%{$filters['search']}%")
                        ->orWhereDate('end_date', 'like', "%{$filters['search']}%");
                });
            }

            return $query->orderByPeriod('desc')->get();
        } catch (Exception $e) {
            Log::error('Failed to get accounting periods', [
                'filters' => $filters,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'accounting_period_service_error',
            ]);
            throw $e;
        }
    }

    /**
     * Get accounting period by ID
     */
    public function getById(int $id): AccountingPeriod
    {
        try {
            return $this->accountingPeriod->query()->findOrFail($id);
        } catch (Exception $e) {
            Log::error('Failed to get accounting period by ID', [
                'period_id' => $id,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'accounting_period_service_error',
            ]);
            throw $e;
        }
    }

    /**
     * Create new accounting period
     */
    public function store(array $data): AccountingPeriod
    {
        try {
            $startDate = Carbon::parse($data['start_date']);
            $endDate = Carbon::parse($data['end_date']);

            if ($startDate->greaterThan($endDate)) {
                throw new Exception('Start date must be before or equal to end date');
            }

            // Check for overlaps
            $overlap = $this->accountingPeriod->query()
                ->byOutletId($data['outlet_id'])
                ->byDateRange($startDate, $endDate)
                ->first();

            if ($overlap) {
                throw new Exception('Accounting period overlaps with existing period (' . $overlap->start_date->format('Y-m-d') . ' to ' . $overlap->end_date->format('Y-m-d') . ')');
            }

            $period = $this->accountingPeriod->create([
                'outlet_id' => $data['outlet_id'],
                'start_date' => $startDate,
                'end_date' => $endDate,
                'is_closed' => false,
            ]);

            Log::info('Accounting period created', [
                'period_id' => $period->id,
                'outlet_id' => $data['outlet_id'],
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
                'user_id' => Auth::id(),
                'type' => 'accounting_period_action',
            ]);

            return $period;
        } catch (Exception $e) {
            Log::error('Failed to create accounting period', [
                'data' => $data,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'accounting_period_service_error',
            ]);
            throw $e;
        }
    }

    /**
     * Close accounting period
     */
    public function close(int $id): AccountingPeriod
    {
        return DB::transaction(function () use ($id) {
            try {
                $period = $this->getById($id);

                if ($period->is_closed) {
                    throw new Exception('Accounting period is already closed');
                }

                if (!$period->canBeClosed()) {
                    throw new Exception('Accounting period cannot be closed yet. End date hasn\'t been reached.');
                }

                $period->update([
                    'is_closed' => true,
                    'closed_at' => now(),
                    'closed_by' => Auth::id(),
                ]);

                Log::info('Accounting period closed successfully', [
                    'period_id' => $id,
                    'outlet_id' => $period->outlet_id,
                    'closed_by' => Auth::id(),
                    'type' => 'accounting_period_action',
                ]);

                return $period;
            } catch (Exception $e) {
                Log::error('Failed to close accounting period', [
                    'period_id' => $id,
                    'error' => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type' => 'accounting_period_service_error',
                ]);
                throw $e;
            }
        });
    }

    /**
     * Reopen accounting period
     */
    public function reopen(int $id): AccountingPeriod
    {
        return DB::transaction(function () use ($id) {
            try {
                $period = $this->getById($id);

                if (!$period->is_closed) {
                    throw new Exception('Accounting period is already open');
                }

                $period->update([
                    'is_closed' => false,
                    'closed_at' => null,
                    'closed_by' => null,
                ]);

                Log::info('Accounting period reopened successfully', [
                    'period_id' => $id,
                    'outlet_id' => $period->outlet_id,
                    'reopened_by' => Auth::id(),
                    'type' => 'accounting_period_action',
                ]);

                return $period;
            } catch (Exception $e) {
                Log::error('Failed to reopen accounting period', [
                    'period_id' => $id,
                    'error' => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type' => 'accounting_period_service_error',
                ]);
                throw $e;
            }
        });
    }

    /**
     * Delete accounting period
     */
    public function destroy(int $id): bool
    {
        try {
            $period = $this->getById($id);

            if ($period->is_closed) {
                throw new Exception('Cannot delete a closed accounting period');
            }

            if ($period->journalEntries()->exists()) {
                throw new Exception('Cannot delete accounting period because it has journal entries');
            }

            $deleted = $period->delete();

            if ($deleted) {
                Log::info('Accounting period deleted', [
                    'period_id' => $id,
                    'outlet_id' => $period->outlet_id,
                    'deleted_by' => Auth::id(),
                    'type' => 'accounting_period_action',
                ]);
            }

            return $deleted;
        } catch (Exception $e) {
            Log::error('Failed to delete accounting period', [
                'period_id' => $id,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'accounting_period_service_error',
            ]);
            throw $e;
        }
    }
}
