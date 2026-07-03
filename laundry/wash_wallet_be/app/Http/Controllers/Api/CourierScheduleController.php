<?php

namespace App\Http\Controllers\Api;

use App\Helpers\PaginationHelper;
use App\Http\Controllers\Controller;
use App\Http\Resources\CourierSchedule\CourierScheduleResource;
use App\Models\CourierSchedule;
use App\Services\CourierScheduleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Throwable;
use Carbon\Carbon;
use App\Services\CourierScheduleAvailabilityService;
use App\Http\Requests\Outlet\CourierSchedule\StoreCourierScheduleRequest;
use App\Http\Requests\Outlet\CourierSchedule\UpdateCourierScheduleRequest;

use Illuminate\Routing\Attributes\Controllers\Middleware;

#[Middleware('auth:sanctum,customer_sanctum', only: ['index', 'show'])]
#[Middleware('auth:sanctum', except: ['index', 'show'])]
class CourierScheduleController extends Controller
{
    public function __construct(
        private readonly CourierScheduleService $courierScheduleService
    ) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $this->getFilters($request);
            $availabilityInfo = null;

            if (empty($filters['date']) && !empty($filters['outletId']) && !empty($filters['type'])) {
                $availabilityService = app(CourierScheduleAvailabilityService::class);
                $availabilityInfo = $availabilityService->getDefaultDate(
                    $filters['outletId'], 
                    $filters['type']
                );
                
                if ($availabilityInfo['defaultDate']) {
                    $filters['date'] = $availabilityInfo['defaultDate'];
                    $filters['dayOfWeek'] = strtolower(Carbon::parse($filters['date'])->format('l'));
                } else {
                    $filters['dayOfWeek'] = 'none'; // Force empty list
                }
            } elseif (!empty($filters['date'])) {
                $filters['dayOfWeek'] = strtolower(Carbon::parse($filters['date'])->format('l'));
            }

            // We ensure we pass date down to resource using request
            if (!empty($filters['date'])) {
                $request->merge(['date' => $filters['date']]);
            }

            $schedules = $this->courierScheduleService->getAll(
                filters: $filters,
                page: $filters['page'],
                perPage: $filters['perPage'],
                relations: ['outlet']
            );

            Log::info('[CourierScheduleController] Retrieved courier schedules', [
                'user_id' => Auth::id(),
                'filters' => $filters,
                'schedules_count' => $schedules->total(),
                'page' => $filters['page'],
                'per_page' => $filters['perPage'],
            ]);

            $meta = PaginationHelper::format($schedules, $request);
            if ($availabilityInfo) {
                $meta['defaultDate'] = $availabilityInfo['defaultDate'];
                $meta['defaultDayLabel'] = $availabilityInfo['defaultDayLabel'];
                $meta['reason'] = $availabilityInfo['reason'];
            }

            return $this->successResponse(
                CourierScheduleResource::collection($schedules->items())->resolve(),
                'Courier schedules retrieved successfully',
                200,
                $meta
            );
        } catch (Throwable $e) {
            Log::error('[CourierScheduleController] Failed to retrieve courier schedules', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return $this->errorResponse('Failed to retrieve courier schedules', 500);
        }
    }

    public function show(CourierSchedule $schedule): JsonResponse
    {
        try {
            $outletId = Auth::user()->outlet_id;

            if ((int) $schedule->outlet_id !== (int) $outletId) {
                return $this->errorResponse('Unauthorized', 403);
            }

            return $this->successResponse(
                new CourierScheduleResource($schedule),
                'Courier schedule retrieved successfully'
            );
        } catch (Throwable $e) {
            Log::error('[CourierScheduleController] Failed to retrieve courier schedule', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'schedule_id' => $schedule->id,
            ]);

            return $this->errorResponse('Failed to retrieve courier schedule', 500);
        }
    }

    public function store(StoreCourierScheduleRequest $request): JsonResponse
    {
        try {
            $outletId = Auth::user()->outlet_id;
            $data = $request->validated();
            $data['type'] = $data['type'] ?? 'pickup';

            $hasOverlap = $this->courierScheduleService->checkOverlap(
                $outletId,
                $data['dayOfWeek'],
                $data['startTime'],
                $data['endTime']
            );

            if ($hasOverlap) {
                return $this->errorResponse('Schedule overlaps with existing schedule', 422);
            }

            /** @var \App\Services\OutletService $outletService */
            $outletService = app(\App\Services\OutletService::class);
            $schedule = $outletService->storeCourierSchedule($outletId, $data);

            return $this->successResponse(
                new CourierScheduleResource($schedule),
                'Courier schedule created successfully',
                201
            );
        } catch (Throwable $e) {
            Log::error('[CourierScheduleController] Failed to create courier schedule', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    public function update(CourierSchedule $schedule, UpdateCourierScheduleRequest $request): JsonResponse
    {
        try {
            $outletId = Auth::user()->outlet_id;
            if ((int) $schedule->outlet_id !== (int) $outletId) {
                return $this->errorResponse('Unauthorized', 403);
            }

            $data = $request->validated();

            $dayOfWeek = $data['dayOfWeek'] ?? $schedule->day_of_week;
            $startTime = $data['startTime'] ?? $schedule->start_time;
            $endTime = $data['endTime'] ?? $schedule->end_time;

            $hasOverlap = $this->courierScheduleService->checkOverlap(
                $outletId,
                $dayOfWeek,
                $startTime,
                $endTime,
                $schedule->id
            );

            if ($hasOverlap) {
                return $this->errorResponse('Schedule overlaps with existing schedule', 422);
            }

            /** @var \App\Services\OutletService $outletService */
            $outletService = app(\App\Services\OutletService::class);
            $updatedSchedule = $outletService->updateCourierSchedule($outletId, $schedule->id, $data);

            return $this->successResponse(
                new CourierScheduleResource($updatedSchedule),
                'Courier schedule updated successfully'
            );
        } catch (Throwable $e) {
            Log::error('[CourierScheduleController] Failed to update courier schedule', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'schedule_id' => $schedule->id,
            ]);

            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    public function destroy(CourierSchedule $schedule): JsonResponse
    {
        try {
            $outletId = Auth::user()->outlet_id;

            if ((int) $schedule->outlet_id !== (int) $outletId) {
                return $this->errorResponse('Unauthorized', 403);
            }

            $this->courierScheduleService->destroy($schedule->id);

            return $this->successResponse(
                null,
                'Courier schedule deleted successfully'
            );
        } catch (Throwable $e) {
            Log::error('[CourierScheduleController] Failed to delete courier schedule', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'schedule_id' => $schedule->id,
            ]);

            return $this->errorResponse('Failed to delete courier schedule', 500);
        }
    }

    private function getFilters(Request $request): array
    {
        return [
            'search' => (string) $request->input('search', ''),
            'outletId' => $request->has('outletId') && $request->filled('outletId')
                ? (int) $request->input('outletId')
                : null,
            'dayOfWeek' => (string) $request->input('dayOfWeek', ''),
            'type' => (string) $request->input('type', ''),
            'date' => $request->filled('date') ? (string) $request->input('date') : null,
            'sortBy'        => (string) $request->input('sortBy', 'created_at'),
            'sortDirection' => (string) $request->input('sortDirection', 'desc'),
            'page'          => (int) $request->input('page', 1),
            'perPage'       => (int) $request->input('perPage', 15),
        ];
    }
}
