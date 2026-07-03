<?php

$files = [
    'app/Services/ExpenseService.php',
    'app/Services/EmployeeService.php',
    'app/Services/OutletService.php',
    'app/Services/MembershipPlanService.php',
    'app/Services/MembershipContractService.php',
    'app/Services/PriveService.php',
    'app/Services/TopupService.php',
    'app/Services/WalletWithdrawalService.php',
    'app/Http/Controllers/Api/CourierScheduleController.php',
    'app/Http/Controllers/Web/CustomerController.php',
    'app/Services/OrderService.php',
    'app/Services/PayrollService.php'
];

foreach ($files as $file) {
    $path = __DIR__ . '/' . $file;
    if (!file_exists($path)) {
        echo "Not found: $file\n";
        continue;
    }
    $content = file_get_contents($path);
    $orig = $content;

    // Normalizations for ->owner_id !== $user->id
    $content = preg_replace('/\$([a-zA-Z0-9_]+)->owner_id !== \$user->id/', '!(int) \$$1->owner_id === (int) \$user->id', $content);
    $content = preg_replace('/\$([a-zA-Z0-9_]+)->outlet->owner_id === \$user->id/', '(int) \$$1->outlet->owner_id === (int) \$user->id', $content);
    
    // Normalize $outlet->owner_id !== $this->resolveOwnerId()
    $content = str_replace('$outlet->owner_id !== $this->resolveOwnerId()', '(int) $outlet->owner_id !== (int) $this->resolveOwnerId()', $content);
    $content = str_replace('$outlet->owner_id === $this->resolveOwnerId()', '(int) $outlet->owner_id === (int) $this->resolveOwnerId()', $content);

    // Normalize ->outlet_id !== ->id
    $content = preg_replace('/(?<!\(int\) )\$([a-zA-Z0-9_]+)->outlet_id !== \$([a-zA-Z0-9_]+)->id/', '(int) \$$1->outlet_id !== (int) \$$2->id', $content);
    $content = preg_replace('/(?<!\(int\) )\$([a-zA-Z0-9_]+)->outlet_id !== \$([a-zA-Z0-9_]+)Id/', '(int) \$$1->outlet_id !== (int) \$$2Id', $content);
    
    // Special missing cases
    $content = str_replace('$user->outlet_id === $outlet->id', '(int) $user->outlet_id === (int) $outlet->id', $content);
    $content = str_replace('$user->id === $outlet->owner_id', '(int) $user->id === (int) $outlet->owner_id', $content);
    
    // Normalize ->user_id !== $userId
    $content = preg_replace('/(?<!\(int\) )\$([a-zA-Z0-9_]+)->user_id !== \$userId/', '(int) \$$1->user_id !== (int) \$userId', $content);
    
    // Normalize customer controller
    $content = str_replace('$subscription->customer_id !== $customerId', '(int) $subscription->customer_id !== (int) $customerId', $content);
    $content = str_replace('$contract->customer_id !== $customerId', '(int) $contract->customer_id !== (int) $customerId', $content);

    if ($content !== $orig) {
        file_put_contents($path, $content);
        echo "Updated $file\n";
    }
}
