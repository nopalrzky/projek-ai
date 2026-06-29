<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\Employee;
use App\Models\Order;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class CheckPositionPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  Request  $request
     * @param  \Closure  $next
     * @param  string  ...$permissions  One or more permission keys (OR logic)
     * @return Response
     */
    public function handle(Request $request, Closure $next, string ...$permissions): Response
    {
        $employee = $request->user();

        if (!$employee || !($employee instanceof Employee)) {
            throw new AccessDeniedHttpException('Only authenticated employees can access this route.');
        }

        $aggregate = in_array('aggregate', $permissions, true);
        if ($aggregate) {
            $permissions = array_values(array_filter(
                $permissions,
                fn($permission) => $permission !== 'aggregate'
            ));
        }

        $hasAccess = false;
        if ($aggregate) {
            foreach ($employee->getAccessibleOutletIds() as $outletId) {
                foreach ($permissions as $permission) {
                    if ($employee->hasPermissionOnOutlet($permission, (int) $outletId)) {
                        $hasAccess = true;
                        break 2;
                    }
                }
            }
        } else {
            $outletId = $this->resolveOutletId($request, $employee);

            if ($outletId === null) {
                throw new AccessDeniedHttpException('Outlet context is required.');
            }

            $outletId = (int) $outletId;

            foreach ($permissions as $permission) {
                if ($employee->hasPermissionOnOutlet($permission, $outletId)) {
                    $hasAccess = true;
                    break;
                }
            }
        }

        if (!$hasAccess) {
            throw new AccessDeniedHttpException('Employee does not have permission to perform this action on this outlet.');
        }

        return $next($request);
    }

    private function resolveOutletId(Request $request, Employee $employee): ?int
    {
        $explicitOutletId = $request->header('X-Outlet-ID')
            ?? $request->input('outlet_id')
            ?? $request->input('outletId')
            ?? $request->route('outletId')
            ?? $request->route('outlet_id');

        if ($explicitOutletId !== null && is_numeric($explicitOutletId)) {
            return (int) $explicitOutletId;
        }

        $orderRouteParam = $request->route('order')
            ?? $request->route('orderId')
            ?? $request->route('id');

        if ($orderRouteParam instanceof Order) {
            return $orderRouteParam->outlet_id !== null ? (int) $orderRouteParam->outlet_id : null;
        }

        if (is_numeric($orderRouteParam) && str_contains((string) $request->route()?->uri(), 'orders/')) {
            $orderOutletId = Order::query()
                ->where('id', (int) $orderRouteParam)
                ->value('outlet_id');

            if ($orderOutletId !== null) {
                return (int) $orderOutletId;
            }
        }

        return $employee->outlet_id !== null ? (int) $employee->outlet_id : null;
    }
}
