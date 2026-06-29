<?php

namespace App\Http\Controllers\Web;

use Illuminate\Routing\Attributes\Controllers\Middleware;

use App\Http\Controllers\Controller;
use App\Services\AuthService;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\ResendOtpRequest;
use App\Http\Requests\Auth\VerifyOtpRequest;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @param AuthService $authService
     */
    public function __construct(private readonly AuthService $authService)
    {
    }

    /**
     * Show the login form.
     *
     * @return Response
     */
    #[Middleware('guest')]
    public function showLoginForm(): Response
    {
        return Inertia::render('Auth/Login');
    }

    /**
     * Handle login request.
     *
     * @param LoginRequest $request
     * @return RedirectResponse
     * @throws ValidationException
     */
    #[Middleware('guest')]
    public function login(LoginRequest $request): RedirectResponse
    {
        try {
            $user = $this->authService->loginWeb(
                $request->validated(),
                $request->ip()
            );

            $request->session()->regenerate();

            return redirect()->intended(route('dashboard'))
                ->with('success', 'Welcome back, ' . $user->name . '!');
        } catch (ValidationException $e) {
            return back()
                ->withErrors($e->errors())
                ->withInput($request->except('password'));
        }
    }

    /**
     * Show the registration form.
     *
     * @return Response
     */
    #[Middleware('guest')]
    public function showRegistrationForm(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle registration request.
     *
     * @param RegisterRequest $request
     * @return RedirectResponse
     * @throws ValidationException
     */
    #[Middleware('guest')]
    public function register(RegisterRequest $request): RedirectResponse
    {
        try {
            $user = $this->authService->register(
                $request->validated(),
                $request->ip()
            );

            return redirect()->route('login')
                ->with('success', 'Registration successful! Welcome to WashWallet, ' . $user->name . '!');
        } catch (ValidationException $e) {
            return back()->withErrors($e->errors())->withInput($request->except('password', 'password_confirmation'));
        }
    }

    /**
     * Handle resend OTP request.
     *
     * @param ResendOtpRequest $request
     * @return \Illuminate\Http\JsonResponse
     * @throws ValidationException
     */
    #[Middleware('guest')]
    public function resendOtp(ResendOtpRequest $request): \Illuminate\Http\JsonResponse
    {
        try {
            $otp = $this->authService->sendOtp(
                $request->phone,
                $request->ip(),
                $request->userAgent()
            );

            return $this->successResponse([
                'expires_at'         => $otp->expires_at->toIso8601String(),
                'expires_in_seconds' => $otp->expires_at->diffInSeconds(now()),
            ], 'Kode OTP telah dikirim ke WhatsApp Anda.');
        } catch (ValidationException $e) {
            return $this->errorResponse(collect($e->errors())->flatten()->first(), 422, $e);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500, $e);
        }
    }

    /**
     * Handle OTP verification request.
     *
     * @param VerifyOtpRequest $request
     * @return \Illuminate\Http\JsonResponse
     * @throws ValidationException
     */
    #[Middleware('guest')]
    public function verifyOtp(VerifyOtpRequest $request): \Illuminate\Http\JsonResponse
    {
        try {
            $this->authService->verifyOtp(
                $request->phone,
                $request->otp
            );

            return $this->successResponse(null, 'Nomor HP berhasil diverifikasi.');
        } catch (ValidationException $e) {
            return $this->errorResponse(collect($e->errors())->flatten()->first(), 422, $e);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500, $e);
        }
    }

    /**
     * Show the forgot password form.
     *
     * @return Response
     */
    #[Middleware('guest')]
    public function showForgotPasswordForm(): Response
    {
        return Inertia::render('Auth/ForgotPassword');
    }

    /**
     * Handle forgot password request.
     *
     * @param ForgotPasswordRequest $request
     * @return RedirectResponse
     * @throws ValidationException
     */
    #[Middleware('guest')]
    public function forgotPassword(ForgotPasswordRequest $request): RedirectResponse
    {
        try {
            $this->authService->forgotPassword($request->email);

            return back()->with('success', 'Password reset link has been sent to your email address.');
        } catch (ValidationException $e) {
            return back()->withErrors($e->errors());
        }
    }

    /**
     * Show the reset password form.
     *
     * @param Request $request
     * @return Response
     */
    #[Middleware('guest')]
    public function showResetPasswordForm(Request $request): Response
    {
        return Inertia::render('Auth/ResetPassword', [
            'token' => $request->route('token'),
            'email' => $request->email,
        ]);
    }

    /**
     * Handle reset password request.
     *
     * @param ResetPasswordRequest $request
     * @return RedirectResponse
     * @throws ValidationException
     */
    #[Middleware('guest')]
    public function resetPassword(ResetPasswordRequest $request): RedirectResponse
    {
        try {
            $this->authService->resetPassword($request->validated());

            return redirect()->route('login')
                ->with('success', 'Password has been reset successfully! You can now login with your new password.');
        } catch (ValidationException $e) {
            return back()->withErrors($e->errors())->withInput($request->except('password', 'password_confirmation'));
        }
    }

    /**
     * Handle logout request.
     *
     * @param Request $request
     * @return RedirectResponse
     */
    #[Middleware('auth')]
    public function logout(Request $request): RedirectResponse
    {
        $this->authService->logoutWeb();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login')
            ->with('success', 'You have been logged out successfully.');
    }

    /**
     * Get remaining attempts for rate limiting (API endpoint).
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getRemainingAttempts(Request $request): \Illuminate\Http\JsonResponse
    {
        $action = $request->get('action'); // login_email, register, etc.
        $identifier = $request->get('identifier'); // email, phone, ip

        if (!$action || !$identifier) {
            return $this->errorResponse('Action and identifier are required', 400);
        }

        $attempts = $this->authService->getRemainingAttempts($action, $identifier);

        return $this->successResponse($attempts, 'Remaining attempts fetched successfully');
    }
}
