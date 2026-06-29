<?php

namespace App\Http\Controllers\Api;

use App\Enums\Permission;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Attributes\Controllers\Middleware;

#[Middleware('auth:sanctum')]
class PermissionCatalogController extends Controller
{
    /**
     * GET /api/permissions/catalog
     * Mengembalikan daftar master permission (read-only).
     */
    public function index(): JsonResponse
    {
        $permissions = array_map(fn(Permission $p) => [
            'key'   => $p->value,
            'label' => $p->label(),
        ], Permission::cases());

        return $this->successResponse($permissions, 'Permission catalog fetched successfully');
    }
}
