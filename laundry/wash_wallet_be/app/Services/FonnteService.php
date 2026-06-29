<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FonnteService
{
    protected string $token;
    protected string $apiUrl;
    protected string $countryCode;

    public function __construct()
    {
        $this->token       = config('fonnte.token', '');
        $this->apiUrl      = config('fonnte.api_url', 'https://api.fonnte.com/send');
        $this->countryCode = config('fonnte.country_code', '62');
    }

    /**
     * Send a WhatsApp message via Fonnte API.
     *
     * @throws \Exception
     */
    public function sendMessage(string $phoneNumber, string $message): array
    {
        if (empty($this->token)) {
            Log::warning('FonnteService: FONNTE_TOKEN is not configured. Skipping send.');
            return ['status' => false, 'reason' => 'Token not configured'];
        }

        try {
            $normalizedPhone = $this->normalizePhoneNumber($phoneNumber);

            $response = Http::withHeaders([
                'Authorization' => $this->token,
            ])->asForm()->post($this->apiUrl, [
                'target'      => $normalizedPhone,
                'message'     => $message,
                'countryCode' => $this->countryCode,
                'typing'      => false,
            ]);

            $data = $response->json() ?? [];

            if (!$response->successful() || ($data['status'] ?? false) === false) {
                $reason = $data['reason'] ?? 'Unknown error';

                Log::error('FonnteService: API Error', [
                    'phone'    => $phoneNumber,
                    'reason'   => $reason,
                    'response' => $data,
                ]);

                throw new \Exception("Gagal mengirim pesan WhatsApp: {$reason}");
            }

            return $data;
        } catch (\Exception $e) {
            Log::error('FonnteService: Exception', [
                'phone' => $phoneNumber,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Send OTP message to a phone number.
     *
     * @throws \Exception
     */
    public function sendOtp(string $phoneNumber, string $otpCode): array
    {
        $expiryMinutes = config('fonnte.otp.expiry_minutes', 5);

        $message = str_replace(
            ['{code}', '{expiry}'],
            [$otpCode, $expiryMinutes],
            config('fonnte.templates.otp', "Kode OTP Anda: {code}\nBerlaku {expiry} menit.")
        );

        return $this->sendMessage($phoneNumber, $message);
    }

    /**
     * Validate Indonesian phone number format.
     */
    public function validatePhoneNumber(string $phoneNumber): bool
    {
        $phone = preg_replace('/[^0-9]/', '', $phoneNumber);

        return (bool) preg_match('/^(0[8][0-9]{8,11}|62[8][0-9]{8,11})$/', $phone);
    }

    /**
     * Normalize phone number — strip non-numeric chars.
     * Fonnte handles leading-0 → country-code conversion via countryCode param.
     */
    protected function normalizePhoneNumber(string $phoneNumber): string
    {
        return preg_replace('/[^0-9]/', '', $phoneNumber);
    }
}
