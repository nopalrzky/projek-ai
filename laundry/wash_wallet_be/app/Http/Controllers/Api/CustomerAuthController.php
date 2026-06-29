<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CustomerAccount\CustomerAccountResource;
use App\Services\CustomerAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Throwable;

use Illuminate\Routing\Attributes\Controllers\Middleware;

#[Middleware('auth:customer_sanctum', only: ['me', 'logout', 'updateFcmToken', 'setPassword', 'updateProfile'])]
class CustomerAuthController extends Controller
{
  public function __construct(
    private readonly CustomerAuthService $authService
  ) {}

  /**
   * Request OTP for login/registration.
   */
  public function requestOtp(Request $request): JsonResponse
  {
    $request->validate([
      'phone' => 'required|string',
      'intent' => 'required|in:register,login',
    ]);

    try {
      $result = $this->authService->sendOtpWithCheck(
        $request->phone,
        $request->intent
      );

      if ($result['status'] === 'already_exists') {
        return $this->successResponse([
          'status' => 'already_exists',
        ], 'Nomor sudah terdaftar. Silakan login atau gunakan nomor lain.');
      }

      if ($result['status'] === 'not_found') {
        return $this->successResponse([
          'status' => 'not_found',
        ], 'Nomor belum terdaftar. Silakan registrasi terlebih dahulu.');
      }

      return $this->successResponse(
        [
          'status' => 'otp_sent',
          'has_password' => $result['has_password'] ?? false,
        ],
        'Kode OTP telah dikirim ke nomor WhatsApp Anda.'
      );
    } catch (ValidationException $e) {
      return $this->errorResponse($e->getMessage(), 422, $e->errors());
    } catch (Throwable $e) {
      Log::error('[CustomerAuthController] OTP Request Failed', [
        'phone' => $request->phone,
        'error' => $e->getMessage()
      ]);
      return $this->errorResponse('Gagal mengirim OTP. Silakan coba lagi nanti.', 500);
    }
  }

  /**
   * Verify OTP and decide registration/login status.
   */
  public function verifyOtp(Request $request): JsonResponse
  {
    $request->validate([
      'phone' => 'required|string',
      'otp'   => 'required|string',
      'deviceName' => 'nullable|string',
    ]);

    try {
      $result = $this->authService->verifyOtpAndCheckStatus(
        $request->phone,
        $request->otp,
        $this->resolveDeviceName($request)
      );

      if ($result['status'] === 'new_user') {
        return $this->successResponse([
          'status' => 'new_user',
          'phone' => $request->phone,
        ], 'OTP valid. Silakan lanjutkan registrasi.');
      }

      return $this->successResponse([
        'status' => 'existing_user',
        'token'     => $result['token'],
        'tokenType' => 'Bearer',
        'customer'  => new CustomerAccountResource($result['customer_account']),
      ], 'Login berhasil.');
    } catch (ValidationException $e) {
      return $this->errorResponse($e->getMessage(), 422, $e->errors());
    } catch (Throwable $e) {
      Log::error('[CustomerAuthController] OTP Verification Failed', [
        'phone' => $request->phone,
        'error' => $e->getMessage()
      ]);
      return $this->errorResponse('Verifikasi gagal. Silakan coba lagi.', 500);
    }
  }

  /**
   * Register customer profile after OTP verification.
   */
  public function register(Request $request): JsonResponse
  {
    $request->validate([
      'phone' => 'required|string',
      'name' => 'required|string|max:255',
      'email' => 'nullable|email|max:255|unique:customer_accounts,email',
      'gender' => 'nullable|in:male,female',
      'password' => 'nullable|string|min:6',
      'date_of_birth' => 'nullable|date',
      'deviceName' => 'nullable|string|max:255',
    ]);

    try {
      $result = $this->authService->registerCustomer(
        $request->only(['phone', 'name', 'email', 'gender', 'password', 'date_of_birth']),
        $this->resolveDeviceName($request)
      );

      return $this->successResponse([
        'token' => $result['token'],
        'tokenType' => 'Bearer',
        'customer' => new CustomerAccountResource($result['customer_account']),
      ], 'Registrasi berhasil.');
    } catch (ValidationException $e) {
      return $this->errorResponse($e->getMessage(), 422, $e->errors());
    } catch (Throwable $e) {
      Log::error('[CustomerAuthController] Register Failed', [
        'phone' => $request->phone,
        'error' => $e->getMessage()
      ]);

      return $this->errorResponse('Registrasi gagal. Silakan coba lagi.', 500);
    }
  }

