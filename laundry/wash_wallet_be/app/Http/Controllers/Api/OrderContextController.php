<?php


namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\MembershipContract;
use App\Models\CustomerQuota;
use Illuminate\Http\JsonResponse;

use Illuminate\Routing\Attributes\Controllers\Middleware;

#[Middleware('auth:sanctum')]
class OrderContextController extends Controller
{
  public function getOrderContext(int $customerId): JsonResponse
  {
    $customer = Customer::with(['outlet'])->findOrFail($customerId);

    $membership = MembershipContract::with('membershipPlan')
      ->where('customer_id', $customerId)
      ->where('status', 'active')
      ->where(function ($q) {
        $q->whereNull('expired_at')
          ->orWhere('expired_at', '>', now());
      })
      ->first();

    $quotas = CustomerQuota::with(['laundryService.unit', 'customerSubscription'])
      ->whereHas('customerSubscription', function ($q) use ($customerId) {
        $q->where('customer_id', $customerId)
          ->where('status', 'active');
      })
      ->where('remaining_quota', '>', 0)
      ->get()
      ->map(function ($quota) {
        return [
          'customerSubscriptionId' => $quota->customer_subscription_id,
          'laundryServiceId' => $quota->laundry_service_id,
          'laundryServiceName' => $quota->laundryService->name,
          'unit' => $quota->laundryService->unit->name ?? 'unit',
          'remainingQuota' => (float) $quota->remaining_quota,
        ];
      });

    return $this->successResponse([
        'customer' => [
          'id' => $customer->id,
          'name' => $customer->name,
          'email' => $customer->email,
          'phone' => $customer->phone,
        ],
        'membership' => $membership ? [
          'membershipContractId' => $membership->id,
          'membershipPlanName' => $membership->membershipPlan->name,
          'discountPercentage' => (float) $membership->membershipPlan->discount_percentage,
          'expiredAt' => $membership->expired_at?->toISOString(),
        ] : null,
        'quotas' => $quotas->values(),
    ], 'Order context retrieved successfully');
  }
}
