<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web\Admin;

use App\Helpers\PaginationHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\WithdrawalBank\StoreWithdrawalBankRequest;
use App\Http\Requests\WithdrawalBank\UpdateWithdrawalBankRequest;
use App\Http\Resources\WithdrawalBank\WithdrawalBankResource;
use App\Services\WithdrawalBankService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Attributes\Controllers\Middleware;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

#[Middleware('auth')]
#[Middleware('role:super_admin')]
class WithdrawalBankController extends Controller
{
    public function __construct(
        private readonly WithdrawalBankService $withdrawalBankService,
    ) {}

    public function index(Request $request): Response
    {
        try {
            $filters = $this->getFiltersFromRequest($request);
            $banks = $this->withdrawalBankService->getAll($filters);

            return Inertia::render('Dashboard/Admin/WithdrawalBanks/Index', [
                'banks' => [
                    'data' => WithdrawalBankResource::collection($banks->items())->resolve(),
                    'meta' => PaginationHelper::format($banks, $request),
                ],
                'filters' => $filters,
            ]);
        } catch (Throwable $e) {
            Log::error('[WithdrawalBankController] Failed to load banks index', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'withdrawal_bank_controller_error',
            ]);

            return Inertia::render('Dashboard/Admin/WithdrawalBanks/Index', [
                'banks'   => ['data' => [], 'meta' => []],
                'filters' => $this->getFiltersFromRequest($request),
                'error'   => 'Gagal memuat data bank master.',
            ]);
        }
    }

    public function create(): Response|RedirectResponse
    {
        try {
            return Inertia::render('Dashboard/Admin/WithdrawalBanks/Create');
        } catch (Throwable $e) {
            Log::error('[WithdrawalBankController] Failed to load create form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'withdrawal_bank_controller_error',
            ]);

            return redirect()->route('admin.withdrawal-banks.index')
                ->with('error', 'Gagal memuat formulir tambah bank master.');
        }
    }

    public function store(StoreWithdrawalBankRequest $request): RedirectResponse
    {
        try {
            $this->withdrawalBankService->store($request->validated());

            return redirect()->route('admin.withdrawal-banks.index')
                ->with('success', 'Bank master berhasil ditambahkan.');
        } catch (Throwable $e) {
            Log::error('[WithdrawalBankController] Failed to store bank', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'withdrawal_bank_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    public function edit(int $id): Response|RedirectResponse
    {
        try {
            $bank = $this->withdrawalBankService->getById($id);

            return Inertia::render('Dashboard/Admin/WithdrawalBanks/Edit', [
                'bank' => (new WithdrawalBankResource($bank))->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[WithdrawalBankController] Failed to load edit form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'withdrawal_bank_controller_error',
                'id'      => $id,
            ]);

            return redirect()->route('admin.withdrawal-banks.index')
                ->with('error', 'Bank master tidak ditemukan.');
        }
    }

    public function update(UpdateWithdrawalBankRequest $request, int $id): RedirectResponse
    {
        try {
            $this->withdrawalBankService->update($id, $request->validated());

            return redirect()->route('admin.withdrawal-banks.index')
                ->with('success', 'Bank master berhasil diperbarui.');
        } catch (Throwable $e) {
            Log::error('[WithdrawalBankController] Failed to update bank', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'withdrawal_bank_controller_error',
                'id'      => $id,
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    public function destroy(int $id): RedirectResponse
    {
        try {
            $this->withdrawalBankService->destroy($id);

            return redirect()->route('admin.withdrawal-banks.index')
                ->with('success', 'Bank master berhasil dihapus.');
        } catch (Throwable $e) {
            Log::error('[WithdrawalBankController] Failed to delete bank', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'withdrawal_bank_controller_error',
                'id'      => $id,
            ]);

            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    private function getFiltersFromRequest(Request $request): array
    {
        return [
            'search'        => $request->string('search')->toString(),
            'page'          => $request->integer('page', 1),
            'perPage'       => $request->integer('perPage', 15),
            'sortBy'        => $request->string('sortBy', 'created_at')->toString(),
            'sortDirection' => $request->string('sortDirection', 'desc')->toString(),
        ];
    }
}
