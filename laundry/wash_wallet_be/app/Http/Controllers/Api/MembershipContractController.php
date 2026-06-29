<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Helpers\PaginationHelper;
use App\Http\Resources\MembershipContract\MembershipContractResource;
use App\Services\MembershipContractService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Throwable;

use Illuminate\Routing\Attributes\Controllers\Middleware;

#[Middleware('auth:sanctum')]
class MembershipContractController extends Controller
{
    public function __construct(
        private readonly MembershipContractService $membershipContractService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $this->getFilters($request);

            $membershipContracts = $this->membershipContractService->getAll(
                filters: $filters,
                page: $filters['page'],
                perPage: $filters['perPage'],
                relations: ['customer', 'outlet', 'membershipPlan']
            );

            return $this->successResponse(
                MembershipContractResource::collection($membershipContracts)->resolve(),
                'Membership contracts retrieved successfully',
                200,
                PaginationHelper::format($membershipContracts, $request)
            );
        } catch (Throwable $e) {
            Log::error('[MembershipContractController] Failed to retrieve membership contracts', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'membership_contract',
            ]);

            return $this->errorResponse('Gagal memuat data kontrak membership', 500, $e);
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            $membershipContract = $this->membershipContractService->getById(
                $id,
                ['customer', 'outlet', 'membershipPlan']
            );

            return $this->successResponse(
                new MembershipContractResource($membershipContract),
                'Membership contract retrieved successfully'
            );
        } catch (Throwable $e) {
            Log::error('[MembershipContractController] Failed to retrieve membership contract', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'membership_contract',
            ]);

            return $this->errorResponse('Gagal memuat data kontrak membership', 500, $e);
        }
    }

    private function getFilters(Request $request): array
    {
        return [
            'search'           => $request->string('search')->toString(),
            'customerId'       => $request->has('customerId') && $request->filled('customerId')
                ? $request->integer('customerId')
                : null,
            'outletId'         => $request->has('outletId') && $request->filled('outletId')
                ? $request->integer('outletId')
                : null,
            'membershipPlanId' => $request->has('membershipPlanId') && $request->filled('membershipPlanId')
                ? $request->integer('membershipPlanId')
                : null,
            'status'           => $request->string('status')->toString(),
            'totalPaidMin'     => $request->has('totalPaidMin') && $request->filled('totalPaidMin')
                ? $request->float('totalPaidMin')
                : null,
            'totalPaidMax'     => $request->has('totalPaidMax') && $request->filled('totalPaidMax')
                ? $request->float('totalPaidMax')
                : null,
            'sortBy'           => $request->string('sortBy', 'createdAt')->toString(),
            'sortDirection'    => $request->string('sortDirection', 'desc')->toString(),
            'page'             => $request->integer('page', 1),
            'perPage'          => $request->integer('perPage', 15),
        ];
    }
}
