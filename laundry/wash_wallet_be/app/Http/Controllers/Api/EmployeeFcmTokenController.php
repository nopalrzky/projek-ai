<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmployeeDeviceToken;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmployeeFcmTokenController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => ['required', 'string', 'max:512'],
            'device_id' => ['nullable', 'string', 'max:255'],
            'device_name' => ['nullable', 'string', 'max:100'],
        ]);

        $employee = $request->user();

        if (!empty($validated['device_id'])) {
            EmployeeDeviceToken::query()
                ->where('employee_id', $employee->id)
                ->where('device_id', $validated['device_id'])
                ->where('token', '!=', $validated['token'])
                ->delete();
        }

        EmployeeDeviceToken::updateOrCreate(
            ['token' => $validated['token']],
            [
                'employee_id' => $employee->id,
                'device_id' => $validated['device_id'] ?? null,
                'device_name' => $validated['device_name'] ?? $request->header('User-Agent'),
                'last_used_at' => now(),
            ]
        );

        return $this->successResponse(null, 'FCM token registered');
    }

    public function destroy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => ['required', 'string', 'max:512'],
        ]);

        $employee = $request->user();

        EmployeeDeviceToken::query()
            ->where('employee_id', $employee->id)
            ->where('token', $validated['token'])
            ->delete();

        return $this->successResponse(null, 'FCM token removed');
    }
}
