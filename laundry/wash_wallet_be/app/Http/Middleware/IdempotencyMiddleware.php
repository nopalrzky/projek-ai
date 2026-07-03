<?php

namespace App\Http\Middleware;

use App\Models\MobileActionIdempotency;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IdempotencyMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, ?string $actionName = null): Response
    {
        $clientRequestId = $request->header('Client-Request-Id') ?? $request->input('client_request_id');
        if (!$clientRequestId) {
            return $next($request);
        }

        $user = $request->user();
        if (!$user || !($user instanceof \App\Models\Employee)) {
            return $next($request);
        }

        $employeeId = $user->id;
        $outletId = $user->outlet_id ?? $request->input('outlet_id');
        $action = $actionName ?? $request->route()->getName() ?? $request->path();

        $idempotency = MobileActionIdempotency::byEmployeeId($employeeId)
            ->where('action', $action)
            ->where('client_request_id', $clientRequestId)
            ->first();

        $textData = $request->except(array_merge(['client_request_id'], array_keys($request->allFiles())));
        $requestHash = hash('sha256', json_encode($textData));

        if ($idempotency) {
            if ($idempotency->request_hash !== $requestHash) {
                return response()->json([
                    'success' => false,
                    'message' => 'Request payload differs from the original request with the same Client-Request-Id.',
                ], 409);
            }

            if ($idempotency->status === 'success') {
                return response()->json($idempotency->response_body, $idempotency->response_code);
            }
            if ($idempotency->status === 'processing') {
                if ($idempotency->updated_at->diffInSeconds(now()) < 60) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Request is already being processed.',
                    ], 409);
                }
            }
            $idempotency->update(['status' => 'processing', 'request_hash' => $requestHash]);
        } else {
            try {
                $idempotency = MobileActionIdempotency::create([
                    'employee_id' => $employeeId,
                    'outlet_id' => $outletId,
                    'action' => $action,
                    'client_request_id' => $clientRequestId,
                    'request_hash' => $requestHash,
                    'status' => 'processing',
                ]);
            } catch (\Illuminate\Database\QueryException $e) {
                $errorCode = $e->errorInfo[1] ?? null;
                $sqlState = $e->errorInfo[0] ?? null;
                if ($errorCode === 1062 || $sqlState === '23000' || $sqlState === '23505') {
                    return response()->json([
                        'success' => false,
                        'message' => 'Request is already being processed concurrently.',
                    ], 409);
                }
                throw $e;
            }
        }

        $response = $next($request);

        $isSuccess = $response->getStatusCode() >= 200 && $response->getStatusCode() < 300;
        
        $body = [];
        if (method_exists($response, 'getContent')) {
            $body = json_decode($response->getContent(), true) ?? [];
        }

        $idempotency->update([
            'status' => $isSuccess ? 'success' : 'failed',
            'response_code' => $response->getStatusCode(),
            'response_body' => $body,
        ]);

        return $response;
    }
}
