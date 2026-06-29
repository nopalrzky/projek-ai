<?php

namespace App\Http\Controllers\Web;

use Illuminate\Routing\Attributes\Controllers\Middleware;

use App\Helpers\PaginationHelper;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use App\Http\Requests\Fine\StoreFineRequest;
use App\Http\Requests\Fine\UpdateFineRequest;
use App\Http\Resources\Fine\FineResource;
use App\Http\Resources\Outlet\OutletResource;
use App\Services\FineService;
use App\Services\OutletService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

#[Middleware('auth')]
class FineController extends Controller
{
    public function __construct(private readonly FineService $fineService, private readonly OutletService $outletService) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        try {
            $filters = $this->getFiltersFromRequest($request);

            $fines = $this->fineService->getAll(
                $filters,
                $filters['page'],
                $filters['perPage'],
                ['fineLogs', 'outlet']
            );

            $outlets = $this->outletService->getAll();

            return Inertia::render('Dashboard/Fines/Index', [
                'fines' => [
                    'data' => FineResource::collection($fines)->resolve(),
                    'meta' => PaginationHelper::format($fines, $request),
                ],
                'filterOptions' => [
                    'outlets' => OutletResource::collection($outlets)->resolve(),
                ],
                'filters' => $filters,
                'flash' => [
                    'success' => session('success'),
                    'error' => session('error'),
                ],
            ]);
        } catch (Throwable $e) {
            Log::error('[FineController] Failed to load fines index', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'fine_controller_error',
            ]);

            return Inertia::render('Dashboard/Fines/Index', [
                'fines' => [
                    'data' => [],
                    'meta' => [
                        'currentPage' => 1,
                        'lastPage' => 1,
                        'perPage' => 15,
                        'total' => 0,
                        'from' => 0,
                        'to' => 0,
                    ],
                ],
                'filterOptions' => [
                    'outlets' => [],
                ],
                'filters' => [
                    'search' => '',
                    'minAmount' => null,
                    'maxAmount' => null,
                    'createdFrom' => null,
                    'createdTo' => null,
                    'hasLogs' => null,
                    'sortBy' => 'created_at',
                    'sortDirection' => 'desc',
                ],
                'flash' => [
                    'error' => 'Gagal memuat data. Silakan coba lagi.',
                ],
            ]);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): RedirectResponse|Response
    {
        try {
            $outlets = $this->outletService->getAll();

            return Inertia::render('Dashboard/Fines/Create', [
                'outlets' => OutletResource::collection($outlets)->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[FineController] Failed to load fine create form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'fine_controller_error',
            ]);

            return redirect()->route('fines.index')
                ->with('error', 'Gagal memuat formulir pembuatan denda');
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreFineRequest $request): RedirectResponse
    {
        try {
            $this->fineService->store($request->validated());

            return redirect()->route('fines.index')
                ->with('success', 'Denda berhasil dibuat');
        } catch (Throwable $e) {
            Log::error('[FineController] Failed to store new fine', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'fine_controller_error',
            ]);

            return redirect()->route('fines.create')
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id): RedirectResponse|Response
    {
        try {
            $fine = $this->fineService->getById($id, [
                'fineLogs',
                'fineLogs.employee',
                'fineLogs.outlet',
                'outlet',
            ]);

            return Inertia::render('Dashboard/Fines/Show', [
                'fine' => (new FineResource($fine))->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[FineController] Failed to load fine show page', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'fine_controller_error',
            ]);

            return redirect()->route('fines.index')
                ->with('error', 'Gagal memuat data denda');
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(int $id): RedirectResponse|Response
    {
        try {
            $fine = $this->fineService->getById($id, ['fineLogs', 'outlet']);
            $outlets = $this->outletService->getAll();

            return Inertia::render('Dashboard/Fines/Edit', [
                'fine' => new FineResource($fine),
                'outlets' => OutletResource::collection($outlets)->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[FineController] Failed to load fine edit form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'fine_controller_error',
            ]);

            return redirect()->route('fines.index')
                ->with('error', 'Gagal memuat formulir edit denda');
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateFineRequest $request, int $id): RedirectResponse
    {
        try {
            $this->fineService->update($id, $request->validated());

            return redirect()->route('fines.index')
                ->with('success', 'Denda berhasil diperbarui');
        } catch (Throwable $e) {
            Log::error('[FineController] Failed to update fine', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'fine_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(int $id): RedirectResponse
    {
        try {
            $this->fineService->destroy($id);

            return redirect()->route('fines.index')
                ->with('success', 'Denda berhasil dihapus');
        } catch (Throwable $e) {
            Log::error('[FineController] Failed to delete fine', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'fine_controller_error',
            ]);

            return redirect()->route('fines.index')
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Get filters from request
     */
    private function getFiltersFromRequest(Request $request): array
    {
        return [
            'search' => $request->string('search', ''),
            'page' => $request->integer('page', 1),
            'perPage' => $request->integer('perPage', 15),
            'sortBy' => $request->string('sortBy', 'createdAt')->toString(),
            'sortDirection' => $request->string('sortDirection', 'desc')->toString(),
            'outletId' => $request->has('outletId') && $request->filled('outletId')
                ? $request->integer('outletId')
                : null,
            'minAmount' => $request->has('minAmount') && $request->filled('minAmount')
                ? $request->float('minAmount')
                : null,
            'maxAmount' => $request->has('maxAmount') && $request->filled('maxAmount')
                ? $request->float('maxAmount')
                : null,
        ];
    }
}
