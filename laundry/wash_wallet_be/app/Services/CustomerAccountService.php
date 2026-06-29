<?php

namespace App\Services;

use App\Models\CustomerAccount;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class CustomerAccountService extends BaseService
{
  public function __construct(
    protected CustomerAccount $customerAccount,
  ) {}

  /*
    |--------------------------------------------------------------------------
    | Read Methods
    |--------------------------------------------------------------------------
    */

  public function getById(int $id, array $relations = []): CustomerAccount
  {
    try {
      $query = $this->customerAccount->query();

      if (!empty($relations)) {
        $query->with($relations);
      }

      return $query->findOrFail($id);
    } catch (Exception $e) {
      Log::error('Failed to get customer account by ID', [
        'customer_account_id' => $id,
        'error'               => $e->getMessage(),
        'user_id'             => Auth::id(),
        'type'                => 'customer_account_service_error',
      ]);

      throw $e;
    }
  }
}