  /**
   * Login customer using phone and password.
   */
  public function loginWithPassword(Request $request): JsonResponse
  {
    $request->validate([
      'phone' => 'required|string',
      'password' => 'required|string',
      'deviceName' => 'nullable|string|max:255',
    ]);

    try {
      $result = $this->authService->loginWithPassword(
        $request->phone,
        $request->password,
        $this->resolveDeviceName($request)
      );

      return $this->successResponse([
        'token' => $result['token'],
        'tokenType' => 'Bearer',
        'customer' => new CustomerAccountResource($result['customer_account']),
      ], 'Login berhasil.');
    } catch (ValidationException $e) {
      return $this->errorResponse($e->getMessage(), 422, $e->errors());
    } catch (Throwable $e) {
      Log::error('[CustomerAuthController] Password Login Failed', [
        'phone' => $request->phone,
        'error' => $e->getMessage(),
      ]);

      return $this->errorResponse('Login gagal. Silakan coba lagi.', 500);
    }
  }

  /**
   * Logout customer.
   */
  public function logout(Request $request): JsonResponse
  {
    try {
      $this->authService->logoutCustomer($request->user());
      return $this->successResponse(null, 'Logout berhasil.');
    } catch (Throwable $e) {
      return $this->errorResponse('Gagal logout.', 500);
    }
  }

  /**
   * Set password for authenticated customer.
   */
  public function setPassword(Request $request): JsonResponse
  {
    $request->validate([
      'password' => 'required|string|min:8|confirmed',
      'password_confirmation' => 'required|string',
    ]);

    try {
      $customerAccount = $this->authService->setCustomerPassword(
        $request->user(),
        $request->password
      );

      return $this->successResponse(
        new CustomerAccountResource($customerAccount),
        'Password berhasil dibuat.'
      );
    } catch (ValidationException $e) {
      return $this->errorResponse($e->getMessage(), 422, $e->errors());
    } catch (Throwable $e) {
      Log::error('[CustomerAuthController] Set Password Failed', [
        'customer_id' => $request->user()?->id,
        'error' => $e->getMessage(),
      ]);

      return $this->errorResponse('Gagal membuat password. Silakan coba lagi.', 500);
    }
  }

  public function updateProfile(Request $request): JsonResponse
  {
    $customerId = $request->user()->id;

    $request->validate([
      'name' => 'required|string|max:255',
      'email' => [
        'nullable',
        'email',
        'max:255',
        Rule::unique('customer_accounts', 'email')->ignore($customerId),
      ],
      'gender' => 'nullable|in:male,female',
      'date_of_birth' => 'nullable|date|before_or_equal:today',
    ]);

    try {
      $customerAccount = $this->authService->updateCustomerProfile(
        $request->user(),
        $request->only(['name', 'email', 'gender', 'date_of_birth'])
      );

      return $this->successResponse(
        new CustomerAccountResource($customerAccount),
        'Profil berhasil diperbarui.'
      );
    } catch (ValidationException $e) {
      return $this->errorResponse($e->getMessage(), 422, $e->errors());
    } catch (Throwable $e) {
      Log::error('[CustomerAuthController] Update Profile Failed', [
        'customer_id' => $request->user()?->id,
        'error' => $e->getMessage(),
      ]);

      return $this->errorResponse('Gagal memperbarui profil. Silakan coba lagi.', 500);
    }
  }

  /**
   * Get current customer profile.
   */
  public function me(Request $request): JsonResponse
  {
    return $this->successResponse(
      new CustomerAccountResource($request->user()),
      'Berhasil mengambil data profil.'
    );
  }

  /**
   * Update FCM token for push notifications.
   */
  public function updateFcmToken(Request $request): JsonResponse
  {
    $request->validate([
      'fcm_token' => 'required|string',
    ]);

    try {
      $customer = $request->user();
      $customer->update([
        'fcm_token' => $request->fcm_token,
      ]);

      return $this->successResponse(null, 'FCM token berhasil diperbarui.');
    } catch (Throwable $e) {
      Log::error('[CustomerAuthController] Update FCM Token Failed', [
        'customer_id' => $request->user()?->id,
        'error' => $e->getMessage(),
      ]);

      return $this->errorResponse('Gagal memperbarui FCM token.', 500);
    }
  }

  private function resolveDeviceName(Request $request): string
  {
    return $request->deviceName ?? $request->userAgent() ?? 'mobile-customer-app';
  }
}
