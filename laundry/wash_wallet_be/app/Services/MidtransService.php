<?php

namespace App\Services;

use Midtrans\Config;
use Midtrans\CoreApi;
use Exception;
use Illuminate\Support\Facades\Log;

class MidtransService
{
    public function __construct()
    {
        Config::$serverKey = (string) (config('midtrans.server_key') ?? '');
        Config::$isProduction = (bool) config('midtrans.is_production', false);
        Config::$isSanitized = true;
        Config::$is3ds = true;
    }

    /**
     * Charge transaction using Core API
     */
    public function charge(array $payload): array
    {
        try {
            $response = CoreApi::charge($payload);

            return $this->normalizeResponse($response, $payload['payment_type']);
        } catch (Exception $e) {
            Log::error('Midtrans Core API Charge Error', [
                'error' => $e->getMessage(),
                'payload' => $payload
            ]);
            throw new Exception("Gagal memproses pembayaran ke Midtrans: " . $e->getMessage());
        }
    }

    /**
     * Normalize Midtrans response for internal storage
     */
    private function normalizeResponse($response, string $paymentType): array
    {
        $data = (array) $response;
        $result = [
            'transaction_id' => $data['transaction_id'] ?? null,
            'order_id'       => $data['order_id'] ?? null,
            'payment_type'   => $paymentType,
            'expire_time'    => $data['expiry_time'] ?? null,
        ];

        switch ($paymentType) {
            case 'bank_transfer':
                $vaData = $this->getVaData($data);
                $result['va_number'] = $vaData['va_number'];
                $result['bank']      = $vaData['bank'];
                $result['instructions'] = "Transfer via ATM atau M-Banking ke Virtual Account {$vaData['bank']} ({$vaData['va_number']}).";
                break;

            case 'echannel':
                $result['bill_key']    = $data['bill_key'] ?? null;
                $result['biller_code'] = $data['biller_code'] ?? null;
                $result['bank']        = 'MANDIRI';
                $result['instructions'] = "Bayar via ATM/M-Banking Mandiri dengan Biller Code {$result['biller_code']} dan Bill Key {$result['bill_key']}.";
                break;

            case 'permata':
                $result['va_number'] = $data['permata_va_number'] ?? null;
                $result['bank']      = 'PERMATA';
                $result['instructions'] = "Transfer via ATM/M-Banking ke Virtual Account Permata ({$result['va_number']}).";
                break;

            case 'gopay':
            case 'qris':
            case 'shopeepay':
                $actions = $data['actions'] ?? [];

                $qrAction = collect($actions)->firstWhere('name', 'generate-qr-code');
                $result['qr_url'] = data_get($qrAction, 'url');

                $deeplinkAction = collect($actions)->firstWhere('name', 'deeplink-redirect');
                $result['deeplink_url'] = data_get($deeplinkAction, 'url');

                $result['instructions'] = "Silakan scan QR Code yang tersedia atau klik tombol 'Buka Aplikasi' jika Anda membukanya melalui smartphone.";
                break;

            case 'cstore':
                $result['payment_code'] = $data['payment_code'] ?? null;
                $result['store']        = $data['store'] ?? null;

                if (empty($result['payment_code'])) {
                    throw new Exception('Payment code tidak diterima dari Midtrans');
                }

                $storeName = ucfirst($result['store']);
                $result['instructions'] = "Bayar di kasir {$storeName} dengan menyebutkan kode pembayaran: {$result['payment_code']}.";
                break;

            case 'akulaku':
            case 'kredivo':
                $result['redirect_url'] = $data['redirect_url'] ?? null;

                if (empty($result['redirect_url'])) {
                    throw new Exception('Redirect URL tidak diterima dari Midtrans');
                }

                $providerName = ucfirst($paymentType);
                $result['instructions'] = "Anda akan diarahkan ke {$providerName} untuk menyelesaikan pembayaran. Login atau daftar akun {$providerName}, lalu setujui transaksi.";
                break;
        }

        return $result;
    }


    private function getVaData(array $data): array
    {
        if (isset($data['va_numbers'][0])) {
            return [
                'va_number' => $data['va_numbers'][0]->va_number,
                'bank'      => strtoupper($data['va_numbers'][0]->bank),
            ];
        }

        if (isset($data['bill_key'])) {
            return [
                'va_number' => $data['bill_key'],
                'bank'      => 'MANDIRI',
            ];
        }

        if (isset($data['permata_va_number'])) {
            return [
                'va_number' => $data['permata_va_number'],
                'bank'      => 'PERMATA',
            ];
        }

        return ['va_number' => null, 'bank' => null];
    }
}
