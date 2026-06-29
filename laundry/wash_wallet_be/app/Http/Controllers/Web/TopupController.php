<?php

namespace App\Http\Controllers\Web;

use Illuminate\Routing\Attributes\Controllers\Middleware;

use App\Helpers\PaginationHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\Topup\StoreTopupRequest;
use App\Http\Resources\Outlet\OutletResource;
use App\Http\Resources\Topup\TopupResource;
use App\Services\OutletService;
use App\Services\TopupService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

#[Middleware('auth')]
class TopupController extends Controller
{
    public function __construct(private readonly OutletService $outletService, private readonly TopupService $topupService) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        try {
            $filters = $this->getFiltersFromRequest($request);

            $topups = $this->topupService->getAll(
                filters: $filters,
                page: $filters['page'],
                perPage: $filters['perPage'],
                relations: ['user']
            );

            return Inertia::render('Dashboard/Topups/Index', [
                'topups' => [
                    'data' => TopupResource::collection($topups->items())->resolve(),
                    'meta' => PaginationHelper::format($topups, $request),
                ],
                'stats'         => $this->topupService->getStats(),
                'filterOptions' => [
                    'statusOptions' => [
                        ['value' => 'pending', 'label' => 'Pending'],
                        ['value' => 'success', 'label' => 'Success'],
                        ['value' => 'failed', 'label' => 'Failed'],
                    ],
                    'paymentStatusOptions' => [
                        ['value' => 'pending', 'label' => 'Pending'],
                        ['value' => 'paid', 'label' => 'Paid'],
                        ['value' => 'failed', 'label' => 'Failed'],
                        ['value' => 'expired', 'label' => 'Expired'],
                    ],
                ],
                'filters' => [
                    'search'        => $filters['search'] ?? '',
                    'status'        => $filters['status'] ?? null,
                    'paymentStatus' => $filters['paymentStatus'] ?? null,
                    'startDate'     => $filters['startDate'] ?? null,
                    'endDate'       => $filters['endDate'] ?? null,
                    'sortBy'        => $filters['sortBy'] ?? 'created_at',
                    'sortDirection' => $filters['sortDirection'] ?? 'desc',
                    'page'          => $filters['page'] ?? 1,
                    'perPage'       => $filters['perPage'] ?? 15,
                ],
                'flash' => [
                    'success' => session('success'),
                    'error'   => session('error'),
                ],
            ]);
        } catch (Throwable $e) {
            Log::error('[TopupController] Failed to load topups index', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'topup_controller_error',
            ]);

            return Inertia::render('Dashboard/Topups/Index', [
                'topups' => [
                    'data' => [],
                    'meta' => [
                        'current_page' => 1,
                        'from'         => 0,
                        'last_page'    => 1,
                        'per_page'     => 15,
                        'to'           => 0,
                        'total'        => 0,
                    ],
                ],
                'filterOptions' => [
                    'statusOptions'        => [],
                    'paymentStatusOptions' => [],
                ],
                'filters' => [],
                'flash'   => [
                    'error' => 'Gagal memuat data topup. Silakan coba lagi.',
                ],
            ]);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response|RedirectResponse
    {
        try {
            $user = Auth::user();
            $pendingTopup = $this->topupService->getPendingTransaction($user->id);

            if ($pendingTopup) {
                return redirect()->route('topups.show', $pendingTopup->id)
                    ->with('info', 'Selesaikan pembayaran transaksi Anda sebelumnya.');
            }

            $outlets = $this->outletService->getAll();

            return Inertia::render('Dashboard/Topups/Create', [
                'outlets' => OutletResource::collection($outlets)->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[TopupController] Failed to load topup create form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'topup_controller_error',
            ]);

            return redirect()->route('topups.index')
                ->with('error', 'Gagal memuat formulir pembuatan topup');
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTopupRequest $request): RedirectResponse
    {
        try {
            $topup = $this->topupService->store($request->validated());

            return redirect()->route('topups.show', $topup->id)
                ->with('success', "Topup sebesar Rp " . number_format($topup->amount_money, 0, ',', '.') . " berhasil dibuat. Silakan selesaikan pembayaran.");
        } catch (Throwable $e) {
            Log::error('[TopupController] Failed to create topup', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'topup_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id): Response|RedirectResponse
    {
        try {
            $topup = $this->topupService->getById($id, ['user', 'referralLog']);

            return Inertia::render('Dashboard/Topups/Show', [
                'topup' => (new TopupResource($topup))->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[TopupController] Failed to show topup', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'topup_controller_error',
            ]);

            return redirect()->route('topups.index')
                ->with('error', 'Topup tidak ditemukan atau akses ditolak');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(int $id): RedirectResponse
    {
        try {
            $deleted = $this->topupService->destroy($id);

            if ($deleted) {
                return redirect()->route('topups.index')
                    ->with('success', 'Topup berhasil dihapus');
            }

            return redirect()->back()
                ->with('error', 'Gagal menghapus topup');
        } catch (Throwable $e) {
            Log::error('[TopupController] Failed to delete topup', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'topup_controller_error',
            ]);

            return redirect()->back()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Get filters from request
     */
    private function getFiltersFromRequest(Request $request): array
    {
        return [
            'search'        => $request->string('search')->toString(),
            'status'        => $request->has('status') && $request->filled('status')
                ? $request->string('status')->toString()
                : null,
            'paymentStatus' => $request->has('paymentStatus') && $request->filled('paymentStatus')
                ? $request->string('paymentStatus')->toString()
                : null,
            'userId' => $request->has('userId') && $request->filled('userId')
                ? $request->integer('userId')
                : null,
            'startDate' => $request->has('startDate') && $request->filled('startDate')
                ? $request->string('startDate')->toString()
                : null,
            'endDate' => $request->has('endDate') && $request->filled('endDate')
                ? $request->string('endDate')->toString()
                : null,
            'sortBy'        => $request->string('sortBy', 'created_at')->toString(),
            'sortDirection' => $request->string('sortDirection', 'desc')->toString(),
            'page'          => $request->integer('page', 1),
            'perPage'       => $request->integer('perPage', 15),
        ];
    }
}
