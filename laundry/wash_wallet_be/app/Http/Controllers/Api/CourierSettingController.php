<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Courier\CalculateDeliveryFeeRequest;
use App\Http\Resources\CourierSetting\CourierSettingResource;
use App\Services\CourierSettingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Throwable;

use Illuminate\Routing\Attributes\Controllers\Middleware;

#[Middleware('auth:customer_sanctum', only: ['calculateFee', 'show'])]
class CourierSettingController extends Controller
{
    public function __construct(
        private readonly CourierSettingService $courierSettingService
    ) {}

    /**
     * Calculate delivery fee based on coordinates.
     */
    public function calculateFee(
        int $outletId,
        CalculateDeliveryFeeRequest $request
    ): JsonResponse {
        try {
            $result = $this->courierSettingService->calculateDeliveryFee(
                $outletId,
                $request->validated()
            );

            return $this->successResponse(
                $result->toArray(),
                'Delivery fee calculated successfully'
            );
        } catch (Throwable $e) {
            Log::error('[CourierSettingController] Failed to calculate delivery fee', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'data'    => $request->all(),
            ]);

            return $this->errorResponse('Gagal menghitung biaya pengiriman: ' . $e->getMessage(), 500);
        }
    }

    public function show(int $outletId): JsonResponse
    {
        try {
            $setting = $this->courierSettingService->getByOutletId($outletId);

            return $this->successResponse(
                new CourierSettingResource($setting),
                'Courier setting retrieved successfully',
                200
            );
        } catch (Throwable $e) {
            Log::error('[CourierSettingController] Failed to retrieve courier setting for customer', [
                'error'     => $e->getMessage(),
                'outlet_id' => $outletId,
            ]);

            return $this->errorResponse('Gagal mengambil pengaturan kurir', 500);
        }
    }
}
