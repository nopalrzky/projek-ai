<?php

namespace App\Services;

use App\Models\CourierSchedule;
use Carbon\Carbon;
use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CourierScheduleService extends BaseService
{
  public function __construct(
    protected CourierSchedule $courierSchedule,
  ) {}

  /*
    |--------------------------------------------------------------------------
    | Read Methods
    |--------------------------------------------------------------------------
    */

  public function getAll(
    ?array $filters = [],
    ?int $page = null,
    ?int $perPage = null,
    array $relations = []
  ): LengthAwarePaginator | Collection {
    try {
      $query = $this->courierSchedule->query();

      $this->applyFilters($query, $filters);

      if (!empty($relations)) {
        $query->with($relations);
      }

      return $this->paginate($query, $perPage, $page);
    } catch (Exception $e) {
      Log::error('Failed to get courier schedules', [
        'filters' => $filters,
        'error' => $e->getMessage(),
        'user_id' => Auth::id(),
        'type' => 'courier_schedule_service_error',
      ]);
      throw $e;
    }
  }

  public function getById(int $id, array $relations = ['outlet']): CourierSchedule
  {
    try {
      $query = $this->courierSchedule->query();

      if (!empty($relations)) {
        $query->with($relations);
      }

      return $query->whereKey($id)->firstOrFail();
    } catch (Exception $e) {
      Log::error('Failed to get courier schedule by ID', [
        'id' => $id,
        'error' => $e->getMessage(),
        'user_id' => Auth::id(),
        'type' => 'courier_schedule_service_error',
      ]);
      throw $e;
    }
  }


  /*
    |--------------------------------------------------------------------------
    | Write Methods
    |--------------------------------------------------------------------------
    */

  public function store(array $data): CourierSchedule
  {
    return DB::transaction(function () use ($data) {
      try {
        return $this->courierSchedule->create($data);
      } catch (Exception $e) {
        Log::error('Failed to create courier schedule', [
          'data' => $data,
          'error' => $e->getMessage(),
          'user_id' => Auth::id(),
          'type' => 'courier_schedule_service_error',
        ]);
        throw $e;
      }
    });
  }

  public function update(int $id, array $data): CourierSchedule
  {
    return DB::transaction(function () use ($id, $data) {
      try {
        $schedule = $this->courierSchedule->findOrFail($id);
        $schedule->update($data);
        return $schedule->fresh();
      } catch (Exception $e) {
        Log::error('Failed to update courier schedule', [
          'id' => $id,
          'data' => $data,
          'error' => $e->getMessage(),
          'user_id' => Auth::id(),
          'type' => 'courier_schedule_service_error',
        ]);
        throw $e;
      }
    });
  }

  public function destroy(int $id): bool
  {
    return DB::transaction(function () use ($id) {
      try {
        $schedule = $this->courierSchedule->findOrFail($id);
        return $schedule->delete();
      } catch (Exception $e) {
        Log::error('Failed to delete courier schedule', [
          'id' => $id,
          'error' => $e->getMessage(),
          'user_id' => Auth::id(),
          'type' => 'courier_schedule_service_error',
        ]);
        throw $e;
      }
    });
  }

  /*
    |--------------------------------------------------------------------------
    | Business Logic Methods
    |--------------------------------------------------------------------------
    */

  public function checkOverlap(int $outletId, string $dayOfWeek, string $startTime, string $endTime, ?int $excludeId = null): bool
  {
    try {
      $query = $this->courierSchedule->byOutletId($outletId)
        ->byDayOfWeek($dayOfWeek)
        ->active();

      if ($excludeId) {
        $query->where('id', '!=', $excludeId);
      }

      $overlaps = $query->where(function ($q) use ($startTime, $endTime) {
        $q->where(function ($subQ) use ($startTime, $endTime) {
          $subQ->where('start_time', '<=', $startTime)
            ->where('end_time', '>', $startTime);
        })->orWhere(function ($subQ) use ($startTime, $endTime) {
          $subQ->where('start_time', '<', $endTime)
            ->where('end_time', '>=', $endTime);
        })->orWhere(function ($subQ) use ($startTime, $endTime) {
          $subQ->where('start_time', '>=', $startTime)
            ->where('end_time', '<=', $endTime);
        });
      })->exists();

      return $overlaps;
    } catch (Exception $e) {
      Log::error('Failed to check overlap', [
        'outlet_id' => $outletId,
        'day_of_week' => $dayOfWeek,
        'start_time' => $startTime,
        'end_time' => $endTime,
        'exclude_id' => $excludeId,
        'error' => $e->getMessage(),
        'user_id' => Auth::id(),
        'type' => 'courier_schedule_service_error',
      ]);
      throw $e;
    }
  }

  public function validateScheduleTime(string $startTime, string $endTime): bool
  {
    try {
      $start = Carbon::createFromFormat('H:i', $startTime);
      $end = Carbon::createFromFormat('H:i', $endTime);

      return $end->greaterThan($start);
    } catch (Exception $e) {
      Log::error('Failed to validate schedule time', [
        'start_time' => $startTime,
        'end_time' => $endTime,
        'error' => $e->getMessage(),
        'user_id' => Auth::id(),
        'type' => 'courier_schedule_service_error',
      ]);
      return false;
    }
  }

  /*
    |--------------------------------------------------------------------------
    | Protected Methods
    |--------------------------------------------------------------------------
    */

  protected function applyFilters(Builder $query, array $filters = []): void
  {
    if (isset($filters['outletId'])) {
      $query->byOutletId($filters['outletId']);
    }

    if (!empty($filters['dayOfWeek'])) {
      $query->byDayOfWeek($filters['dayOfWeek']);
    }

    if (!empty($filters['type'])) {
      $query->byType($filters['type']);
    }

    if (isset($filters['orderBy'])) {
      $direction = $filters['orderDirection'] ?? 'desc';
      $this->applySort(
        $query,
        $filters['orderBy'],
        $direction,
        ['start_time', 'end_time', 'day_of_week', 'created_at'],
        [],
        'created_at'
      );
    }
  }
}
