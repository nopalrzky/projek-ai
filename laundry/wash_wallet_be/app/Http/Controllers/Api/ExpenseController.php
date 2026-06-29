<?php

namespace App\Http\Controllers\Api;

use App\Helpers\PaginationHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\Expense\StoreExpenseRequest;
use App\Http\Requests\Expense\UpdateExpenseRequest;
use App\Http\Resources\Expense\ExpenseResource;
use App\Services\ExpenseService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Throwable;

use Illuminate\Routing\Attributes\Controllers\Middleware;

#[Middleware('auth:sanctum')]
class ExpenseController extends Controller
{
    public function __construct(
        private readonly ExpenseService $expenseService,
    ) {}

    /**
     * Display a listing of expenses
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $this->getFilters($request);

            $expenses = $this->expenseService->getAll(
                filters: $filters,
                page: $filters['page'],
                perPage: $filters['perPage'],
                relations: ['outlet', 'employee', 'user', 'expenseAccount', 'sourceAccount', 'approvedBy']
            );

            return $this->successResponse(
                ExpenseResource::collection($expenses->items())->resolve(),
                'Expenses retrieved successfully',
                200,
                PaginationHelper::format($expenses, $request)
            );
        } catch (Throwable $e) {
            Log::error('[ExpenseController] Failed to retrieve expenses', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'expense',
            ]);

            return $this->errorResponse('Gagal memuat data pengeluaran', 500, $e);
        }
    }

    /**
     * Display the specified expense
     */
    public function show(int $id): JsonResponse
    {
        try {
            $expense = $this->expenseService->getById(
                $id,
                ['outlet', 'employee', 'user', 'expenseAccount', 'sourceAccount', 'approvedBy', 'journalEntry']
            );

            return $this->successResponse(
                (new ExpenseResource($expense))->resolve(),
                'Expense retrieved successfully'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[ExpenseController] Failed to retrieve expense', [
                'error'      => $e->getMessage(),
                'user_id'    => Auth::id(),
                'type'       => 'expense',
                'expense_id' => $id,
            ]);

            return $this->errorResponse('Gagal memuat data pengeluaran', 500, $e);
        }
    }

    /**
     * Store a newly created expense
     */
    public function store(StoreExpenseRequest $request): JsonResponse
    {
        try {
            $expense = $this->expenseService->store($request->validated());

            return $this->successResponse(
                (new ExpenseResource($expense->load(['outlet', 'employee', 'user', 'expenseAccount', 'sourceAccount'])))->resolve(),
                'Expense created successfully',
                201
            );
        } catch (Throwable $e) {
            Log::error('[ExpenseController] Failed to create expense', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'expense',
            ]);

            return $this->errorResponse('Gagal membuat data pengeluaran', 500, $e);
        }
    }

    /**
     * Update the specified expense
     */
    public function update(UpdateExpenseRequest $request, int $id): JsonResponse
    {
        try {
            $expense = $this->expenseService->update(
                $id,
                $request->validated(),
                $request->file('attachment')
            );

            return $this->successResponse(
                (new ExpenseResource($expense->load(['outlet', 'employee', 'user', 'expenseAccount', 'sourceAccount'])))->resolve(),
                'Expense updated successfully'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[ExpenseController] Failed to update expense', [
                'error'      => $e->getMessage(),
                'user_id'    => Auth::id(),
                'type'       => 'expense',
                'expense_id' => $id,
            ]);

            return $this->errorResponse('Gagal memperbarui data pengeluaran', 500, $e);
        }
    }

    /**
     * Helper: Get filters from request
     */
    private function getFilters(Request $request): array
    {
        return [
            'search'          => $request->string('search')->toString(),
            'outletId'        => $request->has('outletId') && $request->filled('outletId')
                ? $request->integer('outletId')
                : null,
            'employeeId'      => $request->has('employeeId') && $request->filled('employeeId')
                ? $request->integer('employeeId')
                : null,
            'expenseAccountId' => $request->has('expenseAccountId') && $request->filled('expenseAccountId')
                ? $request->integer('expenseAccountId')
                : null,
            'sourceAccountId' => $request->has('sourceAccountId') && $request->filled('sourceAccountId')
                ? $request->integer('sourceAccountId')
                : null,
            'status'          => $request->has('status') && $request->filled('status')
                ? $request->string('status')->toString()
                : null,
            'startDate'       => $request->has('startDate') && $request->filled('startDate')
                ? $request->string('startDate')->toString()
                : null,
            'endDate'         => $request->has('endDate') && $request->filled('endDate')
                ? $request->string('endDate')->toString()
                : null,
            'minAmount'       => $request->has('minAmount') && $request->filled('minAmount')
                ? $request->float('minAmount')
                : null,
            'maxAmount'       => $request->has('maxAmount') && $request->filled('maxAmount')
                ? $request->float('maxAmount')
                : null,
            'hasAttachment'   => $request->has('hasAttachment') && $request->filled('hasAttachment')
                ? $request->boolean('hasAttachment')
                : null,
            'sortBy'          => $request->string('sortBy', 'date')->toString(),
            'sortDirection'   => $request->string('sortDirection', 'desc')->toString(),
            'page'            => $request->integer('page', 1),
            'perPage'         => $request->integer('perPage', 15),
        ];
    }
}
