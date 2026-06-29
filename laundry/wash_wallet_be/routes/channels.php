<?php

use App\Models\Employee;
use App\Models\CustomerAccount;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('outlet.{outletId}', function (Employee $employee, int $outletId): bool {
    return $employee->hasPermissionOnOutlet('order.view', $outletId);
}, ['guards' => ['sanctum']]);

Broadcast::channel('customer.{customerId}', function ($user, int $customerId): bool {
    return $user instanceof CustomerAccount && (int) $user->id === $customerId;
}, ['guards' => ['customer_sanctum']]);
