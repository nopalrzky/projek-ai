<?php

namespace App\Http\Resources\Order;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Attributes\Collects;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Pagination\LengthAwarePaginator;

#[Collects(OrderResource::class)]
class OrderCollection extends ResourceCollection
{

    protected $message;
    protected $status;
    protected $filters;
    protected $errors;

    public function __construct($resource, $message = null, $status = 200, $filters = [], $errors = null)
    {
        parent::__construct($resource);
        $this->message = $message ?? 'Orders fetched successfully';
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
        $response = [
            'data' => $this->collection,
            'meta' => $this->buildMeta(),
        ];

        if (!empty($this->filters)) {
            $response['filters'] = $this->filters;
        }

        if ($this->errors !== null) {
            $response['errors'] = $this->errors;
        }

        return $response;
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
     * Create success collection
     */
    public static function success($resource, $message = null, $filters = []): self
    {
        return new self($resource, $message ?? 'Orders fetched successfully', 200, $filters);
    }

    /**
     * Create error collection
     */
    public static function error($resource, $message, $errors, $status = 500): self
    {
        return new self($resource, $message, $status, [], $errors);
    }

    /**
     * Create collection for specific contexts
     */
    public static function active($resource, $message = null): self
    {
        return new self($resource, $message ?? 'Active orders fetched successfully');
    }

    public static function completed($resource, $message = null): self
    {
        return new self($resource, $message ?? 'Completed orders fetched successfully');
    }

    public static function overdue($resource, $message = null): self
    {
        return new self($resource, $message ?? 'Overdue orders fetched successfully');
    }

    public static function today($resource, $message = null): self
    {
        return new self($resource, $message ?? 'Today\'s orders fetched successfully');
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
}
