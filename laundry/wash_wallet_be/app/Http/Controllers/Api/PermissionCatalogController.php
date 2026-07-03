<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PositionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Attributes\Controllers\Middleware;

#[Middleware('auth:sanctum')]
class PermissionCatalogController extends Controller
{
    public function __construct(private readonly PositionService $positionService) {}

    /**
     * GET /api/permissions/catalog
     * Mengembalikan daftar master permission (read-only).
     */
    public function index(): JsonResponse
    {
        return $this->successResponse(
            $this->positionService->getPermissionCatalog(),
            'Permission catalog fetched successfully'
        );
    }
}
