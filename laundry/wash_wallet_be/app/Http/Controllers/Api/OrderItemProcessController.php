<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderItem\OrderItemResource;
use App\Services\OrderItemService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Throwable;

use Illuminate\Routing\Attributes\Controllers\Middleware;

#[Middleware('auth:sanctum')]
class OrderItemProcessController extends Controller
{
    public function __construct(
        private readonly OrderItemService $orderItemService,
    ) {}

    public function start(Request $request, int $id): JsonResponse
    {
        try {
            $employee = $request->user();

            if (!$employee) {
                return $this->errorResponse('Data tidak ditemukan', 404);
            }

            $result = $this->orderItemService->startOrderItemProcess($id, $employee->id);
            $process = $result['process'];

            return $this->successResponse(
                [
                    'process' => [
                        'id'           => (int) $process->id,
                        'status'       => 'processing',
                        'startedAt'    => $process->started_at?->toISOString(),
                        'employeeId'   => $process->employee_id ? (int) $process->employee_id : null,
                        'employeeName' => $process->employee?->name,
                    ],
                    'orderItem' => (new OrderItemResource($result['orderItem']))->resolve(),
                ],
                'Proses berhasil dimulai'
            );
        } catch (AuthorizationException $e) {
            return $this->errorResponse($e->getMessage(), 403, $e);
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[OrderItemProcessController] Failed to start order item process', [
                'error'                  => $e->getMessage(),
                'user_id'                => Auth::id(),
                'type'                   => 'order_item_process',
                'order_item_process_id'  => $id,
            ]);

            return $this->errorResponse('Gagal memulai proses', 500, $e);
        }
    }

    public function complete(Request $request, int $id): JsonResponse
    {
        try {
            $employee = $request->user();

            if (!$employee) {
                return $this->errorResponse('Data tidak ditemukan', 404);
            }

            $result = $this->orderItemService->completeOrderItemProcess($id, $employee->id);
            $process = $result['process'];

            return $this->successResponse(
                [
                    'process' => [
                        'id'           => (int) $process->id,
                        'status'       => 'done',
                        'completedAt'  => $process->completed_at?->toISOString(),
                        'employeeId'   => $process->employee_id ? (int) $process->employee_id : null,
                        'employeeName' => $process->employee?->name,
                    ],
                    'orderItem' => (new OrderItemResource($result['orderItem']))->resolve(),
                ],
                'Proses berhasil diselesaikan'
            );
        } catch (AuthorizationException $e) {
            return $this->errorResponse($e->getMessage(), 403, $e);
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[OrderItemProcessController] Failed to complete order item process', [
                'error'                 => $e->getMessage(),
                'user_id'               => Auth::id(),
                'type'                  => 'order_item_process',
                'order_item_process_id' => $id,
            ]);

            return $this->errorResponse('Gagal menyelesaikan proses', 500, $e);
        }
    }
}
