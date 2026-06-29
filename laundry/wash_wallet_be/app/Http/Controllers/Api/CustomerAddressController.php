<?php

namespace App\Http\Controllers\Api;

use App\Helpers\PaginationHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\CustomerAddress\StoreCustomerAddressRequest;
use App\Http\Requests\CustomerAddress\UpdateCustomerAddressRequest;
use App\Http\Resources\CustomerAddress\CustomerAddressResource;
use App\Models\CustomerAccount;
use App\Services\CustomerAddressService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Throwable;

use Illuminate\Routing\Attributes\Controllers\Middleware;

#[Middleware('auth:customer_sanctum')]
class CustomerAddressController extends Controller
{
  public function __construct(
    private readonly CustomerAddressService $customerAddressService,
  ) {}

  public function index(Request $request): JsonResponse
  {
    try {
      $customerAccount = $this->resolveCustomerAccount();
      $filters = $this->getFilters($request);
      $filters['customerAccountId'] = $customerAccount->id;

      $addresses = $this->customerAddressService->getAll(
        filters: $filters,
        page: $filters['page'],
        perPage: $filters['perPage'],
      );

      return $this->successResponse(
        CustomerAddressResource::collection($addresses->items())->resolve(),
        'Customer addresses retrieved successfully',
        200,
        PaginationHelper::format($addresses, $request)
      );
    } catch (Throwable $e) {
      Log::error('[CustomerAddressController] Failed to fetch customer addresses', [
        'error'               => $e->getMessage(),
        'user_id'             => Auth::id(),
        'customer_account_id' => Auth::guard('customer_sanctum')->id(),
        'type'                => 'customer_address_management',
      ]);

      return $this->errorResponse('Gagal memuat daftar alamat', 500, $e);
    }
  }

  public function show(int $id): JsonResponse
  {
    try {
      $customerAccount = $this->resolveCustomerAccount();
      $address = $this->customerAddressService->getById($customerAccount, $id);

      return $this->successResponse(
        (new CustomerAddressResource($address))->resolve(),
        'Customer address retrieved successfully'
      );
    } catch (ModelNotFoundException $e) {
      return $this->errorResponse('Alamat tidak ditemukan', 404, $e);
    } catch (Throwable $e) {
      Log::error('[CustomerAddressController] Failed to fetch customer address', [
        'error'               => $e->getMessage(),
        'user_id'             => Auth::id(),
        'address_id'          => $id,
        'customer_account_id' => Auth::guard('customer_sanctum')->id(),
        'type'                => 'customer_address_management',
      ]);

      return $this->errorResponse('Gagal memuat detail alamat', 500, $e);
    }
  }

  public function store(StoreCustomerAddressRequest $request): JsonResponse
  {
    try {
      $customerAccount = $this->resolveCustomerAccount();
      $address = $this->customerAddressService->store($customerAccount, $request->validated());

      return $this->successResponse(
        (new CustomerAddressResource($address))->resolve(),
        'Customer address created successfully',
        201
      );
    } catch (Throwable $e) {
      Log::error('[CustomerAddressController] Failed to create customer address', [
        'error'               => $e->getMessage(),
        'user_id'             => Auth::id(),
        'customer_account_id' => Auth::guard('customer_sanctum')->id(),
        'type'                => 'customer_address_management',
      ]);

      return $this->errorResponse('Gagal membuat alamat', 500, $e);
    }
  }

  public function update(UpdateCustomerAddressRequest $request, int $id): JsonResponse
  {
    try {
      $customerAccount = $this->resolveCustomerAccount();
      $address = $this->customerAddressService->update($customerAccount, $id, $request->validated());

      return $this->successResponse(
        (new CustomerAddressResource($address))->resolve(),
        'Customer address updated successfully'
      );
    } catch (ModelNotFoundException $e) {
      return $this->errorResponse('Alamat tidak ditemukan', 404, $e);
    } catch (Throwable $e) {
      Log::error('[CustomerAddressController] Failed to update customer address', [
        'error'               => $e->getMessage(),
        'user_id'             => Auth::id(),
        'address_id'          => $id,
        'customer_account_id' => Auth::guard('customer_sanctum')->id(),
        'type'                => 'customer_address_management',
      ]);

      return $this->errorResponse('Gagal memperbarui alamat', 500, $e);
    }
  }

  public function destroy(int $id): JsonResponse
  {
    try {
      $customerAccount = $this->resolveCustomerAccount();
      $deleted = $this->customerAddressService->destroy($customerAccount, $id);

      if ($deleted) {
        return $this->successResponse(null, 'Customer address deleted successfully');
      }

      return $this->errorResponse('Alamat tidak ditemukan atau tidak dapat dihapus', 404);
    } catch (ModelNotFoundException $e) {
      return $this->errorResponse('Alamat tidak ditemukan', 404, $e);
    } catch (Throwable $e) {
      Log::error('[CustomerAddressController] Failed to delete customer address', [
        'error'               => $e->getMessage(),
        'user_id'             => Auth::id(),
        'address_id'          => $id,
        'customer_account_id' => Auth::guard('customer_sanctum')->id(),
        'type'                => 'customer_address_management',
      ]);

      return $this->errorResponse('Gagal menghapus alamat', 500, $e);
    }
  }

  private function getFilters(Request $request): array
  {
    return [
      'search'            => $request->string('search')->toString(),
      'customerAccountId' => $request->filled('customerAccountId')
        ? $request->integer('customerAccountId')
        : null,
      'isPrimary'         => $request->has('isPrimary') && $request->filled('isPrimary')
        ? $request->boolean('isPrimary')
        : null,
      'sortBy'            => $request->string('sortBy', 'createdAt')->toString(),
      'sortDirection'     => $request->string('sortDirection', 'desc')->toString(),
      'page'              => $request->integer('page', 1),
      'perPage'           => $request->integer('perPage', 15),
    ];
  }

  private function resolveCustomerAccount(): CustomerAccount
  {
    $customerAccount = Auth::guard('customer_sanctum')->user();

    if (!$customerAccount instanceof CustomerAccount) {
      throw new ModelNotFoundException('Customer account not found');
    }

    return $customerAccount;
  }
}
