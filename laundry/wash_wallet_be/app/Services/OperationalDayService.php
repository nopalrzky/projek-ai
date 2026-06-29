<?php

namespace App\Services;

use App\Models\OperationalDay;
use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OperationalDayService extends BaseService
{
    public function __construct(
        protected OperationalDay $operationalDay,
    ) {}

    /*
    |--------------------------------------------------------------------------
    | Read Methods
    |--------------------------------------------------------------------------
    */

    public function getAll(
        array $filters = [],
        ?int $page = null,
        ?int $perPage = null,
        array $relations = []
    ): LengthAwarePaginator|Collection {
        $query = $this->operationalDay->withTrashed();

        $this->applyFilters($query, $filters);

        if (!empty($relations)) {
            $query->with($relations);
        }

        return $this->paginate($query, $perPage, $page);
    }

    public function getById(int $id, array $relations = ['outlet']): OperationalDay
    {
        $query = $this->operationalDay->byId($id);

        if (!empty($relations)) {
            $query->with($relations);
        }

        return $query->firstOrFail();
    }

    /*
    |--------------------------------------------------------------------------
    | Write Methods
    |--------------------------------------------------------------------------
    */

    public function generateDefaults(int $outletId): void
    {
        try {
            $days = array_keys($this->operationalDay::DAYS_OF_WEEK);
            $now  = now();

            $operationalDaysData = [];
            foreach ($days as $day) {
                $operationalDaysData[] = [
                    'outlet_id'   => $outletId,
                    'day_of_week' => $day,
                    'open_time'   => null,
                    'close_time'  => null,
                    'is_open'     => false,
                    'created_at'  => $now,
                    'updated_at'  => $now,
                ];
            }

            $this->operationalDay->insert($operationalDaysData);

            Log::info('Default operational days generated', [
                'outlet_id' => $outletId,
                'count'     => count($operationalDaysData),
                'type'      => 'operational_day_generation',
            ]);
        } catch (Exception $e) {
            Log::error('Failed to generate operational days', [
                'outlet_id' => $outletId,
                'error'     => $e->getMessage(),
                'type'      => 'operational_day_service_error',
            ]);
            throw $e;
        }
    }

    public function store(array $data): OperationalDay
    {
        return DB::transaction(function () use ($data) {
            try {
                $operationalDay = $this->operationalDay->create([
                    'outlet_id'   => $data['outletId'],
                    'day_of_week' => strtolower($data['dayOfWeek']),
                    'is_open'     => $data['isOpen'] ?? true,
                    'open_time'   => $data['openTime'] ?? null,
                    'close_time'  => $data['closeTime'] ?? null,
                    'is_active'   => $data['isActive'] ?? true,
                    'notes'       => $data['notes'] ?? null,
                ]);

                Log::info('Operational day created successfully', [
                    'operational_day_id' => $operationalDay->id,
                    'outlet_id'          => $data['outletId'],
                    'day_of_week'        => $data['dayOfWeek'],
                ]);

                return $operationalDay->fresh();
            } catch (Exception $e) {
                Log::error('Failed to create operational day', [
                    'outlet_id'   => $data['outletId'] ?? null,
                    'day_of_week' => $data['dayOfWeek'] ?? null,
                    'error'       => $e->getMessage(),
                ]);
                throw $e;
            }
        });
    }

    public function update(int $id, array $data): OperationalDay
    {
        return DB::transaction(function () use ($id, $data) {
            try {
                if ($id === 0 || $id < 1) {
                    $outletId   = $data['outletId'] ?? null;
                    $dayOfWeek  = strtolower($data['dayOfWeek'] ?? '');

                    if (!$outletId || !$dayOfWeek) {
                        throw new Exception('Outlet ID and Day of Week are required');
                    }

                    $operationalDay = $this->operationalDay
                        ->byOutletId($outletId)
                        ->byDay($dayOfWeek)
                        ->first();

                    if (!$operationalDay) {
                        $operationalDay = $this->operationalDay->create([
                            'outlet_id'   => $outletId,
                            'day_of_week' => $dayOfWeek,
                            'is_open'     => $data['isOpen'] ?? false,
                            'open_time'   => $data['openTime'] ?? null,
                            'close_time'  => $data['closeTime'] ?? null,
                            'is_active'   => $data['isActive'] ?? true,
                            'notes'       => $data['notes'] ?? null,
                        ]);

                        Log::info('Operational day created (via update)', [
                            'operational_day_id' => $operationalDay->id,
                            'outlet_id'          => $outletId,
                            'day_of_week'        => $dayOfWeek,
                        ]);

                        return $operationalDay->fresh();
                    }
                } else {
                    $operationalDay = $this->operationalDay->byId($id)->firstOrFail();
                }

                if (isset($data['dayOfWeek'])) $operationalDay->day_of_week = strtolower($data['dayOfWeek']);
                if (isset($data['isOpen'])) {
                    $operationalDay->is_open = $data['isOpen'];
                    if (!$data['isOpen']) {
                        $operationalDay->courierSchedules()->update(['is_active' => false]);
                    }
                }
                if (isset($data['openTime']))  $operationalDay->open_time   = $data['openTime'];
                if (isset($data['closeTime'])) $operationalDay->close_time  = $data['closeTime'];
                if (isset($data['isActive']))  $operationalDay->is_active   = $data['isActive'];
                if (isset($data['notes']))     $operationalDay->notes       = $data['notes'];

                $operationalDay->save();

                Log::info('Operational day updated successfully', [
                    'operational_day_id' => $operationalDay->id,
                    'outlet_id'          => $operationalDay->outlet_id,
                    'day_of_week'        => $operationalDay->day_of_week,
                ]);

                return $operationalDay->fresh();
            } catch (Exception $e) {
                Log::error('Failed to update operational day', [
                    'operational_day_id' => $id,
                    'outlet_id'          => $data['outletId'] ?? null,
                    'error'              => $e->getMessage(),
                ]);
                throw $e;
            }
        });
    }

    public function updateOrCreate(int $outletId, string $dayOfWeek, array $data): OperationalDay
    {
        return DB::transaction(function () use ($outletId, $dayOfWeek, $data) {
            try {
                $operationalDay = $this->operationalDay->updateOrCreate(
                    ['outlet_id' => $outletId, 'day_of_week' => strtolower($dayOfWeek)],
                    [
                        'is_open'    => $data['isOpen'] ?? false,
                        'open_time'  => $data['openTime'] ?? null,
                        'close_time' => $data['closeTime'] ?? null,
                        'is_active'  => $data['isActive'] ?? true,
                        'notes'      => $data['notes'] ?? null,
                    ]
                );

                if (!$operationalDay->is_open) {
                    $operationalDay->courierSchedules()->update(['is_active' => false]);
                }

                Log::info('Operational day updated or created successfully', [
                    'operational_day_id' => $operationalDay->id,
                    'outlet_id'          => $outletId,
                    'day_of_week'        => $dayOfWeek,
                    'action'             => $operationalDay->wasRecentlyCreated ? 'created' : 'updated',
                ]);

                return $operationalDay->fresh();
            } catch (Exception $e) {
                Log::error('Failed to update or create operational day', [
                    'outlet_id'   => $outletId,
                    'day_of_week' => $dayOfWeek,
                    'error'       => $e->getMessage(),
                ]);
                throw $e;
            }
        });
    }

    public function destroy(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            try {
                $operationalDay = $this->operationalDay->byId($id)->firstOrFail();
                $deleted        = $operationalDay->delete();

                if ($deleted) {
                    Log::info('Operational day deleted successfully', [
                        'operational_day_id' => $id,
                    ]);
                }

                return $deleted;
            } catch (Exception $e) {
                Log::error('Failed to delete operational day', [
                    'operational_day_id' => $id,
                    'error'              => $e->getMessage(),
                ]);
                throw $e;
            }
        });
    }

    public function restore(int $id): OperationalDay
    {
        return DB::transaction(function () use ($id) {
            try {
                $operationalDay = $this->operationalDay->onlyTrashed()->findOrFail($id);
                $operationalDay->restore();

                Log::info('Operational day restored successfully', [
                    'operational_day_id' => $id,
                    'outlet_id'          => $operationalDay->outlet_id,
                    'day_of_week'        => $operationalDay->day_of_week,
                ]);

                return $operationalDay->fresh();
            } catch (Exception $e) {
                Log::error('Failed to restore operational day', [
                    'operational_day_id' => $id,
                    'error'              => $e->getMessage(),
                ]);
                throw $e;
            }
        });
    }

    public function forceDestroy(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            try {
                $deleted = $this->operationalDay->onlyTrashed()->findOrFail($id)->forceDelete();

                if ($deleted) {
                    Log::info('Operational day permanently deleted', [
                        'operational_day_id' => $id,
                    ]);
                }

                return $deleted;
            } catch (Exception $e) {
                Log::error('Failed to permanently delete operational day', [
                    'operational_day_id' => $id,
                    'error'              => $e->getMessage(),
                ]);
                throw $e;
            }
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Private — Filters
    |--------------------------------------------------------------------------
    */

    protected function applyFilters(Builder $query, array $filters): void
    {
        if (!empty($filters['outletId'])) {
            $query->byOutletId($filters['outletId']);
        }

        if (!empty($filters['search'])) {
            $query->search($filters['search']);
        }

        if (isset($filters['isActive'])) {
            $filters['isActive'] ? $query->active() : $query->notActive();
        }

        if (isset($filters['isOpen'])) {
            $filters['isOpen'] ? $query->isOpen() : $query->notOpen();
        }

        if (!empty($filters['dayOfWeek'])) {
            $query->dayOfWeek($filters['dayOfWeek']);
        }

        if (!empty($filters['sortBy'])) {
            $query->orderBy($filters['sortBy'], $filters['sortDirection'] ?? 'asc');
        } else {
            $query->orderByRaw("
                CASE day_of_week
                    WHEN 'monday'    THEN 1
                    WHEN 'tuesday'   THEN 2
                    WHEN 'wednesday' THEN 3
                    WHEN 'thursday'  THEN 4
                    WHEN 'friday'    THEN 5
                    WHEN 'saturday'  THEN 6
                    WHEN 'sunday'    THEN 7
                END
            ");
        }

        if (!empty($filters['dateFrom'])) {
            $dateTo = $filters['dateTo'] ?? now()->toDateString();
            $query->whereBetween('created_at', [$filters['dateFrom'], $dateTo]);
        }
    }
}
