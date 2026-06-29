<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderReview\OrderReviewResource;
use App\Services\OrderReviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Attributes\Controllers\Middleware;

#[Middleware('auth:customer_sanctum')]
class OrderReviewController extends Controller
{
    public function __construct(
        private readonly OrderReviewService $orderReviewService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $this->getFilters($request);
        $reviews = $this->orderReviewService->getAll($filters);

        return $this->successResponse(
            OrderReviewResource::collection($reviews),
            'Order reviews retrieved successfully'
        );
    }

    public function show(int $id): JsonResponse
    {
        $review = $this->orderReviewService->getById($id);

        return $this->successResponse(
            new OrderReviewResource($review),
            'Order review retrieved successfully'
        );
    }

    /**
     * Get review summary for an outlet.
     */
    public function orderReviewSummary(int $outletId)
    {
        $summary = $this->orderReviewService->getOrderReviewSummary($outletId);

        return $this->successResponse(
            $summary,
            'Review summary retrieved successfully'
        );
    }

    /**
     * Helper: Get filters from request
     */
    private function getFilters(Request $request): array
    {
        return [
            'search' => $request->string('search')->toString(),
            'outletId' => $request->has('outletId') && $request->filled('outletId')
                ? $request->integer('outletId')
                : null,
            'customerAccountId' => $request->has('customerAccountId') && $request->filled('customerAccountId')
                ? $request->integer('customerAccountId')
                : null,
            'orderId' => $request->has('orderId') && $request->filled('orderId')
                ? $request->integer('orderId')
                : null,
            'rating' => $request->has('rating') && $request->filled('rating')
                ? $request->integer('rating')
                : null,
            'sortBy'        => $request->string('sortBy', 'created_at')->toString(),
            'sortDirection' => $request->string('sortDirection', 'desc')->toString(),
            'page'          => $request->integer('page', 1),
            'perPage'       => $request->integer('perPage', 15),
        ];
    }
}
