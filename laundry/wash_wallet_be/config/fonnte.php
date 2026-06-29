<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Fonnte API Configuration
    |--------------------------------------------------------------------------
    | Token dan endpoint untuk Fonnte WhatsApp Gateway.
    | Daftar akun di https://fonnte.com dan scan QR di dashboard.
    */

    'token'        => env('FONNTE_TOKEN'),
    'api_url'      => env('FONNTE_API_URL', 'https://api.fonnte.com/send'),
    'country_code' => env('FONNTE_COUNTRY_CODE', '62'),

    /*
    |--------------------------------------------------------------------------
    | OTP Configuration
    |--------------------------------------------------------------------------
    */

    'otp' => [
        'length'               => (int) env('OTP_LENGTH', 6),
        'expiry_minutes'       => (int) env('OTP_EXPIRY_MINUTES', 5),
        'max_attempts'         => (int) env('OTP_MAX_ATTEMPTS', 3),
        'rate_limit_seconds'   => (int) env('OTP_RATE_LIMIT_SECONDS', 60),
    ],

    /*
    |--------------------------------------------------------------------------
    | Message Templates
    |--------------------------------------------------------------------------
    */

    'templates' => [
        'otp' => "*WashWallet* - Kode Verifikasi\n\nKode OTP Anda: *{code}*\n\nBerlaku selama *{expiry} menit*. Jangan bagikan kode ini ke siapapun.\n\n_Tim WashWallet_",
    ],
];
