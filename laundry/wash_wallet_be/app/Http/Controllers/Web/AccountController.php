<?php

namespace App\Http\Controllers\Web;

use Illuminate\Routing\Attributes\Controllers\Middleware;

use App\Http\Controllers\Controller;
use App\Http\Requests\Account\StoreAccountRequest;
use App\Http\Requests\Account\UpdateAccountRequest;
use App\Http\Resources\Account\AccountResource;
use App\Services\AccountService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

#[Middleware('auth')]
class AccountController extends Controller
{
    public function __construct(private readonly AccountService $accountService) {}

    /**
     * Display a listing of accounts (tree structure)
     */
    public function index(Request $request): Response
    {
        try {
            $filters = [
                'search'          => $request->get('search'),
                'type'            => $request->get('type'),
                'isSystem'        => $request->get('isSystem'),
                'isTransactional' => $request->get('isTransactional'),
                'sortBy'          => $request->get('sortBy', 'code'),
                'sortDirection'   => $request->get('sortDirection', 'asc'),
            ];

            $accounts = $this->accountService->getAccountTree($filters);

            return Inertia::render('Dashboard/Accounts/Index', [
                'accounts' => AccountResource::collection($accounts)->resolve(),
                'filters'  => $filters,
                'accountTypes' => [
                    ['value' => 'asset',    'label' => 'Aset'],
                    ['value' => 'liability', 'label' => 'Kewajiban'],
                    ['value' => 'equity',   'label' => 'Modal'],
                    ['value' => 'revenue',  'label' => 'Pendapatan'],
                    ['value' => 'expense',  'label' => 'Beban'],
                ],
            ]);
        } catch (Throwable $e) {
            Log::error('[AccountController] Failed to load accounts index', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'account_controller_error',
            ]);

            return Inertia::render('Dashboard/Accounting/Accounts/Index', [
                'accounts'     => [],
                'filters'      => [],
                'accountTypes' => [],
                'error'        => 'Gagal memuat daftar akun. Silakan coba lagi.',
            ]);
        }
    }

    /**
     * Show the form for creating a new account
     */
    public function create(): Response
    {
        try {
            $accounts = $this->accountService->getAll();

            return Inertia::render('Dashboard/Accounting/Accounts/Create', [
                'accounts' => AccountResource::collection($accounts)->resolve(),
                'accountTypes' => [
                    ['value' => 'asset',    'label' => 'Aset'],
                    ['value' => 'liability', 'label' => 'Kewajiban'],
                    ['value' => 'equity',   'label' => 'Modal'],
                    ['value' => 'revenue',  'label' => 'Pendapatan'],
                    ['value' => 'expense',  'label' => 'Beban'],
                ],
            ]);
        } catch (Throwable $e) {
            Log::error('[AccountController] Failed to load create account form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'account_controller_error',
            ]);

            return Inertia::render('Dashboard/Accounting/Accounts/Create', [
                'accounts'     => [],
                'accountTypes' => [],
                'error'        => 'Gagal memuat form tambah akun. Silakan coba lagi.',
            ]);
        }
    }

    /**
     * Store a newly created account in storage
     */
    public function store(StoreAccountRequest $request): RedirectResponse
    {
        try {
            $account = $this->accountService->store($request->validated());

            return redirect()
                ->route('accounts.index')
                ->with('success', "Akun '{$account->name}' berhasil ditambahkan.");
        } catch (Throwable $e) {
            Log::error('[AccountController] Failed to store account', [
                'data'    => $request->validated(),
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'account_controller_error',
            ]);

            return redirect()
                ->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Display the specified account
     */
    public function show(int $id): Response
    {
        try {
            $account = $this->accountService->getById($id, [
                'owner',
                'parent',
                'children',
                'children.children',
            ]);

            return Inertia::render('Dashboard/Accounting/Accounts/Show', [
                'account' => new AccountResource($account),
            ]);
        } catch (ModelNotFoundException $e) {
            return Inertia::render('Dashboard/Accounting/Accounts/Show', [
                'account' => null,
                'error'   => 'Akun tidak ditemukan.',
            ]);
        } catch (Throwable $e) {
            Log::error('[AccountController] Failed to show account', [
                'account_id' => $id,
                'error'      => $e->getMessage(),
                'user_id'    => Auth::id(),
                'type'       => 'account_controller_error',
            ]);

            return Inertia::render('Dashboard/Accounting/Accounts/Show', [
                'account' => null,
                'error'   => 'Gagal memuat detail akun. Silakan coba lagi.',
            ]);
        }
    }

    /**
     * Show the form for editing the specified account
     */
    public function edit(int $id): Response
    {
        try {
            $account = $this->accountService->getById($id, ['parent', 'owner']);

            $ownerId  = $account->owner_id;
            $accounts = $this->accountService->getAll(['ownerId' => $ownerId]);
            $accounts = $accounts->filter(fn($acc) => $acc->id !== $id);

            return Inertia::render('Dashboard/Accounting/Accounts/Edit', [
                'account'      => new AccountResource($account),
                'accounts'     => AccountResource::collection($accounts),
                'accountTypes' => [
                    ['value' => 'asset',    'label' => 'Aset'],
                    ['value' => 'liability', 'label' => 'Kewajiban'],
                    ['value' => 'equity',   'label' => 'Modal'],
                    ['value' => 'revenue',  'label' => 'Pendapatan'],
                    ['value' => 'expense',  'label' => 'Beban'],
                ],
            ]);
        } catch (ModelNotFoundException $e) {
            return Inertia::render('Dashboard/Accounting/Accounts/Edit', [
                'account'      => null,
                'accounts'     => [],
                'accountTypes' => [],
                'error'        => 'Akun tidak ditemukan.',
            ]);
        } catch (Throwable $e) {
            Log::error('[AccountController] Failed to load edit account form', [
                'account_id' => $id,
                'error'      => $e->getMessage(),
                'user_id'    => Auth::id(),
                'type'       => 'account_controller_error',
            ]);

            return Inertia::render('Dashboard/Accounting/Accounts/Edit', [
                'account'      => null,
                'accounts'     => [],
                'accountTypes' => [],
                'error'        => 'Gagal memuat form edit akun. Silakan coba lagi.',
            ]);
        }
    }

    /**
     * Update the specified account in storage
     */
    public function update(UpdateAccountRequest $request, int $id): RedirectResponse
    {
        try {
            $validated = $request->validated();
            $account   = $this->accountService->update($id, $validated);

            Log::info('[AccountController] Account updated successfully', [
                'account_id'   => $id,
                'account_code' => $account->code,
                'user_id'      => Auth::id(),
                'type'         => 'account_controller',
            ]);

            return redirect()
                ->route('accounts.index')
                ->with('success', "Akun '{$account->name}' berhasil diperbarui.");
        } catch (Throwable $e) {
            Log::error('[AccountController] Failed to update account', [
                'account_id' => $id,
                'data'       => $request->validated(),
                'error'      => $e->getMessage(),
                'user_id'    => Auth::id(),
                'type'       => 'account_controller_error',
            ]);

            return redirect()
                ->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Remove the specified account from storage
     */
    public function destroy(int $id): RedirectResponse
    {
        try {
            $account     = $this->accountService->getById($id);
            $accountName = $account->name;

            $this->accountService->destroy($id);

            Log::info('[AccountController] Account deleted successfully', [
                'account_id'   => $id,
                'account_name' => $accountName,
                'user_id'      => Auth::id(),
                'type'         => 'account_controller',
            ]);

            return redirect()
                ->back()
                ->with('success', "Akun '{$accountName}' berhasil dihapus.");
        } catch (Throwable $e) {
            Log::error('[AccountController] Failed to delete account', [
                'account_id' => $id,
                'error'      => $e->getMessage(),
                'user_id'    => Auth::id(),
                'type'       => 'account_controller_error',
            ]);

            return redirect()
                ->back()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Generate default accounts for the authenticated owner
     */
    public function generateDefaults(): RedirectResponse
    {
        try {
            $user = Auth::user();
            $this->accountService->generateDefaultAccounts($user->id);

            Log::info('[AccountController] Default accounts generated', [
                'owner_id' => $user->id,
                'user_id'  => Auth::id(),
                'type'     => 'account_controller',
            ]);

            return redirect()
                ->route('accounts.index')
                ->with('success', 'Akun standar berhasil dibuat. Chart of Accounts siap digunakan!');
        } catch (Throwable $e) {
            Log::error('[AccountController] Failed to generate default accounts', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'account_controller_error',
            ]);

            return redirect()
                ->back()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Get accounts by parent ID (for dynamic dropdowns)
     */
    public function getByParent(Request $request): JsonResponse
    {
        try {
            $parentId = $request->get('parentId');

            if (!$parentId) {
                return $this->errorResponse('Parent ID is required', 422);
            }

            $parent = $this->accountService->getById($parentId, ['children']);

            return $this->successResponse(
                AccountResource::collection($parent->children)->resolve(),
                'Children accounts retrieved successfully'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Parent account not found', 404, $e);
        } catch (Throwable $e) {
            Log::error('[AccountController] Failed to get children accounts', [
                'parent_id' => $request->get('parentId'),
                'error'     => $e->getMessage(),
                'user_id'   => Auth::id(),
                'type'      => 'account_controller_error',
            ]);

            return $this->errorResponse('Failed to get children accounts', 500, $e);
        }
    }
}
