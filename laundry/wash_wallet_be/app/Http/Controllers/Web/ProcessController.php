<?php

namespace App\Http\Controllers\Web;

use Illuminate\Routing\Attributes\Controllers\Middleware;

use App\Helpers\PaginationHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\Process\StoreProcessRequest;
use App\Http\Requests\Process\UpdateProcessRequest;
use App\Http\Resources\Process\ProcessResource;
use App\Services\ProcessService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

#[Middleware('auth')]
class ProcessController extends Controller
{
    public function __construct(private readonly ProcessService $processService) {}

    public function index(Request $request): Response
    {
        try {
            $filters = $this->getFiltersFromRequest($request);

            $processes = $this->processService->getAll(
                filters: $filters,
                page: $filters['page'],
                perPage: $filters['perPage'],
                relations: ['laundryServices', 'employees']
            );

            return Inertia::render('Dashboard/Processes/Index', [
                'processes' => [
                    'data' => ProcessResource::collection($processes->items())->resolve(),
                    'meta' => PaginationHelper::format($processes, $request),
                ],
                'filterOptions' => [
                    'statusOptions' => [
                        ['value' => 'true', 'label' => 'Aktif'],
                        ['value' => 'false', 'label' => 'Nonaktif'],
                    ],
                ],
                'filters' => [
                    'search' => $filters['search'] ?? '',
                    'isActive' => $filters['isActive'] ?? null,
                    'sortBy' => $filters['sortBy'] ?? 'created_at',
                    'sortDirection' => $filters['sortDirection'] ?? 'desc',
                ],
                'flash' => [
                    'success' => session('success'),
                    'error' => session('error'),
                ],
            ]);
        } catch (Throwable $e) {
            Log::error('[ProcessController] Failed to load processes index', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'process_controller_error',
            ]);

            return Inertia::render('Dashboard/Processes/Index', [
                'processes' => [
                    'data' => [],
                    'meta' => [
                        'current_page' => 1,
                        'from' => 0,
                        'last_page' => 1,
                        'per_page' => 15,
                        'to' => 0,
                        'total' => 0,
                    ],
                ],
                'filterOptions' => [
                    'statusOptions' => [
                        ['value' => 'true', 'label' => 'Aktif'],
                        ['value' => 'false', 'label' => 'Nonaktif'],
                    ],
                ],
                'filters' => [],
                'error' => 'Gagal memuat data. Silakan coba lagi.',
            ]);
        }
    }

    public function create(): Response|RedirectResponse
    {
        try {
            return Inertia::render('Dashboard/Processes/Create');
        } catch (Throwable $e) {
            Log::error('[ProcessController] Failed to load process create form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'process_controller_error',
            ]);

            return redirect()->route('processes.index')
                ->with('error', 'Gagal memuat formulir pembuatan proses');
        }
    }

    public function store(StoreProcessRequest $request): RedirectResponse
    {
        try {
            $process = $this->processService->store($request->validated());

            return redirect()->route('processes.index')
                ->with('success', "Proses '{$process->name}' berhasil dibuat");
        } catch (Throwable $e) {
            Log::error('[ProcessController] Failed to create process', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'process_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    public function show(int $id): Response|RedirectResponse
    {
        try {
            $process = $this->processService->getProcessById(
                $id,
                [
                    'laundryServices',
                    'laundryServices.category',
                    'laundryServices.unit',
                    'employees',
                    'employees.outlet',
                    'employeeProcessCommissions',
                ]
            );

            return Inertia::render('Dashboard/Processes/Show', [
                'process' => (new ProcessResource($process))->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[ProcessController] Failed to show process', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'process_controller_error',
            ]);

            return redirect()->route('processes.index')
                ->with('error', 'Proses tidak ditemukan');
        }
    }

    public function edit(int $id): Response|RedirectResponse
    {
        try {
            $process = $this->processService->getProcessById($id);

            return Inertia::render('Dashboard/Processes/Edit', [
                'process' => (new ProcessResource($process))->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[ProcessController] Failed to load process edit form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'process_controller_error',
            ]);

            return redirect()->route('processes.index')
                ->with('error', 'Proses tidak ditemukan');
        }
    }

    public function update(UpdateProcessRequest $request, int $id): RedirectResponse
    {
        try {
            $process = $this->processService->update(
                id: $id,
                data: $request->validated()
            );

            return redirect()->route('processes.index')
                ->with('success', "Proses '{$process->name}' berhasil diperbarui");
        } catch (Throwable $e) {
            Log::error('[ProcessController] Failed to update process', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'process_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    public function destroy(int $id): RedirectResponse
    {
        try {
            $deleted = $this->processService->destroy($id);

            if ($deleted) {
                return redirect()->route('processes.index')
                    ->with('success', 'Proses berhasil dihapus');
            }

            return redirect()->back()
                ->with('error', 'Gagal menghapus proses');
        } catch (Throwable $e) {
            Log::error('[ProcessController] Failed to delete process', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'process_controller_error',
            ]);

            return redirect()->back()
                ->with('error', $e->getMessage());
        }
    }

    private function getFiltersFromRequest(Request $request): array
    {
        return [
            'search' => $request->string('search')->toString(),
            'isActive' => $request->has('isActive') && $request->filled('isActive')
                ? $request->boolean('isActive')
                : null,
            'startDate' => $request->has('startDate') && $request->filled('startDate')
                ? $request->string('startDate')->toString()
                : null,
            'endDate' => $request->has('endDate') && $request->filled('endDate')
                ? $request->string('endDate')->toString()
                : null,
            'sortBy' => $request->string('sortBy', 'created_at')->toString(),
            'sortDirection' => $request->string('sortDirection', 'desc')->toString(),
            'page' => $request->integer('page', 1),
            'perPage' => $request->integer('perPage', 15),
        ];
    }
}
