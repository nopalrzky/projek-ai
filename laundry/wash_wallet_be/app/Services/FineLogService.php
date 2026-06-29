<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\FineLog;
use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class FineLogService extends BaseService
{
    public function __construct(
        private FineLog $fineLog,
        private AccountingService $accountingService,
    ) {}

    public function getAll(
        array $filters = [],
        ?int $page = null,
        ?int $perPage = null,
        array $relations = ['employee', 'fine', 'outlet', 'payrollItem', 'payrollItem.payroll']
    ): LengthAwarePaginator|Collection {
        try {
            $query = $this->fineLog->query();

            $this->applyTenantScope($query, 'byOwnerId', 'byOutletId');
            $this->applyFineLogFilters($query, $filters);

            if (! empty($relations)) {
                $query->with($relations);
            }

            return $this->paginate($query, $perPage, $page);
        } catch (Exception $e) {
            Log::error('Failed to get fine logs', [
                'filters' => $filters,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => Auth::id(),
                'type' => 'fine_log_service_error',
            ]);
            throw new Exception('Failed to fetch fine logs: ' . $e->getMessage());
        }
    }

    public function getById(
        int $id,
        array $relations = ['employee', 'fine', 'outlet', 'payrollItem', 'payrollItem.payroll']
    ): FineLog {
        try {
            $query = $this->fineLog->byId($id);

            if (! empty($relations)) {
                $query->with($relations);
            }

            return $query->firstOrFail();
        } catch (Exception $e) {
            Log::error('Failed to get fine log by ID', [
                'fine_log_id' => $id,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'fine_log_service_error',
            ]);
            throw new Exception('Fine log not found');
        }
    }

    public function store(array $data, ?UploadedFile $attachment = null): FineLog
    {
        return DB::transaction(function () use ($data, $attachment) {
            try {
                $attachmentPath = null;
                if ($attachment) {
                    $attachmentPath = $this->uploadAttachment($attachment, $data['employeeId']);
                }

                $fineLog = $this->fineLog->create([
                    'employee_id' => $data['employeeId'],
                    'fine_id' => $data['fineId'],
                    'date' => $data['date'],
                    'amount' => $data['amount'],
                    'reason' => $data['reason'] ?? null,
                    'attachment' => $attachmentPath,
                ]);

                $this->accountingService->recordFineLog($fineLog->fresh(['employee', 'fine']));

                DB::commit();

                Log::info('Fine log created successfully with journal entry', [
                    'fine_log_id' => $fineLog->id,
                    'employee_id' => $fineLog->employee_id,
                    'fine_id' => $fineLog->fine_id,
                    'outlet_id' => $fineLog->outlet_id,
                    'amount' => $fineLog->amount,
                    'date' => $fineLog->date,
                    'has_attachment' => ! is_null($attachmentPath),
                    'user_id' => Auth::id(),
                    'type' => 'fine_log_action',
                ]);

                return $fineLog->fresh(['employee', 'fine', 'outlet', 'payrollItem']);
            } catch (Exception $e) {
                DB::rollBack();

                if (isset($attachmentPath)) {
                    Storage::disk('public')->delete($attachmentPath);
                }

                Log::error('Failed to create fine log', [
                    'data' => $data,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'user_id' => Auth::id(),
                    'type' => 'fine_log_service_error',
                ]);
                throw new Exception('Failed to record fine: ' . $e->getMessage());
            }
        });
    }

    public function update(int $id, array $data, ?UploadedFile $attachment = null): FineLog
    {
        return DB::transaction(function () use ($id, $data, $attachment) {
            try {
                $fineLog = $this->fineLog->byId($id)->firstOrFail();

                if ($fineLog->payroll_item_id !== null) {
                    throw new Exception('Cannot update fine that has been paid');
                }

                $oldAmount = $fineLog->amount;
                $oldDate = $fineLog->date;
                $updateData = [];

                if ($attachment) {
                    if ($fineLog->attachment) {
                        Storage::disk('public')->delete($fineLog->attachment);
                    }

                    $updateData['attachment'] = $this->uploadAttachment($attachment, $fineLog->employee_id);
                }

                if (isset($data['fineId'])) {
                    $updateData['fine_id'] = $data['fineId'];
                }

                if (isset($data['date'])) {
                    $updateData['date'] = $data['date'];
                }

                if (isset($data['amount'])) {
                    $updateData['amount'] = $data['amount'];
                }

                if (isset($data['reason'])) {
                    $updateData['reason'] = $data['reason'];
                }

                if (! empty($updateData)) {
                    $fineLog->update($updateData);
                }

                $amountChanged = isset($data['amount']) && $oldAmount != $data['amount'];
                $dateChanged = isset($data['date']) && $oldDate != $data['date'];

                if ($amountChanged || $dateChanged) {
                    $this->accountingService->updateJournalEntry(FineLog::class, $fineLog->id, function () use ($fineLog) {
                        $this->accountingService->recordFineLog($fineLog->fresh(['employee', 'fine']));
                    });
                }

                DB::commit();

                Log::info('Fine log updated successfully', [
                    'fine_log_id' => $fineLog->id,
                    'updated_fields' => array_keys($updateData),
                    'amount_changed' => $amountChanged,
                    'date_changed' => $dateChanged,
                    'journal_updated' => $amountChanged || $dateChanged,
                    'user_id' => Auth::id(),
                    'type' => 'fine_log_action',
                ]);

                return $fineLog->fresh(['employee', 'fine', 'outlet', 'payrollItem', 'payrollItem.payroll']);
            } catch (Exception $e) {
                DB::rollBack();

                if (isset($updateData['attachment'])) {
                    Storage::disk('public')->delete($updateData['attachment']);
                }

                Log::error('Failed to update fine log', [
                    'fine_log_id' => $id,
                    'data' => $data,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'user_id' => Auth::id(),
                    'type' => 'fine_log_service_error',
                ]);
                throw new Exception('Failed to update fine log: ' . $e->getMessage());
            }
        });
    }

    public function destroy(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            try {
                $fineLog = $this->fineLog->byId($id)->firstOrFail();

                if ($fineLog->payroll_item_id !== null) {
                    throw new Exception('Cannot delete fine that has been paid');
                }

                $fineLogInfo = [
                    'id' => $fineLog->id,
                    'employee_id' => $fineLog->employee_id,
                    'fine_id' => $fineLog->fine_id,
                    'amount' => $fineLog->amount,
                    'date' => $fineLog->date,
                ];

                if ($fineLog->attachment) {
                    Storage::disk('public')->delete($fineLog->attachment);
                }

                $this->accountingService->reverseJournalEntry(FineLog::class, $fineLog->id);

                $deleted = $fineLog->delete();

                DB::commit();

                if ($deleted) {
                    Log::info('Fine log deleted successfully', array_merge($fineLogInfo, [
                        'user_id' => Auth::id(),
                        'type' => 'fine_log_action',
                    ]));
                }

                return $deleted;
            } catch (Exception $e) {
                DB::rollBack();

                Log::error('Failed to delete fine log', [
                    'fine_log_id' => $id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'user_id' => Auth::id(),
                    'type' => 'fine_log_service_error',
                ]);
                throw new Exception($e->getMessage());
            }
        });
    }

    public function markAsPaid(int $fineLogId, int $payrollId): bool
    {
        return DB::transaction(function () use ($fineLogId, $payrollId) {
            try {
                $fineLog = $this->fineLog->byId($fineLogId)->firstOrFail();

                if ($fineLog->payroll_item_id !== null) {
                    throw new Exception('Fine log is already paid');
                }

                $fineLog->update([
                    'payroll_item_id' => $payrollId,
                ]);

                DB::commit();

                Log::info('Fine log marked as paid', [
                    'fine_log_id' => $fineLogId,
                    'payroll_item_id' => $payrollId,
                    'employee_id' => $fineLog->employee_id,
                    'amount' => $fineLog->amount,
                    'user_id' => Auth::id(),
                    'type' => 'fine_log_action',
                ]);

                return true;
            } catch (Exception $e) {
                DB::rollBack();

                Log::error('Failed to mark fine as paid', [
                    'fine_log_id' => $fineLogId,
                    'payroll_item_id' => $payrollId,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'type' => 'fine_log_service_error',
                ]);
                throw new Exception('Failed to mark fine as paid: ' . $e->getMessage());
            }
        });
    }

    public function cancel(int $id, ?string $reason = null): bool
    {
        return DB::transaction(function () use ($id, $reason) {
            try {
                $fineLog = $this->fineLog->byId($id)->firstOrFail();

                if ($fineLog->payroll_item_id !== null) {
                    throw new Exception('Only unpaid fines can be cancelled');
                }

                $this->accountingService->reverseJournalEntry(FineLog::class, $fineLog->id);

                $fineLog->update([
                    'reason' => $reason ? ($fineLog->reason . "\n\nCancellation reason: " . $reason) : $fineLog->reason,
                ]);
                $fineLog->delete();

                DB::commit();

                Log::info('Fine log cancelled', [
                    'fine_log_id' => $id,
                    'employee_id' => $fineLog->employee_id,
                    'amount' => $fineLog->amount,
                    'cancellation_reason' => $reason,
                    'user_id' => Auth::id(),
                    'type' => 'fine_log_action',
                ]);

                return true;
            } catch (Exception $e) {
                DB::rollBack();

                Log::error('Failed to cancel fine log', [
                    'fine_log_id' => $id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'type' => 'fine_log_service_error',
                ]);
                throw new Exception('Failed to cancel fine: ' . $e->getMessage());
            }
        });
    }

    public function getUnpaidFines(int $employeeId): Collection
    {
        try {
            return $this->fineLog
                ->byEmployeeId($employeeId)
                ->unpaid()
                ->with(['fine', 'outlet'])
                ->orderBy('date', 'asc')
                ->get();
        } catch (Exception $e) {
            Log::error('Failed to get unpaid fines', [
                'employee_id' => $employeeId,
                'error' => $e->getMessage(),
                'type' => 'fine_log_service_error',
            ]);
            throw new Exception('Failed to fetch unpaid fines: ' . $e->getMessage());
        }
    }

    public function getTotalUnpaidAmount(int $employeeId): float
    {
        try {
            return (float) $this->fineLog
                ->byEmployeeId($employeeId)
                ->unpaid()
                ->sum('amount');
        } catch (Exception $e) {
            Log::error('Failed to calculate total unpaid fines', [
                'employee_id' => $employeeId,
                'error' => $e->getMessage(),
                'type' => 'fine_log_service_error',
            ]);

            return 0.0;
        }
    }

    private function uploadAttachment(UploadedFile $file, int $employeeId): string
    {
        try {
            $filename = sprintf(
                'fine_%d_%s.%s',
                $employeeId,
                uniqid(),
                $file->getClientOriginalExtension()
            );

            $path = $file->storeAs('fines', $filename, 'public');

            Log::info('Fine attachment uploaded', [
                'employee_id' => $employeeId,
                'filename' => $filename,
                'size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'type' => 'fine_log_file',
            ]);

            return $path;
        } catch (Exception $e) {
            Log::error('Failed to upload fine attachment', [
                'employee_id' => $employeeId,
                'error' => $e->getMessage(),
                'type' => 'fine_log_service_error',
            ]);
            throw new Exception('Failed to upload attachment: ' . $e->getMessage());
        }
    }

    private function applyFineLogFilters(Builder $query, array $filters): void
    {
        $sortBy = ! empty($filters['sortBy']) ? (string) $filters['sortBy'] : 'date';
        $sortDirection = ! empty($filters['sortDirection']) ? (string) $filters['sortDirection'] : 'desc';

        if (! empty($filters['search'])) {
            $query->search(trim($filters['search']));
        }

        if (! empty($filters['employeeId'])) {
            $query->byEmployeeId((int) $filters['employeeId']);
        }

        if (! empty($filters['outletId'])) {
            $query->where('outlet_id', (int) $filters['outletId']);
        }

        if (! empty($filters['fineId'])) {
            $query->byFineId((int) $filters['fineId']);
        }


        if (! empty($filters['dateFrom'])) {
            $query->whereDate('date', '>=', $filters['dateFrom']);
        }

        if (! empty($filters['dateTo'])) {
            $query->whereDate('date', '<=', $filters['dateTo']);
        }

        if (! empty($filters['minAmount'])) {
            $query->minAmount((float) $filters['minAmount']);
        }

        if (! empty($filters['maxAmount'])) {
            $query->maxAmount((float) $filters['maxAmount']);
        }

        $validSortColumns = ['date', 'amount', 'created_at', 'updated_at'];
        $sortColumn = in_array($sortBy, $validSortColumns) ? $sortBy : 'date';
        $sortDir = in_array(strtolower($sortDirection), ['asc', 'desc']) ? $sortDirection : 'desc';

        $query->orderBy($sortColumn, $sortDir);
    }
}
