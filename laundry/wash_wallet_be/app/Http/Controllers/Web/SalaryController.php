<?php

namespace App\Http\Controllers\Web;

use Illuminate\Routing\Attributes\Controllers\Middleware;

use App\Helpers\PaginationHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\Salary\StoreSalaryRequest;
use App\Http\Requests\Salary\UpdateSalaryRequest;
use App\Http\Resources\Salary\SalaryResource;
use App\Services\SalaryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

#[Middleware('auth')]
#[Middleware('role:super_admin')]
class SalaryController extends Controller
{
    public function __construct(private readonly SalaryService $salaryService) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        try {
            $filters = $this->getFiltersFromRequest($request);
            $salaries = $this->salaryService->getAll(
                $filters,
                $request->integer('page', 1),
                $request->integer('perPage', 15),
                ['employeeSalaries']
            );

            return Inertia::render('Dashboard/Salaries/Index', [
                'salaries' => [
                    'data' => SalaryResource::collection($salaries->items())->resolve(),
                    'meta' => PaginationHelper::format($salaries, $request),
                ],
                'filters' => [
                    'search'        => $filters['search'],
                    'type'          => $filters['type'],
                    'sortBy'        => $filters['sortBy'] ?? 'created_at',
                    'sortDirection' => $filters['sortDirection'] ?? 'desc',
                ],
                'flash' => [
                    'success' => session('success'),
                    'error'   => session('error'),
                ],
            ]);
        } catch (Throwable $e) {
            Log::error('[SalaryController] Failed to load salaries index', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'salary_controller_error',
            ]);

            return Inertia::render('Dashboard/Salaries/Index', [
                'salaries'   => collect(),
                'statistics' => [],
                'filters'    => [],
                'error'      => 'Failed to load salaries data',
            ]);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response|RedirectResponse
    {
        try {
            return Inertia::render('Dashboard/Salaries/Create');
        } catch (Throwable $e) {
            Log::error('[SalaryController] Failed to load salary create form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'salary_controller_error',
            ]);

            return redirect()->route('salaries.index')
                ->with('error', 'Gagal memuat formulir pembuatan salary');
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSalaryRequest $request): RedirectResponse
    {
        try {
            $this->salaryService->store($request->validated());

            return redirect()->route('salaries.index')
                ->with('success', 'Salary berhasil dibuat');
        } catch (Throwable $e) {
            Log::error('[SalaryController] Failed to store new salary', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'salary_controller_error',
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
            $salary = $this->salaryService->getById($id, ['employeeSalaries']);

            return Inertia::render('Dashboard/Salaries/Show', [
                'salary' => new SalaryResource($salary),
            ]);
        } catch (Throwable $e) {
            Log::error('[SalaryController] Failed to load salary show page', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'salary_controller_error',
            ]);

            return redirect()->route('salaries.index')
                ->with('error', 'Gagal memuat data salary');
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(int $id): Response|RedirectResponse
    {
        try {
            $salary = $this->salaryService->getById($id);

            return Inertia::render('Dashboard/Salaries/Edit', [
                'salary' => new SalaryResource($salary),
            ]);
        } catch (Throwable $e) {
            Log::error('[SalaryController] Failed to load salary edit form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'salary_controller_error',
            ]);

            return redirect()->route('salaries.index')
                ->with('error', 'Gagal memuat formulir edit salary');
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSalaryRequest $request, int $id): RedirectResponse
    {
        try {
            $this->salaryService->update($id, $request->validated());

            return redirect()->route('salaries.index')
                ->with('success', 'Salary berhasil diperbarui');
        } catch (Throwable $e) {
            Log::error('[SalaryController] Failed to update salary', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'salary_controller_error',
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
            $this->salaryService->destroy($id);

            return redirect()->route('salaries.index')
                ->with('success', 'Salary berhasil dihapus');
        } catch (Throwable $e) {
            Log::error('[SalaryController] Failed to delete salary', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'salary_controller_error',
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
            'search'        => $request->string('search'),
            'type'          => $request->string('type') ?: null,
            'sortBy'        => $request->string('sortBy', 'created_at'),
            'sortDirection' => $request->string('sortDirection', 'desc'),
        ];
    }
}
