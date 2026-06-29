<?php

namespace App\Http\Resources\Employee;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Http\Resources\Attributes\Collects;

#[Collects(EmployeeResource::class)]
class EmployeeCollection extends ResourceCollection
{
    protected $message;
    protected $status;
    protected $filters;
    protected $errors;

    public function __construct($resource, $message = null, $status = 200, $filters = [], $errors = null)
    {
        parent::__construct($resource);
        $this->message = $message ?? 'Employees fetched successfully';
        $this->status = $status;
        $this->filters = $filters;
        $this->errors = $errors;
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
        if ($this->resource instanceof \Illuminate\Pagination\LengthAwarePaginator) {
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
            'name' => $request->get('filter.name'),
            'username' => $request->get('filter.username'),
            'email' => $request->get('filter.email'),
            'phone' => $request->get('filter.phone'),
            'address' => $request->get('filter.address'),

            // Status filters
            'isActive' => $request->get('filter.is_active') ?? $request->get('isActive'),
            'gender' => $request->get('filter.gender'),
            'outletId' => $request->get('filter.outlet_id') ?? $request->get('outletId'),
            'ownerId' => $request->get('filter.owner_id') ?? $request->get('ownerId'),

            // Position filters
            'positionName' => $request->get('filter.position_name') ?? $request->get('positionName'),
            'hasPositions' => $request->get('filter.has_positions') ?? $request->get('hasPositions'),
            'hasCommissions' => $request->get('filter.has_commissions') ?? $request->get('hasCommissions'),

            // Payroll filters
            'payrollPeriod' => $request->get('filter.payroll_period') ?? $request->get('payrollPeriod'),
            'salaryMin' => $request->get('filter.salary_min') ?? $request->get('salaryMin'),
            'salaryMax' => $request->get('filter.salary_max') ?? $request->get('salaryMax'),

            // Date filters
            'startDate' => $request->get('filter.start_date') ?? $request->get('startDate'),
            'endDate' => $request->get('filter.end_date') ?? $request->get('endDate'),
            'dateFrom' => $request->get('filter.date_from') ?? $request->get('dateFrom'),
            'dateTo' => $request->get('filter.date_to') ?? $request->get('dateTo'),
            'createdFrom' => $request->get('filter.created_from') ?? $request->get('createdFrom'),
            'createdTo' => $request->get('filter.created_to') ?? $request->get('createdTo'),

            // Login activity filters
            'loggedInRecently' => $request->get('filter.logged_in_recently') ?? $request->get('loggedInRecently'),
            'neverLoggedIn' => $request->get('filter.never_logged_in') ?? $request->get('neverLoggedIn'),

            // Advanced filters
            'withCounts' => $request->get('filter.with_counts') ?? $request->get('withCounts'),
            'withTrashed' => $request->get('filter.with_trashed') ?? $request->get('withTrashed'),
            'onlyTrashed' => $request->get('filter.only_trashed') ?? $request->get('onlyTrashed'),

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
        ];

        // Remove null values
        return array_filter($filters, function ($value) {
            return $value !== null && $value !== '';
        });
    }

    /**
     * Create success collection
     */
    public static function success($resource, $message = null, $filters = []): self
    {
        return new self($resource, $message ?? 'Employees fetched successfully', 200, $filters);
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
