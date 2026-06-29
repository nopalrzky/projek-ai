<?php

namespace App\Http\Controllers\Web;

use Illuminate\Routing\Attributes\Controllers\Middleware;

use App\Helpers\PaginationHelper;
use App\Http\Controllers\Controller;
use App\Http\Resources\Affiliate\AffiliateResource;
use App\Http\Resources\User\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

#[Middleware('auth')]
class AffiliateController extends Controller
{
    /**
     * Display a listing of the affiliates (referrals)
     */
    public function index(Request $request): Response
    {
        try {
            /** @var User $user */
            $user = Auth::user();

            $filters = [
                'search'        => $request->string('search')->toString(),
                'status'        => $request->string('status')->toString(),
                'sortBy'        => $request->string('sortBy', 'created_at')->toString(),
                'sortDirection' => $request->string('sortDirection', 'desc')->toString(),
                'page'          => $request->integer('page', 1),
                'perPage'       => $request->integer('perPage', 15),
            ];

            $referralsQuery = $user->referrals();

            if ($filters['search'] !== '') {
                $search = $filters['search'];
                $referralsQuery->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            }

            if ($filters['status'] !== '') {
                $referralsQuery->where('status', $filters['status']);
            }

            $allowedSortBy = ['name', 'email', 'created_at', 'status'];
            $sortBy = in_array($filters['sortBy'], $allowedSortBy, true) ? $filters['sortBy'] : 'created_at';
            $sortDirection = $filters['sortDirection'] === 'asc' ? 'asc' : 'desc';

            $referrals = $referralsQuery
                ->orderBy($sortBy, $sortDirection)
                ->paginate($filters['perPage'], ['*'], 'page', $filters['page']);

            $summary = [
                'totalReferrals'  => $user->referrals()->count(),
                'totalCommission' => (int) $user->commissionLogs()->sum('commission_coin'),
            ];

            Log::info('Affiliates page accessed', [
                'user_id'          => $user->id,
                'total_referrals'  => $summary['totalReferrals'],
                'total_commission' => $summary['totalCommission'],
                'type'             => 'affiliate_controller_action',
            ]);

            return Inertia::render('Dashboard/Affiliates/Index', [
                'user'     => (new UserResource($user))->resolve($request),
                'referrals' => [
                    'data' => AffiliateResource::collection($referrals->items())->resolve(),
                    'meta' => PaginationHelper::format($referrals, $request),
                ],
                'summary' => $summary,
                'filters' => [
                    'search'        => $filters['search'],
                    'status'        => $filters['status'] ?: null,
                    'sortBy'        => $sortBy,
                    'sortDirection' => $sortDirection,
                    'page'          => $filters['page'],
                    'perPage'       => $filters['perPage'],
                ],
            ]);
        } catch (Throwable $e) {
            Log::error('[AffiliateController] Failed to load affiliates page', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'affiliate_controller_error',
            ]);

            /** @var User $user */
            $user = Auth::user();

            return Inertia::render('Dashboard/Affiliates/Index', [
                'user'     => (new UserResource($user))->resolve($request),
                'referrals' => [
                    'data' => [],
                    'meta' => [
                        'currentPage' => 1,
                        'from'        => null,
                        'lastPage'    => 1,
                        'perPage'     => 15,
                        'to'          => null,
                        'total'       => 0,
                    ],
                ],
                'summary' => [
                    'totalReferrals'  => 0,
                    'totalCommission' => 0,
                ],
                'filters' => [
                    'search'        => '',
                    'status'        => null,
                    'sortBy'        => 'created_at',
                    'sortDirection' => 'desc',
                    'page'          => 1,
                    'perPage'       => 15,
                ],
                'error' => 'Terjadi kesalahan saat memuat data afiliasi.',
            ]);
        }
    }
}
