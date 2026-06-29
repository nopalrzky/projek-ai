<?php

namespace App\Services;

use App\Models\OrderReview;
use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;


class OrderReviewService extends BaseService
{

    public function __construct(protected OrderReview $orderReview) {}

    public function getAll(
        array $filters = [],
        ?int $page = null,
        ?int $perPage = null,
        array $relations = ['order', 'customerAccount', 'outlet']
    ): LengthAwarePaginator|Collection {
        try {
            $query = $this->orderReview->query();

            $this->applyFilters($query, $filters);

            if (!empty($relations)) {
                $query->with($relations);
            }

            return $this->paginate($query, $perPage, $page);
        } catch (Exception $e) {
            Log::error('Failed to get order reviews', [
                'filters'  => $filters,
                'error'    => $e->getMessage(),
                'user_id'  => Auth::id(),
                'type'     => 'order_review_service_error',
            ]);
            throw $e;
        }
    }

    public function getById(
        int $id,
        array $relations = ['order', 'customerAccount', 'outlet']
    ): OrderReview {
        try {
            $query = $this->orderReview->query()->byId($id);

            if (!empty($relations)) {
                $query->with($relations);
            }

            return $query->firstOrFail();
        } catch (Exception $e) {
            Log::error('Failed to get order review by ID', [
                'id'      => $id,
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'order_review_service_error',
            ]);
            throw $e;
        }
    }

    public function store(array $data): OrderReview
    {
        try {
            return $this->orderReview->create($data);
        } catch (Exception $e) {
            Log::error('Failed to store order review', [
                'data'    => $data,
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'order_review_service_error',
            ]);
            throw $e;
        }
    }


    /**
     * Get review summary for an outlet.
     */
    public function getOrderReviewSummary(int $outletId): array
    {
        $reviews = $this->orderReview->byOutletId($outletId)
            ->where('is_published', true)
            ->get();

        $totalReviews = $reviews->count();
        $averageRating = $totalReviews > 0 ? $reviews->avg('rating') : 0;

        $distribution = [
            5 => 0,
            4 => 0,
            3 => 0,
            2 => 0,
            1 => 0,
        ];

        foreach ($reviews as $review) {
            $distribution[$review->rating]++;
        }

        return [
            'averageRating' => round($averageRating, 1),
            'totalReviews' => $totalReviews,
            'ratingDistribution' => $distribution,
        ];
    }

    protected function applyFilters(Builder $query, array $filters): void
    {
        if (!empty($filters['search'])) {
            $query->search($filters['search']);
        }

        if (!empty($filters['outletId'])) {
            $query->byOutletId($filters['outletId']);
        }

        if (!empty($filters['customerAccountId'])) {
            $query->byCustomerAccountId($filters['customerAccountId']);
        }

        if (!empty($filters['orderId'])) {
            $query->byOrderId($filters['orderId']);
        }

        if (!empty($filters['rating'])) {
            $query->where('rating', $filters['rating']);
        }

        $sortBy        = $filters['sortBy'] ?? 'createdAt';
        $sortDirection = $filters['sortDirection'] ?? 'desc';

        $this->applySort($query, $sortBy, $sortDirection);
    }
}
