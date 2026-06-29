<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CustomerTopupService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

use Illuminate\Routing\Attributes\Controllers\Middleware;

#[Middleware('auth:customer_sanctum')]
class CustomerTopupController extends Controller
{
    public function __construct(
        private readonly CustomerTopupService $topupService
    ) {}

    public function index(Request $request)
    {
        $customerId = Auth::guard('customer_sanctum')->id();
        $topups = $this->topupService->getAll($customerId, $request->all());

        return $this->successResponse($topups, 'Topups retrieved successfully');
    }

    public function store(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'paymentMethod' => 'required|string',
            'bankCode' => 'nullable|string',
        ]);

        $customerId = Auth::guard('customer_sanctum')->id();
        $topup = $this->topupService->store($customerId, $request->all());

        return $this->successResponse($topup, 'Topup created successfully', 201);
    }

    public function show($id)
    {
        $customerId = Auth::guard('customer_sanctum')->id();
        $topup = $this->topupService->getById($id, $customerId);

        return $this->successResponse($topup, 'Topup retrieved successfully');
    }
}
