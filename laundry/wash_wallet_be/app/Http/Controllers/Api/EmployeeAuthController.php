<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\EmployeeLoginRequest;
use App\Http\Requests\Auth\ResetPinRequest;
use App\Http\Requests\Auth\SetupPinRequest;
use App\Http\Requests\Auth\VerifyPinRequest;
use App\Http\Resources\Employee\LoginEmployeeResource;
use App\Services\AuthService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Throwable;

use Illuminate\Routing\Attributes\Controllers\Middleware;

#[Middleware('auth:sanctum', only: ['logout', 'validateToken', 'me'])]
class EmployeeAuthController extends Controller
{
    public function __construct(
        private readonly AuthService $authService,
    ) {}

    public function login(EmployeeLoginRequest $request): JsonResponse
    {
        try {
            $credentials = [
                'username' => $request->username,
                'password' => $request->password,
            ];

            $result = $this->authService->loginEmployee(
                $credentials,
                $request->deviceName ?? 'mobile-app',
                $request->ip()
            );

            $employee = $result['employee'];

            return $this->successResponse(
                [
                    'token'     => $result['token'],
                    'tokenType' => 'Bearer',
                    'employee'  => new LoginEmployeeResource($employee),
                ],
                'Login successful'
            );
        } catch (ValidationException $e) {
            return $this->errorResponse('Login gagal', 422, $e->errors());
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[EmployeeAuthController] Failed to login', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'employee_auth',
            ]);

            return $this->errorResponse('Terjadi kesalahan saat login', 500, $e);
        }
    }

    public function logout(Request $request): JsonResponse
    {
        try {
            $this->authService->logoutEmployee($request->user());

            return $this->successResponse(null, 'Logout successful');
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[EmployeeAuthController] Failed to logout', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'employee_auth',
            ]);

            return $this->errorResponse('Terjadi kesalahan saat logout', 500, $e);
        }
    }

    public function validateToken(Request $request): JsonResponse
    {
        $employee = $request->user();

        if (!$employee->is_active) {
            return $this->errorResponse('Akun tidak aktif', 403);
        }

        return $this->successResponse(null, 'Token is valid');
    }

    public function me(Request $request): JsonResponse
    {
        $employee = $request->user();

        if (!$employee->is_active) {
            return $this->errorResponse('Akun tidak aktif', 403);
        }

        $employee->load([
            'outlet',
            'positions' => function ($query) {
                $query->where('positions.is_active', true)
                    ->where('employee_positions.is_active', true);
            },
            'positions.permissions',
            'positions.outlet',
        ]);

        return $this->successResponse(new LoginEmployeeResource($employee), 'Success');
    }

    public function setupPin(SetupPinRequest $request): JsonResponse
    {
        try {
            $employee = $request->user();

            $updatedEmployee = $this->authService->setupPin($employee, $request->pin);

            return $this->successResponse(
                [
                    'employee' => new LoginEmployeeResource($updatedEmployee),
                ],
                'PIN berhasil dibuat'
            );
        } catch (ValidationException $e) {
            return $this->errorResponse('Validasi gagal', 422, $e->errors());
        } catch (Throwable $e) {
            Log::error('[EmployeeAuthController] Failed to setup PIN', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'employee_pin_setup',
            ]);

            return $this->errorResponse('Terjadi kesalahan saat membuat PIN', 500, $e);
        }
    }

    public function resetPin(ResetPinRequest $request): JsonResponse
    {
        try {
            $employee = $request->user();

            $updatedEmployee = $this->authService->resetPin(
                $employee,
                $request->current_pin,
                $request->pin,
            );

            return $this->successResponse(
                [
                    'employee' => new LoginEmployeeResource($updatedEmployee),
                ],
                'PIN berhasil diubah'
            );
        } catch (ValidationException $e) {
            return $this->errorResponse('Validasi gagal', 422, $e->errors());
        } catch (Throwable $e) {
            Log::error('[EmployeeAuthController] Failed to reset PIN', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'employee_pin_reset',
            ]);

            return $this->errorResponse('Terjadi kesalahan saat mengubah PIN', 500, $e);
        }
    }

    public function verifyPin(VerifyPinRequest $request): JsonResponse
    {
        try {
            $result = $this->authService->verifyPin(
                $request->only(['employee_id', 'username', 'pin']),
                $request->device_name ?? 'mobile-cashier',
                $request->ip()
            );

            $employee = $result['employee'];

            return $this->successResponse(
                [
                    'token'     => $result['token'],
                    'tokenType' => 'Bearer',
                    'employee'  => new LoginEmployeeResource($employee),
                ],
                'PIN verified successfully'
            );
        } catch (ValidationException $e) {
            return $this->errorResponse('Verifikasi PIN gagal', 422, $e->errors());
        } catch (Throwable $e) {
            Log::error('[EmployeeAuthController] Failed to verify PIN', [
                'error'   => $e->getMessage(),
                'type'    => 'employee_pin_verify',
            ]);

            return $this->errorResponse('Terjadi kesalahan saat verifikasi PIN', 500, $e);
        }
    }
}
