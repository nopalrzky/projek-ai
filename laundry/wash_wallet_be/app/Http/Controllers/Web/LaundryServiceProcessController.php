<?php

namespace App\Http\Controllers\Web;

use Illuminate\Routing\Attributes\Controllers\Middleware;

use App\Helpers\PaginationHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\LaundryServiceProcess\StoreLaundryServiceProcessRequest;
use App\Http\Requests\LaundryServiceProcess\UpdateLaundryServiceProcessRequest;
use App\Http\Resources\LaundryService\LaundryServiceResource;
use App\Http\Resources\LaundryServiceProcess\LaundryServiceProcessResource;
use App\Http\Resources\Process\ProcessResource;
use App\Services\LaundryServiceProcessService;
use App\Services\LaundryServiceService;
use App\Services\ProcessService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

#[Middleware('auth')]
class LaundryServiceProcessController extends Controller
{
    public function __construct(private readonly LaundryServiceProcessService $laundryServiceProcessService, private readonly LaundryServiceService $laundryServiceService, private readonly ProcessService $processService) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        try {
            $filters = $this->getFiltersFromRequest($request);

            $laundryServiceProcesses = $this->laundryServiceProcessService->getAll(
                filters: $filters,
                page: $filters['page'],
                perPage: $filters['perPage'],
                relations: ['laundryService.category.outlet', 'process']
            );

            $laundryServices = $this->laundryServiceService->getAll(
                relations: ['category.outlet', 'unit']
            );

            $processes = $this->processService->getAll([
                'isActive' => true,
            ]);

            return Inertia::render('Dashboard/LaundryServiceProcesses/Index', [
                'laundryServiceProcesses' => [
                    'data' => LaundryServiceProcessResource::collection($laundryServiceProcesses->items())->resolve(),
                    'meta' => PaginationHelper::format($laundryServiceProcesses, $request),
                ],
                'filterOptions' => [
                    'laundryServices' => LaundryServiceResource::collection($laundryServices)->resolve(),
                    'processes' => ProcessResource::collection($processes)->resolve(),
                ],
                'filters' => [
                    'search' => $filters['search'] ?? '',
                    'laundryServiceId' => $filters['laundryServiceId'] ?? null,
                    'processId' => $filters['processId'] ?? null,
                    'sortBy' => $filters['sortBy'] ?? 'sequence',
                    'sortDirection' => $filters['sortDirection'] ?? 'asc',
                ],
                'flash' => [
                    'success' => session('success'),
                    'error' => session('error'),
                ],
            ]);
        } catch (Throwable $e) {
            Log::error('[LaundryServiceProcessController] Failed to load laundry service processes index', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'laundry_service_process_controller_error',
            ]);

