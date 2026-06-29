<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Helpers\PaginationHelper;
use App\Http\Resources\MembershipPlan\MembershipPlanResource;
use App\Services\MembershipPlanService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Throwable;

use Illuminate\Routing\Attributes\Controllers\Middleware;

#[Middleware('auth:sanctum')]
class MembershipPlanController extends Controller
{
    public function __construct(
        private readonly MembershipPlanService $membershipPlanService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $this->getFilters($request);

            $membershipPlans = $this->membershipPlanService->getAll(
                filters: $filters,
                page: $filters['page'],
                perPage: $filters['perPage'],
                relations: ['outlet']
            );

            return $this->successResponse(
                MembershipPlanResource::collection($membershipPlans)->resolve(),
                'Membership plans retrieved successfully',
                200,
                PaginationHelper::format($membershipPlans, $request)
            );
        } catch (Throwable $e) {
            Log::error('[MembershipPlanController] Failed to retrieve membership plans', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'membership_plan',
            ]);

            return $this->errorResponse('Gagal memuat data paket membership', 500, $e);
        }
    }

    public function getById(int $membershipPlanId): JsonResponse
    {
        try {
            $membershipPlan = $this->membershipPlanService->getById(
                $membershipPlanId,
            );

            return $this->successResponse(
                new MembershipPlanResource($membershipPlan),
                'Membership plan retrieved successfully'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[MembershipPlanController] Failed to retrieve membership plan', [
                'error'              => $e->getMessage(),
                'user_id'            => Auth::id(),
                'type'               => 'membership_plan',
                'membership_plan_id' => $membershipPlanId,
            ]);

            return $this->errorResponse('Gagal memuat data paket membership', 500, $e);
        }
    }

    private function getFilters(Request $request): array
    {
        return [
            'search'                => $request->string('search')->toString(),
            'outletId'              => $request->has('outletId') && $request->filled('outletId')
                ? $request->integer('outletId')
                : null,
            'isActive'              => $request->has('isActive') && $request->filled('isActive')
                ? $request->boolean('isActive')
                : null,
            'minPrice'              => $request->has('minPrice') && $request->filled('minPrice')
                ? $request->float('minPrice')
                : null,
            'maxPrice'              => $request->has('maxPrice') && $request->filled('maxPrice')
                ? $request->float('maxPrice')
                : null,
            'minDurationDays'       => $request->has('minDurationDays') && $request->filled('minDurationDays')
                ? $request->integer('minDurationDays')
                : null,
            'maxDurationDays'       => $request->has('maxDurationDays') && $request->filled('maxDurationDays')
                ? $request->integer('maxDurationDays')
                : null,
            'minDiscountPercentage' => $request->has('minDiscountPercentage') && $request->filled('minDiscountPercentage')
                ? $request->float('minDiscountPercentage')
                : null,
            'maxDiscountPercentage' => $request->has('maxDiscountPercentage') && $request->filled('maxDiscountPercentage')
                ? $request->float('maxDiscountPercentage')
                : null,
            'sortBy'                => $request->string('sortBy', 'createdAt')->toString(),
            'sortOrder'             => $request->string('sortOrder', 'desc')->toString(),
            'page'                  => $request->integer('page', 1),
            'perPage'               => $request->integer('perPage', 15),
        ];
    }
}
