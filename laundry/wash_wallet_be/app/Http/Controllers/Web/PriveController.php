<?php

namespace App\Http\Controllers\Web;

use Illuminate\Routing\Attributes\Controllers\Middleware;

use App\Helpers\PaginationHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\Prive\StorePriveRequest;
use App\Http\Requests\Prive\UpdatePriveRequest;
use App\Http\Resources\Account\AccountResource;
use App\Http\Resources\Outlet\OutletResource;
use App\Http\Resources\Prive\PriveResource;
use App\Services\AccountService;
use App\Services\OutletService;
use App\Services\PriveService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

#[Middleware('auth')]
class PriveController extends Controller
{
    public function __construct(private readonly PriveService $priveService, private readonly OutletService $outletService, private readonly AccountService $accountService) {}

    public function index(Request $request): Response
    {
        try {
            $filters = $this->getFiltersFromRequest($request);

            $prives = $this->priveService->getAll(
                filters: $filters,
                page: $filters['page'],
                perPage: $filters['perPage'],
                relations: ['outlet:id,name,code', 'user:id,name', 'sourceAccount', 'equityAccount']
            );

            $outlets = $this->outletService->getAll();

            $sourceAccounts = $this->accountService->getAll([
                'ownerId' => Auth::id(),
                'type'            => 'asset',
                'isTransactional' => true,
            ]);

            $equityAccounts = $this->accountService->getAll([
                'ownerId' => Auth::id(),
                'type' => 'equity',
            ]);

            return Inertia::render('Dashboard/Prives/Index', [
                'prives' => [
                    'data' => PriveResource::collection($prives->items())->resolve(),
                    'meta' => PaginationHelper::format($prives, $request),
                ],
                'filterOptions' => [
                    'outlets'        => OutletResource::collection($outlets)->resolve(),
                    'sourceAccounts' => AccountResource::collection($sourceAccounts)->resolve(),
                    'equityAccounts' => AccountResource::collection($equityAccounts)->resolve(),
                ],
                'filters' => [
                    'search'          => $filters['search'] ?? '',
                    'outletId'        => $filters['outletId'] ?? null,
                    'sourceAccountId' => $filters['sourceAccountId'] ?? null,
                    'equityAccountId' => $filters['equityAccountId'] ?? null,
                    'startDate'       => $filters['startDate'] ?? null,
                    'endDate'         => $filters['endDate'] ?? null,
                    'minAmount'       => $filters['minAmount'] ?? null,
                    'maxAmount'       => $filters['maxAmount'] ?? null,
                    'sortBy'          => $filters['sortBy'] ?? 'date',
                    'sortDirection'   => $filters['sortDirection'] ?? 'desc',
                ],
                'flash' => [
                    'success' => session('success'),
                    'error'   => session('error'),
                ],
            ]);
        } catch (Throwable $e) {
            Log::error('[PriveController] Failed to load prives index', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'prive_controller_error',
            ]);

            return Inertia::render('Dashboard/Prives/Index', [
                'prives' => [
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
                    'outlets'        => [],
                    'sourceAccounts' => [],
                    'equityAccounts' => [],
                ],
                'filters' => [],
                'flash'   => [
                    'error' => 'Gagal memuat data prive. Silakan coba lagi.',
                ],
            ]);
        }
    }

    public function create(): Response|RedirectResponse
    {
        try {
            $outlets = $this->outletService->getAll(Auth::id());

            $sourceAccounts = $this->accountService->getAll([
                'ownerId' => Auth::id(),
                'type' => 'asset',
                'isTransactional' => true,
            ]);

            $equityAccounts = $this->accountService->getAll([
                'ownerId' => Auth::id(),
                'type' => 'equity',
            ]);

            return Inertia::render('Dashboard/Prives/Create', [
                'outlets'        => OutletResource::collection($outlets)->resolve(),
                'sourceAccounts' => AccountResource::collection($sourceAccounts)->resolve(),
                'equityAccounts' => AccountResource::collection($equityAccounts)->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[PriveController] Failed to load prive create form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'prive_controller_error',
            ]);

            return redirect()->route('prives.index')
                ->with('error', 'Gagal memuat formulir pembuatan Prive');
        }
    }

    public function store(StorePriveRequest $request): RedirectResponse
    {
        try {
            $prive = $this->priveService->store($request->validated());

            return redirect()->route('prives.index')
                ->with('success', 'Prive berhasil ditambahkan');
        } catch (Throwable $e) {
            Log::error('[PriveController] Failed to create prive', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'prive_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    public function show(Request $request, int $id): Response|RedirectResponse
    {
        try {
            $prive = $this->priveService->getById(
                id: $id,
                relations: [
                    'outlet:id,name,code',
                    'user:id,name,email',
                    'sourceAccount',
                    'equityAccount',
                ]
            );

            return Inertia::render('Dashboard/Prives/Show', [
                'prive' => (new PriveResource($prive))->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[PriveController] Failed to show prive', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'prive_controller_error',
            ]);

            return redirect()->route('prives.index')
                ->with('error', 'Prive tidak ditemukan atau akses ditolak');
        }
    }

    public function edit(int $id): Response|RedirectResponse
    {
        try {
            $prive = $this->priveService->getById(
                id: $id,
                relations: ['outlet:id,name', 'sourceAccount', 'equityAccount']
            );

            $outlets = $this->outletService->getAll();

            $sourceAccounts = $this->accountService->getAll([
                'ownerId' => Auth::id(),
                'type' => 'asset',
                'isTransactional' => true,
            ]);

            $equityAccounts = $this->accountService->getAll([
                'ownerId' => Auth::id(),
                'type' => 'equity',
            ]);

            return Inertia::render('Dashboard/Prives/Edit', [
                'prive'          => (new PriveResource($prive))->resolve(),
                'outlets'        => OutletResource::collection($outlets)->resolve(),
                'sourceAccounts' => AccountResource::collection($sourceAccounts)->resolve(),
                'equityAccounts' => AccountResource::collection($equityAccounts)->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[PriveController] Failed to load prive edit form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'prive_controller_error',
            ]);

            return redirect()->route('prives.index')
                ->with('error', 'Prive tidak ditemukan atau akses ditolak');
        }
    }

    public function update(UpdatePriveRequest $request, int $id): RedirectResponse
    {
        try {
            $prive = $this->priveService->update(
                id: $id,
                data: $request->validated()
            );

            return redirect()->route('prives.index')
                ->with('success', 'Data Prive berhasil diperbarui');
        } catch (Throwable $e) {
            Log::error('[PriveController] Failed to update prive', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'prive_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    public function destroy(Request $request, int $id): RedirectResponse
    {
        try {
            $deleted = $this->priveService->destroy($id);

            if ($deleted) {
                return redirect()->route('prives.index')
                    ->with('success', 'Prive berhasil dihapus');
            }

            return redirect()->back()
                ->with('error', 'Gagal menghapus Prive');
        } catch (Throwable $e) {
            Log::error('[PriveController] Failed to delete prive', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'prive_controller_error',
            ]);

            return redirect()->back()
                ->with('error', $e->getMessage());
        }
    }

    public function restore(Request $request, int $id): RedirectResponse
    {
        try {
            $prive = $this->priveService->restore($id);

            Log::info('Prive restored via web interface', [
                'prive_id'    => $id,
                'outlet_id'   => $prive->outlet_id,
                'restored_by' => $request->user()?->id,
                'type'        => 'prive_web_action',
            ]);

            return redirect()->route('prives.show', $prive->id)
                ->with('success', 'Prive berhasil dipulihkan');
        } catch (Throwable $e) {
            Log::error('[PriveController] Failed to restore prive', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'prive_controller_error',
            ]);

            return redirect()->back()
                ->with('error', $e->getMessage());
        }
    }

    public function forceDestroy(Request $request, int $id): RedirectResponse
    {
        try {
            $deleted = $this->priveService->forceDestroy($id);

            if ($deleted) {
                Log::info('Prive permanently deleted via web interface', [
                    'prive_id'   => $id,
                    'deleted_by' => $request->user()?->id,
                    'type'       => 'prive_web_action',
                ]);

                return redirect()->route('prives.index')
                    ->with('success', 'Prive berhasil dihapus permanen');
            }

            return redirect()->back()
                ->with('error', 'Gagal menghapus Prive secara permanen');
        } catch (Throwable $e) {
            Log::error('[PriveController] Failed to force delete prive', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'prive_controller_error',
            ]);

            return redirect()->back()
                ->with('error', $e->getMessage());
        }
    }

    private function getFiltersFromRequest(Request $request): array
    {
        return [
            'search'   => $request->string('search')->toString(),
            'outletId' => $request->has('outletId') && $request->filled('outletId')
                ? $request->integer('outletId')
                : null,
            'sourceAccountId' => $request->has('sourceAccountId') && $request->filled('sourceAccountId')
                ? $request->integer('sourceAccountId')
                : null,
            'equityAccountId' => $request->has('equityAccountId') && $request->filled('equityAccountId')
                ? $request->integer('equityAccountId')
                : null,
            'startDate' => $request->has('startDate') && $request->filled('startDate')
                ? $request->string('startDate')->toString()
                : null,
            'endDate' => $request->has('endDate') && $request->filled('endDate')
                ? $request->string('endDate')->toString()
                : null,
            'minAmount' => $request->has('minAmount') && $request->filled('minAmount')
                ? $request->float('minAmount')
                : null,
            'maxAmount' => $request->has('maxAmount') && $request->filled('maxAmount')
                ? $request->float('maxAmount')
                : null,
            'sortBy'        => $request->string('sortBy', 'date')->toString(),
            'sortDirection' => $request->string('sortDirection', 'desc')->toString(),
            'page'          => $request->integer('page', 1),
            'perPage'       => $request->integer('perPage', 15),
        ];
    }
}
