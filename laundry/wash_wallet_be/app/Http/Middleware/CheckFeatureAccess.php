<?php

namespace App\Http\Middleware;

use App\Models\Outlet;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckFeatureAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string $featureKey
     */
    public function handle(Request $request, Closure $next, string $featureKey): Response
    {
        // Get outletId from route parameters
        $outletId = $request->route('outletId');

        if (!$outletId) {
            // Some routes might use other naming or not have it.
            // If No outlet context, we can't check feature access.
            // In that case, we might allow it or block it.
            // Let's assume most routes needing this WILL have outlet context.
            return $next($request);
        }

        /** @var \App\Models\Outlet $outlet */
        $outlet = Outlet::find($outletId);

        if (!$outlet) {
            return $next($request);
        }

        if (!$outlet->hasFeature($featureKey)) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => "Feature [{$featureKey}] is locked. Please activate/trial it in feature settings.",
                    'feature' => $featureKey,
                    'is_locked' => true,
                ], 403);
            }

            // Redirect to feature catalog page if web request
            return redirect()->route('dashboard')->with('error', "Fitur [{$featureKey}] tidak aktif. Silakan aktifkan di dashboard.");
        }

        return $next($request);
    }
}
