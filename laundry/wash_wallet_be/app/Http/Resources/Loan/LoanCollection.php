<?php

namespace App\Http\Resources\Loan;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Http\Resources\Attributes\Collects;

#[Collects(LoanResource::class)]
class LoanCollection extends ResourceCollection
{
    protected $message;
    protected $status;
    protected $filters;
    protected $errors;
    protected $statistics;

    public function __construct(
        $resource,
        $message = null,
        $status = 200,
        $filters = [],
        $errors = null,
        $statistics = null
    ) {
        parent::__construct($resource);
        $this->message = $message ?? 'Loans fetched successfully';
        $this->status = $status;
        $this->filters = $filters;
        $this->errors = $errors;
        $this->statistics = $statistics;
    }

    /**
     * Transform the resource collection into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'data' => $this->collection,
            'meta' => $this->buildMeta(),
            'statistics' => $this->statistics,
            'filters' => $this->buildFilters($request),
            'errors' => $this->errors,
        ];
    }

    /**
     * Build meta information
     */
    private function buildMeta(): array
    {
        $meta = [
            'message' => $this->message,
            'status' => $this->status,
        ];

        // Add pagination info if resource is paginated
        if ($this->resource instanceof LengthAwarePaginator) {
            $meta['pagination'] = [
                'total' => $this->resource->total(),
                'perPage' => $this->resource->perPage(),
                'currentPage' => $this->resource->currentPage(),
                'lastPage' => $this->resource->lastPage(),
                'from' => $this->resource->firstItem(),
                'to' => $this->resource->lastItem(),
                'hasMorePages' => $this->resource->hasMorePages(),
                'path' => $this->resource->path(),
                'firstPageUrl' => $this->resource->url(1),
                'lastPageUrl' => $this->resource->url($this->resource->lastPage()),
                'nextPageUrl' => $this->resource->nextPageUrl(),
                'prevPageUrl' => $this->resource->previousPageUrl(),
            ];
        } else {
            // For non-paginated collections
            $meta['total'] = $this->collection->count();
        }

        return $meta;
    }

    /**
     * Build filters information
     */
    private function buildFilters(Request $request): array
    {
        $filters = [
            // Search filters
            'search' => $request->get('filter.search') ?? $request->get('search'),

            // Employee filters
            'employeeId' => $request->get('filter.employee_id') ?? $request->get('employeeId'),
            'employeeName' => $request->get('filter.employee_name'),

            // Status filters
            'isPaid' => $request->get('filter.is_paid') ?? $request->get('isPaid'),
            'repaymentType' => $request->get('filter.repayment_type') ?? $request->get('repaymentType'),

            // Amount filters
            'minAmount' => $request->get('filter.min_amount') ?? $request->get('minAmount'),
            'maxAmount' => $request->get('filter.max_amount') ?? $request->get('maxAmount'),
            'minRemaining' => $request->get('filter.min_remaining'),
            'maxRemaining' => $request->get('filter.max_remaining'),

            // Date filters
            'loanDateFrom' => $request->get('filter.loan_date_from') ?? $request->get('loanDateFrom'),
            'loanDateTo' => $request->get('filter.loan_date_to') ?? $request->get('loanDateTo'),
            'startRepaymentFrom' => $request->get('filter.start_repayment_from'),
            'startRepaymentTo' => $request->get('filter.start_repayment_to'),
            'createdFrom' => $request->get('filter.created_from'),
            'createdTo' => $request->get('filter.created_to'),

            // Advanced filters
            'isActive' => $request->get('filter.is_active'),
            'isOverdue' => $request->get('filter.is_overdue'),
            'hasPayments' => $request->get('filter.has_payments'),

            // Sorting
            'sort' => $request->get('sort'),
            'sortBy' => $request->get('sortBy'),
            'sortDirection' => $request->get('sortDirection') ?? $request->get('sortOrder'),

            // Pagination
            'page' => $request->get('page'),
            'perPage' => $request->get('perPage') ?? $request->get('per_page'),

            // Includes
            'include' => $request->get('include'),
            'relations' => $request->get('relations'),
            'with' => $request->get('with'),
        ];

        // Remove null values
        return array_filter($filters, function ($value) {
            return $value !== null && $value !== '';
        });
    }

    /**
     * Create success collection
     */
    public static function success(
        $resource,
        $message = null,
        $filters = [],
        $statistics = null
    ): self {
        return new self(
            $resource,
            $message ?? 'Loans fetched successfully',
            200,
            $filters,
            null,
            $statistics
        );
    }

    /**
     * Create error collection
     */
    public static function error($resource, $message, $errors, $status = 500): self
    {
        return new self($resource, $message, $status, [], $errors);
    }

    /**
     * Add custom response data
     */
    public function with(Request $request): array
    {
        return [
            'success' => $this->status >= 200 && $this->status < 300,
            'timestamp' => now()->toISOString(),
        ];
    }
}
