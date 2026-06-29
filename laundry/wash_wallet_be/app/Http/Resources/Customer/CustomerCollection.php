<?php

namespace App\Http\Resources\Customer;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Attributes\Collects;
use Illuminate\Http\Resources\Json\ResourceCollection;

#[Collects(CustomerResource::class)]
class CustomerCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<int|string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'data' => $this->collection,
            'meta' => [
                'total' => $this->collection->count(),
                'activeCustomers' => $this->collection->where('isActive', true)->count(),
                'inactiveCustomers' => $this->collection->where('isActive', false)->count(),
                'customersWithOrders' => $this->collection->where('ordersCount', '>', 0)->count(),
                'totalOrders' => $this->collection->sum('ordersCount'),
                'totalRevenue' => $this->collection->sum('totalSpent'),
                'averageOrdersPerCustomer' => $this->collection->where('ordersCount', '>', 0)->avg('ordersCount'),
            ],
        ];
    }
}
