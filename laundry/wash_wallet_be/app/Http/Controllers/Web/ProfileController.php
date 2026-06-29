<?php

namespace App\Http\Controllers\Web;

use Illuminate\Routing\Attributes\Controllers\Middleware;

use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\ChangePasswordRequest;
use App\Http\Requests\Profile\UpdateProfileRequest;
use App\Http\Resources\Outlet\OutletResource;
use App\Http\Resources\User\UserResource;
use App\Services\ProfileService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

#[Middleware('auth')]
class ProfileController extends Controller
{
    public function __construct(private readonly ProfileService $profileService) {}

    public function index(): Response
    {
        try {
            $user = $this->profileService->getProfile();
            $overview = $this->profileService->getProfileOverview();
            $outlets = $this->profileService->getOwnedOutlets();
            $financeSummary = $this->profileService->getFinanceSummary();
            $referralSummary = $this->profileService->getReferralSummary();
            $setupChecklist = $this->profileService->getSetupChecklist();

            return Inertia::render('Dashboard/Profile/Index', [
                'user'            => (new UserResource($user))->resolve(),
                'overview'        => $overview,
                'outlets'         => OutletResource::collection($outlets)->resolve(),
                'financeSummary'  => $financeSummary,
                'referralSummary' => $referralSummary,
                'setupChecklist'  => $setupChecklist,
                'flash'           => [
                    'success' => session('success'),
                    'error'   => session('error'),
                ],
            ]);
        } catch (Throwable $e) {
            Log::error('[ProfileController] Failed to load profile page', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'profile_controller_error',
            ]);

            return Inertia::render('Dashboard/Profile/Index', [
                'user'     => null,
                'overview' => [],
                'outlets'  => [],
                'flash'    => [
                    'error' => 'Gagal memuat halaman profil',
                ],
            ]);
        }
    }

    public function edit(): Response|RedirectResponse
    {
        try {
            $user = $this->profileService->getProfile();

            return Inertia::render('Dashboard/Profile/Edit', [
                'user' => (new UserResource($user))->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[ProfileController] Failed to load profile edit page', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'profile_controller_error',
            ]);

            return redirect()->route('profile.index')
                ->with('error', 'Gagal memuat halaman edit profil');
        }
    }

    public function update(UpdateProfileRequest $request): RedirectResponse
    {
        try {
            $user = $this->profileService->updateProfile($request->validated());

            return redirect()
                ->route('profile.index')
                ->with('success', "Profil '{$user->name}' berhasil diperbarui");
        } catch (Throwable $e) {
            Log::error('[ProfileController] Failed to update profile', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'profile_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    public function changePassword(): Response|RedirectResponse
    {
        try {
            return Inertia::render('Dashboard/Profile/ChangePassword');
        } catch (Throwable $e) {
            Log::error('[ProfileController] Failed to load change password page', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'profile_controller_error',
            ]);

            return redirect()->route('profile.index')
                ->with('error', 'Gagal memuat halaman ganti password');
        }
    }

    public function updatePassword(ChangePasswordRequest $request): RedirectResponse
    {
        try {
            $user = $this->profileService->changePassword(
                $request->validated()['password']
            );

            return redirect()
                ->route('profile.index')
                ->with('success', 'Password berhasil diperbarui');
        } catch (Throwable $e) {
            Log::error('[ProfileController] Failed to change password', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'profile_controller_error',
            ]);

            return redirect()->back()
                ->with('error', $e->getMessage());
        }
    }
}
