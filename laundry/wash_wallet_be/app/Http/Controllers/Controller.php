<?php

namespace App\Http\Controllers;

use App\Helpers\PaginationHelper;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

abstract class Controller
{
    /**
     * Return a standardized success JSON response.
     */
    protected function successResponse(mixed $data = null, string $message = 'Success', int $code = 200, array $meta = []): JsonResponse
    {
        $response = [
            'success' => true,
            'message' => $message,
            'data'    => $data,
        ];

        if (!empty($meta)) {
            $response['meta'] = $meta;
        }

        return response()->json($response, $code);
    }

    /**
     * Return a standardized error JSON response.
     */
    protected function errorResponse(string $message = 'Error', int $code = 500, mixed $error = null): JsonResponse
    {
        $response = [
            'success' => false,
            'message' => $message,
        ];

        if (config('app.debug') && !is_null($error)) {
            if ($error instanceof \Exception || $error instanceof \Throwable) {
                $response['error'] = $error->getMessage();
            } else {
                $response['error'] = $error;
            }
        }

        return response()->json($response, $code);
    }

    /**
     * Format pagination metadata for a paginated response.
     */
    protected function getPaginationMeta(LengthAwarePaginator $paginator, ?Request $request = null): array
    {
        return PaginationHelper::format($paginator, $request ?? request());
    }
}
