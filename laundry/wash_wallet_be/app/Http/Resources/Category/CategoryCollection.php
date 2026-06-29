<?php

namespace App\Http\Resources\Category;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Attributes\Collects;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Pagination\LengthAwarePaginator;

#[Collects(CategoryResource::class)]
class CategoryCollection extends ResourceCollection
{
    protected $message;
    protected $status;
    protected $filters;
    protected $errors;

    public function __construct($resource, $message = null, $status = 200, $filters = [], $errors = null)
    {
        parent::__construct($resource);
        $this->message = $message ?? 'Categories fetched successfully';
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
            'name' => $request->get('filter.name'),
            'code' => $request->get('filter.code'),
            'description' => $request->get('filter.description'),

            // Status filters
            'is_active' => $request->get('filter.is_active') ?? $request->get('isActive'),
            'outlet_id' => $request->get('filter.outlet_id') ?? $request->get('outletId'),

            // Date filters
            'created_date' => $request->get('filter.created_date'),
            'updated_date' => $request->get('filter.updated_date'),
            'date_from' => $request->get('filter.date_from') ?? $request->get('dateFrom'),
            'date_to' => $request->get('filter.date_to') ?? $request->get('dateTo'),

            // Advanced filters
            'has_products' => $request->get('filter.has_products'),
            'with_trashed' => $request->get('filter.with_trashed'),
            'only_trashed' => $request->get('filter.only_trashed'),

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
        return new self($resource, $message ?? 'Categories fetched successfully', 200, $filters);
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