            return Inertia::render('Dashboard/LaundryServiceProcesses/Index', [
                'laundryServiceProcesses' => [
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
                    'laundryServices' => [],
                    'processes' => [],
                ],
                'filters' => [],
                'error' => 'Gagal memuat data. Silakan coba lagi.',
            ]);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response|RedirectResponse
    {
        try {
            $laundryServices = $this->laundryServiceService->getAll(
                relations: ['category.outlet', 'unit']
            );

            $processes = $this->processService->getAll();

            return Inertia::render('Dashboard/LaundryServiceProcesses/Create', [
                'laundryServices' => LaundryServiceResource::collection($laundryServices)->resolve(),
                'processes' => ProcessResource::collection($processes)->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[LaundryServiceProcessController] Failed to load laundry service process create form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'laundry_service_process_controller_error',
            ]);

            return redirect()->route('laundry-service-processes.index')
                ->with('error', 'Gagal memuat formulir pembuatan proses layanan');
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreLaundryServiceProcessRequest $request): RedirectResponse
    {
        try {
            $laundryServiceProcess = $this->laundryServiceProcessService->store($request->validated());

            return redirect()->route('laundry-services.show', $request->input('laundryServiceId'))
                ->with('success', "Proses '{$laundryServiceProcess->process->name}' berhasil ditambahkan ke layanan");
        } catch (Throwable $e) {
            Log::error('[LaundryServiceProcessController] Failed to create laundry service process', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'laundry_service_process_controller_error',
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
            $laundryServiceProcess = $this->laundryServiceProcessService->getById(
                $id,
                ['laundryService.category.outlet', 'laundryService.unit', 'process']
            );

            return Inertia::render('Dashboard/LaundryServiceProcesses/Show', [
                'laundryServiceProcess' => (new LaundryServiceProcessResource($laundryServiceProcess))->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[LaundryServiceProcessController] Failed to show laundry service process', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'laundry_service_process_controller_error',
            ]);

            return redirect()->route('laundry-service-processes.index')
                ->with('error', 'Proses layanan tidak ditemukan atau akses ditolak');
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(int $id): Response|RedirectResponse
    {
        try {
            $laundryServiceProcess = $this->laundryServiceProcessService->getById(
                $id,
                ['laundryService.category.outlet', 'laundryService.unit', 'process']
            );

            $processes = $this->processService->getAll([
                'isActive' => true,
            ]);

            $currentProcesses = $this->laundryServiceProcessService->getAll(
                filters: ['laundryServiceId' => $laundryServiceProcess->laundry_service_id],
                relations: ['process']
            );

            $assignedProcessIds = $currentProcesses
                ->pluck('process_id')
                ->reject(fn($processId) => $processId === $laundryServiceProcess->process_id)
                ->toArray();

            $availableProcesses = $processes->filter(function ($process) use ($assignedProcessIds) {
                return !in_array($process->id, $assignedProcessIds);
            });

            return Inertia::render('Dashboard/LaundryServiceProcesses/Edit', [
                'laundryServiceProcess' => (new LaundryServiceProcessResource($laundryServiceProcess))->resolve(),
                'processes' => ProcessResource::collection($availableProcesses)->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[LaundryServiceProcessController] Failed to load laundry service process edit form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'laundry_service_process_controller_error',
            ]);

            return redirect()->route('laundry-service-processes.index')
                ->with('error', 'Proses layanan tidak ditemukan atau akses ditolak');
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateLaundryServiceProcessRequest $request, int $id): RedirectResponse
    {
        try {
            $laundryServiceProcess = $this->laundryServiceProcessService->update(
                id: $id,
                data: $request->validated()
            );

            return redirect()->route('laundry-services.show', $laundryServiceProcess->laundry_service_id)
                ->with('success', "Proses '{$laundryServiceProcess->process->name}' berhasil diperbarui");
        } catch (Throwable $e) {
            Log::error('[LaundryServiceProcessController] Failed to update laundry service process', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'laundry_service_process_controller_error',
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
            $laundryServiceProcess = $this->laundryServiceProcessService->getById($id);
            $laundryServiceId = $laundryServiceProcess->laundry_service_id;

            $deleted = $this->laundryServiceProcessService->destroy($id);

            if ($deleted) {
                return redirect()->route('laundry-services.show', $laundryServiceId)
                    ->with('success', 'Proses berhasil dihapus dari layanan');
            }

            return redirect()->back()
                ->with('error', 'Gagal menghapus proses');
        } catch (Throwable $e) {
            Log::error('[LaundryServiceProcessController] Failed to delete laundry service process', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'laundry_service_process_controller_error',
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
            'search' => $request->string('search')->toString(),
            'laundryServiceId' => $request->has('laundryServiceId') && $request->filled('laundryServiceId')
                ? $request->integer('laundryServiceId')
                : null,
            'processId' => $request->has('processId') && $request->filled('processId')
                ? $request->integer('processId')
                : null,
            'startDate' => $request->has('startDate') && $request->filled('startDate')
                ? $request->string('startDate')->toString()
                : null,
            'endDate' => $request->has('endDate') && $request->filled('endDate')
                ? $request->string('endDate')->toString()
                : null,
            'sortBy' => $request->string('sortBy', 'sequence')->toString(),
            'sortDirection' => $request->string('sortDirection', 'asc')->toString(),
            'page' => $request->integer('page', 1),
            'perPage' => $request->integer('perPage', 15),
        ];
    }
}
