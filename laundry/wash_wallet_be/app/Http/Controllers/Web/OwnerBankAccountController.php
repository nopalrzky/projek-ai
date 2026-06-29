<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Helpers\PaginationHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\OwnerBankAccount\StoreOwnerBankAccountRequest;
use App\Http\Requests\OwnerBankAccount\UpdateOwnerBankAccountRequest;
use App\Http\Resources\OwnerBankAccount\OwnerBankAccountResource;
use App\Http\Resources\WithdrawalBank\WithdrawalBankResource;
use App\Services\OwnerBankAccountService;
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
class OwnerBankAccountController extends Controller
{
    public function __construct(
        private readonly OwnerBankAccountService $ownerBankAccountService,
        private readonly WithdrawalBankService $withdrawalBankService,
    ) {}

    public function index(Request $request): Response
    {
        try {
            $filters = $this->getFiltersFromRequest($request);
            $accounts = $this->ownerBankAccountService->getAll($filters);

            return Inertia::render('Dashboard/BankAccounts/Index', [
                'accounts' => [
                    'data' => OwnerBankAccountResource::collection($accounts->items())->resolve(),
                    'meta' => PaginationHelper::format($accounts, $request),
                ],
                'filters' => $filters,
            ]);
        } catch (Throwable $e) {
            Log::error('[OwnerBankAccountController] Failed to load bank accounts index', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'owner_bank_account_controller_error',
            ]);

            return Inertia::render('Dashboard/BankAccounts/Index', [
                'accounts' => ['data' => [], 'meta' => []],
                'filters'  => $this->getFiltersFromRequest($request),
                'error'    => 'Gagal memuat data rekening.',
            ]);
        }
    }

    public function create(): Response|RedirectResponse
    {
        try {
            $banks = $this->withdrawalBankService->getActiveBanks();

            return Inertia::render('Dashboard/BankAccounts/Create', [
                'banks' => WithdrawalBankResource::collection($banks)->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[OwnerBankAccountController] Failed to load create form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'owner_bank_account_controller_error',
            ]);

            return redirect()->route('bank-accounts.index')
                ->with('error', 'Gagal memuat formulir tambah rekening.');
        }
    }

    public function store(StoreOwnerBankAccountRequest $request): RedirectResponse
    {
        try {
            $this->ownerBankAccountService->store($request->validated());

            return redirect()->route('bank-accounts.index')
                ->with('success', 'Rekening bank berhasil ditambahkan.');
        } catch (Throwable $e) {
            Log::error('[OwnerBankAccountController] Failed to store bank account', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'owner_bank_account_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    public function edit(int $id): Response|RedirectResponse
    {
        try {
            $account = $this->ownerBankAccountService->getById($id);
            $banks = $this->withdrawalBankService->getActiveBanks();

            return Inertia::render('Dashboard/BankAccounts/Edit', [
                'account' => (new OwnerBankAccountResource($account))->resolve(),
                'banks'   => WithdrawalBankResource::collection($banks)->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[OwnerBankAccountController] Failed to load edit form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'owner_bank_account_controller_error',
                'id'      => $id,
            ]);

            return redirect()->route('bank-accounts.index')
                ->with('error', 'Rekening bank tidak ditemukan.');
        }
    }

    public function update(UpdateOwnerBankAccountRequest $request, int $id): RedirectResponse
    {
        try {
            $this->ownerBankAccountService->update($id, $request->validated());

            return redirect()->route('bank-accounts.index')
                ->with('success', 'Rekening bank berhasil diperbarui.');
        } catch (Throwable $e) {
            Log::error('[OwnerBankAccountController] Failed to update bank account', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'owner_bank_account_controller_error',
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
            $this->ownerBankAccountService->destroy($id);

            return redirect()->route('bank-accounts.index')
                ->with('success', 'Rekening bank berhasil dihapus.');
        } catch (Throwable $e) {
            Log::error('[OwnerBankAccountController] Failed to delete bank account', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'owner_bank_account_controller_error',
                'id'      => $id,
            ]);

            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function setDefault(int $id): RedirectResponse
    {
        try {
            $this->ownerBankAccountService->setDefault($id);

            return redirect()->back()
                ->with('success', 'Rekening utama berhasil diperbarui.');
        } catch (Throwable $e) {
            Log::error('[OwnerBankAccountController] Failed to set default bank account', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'owner_bank_account_controller_error',
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
