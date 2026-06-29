<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\User;
use App\Models\WhatsappOtp;
use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Services\FonnteService;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Throwable;

class AuthService extends BaseService
{
    protected FonnteService $fonnte;

    public function __construct(FonnteService $fonnte)
    {
        $this->fonnte = $fonnte;
    }

    /*
    |--------------------------------------------------------------------------
    | Registration
    |--------------------------------------------------------------------------
    */

    public function register(array $data, ?string $ipAddress = null): User
    {
        /** @var \Illuminate\Http\Request $request */
        $request = request();
        $ipAddress    = $ipAddress ?? $request->ip();
        $rateLimitKey = "register_attempts:{$ipAddress}";

        if (RateLimiter::tooManyAttempts($rateLimitKey, 3)) {
            $availableIn = RateLimiter::availableIn($rateLimitKey);
            throw ValidationException::withMessages([
                'register' => "Too many registration attempts. Please try again in {$availableIn} seconds."
            ]);
        }

        RateLimiter::hit($rateLimitKey, 60);

        try {
            /** @var User $user */
            $user = DB::transaction(function () use ($data): User {
                $referredBy = null;

                if (!empty($data['referralCode'])) {
                    $referrer = User::byReferralCode($data['referralCode'])->first();

                    if ($referrer) {
                        $referredBy = $referrer->id;
                        Log::info('Referral code found during registration', [
                            'referralCode'  => $data['referralCode'],
                            'referrer_id'   => $referrer->id,
                            'referrer_name' => $referrer->name,
                            'type'          => 'registration_referral',
                        ]);
                    } else {
                        Log::warning('Invalid referral code provided during registration', [
                            'referralCode' => $data['referralCode'],
                            'type'         => 'registration_referral',
                        ]);
                    }
                }

                $user = User::create([
                    'username'      => $data['username'] ?? null,
                    'name'          => $data['name'] ?? null,
                    'email'         => $data['email'] ?? null,
                    'phone'         => $data['phone'] ?? null,
                    'address'       => $data['address'] ?? null,
                    'status'        => UserStatus::Active,
                    'password'      => isset($data['password']) ? Hash::make($data['password']) : null,
                    'referral_code' => User::generateReferralCode(),
                    'referred_by'   => $referredBy,
                ]);

                $user->assignRole(UserRole::Owner->value);

                event(new Registered($user));

                Log::info('User registered successfully', [
                    'user_id'       => $user->id,
                    'email'         => $user->email,
                    'referral_code' => $user->referral_code,
                    'referred_by'   => $referredBy,
                    'type'          => 'registration',
                ]);

                return $user;
            });

            RateLimiter::clear($rateLimitKey);

            return $user;
        } catch (Throwable $e) {
            Log::error('User registration failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'type'  => 'registration_error',
            ]);
            throw $e;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | OTP
    |--------------------------------------------------------------------------
    */

    /**
     * Generate & send OTP to a phone number via WhatsApp (Fonnte).
     *
     * @throws ValidationException|\Exception
     */
    public function sendOtp(string $phone, ?string $ipAddress = null, ?string $userAgent = null): WhatsappOtp
    {
        if (!$this->fonnte->validatePhoneNumber($phone)) {
            throw ValidationException::withMessages(['phone' => 'Format nomor WhatsApp tidak valid. Gunakan format 08xxx atau 628xxx.']);
        }

        $rlKey     = "otp_send:{$phone}";
        $rlSeconds = config('fonnte.otp.rate_limit_seconds', 60);

        if (RateLimiter::tooManyAttempts($rlKey, 1)) {
            $available = RateLimiter::availableIn($rlKey);
            throw ValidationException::withMessages(['phone' => "Mohon tunggu {$available} detik sebelum mengirim ulang OTP."]);
        }

        WhatsappOtp::where('phone_number', $phone)
            ->where('is_verified', false)
            ->update(['is_verified' => true]);

        $length  = (int) config('fonnte.otp.length', 6);
        $otpCode = str_pad((string) random_int(0, 999999), $length, '0', STR_PAD_LEFT);

        /** @var \Illuminate\Http\Request $request */
        $request = request();

        $otp = WhatsappOtp::create([
            'phone_number' => $phone,
            'otp_code'     => $otpCode,
            'expires_at'   => now()->addMinutes(config('fonnte.otp.expiry_minutes', 5)),
            'attempts'     => 0,
            'is_verified'  => false,
            'ip_address'   => $ipAddress ?? $request->ip(),
            'user_agent'   => $userAgent ?? $request->userAgent(),
        ]);

        try {
            $this->fonnte->sendOtp($phone, $otpCode);
        } catch (\Exception $e) {
            $otp->delete();
            throw $e;
        }

        RateLimiter::hit($rlKey, $rlSeconds);

        return $otp;
    }

    /**
     * Verify OTP code for a given phone number.
     *
     * @throws ValidationException
     */
    public function verifyOtp(string $phone, string $otp): bool
    {
        $record = WhatsappOtp::latestValid($phone)->first();

        if (!$record) {
            throw ValidationException::withMessages(['otp' => 'Kode OTP tidak ditemukan atau sudah tidak berlaku. Silakan minta kirim ulang.']);
        }

        if ($record->isExpired()) {
            throw ValidationException::withMessages(['otp' => 'Kode OTP sudah expired. Silakan minta kirim ulang.']);
        }

        if ($record->hasReachedMaxAttempts()) {
            throw ValidationException::withMessages(['otp' => 'Maksimal percobaan verifikasi tercapai. Silakan minta kirim ulang OTP.']);
        }

        $record->incrementAttempts();

        if ($record->otp_code !== $otp) {
            $maxAttempts    = config('fonnte.otp.max_attempts', 3);
            $remaining      = max(0, $maxAttempts - $record->fresh()->attempts);

            if ($remaining > 0) {
                throw ValidationException::withMessages(['otp' => "Kode OTP salah. Sisa percobaan: {$remaining}."]);
            }

            throw ValidationException::withMessages(['otp' => 'Kode OTP salah. Maksimal percobaan tercapai. Silakan minta kirim ulang OTP.']);
        }

        $record->markAsVerified();

        Log::info('OTP verified successfully', ['phone' => $phone]);

        return true;
    }

    /**
     * @deprecated Use sendOtp() instead.
     */
    public function resendOtp(string $phone): bool
    {
        $rateLimitKey = "resend_otp_attempts:{$phone}";

        if (RateLimiter::tooManyAttempts($rateLimitKey, 3)) {
            $availableIn = RateLimiter::availableIn($rateLimitKey);
            $minutes     = ceil($availableIn / 60);
            throw ValidationException::withMessages([
                'otp' => "Too many OTP resend attempts. Please try again in {$minutes} minute(s)."
            ]);
        }

        $user = User::byPhone($phone)->first();

        if (!$user) {
            throw ValidationException::withMessages(['phone' => 'User not found.']);
        }

        RateLimiter::hit($rateLimitKey, 300);

        return true;
    }

    /*
    |--------------------------------------------------------------------------
    | Login & Logout
    |--------------------------------------------------------------------------
    */

    public function loginWeb(array $credentials, ?string $ipAddress = null): User
    {
        $email             = $credentials['email'] ?? '';
        /** @var \Illuminate\Http\Request $request */
        $request = request();
        $ipAddress         = $ipAddress ?? $request->ip();
        $remember          = $credentials['remember'] ?? false;
        $emailRateLimitKey = "login_attempts_email:{$email}";
        $ipRateLimitKey    = "login_attempts_ip:{$ipAddress}";

        if (RateLimiter::tooManyAttempts($emailRateLimitKey, 5)) {
            $availableIn = RateLimiter::availableIn($emailRateLimitKey);
            throw ValidationException::withMessages([
                'email' => "Too many login attempts for this email. Please try again in {$availableIn} seconds.",
            ]);
        }

        if (RateLimiter::tooManyAttempts($ipRateLimitKey, 5)) {
            $availableIn = RateLimiter::availableIn($ipRateLimitKey);
            throw ValidationException::withMessages([
                'login' => "Too many login attempts from this IP. Please try again in {$availableIn} seconds.",
            ]);
        }

        RateLimiter::hit($emailRateLimitKey, 60);
        RateLimiter::hit($ipRateLimitKey, 60);

        if (!Auth::attempt([
            'email'    => $email,
            'password' => $credentials['password'] ?? null,
        ], $remember)) {
            throw ValidationException::withMessages(['errors' => 'Invalid credentials.']);
        }

        /** @var User $user */
        $user = Auth::user();

        if ($user->status !== UserStatus::Active) {
            Auth::logout();
            throw ValidationException::withMessages(['account' => 'Account is not active.']);
        }

        $user->update(['last_login_at' => now()]);

        RateLimiter::clear($emailRateLimitKey);
        RateLimiter::clear($ipRateLimitKey);

        return $user;
    }

    public function loginEmployee(array $credentials, string $deviceName, ?string $ipAddress = null): array
    {
        $username             = $credentials['username'] ?? '';
        $password             = $credentials['password'] ?? ''; 
        /** @var \Illuminate\Http\Request $request */
        $request = request();
        $ipAddress            = $ipAddress ?? $request->ip();
        $usernameRateLimitKey = "login_attempts_username:{$username}";
        $ipRateLimitKey       = "login_attempts_employee_ip:{$ipAddress}";

        if (RateLimiter::tooManyAttempts($usernameRateLimitKey, 5)) {
            $availableIn = RateLimiter::availableIn($usernameRateLimitKey);
            throw ValidationException::withMessages([
                'username' => "Too many login attempts for this username. Please try again in {$availableIn} seconds.",
            ]);
        }

        if (RateLimiter::tooManyAttempts($ipRateLimitKey, 5)) {
            $availableIn = RateLimiter::availableIn($ipRateLimitKey);
            throw ValidationException::withMessages([
                'login' => "Too many login attempts from this IP. Please try again in {$availableIn} seconds.",
            ]);
        }

        RateLimiter::hit($usernameRateLimitKey, 60);
        RateLimiter::hit($ipRateLimitKey, 60);

        /** @var \App\Models\Employee|null $employee */
        $employee = Employee::byUsername($username)
            ->with([
                'outlet',
                'positions' => function ($query) {
                    $query->where('positions.is_active', true)
                        ->where('employee_positions.is_active', true);
                },
                'positions.permissions',
                'positions.outlet'
            ])
            ->first();

        if (!$employee || !Hash::check($password, $employee->password)) {
            throw ValidationException::withMessages(['credentials' => 'Invalid username or password.']);
        }

        if (!$employee->is_active) {
            throw ValidationException::withMessages(['account' => 'Account is not active.']);
        }

        $employee->tokens()->delete();
        $token = $employee->createToken($deviceName)->plainTextToken;

        $employee->update(['last_login_at' => now()]);

        RateLimiter::clear($usernameRateLimitKey);
        RateLimiter::clear($ipRateLimitKey);

        return [
            'token'    => $token,
            'employee' => $employee,
        ];
    }

    public function logoutWeb(): void
    {
        Auth::logout();
    }

    public function logoutEmployee(Employee $employee): void
    {
        /** @var \Laravel\Sanctum\PersonalAccessToken|null $token */
        $token = $employee->currentAccessToken();
        if ($token) {
            $token->delete();
        }
    }

    public function setupPin(Employee $employee, string $pin): Employee
    {
        if ($employee->pin_hash !== null) {
            throw ValidationException::withMessages(['pin' => 'PIN sudah diatur. Gunakan endpoint reset PIN.']);
        }

        $employee->update([
            'pin_hash' => Hash::make($pin),
            'pin_set_at' => now(),
        ]);

        Log::info('Employee PIN setup successfully', [
            'employee_id' => $employee->id,
            'type' => 'pin_setup',
        ]);

        // PERBAIKAN: Load relasi yang sama dengan loginEmployee() dan verifyPin()
        return $employee->fresh([
            'outlet',
            'positions' => function ($query) {
                $query->where('positions.is_active', true)
                    ->where('employee_positions.is_active', true);
            },
            'positions.permissions',
            'positions.outlet',
        ]);
    }

    public function resetPin(Employee $employee, string $currentPin, string $newPin): Employee
    {
        if ($employee->pin_hash === null) {
            throw ValidationException::withMessages([
                'current_pin' => 'Employee belum memiliki PIN. Gunakan endpoint setup PIN.',
            ]);
        }

        if (!Hash::check($currentPin, $employee->pin_hash)) {
            throw ValidationException::withMessages([
                'current_pin' => 'PIN saat ini tidak valid.',
            ]);
        }

        $employee->update([
            'pin_hash'   => Hash::make($newPin),
            'pin_set_at' => now(),
        ]);

        Log::info('Employee PIN reset successfully', [
            'employee_id' => $employee->id,
            'type'        => 'pin_reset',
        ]);

        return $employee->fresh([
            'outlet',
            'positions' => function ($query) {
                $query->where('positions.is_active', true)
                    ->where('employee_positions.is_active', true);
            },
            'positions.permissions',
            'positions.outlet',
        ]);
    }

    public function verifyPin(array $data, string $deviceName, ?string $ipAddress = null): array
    {
        $pin = $data['pin'] ?? '';
        $identifier = $data['employee_id'] ?? $data['username'] ?? '';
        $identifierType = isset($data['employee_id']) ? 'id' : 'username';

        $rateLimitKey = "pin_verify_attempts:{$identifier}:{$ipAddress}";

        if (RateLimiter::tooManyAttempts($rateLimitKey, 5)) {
            $availableIn = RateLimiter::availableIn($rateLimitKey);
            throw ValidationException::withMessages([
                'pin' => "Terlalu banyak percobaan PIN. Silakan coba lagi dalam {$availableIn} detik.",
            ]);
        }

        /** @var Employee|null $employee */
        if ($identifierType === 'id') {
            $employee = Employee::with([
                'outlet',
                'positions' => function ($query) {
                    $query->where('positions.is_active', true)
                        ->where('employee_positions.is_active', true);
                },
                'positions.permissions',
                'positions.outlet'
            ])->find($identifier);
        } else {
            $employee = Employee::byUsername($identifier)
                ->with([
                    'outlet',
                    'positions' => function ($query) {
                        $query->where('positions.is_active', true)
                            ->where('employee_positions.is_active', true);
                    },
                    'positions.permissions',
                    'positions.outlet'
                ])
                ->first();
        }

        if (!$employee || !$employee->pin_hash || !Hash::check($pin, $employee->pin_hash)) {
            RateLimiter::hit($rateLimitKey, 60);
            throw ValidationException::withMessages(['pin' => 'PIN tidak valid.']);
        }

        if (!$employee->is_active) {
            throw ValidationException::withMessages(['account' => 'Akun tidak aktif.']);
        }

        $employee->tokens()->delete();
        $token = $employee->createToken($deviceName)->plainTextToken;

        $employee->update(['last_login_at' => now()]);

        RateLimiter::clear($rateLimitKey);

        return [
            'token'    => $token,
            'employee' => $employee,
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Password Reset
    |--------------------------------------------------------------------------
    */

    public function forgotPassword(string $email): bool
    {
        $rateLimitKey = "forgot_password_attempts:{$email}";

        if (RateLimiter::tooManyAttempts($rateLimitKey, 3)) {
            $availableIn = RateLimiter::availableIn($rateLimitKey);
            $minutes     = ceil($availableIn / 60);
            throw ValidationException::withMessages([
                'email' => "Too many password reset attempts. Please try again in {$minutes} minute(s).",
            ]);
        }

        RateLimiter::hit($rateLimitKey, 600);

        $status = Password::sendResetLink(['email' => $email]);

        if ($status !== Password::RESET_LINK_SENT) {
            throw ValidationException::withMessages(['email' => __($status)]);
        }

        RateLimiter::clear($rateLimitKey);

        return true;
    }

    public function resetPassword(array $data): bool
    {
        $status = Password::reset(
            $data,
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                ])->setRememberToken(Str::random(60));

                $user->save();
                event(new PasswordReset($user));
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages(['email' => __($status)]);
        }

        $email = $data['email'] ?? '';
        if ($email) {
            RateLimiter::clear("login_attempts_email:{$email}");
            RateLimiter::clear("forgot_password_attempts:{$email}");
        }

        return true;
    }

    /*
    |--------------------------------------------------------------------------
    | Utilities
    |--------------------------------------------------------------------------
    */

    public function clearRateLimits(string $email, ?string $phone = null, ?string $ipAddress = null, ?string $username = null): void
    {
        RateLimiter::clear("login_attempts_email:{$email}");
        RateLimiter::clear("forgot_password_attempts:{$email}");

        if ($phone) {
            RateLimiter::clear("resend_otp_attempts:{$phone}");
        }

        if ($ipAddress) {
            RateLimiter::clear("login_attempts_ip:{$ipAddress}");
            RateLimiter::clear("login_attempts_employee_ip:{$ipAddress}");
            RateLimiter::clear("register_attempts:{$ipAddress}");
        }

        if ($username) {
            RateLimiter::clear("login_attempts_username:{$username}");
        }
    }

    /**
     * @return array{remaining:int, reset_in:int, max_attempts:int}
     */
    public function getRemainingAttempts(string $action, string $identifier): array
    {
        $configs = [
            'login_email'       => ['key' => "login_attempts_email:{$identifier}",       'max' => 5],
            'login_ip'          => ['key' => "login_attempts_ip:{$identifier}",          'max' => 5],
            'login_username'    => ['key' => "login_attempts_username:{$identifier}",    'max' => 5],
            'login_employee_ip' => ['key' => "login_attempts_employee_ip:{$identifier}", 'max' => 5],
            'register'          => ['key' => "register_attempts:{$identifier}",          'max' => 3],
            'resend_otp'        => ['key' => "resend_otp_attempts:{$identifier}",        'max' => 3],
            'forgot_password'   => ['key' => "forgot_password_attempts:{$identifier}",   'max' => 3],
        ];

        if (!isset($configs[$action])) {
            return ['remaining' => 0, 'reset_in' => 0, 'max_attempts' => 0];
        }

        $config      = $configs[$action];
        $key         = $config['key'];
        $maxAttempts = $config['max'];
        $attempts    = RateLimiter::attempts($key);
        $remaining   = max(0, $maxAttempts - $attempts);
        $resetIn     = RateLimiter::availableIn($key);

        return [
            'remaining'    => $remaining,
            'reset_in'     => $resetIn,
            'max_attempts' => $maxAttempts,
        ];
    }
}
