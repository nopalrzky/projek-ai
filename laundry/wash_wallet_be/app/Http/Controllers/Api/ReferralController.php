<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Throwable;

class ReferralController extends Controller
{
    /**
     * Check if referral code is valid
     */
    public function checkReferralCode(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'code' => 'required|string|size:8',
            ]);

            if ($validator->fails()) {
                return $this->errorResponse('Format kode referral tidak valid', 422);
            }

            $code = strtoupper($request->input('code'));

            $referrer = User::where('referral_code', $code)
                ->where('status', UserStatus::Active)
                ->first(['id', 'name', 'referral_code']);

            if (!$referrer) {
                return $this->errorResponse('Kode referral tidak ditemukan', 404);
            }

            return $this->successResponse(
                [
                    'valid'    => true,
                    'referrer' => [
                        'id'   => $referrer->id,
                        'name' => $referrer->name,
                    ],
                ],
                'Referral code is valid'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[ReferralController] Failed to check referral code', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'referral',
            ]);

            return $this->errorResponse('Gagal memeriksa kode referral', 500, $e);
        }
    }
}
