<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Employee\UpdateEmployeeRequest;
use App\Http\Resources\Employee\EmployeeResource;
use App\Services\EmployeeService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Throwable;

use Illuminate\Routing\Attributes\Controllers\Middleware;

#[Middleware('auth:sanctum')]
class EmployeeController extends Controller
{
    public function __construct(
        private readonly EmployeeService $employeeService,
    ) {}

    /**
     * Display a listing of employees.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $this->getFilters($request);

            $employees = $this->employeeService->getAll(
                filters: $filters
            );

            return $this->successResponse(
                EmployeeResource::collection($employees)->resolve(),
                'Employees fetched successfully'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[EmployeeController] Failed to fetch employees by outlet', [
                'error'     => $e->getMessage(),
                'user_id'   => Auth::id(),
                'type'      => 'employee_management',
                'filters'   => $filters ?? [],
            ]);

            return $this->errorResponse('Gagal memuat data karyawan untuk outlet', 500, $e);
        }
    }

    /**
     * Display the specified employee
     */
    public function show(int $id): JsonResponse
    {
        try {
            $employee = $this->employeeService->getById($id);

            return $this->successResponse(
                (new EmployeeResource($employee))->resolve(),
                'Employee fetched successfully'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[EmployeeController] Failed to fetch employee', [
                'error'       => $e->getMessage(),
                'user_id'     => Auth::id(),
                'type'        => 'employee_management',
                'employee_id' => $id,
            ]);

            return $this->errorResponse('Gagal memuat data karyawan', 500, $e);
        }
    }

    /**
     * Update the specified employee
     */
    public function update(UpdateEmployeeRequest $request, int $id): JsonResponse
    {
        try {
            $employee = $this->employeeService->update($id, $request->validated());

            return $this->successResponse(
                (new EmployeeResource($employee))->resolve(),
                'Employee updated successfully'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[EmployeeController] Failed to update employee', [
                'error'       => $e->getMessage(),
                'user_id'     => Auth::id(),
                'type'        => 'employee_management',
                'employee_id' => $id,
            ]);

            return $this->errorResponse('Gagal memperbarui data karyawan', 500, $e);
        }
    }

    private function getFilters(Request $request): array
    {
        return [
            'outletId' => $request->has('outletId') && $request->filled('outletId')
                ? $request->integer('outletId')
                : null,
        ];
    }
}
