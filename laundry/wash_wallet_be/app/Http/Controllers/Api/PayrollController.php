<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PayrollService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Throwable;

use Illuminate\Routing\Attributes\Controllers\Middleware;

#[Middleware('auth:sanctum')]
class PayrollController extends Controller
{
    public function __construct(
        private readonly PayrollService $payrollService,
    ) {}

    /**
     * Get payroll preview (AJAX endpoint)
     */
    public function preview(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'outletId'   => 'required|integer|exists:outlets,id',
                'employeeId' => 'nullable|integer|exists:employees,id',
                'month'      => 'required|integer|min:1|max:12',
                'year'       => 'required|integer|min:2020|max:2100',
            ]);

            $previewData = $this->payrollService->getPreview(
                outletId: $request->integer('outletId'),
                employeeId: $request->filled('employeeId') ? $request->integer('employeeId') : null,
                month: str_pad((string) $request->integer('month'), 2, '0', STR_PAD_LEFT),
                year: (string) $request->integer('year')
            );

            return $this->successResponse($previewData, 'Success');
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[PayrollController] Failed to get payroll preview', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'payroll_controller_error',
            ]);

            return $this->errorResponse('Gagal memuat preview penggajian', 400, $e);
        }
    }
}
