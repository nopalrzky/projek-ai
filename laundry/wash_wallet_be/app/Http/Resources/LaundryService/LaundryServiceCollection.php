<?php

namespace App\Http\Resources\LaundryService;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Http\Resources\Attributes\Collects;

#[Collects(LaundryServiceResource::class)]
class LaundryServiceCollection extends ResourceCollection
{
    protected $message;
    protected $status;
    protected $filters;
    protected $errors;

    public function __construct($resource, $message = null, $status = 200, $filters = [], $errors = null)
    {
        parent::__construct($resource);
        $this->message = $message ?? 'Laundry services fetched successfully';
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
            'description' => $request->get('filter.description'),
            'slug' => $request->get('filter.slug'),

            // Status filters
            'isActive' => $request->get('filter.is_active') ?? $request->get('isActive'),
            'categoryId' => $request->get('filter.category_id') ?? $request->get('categoryId'),
            'unitId' => $request->get('filter.unit_id') ?? $request->get('unitId'),
            'outletId' => $request->get('filter.outlet_id') ?? $request->get('outletId'),
            'ownerId' => $request->get('filter.owner_id') ?? $request->get('ownerId'),

            'priceMin' => $request->get('filter.price_min') ?? $request->get('priceMin'),
            'priceMax' => $request->get('filter.price_max') ?? $request->get('priceMax'),

            // Relationship filters
            'categoryName' => $request->get('filter.category_name') ?? $request->get('categoryName'),
            'unitName' => $request->get('filter.unit_name') ?? $request->get('unitName'),
            'outletName' => $request->get('filter.outlet_name') ?? $request->get('outletName'),

            // Advanced filters
            'withCounts' => $request->get('filter.with_counts') ?? $request->get('withCounts'),
            'withRelations' => $request->get('filter.with_relations') ?? $request->get('withRelations'),
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
    public static function success($resource, $message = null, $filters = []): self
    {
        return new self($resource, $message ?? 'Laundry services fetched successfully', 200, $filters);
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
            'endpoint' => $request->url(),
            'method' => $request->method(),
        ];
    }

    /**
     * Override buildMeta to include statistics
     */
    private function buildMetaWithStatistics(): array
    {
        $meta = $this->buildMeta();

        if (isset($this->statistics)) {
            $meta['statistics'] = $this->statistics;
        }

        return $meta;
    }

    /**
     * Transform with statistics
     */
    public function toArrayWithStatistics(Request $request): array
    {
        return [
            'data' => $this->collection,
            'meta' => $this->buildMetaWithStatistics(),
            'filters' => $this->buildFilters($request),
            'errors' => $this->errors,
        ];
    }
}
