<?php

namespace App\Services;

use App\Models\CustomerAccount;
use App\Models\WhatsappOtp;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Throwable;

class CustomerAuthService extends AuthService
{
    /**
     * Send OTP with account existence check by intent.
     */
    public function sendOtpWithCheck(string $phone, string $intent): array
    {
        $exists = CustomerAccount::byPhone($phone)->exists();

        if ($intent === 'register' && $exists) {
            return ['status' => 'already_exists'];
        }

        if ($intent === 'login' && !$exists) {
            return ['status' => 'not_found'];
        }

        $this->sendOtp($phone);

        $hasPassword = CustomerAccount::byPhone($phone)
            ->whereNotNull('password')
            ->exists();

        return [
            'status' => 'otp_sent',
            'has_password' => $hasPassword,
        ];
    }

    /**
     * Verify OTP and login if account already exists.
     *
     * @throws ValidationException
     * @throws Throwable
     */
    public function verifyOtpAndCheckStatus(string $phone, string $otp, string $deviceName): array
    {
        $this->verifyOtp($phone, $otp);

        try {
            $customerAccount = CustomerAccount::where('phone', $phone)->first();

            if (!$customerAccount) {
                return [
                    'status' => 'new_user',
                    'phone' => $phone,
                ];
            }

            if (!$customerAccount->is_active) {
                throw ValidationException::withMessages([
                    'phone' => 'Akun Anda telah dinonaktifkan. Silakan hubungi admin.'
                ]);
            }

            if (!$customerAccount->is_verified) {
                $customerAccount->update(['is_verified' => true]);
            }
            $customerAccount->tokens()->delete();
            $token = $customerAccount->createToken($deviceName)->plainTextToken;

            $customerAccount->update(['last_login_at' => now()]);

            return [
                'status' => 'existing_user',
                'token'            => $token,
                'customer_account' => $customerAccount,
            ];
        } catch (Throwable $e) {
            Log::error('Customer OTP verification flow failed', [
                'phone' => $phone,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Register customer account after OTP verification.
     *
     * @throws ValidationException
     */
    public function registerCustomer(array $data, string $deviceName): array
    {
        $phone = $data['phone'];

        if (CustomerAccount::where('phone', $phone)->exists()) {
            throw ValidationException::withMessages([
                'phone' => 'Nomor sudah terdaftar.'
            ]);
        }

        $verifiedOtp = WhatsappOtp::where('phone_number', $phone)
            ->where('is_verified', true)
            ->latest('verified_at')
            ->first();

        $validUntil = now()->subMinutes(config('fonnte.otp.expiry_minutes', 5));
        if (!$verifiedOtp || !$verifiedOtp->verified_at || $verifiedOtp->verified_at->lt($validUntil)) {
            throw ValidationException::withMessages([
                'phone' => 'OTP belum diverifikasi atau sudah kedaluwarsa. Silakan verifikasi OTP kembali.'
            ]);
        }

        $customerAccount = CustomerAccount::create([
            'phone' => $phone,
            'name' => $data['name'],
            'email' => $data['email'] ?? null,
            'gender' => $data['gender'] ?? null,
            'password' => $data['password'] ?? null,
            'date_of_birth' => $data['date_of_birth'] ?? null,
            'is_verified' => true,
            'is_active' => true,
            'last_login_at' => now(),
        ]);

        $customerAccount->tokens()->delete();
        $token = $customerAccount->createToken($deviceName)->plainTextToken;

        Log::info('Customer registered successfully', [
            'phone' => $phone,
            'id' => $customerAccount->id,
        ]);

        return [
            'token' => $token,
            'customer_account' => $customerAccount,
        ];
    }

    /**
     * Login customer with phone and password.
     *
     * @throws ValidationException
     */
    public function loginWithPassword(string $phone, string $password, string $deviceName): array
    {
        $customerAccount = CustomerAccount::where('phone', $phone)->first();

        if (!$customerAccount || !$customerAccount->password || !Hash::check($password, $customerAccount->password)) {
            throw ValidationException::withMessages([
                'credentials' => 'Nomor atau password salah.'
            ]);
        }

        if (!$customerAccount->is_active) {
            throw ValidationException::withMessages([
                'phone' => 'Akun Anda telah dinonaktifkan. Silakan hubungi admin.'
            ]);
        }

        if (!$customerAccount->is_verified) {
            $customerAccount->update(['is_verified' => true]);
        }

        $customerAccount->tokens()->delete();
        $token = $customerAccount->createToken($deviceName)->plainTextToken;
        $customerAccount->update(['last_login_at' => now()]);

        return [
            'token' => $token,
            'customer_account' => $customerAccount,
        ];
    }

    /**
     * Logout customer.
     */
    public function logoutCustomer(CustomerAccount $customerAccount): void
    {
        $currentToken = $customerAccount->currentAccessToken();
        if ($currentToken) {
            $customerAccount->tokens()->whereKey($currentToken->id)->delete();
        }
    }

    /**
     * Set or create password for authenticated customer.
     *
     * @throws ValidationException
     */
    public function setCustomerPassword(CustomerAccount $customerAccount, string $password): CustomerAccount
    {
        if (!is_null($customerAccount->password)) {
            throw ValidationException::withMessages([
                'password' => 'Akun sudah memiliki password.',
            ]);
        }

        $customerAccount->update([
            'password' => $password,
        ]);

        return $customerAccount->refresh();
    }

    public function updateCustomerProfile(CustomerAccount $customerAccount, array $data): CustomerAccount
    {
        $customerAccount->update([
            'name' => $data['name'],
            'email' => $data['email'] ?? null,
            'gender' => $data['gender'] ?? null,
            'date_of_birth' => $data['date_of_birth'] ?? null,
        ]);

        return $customerAccount->refresh();
    }
}
