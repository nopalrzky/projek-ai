# Courier Pricing Zone Bug: Default Price Applied Instead of Zone Price

## Deskripsi Masalah
Pengguna telah menambahkan zona/kecamatan baru untuk penentuan harga kurir (zone-based pricing), dan alamat pengguna juga berada di kecamatan yang sama. Namun, ketika dites di aplikasi customer, harga yang muncul adalah harga default (flat fee), bukan harga khusus zona/kecamatan tersebut.

## Analisis Masalah
Berdasarkan hasil proses debugging, terdapat 2 penyebab utama yang membuat kalkulasi zona gagal dan melakukan *fallback* ke harga default (`flat_fee`):

1. **Parameter Request di Frontend vs Backend Berbeda**:
   - Di sisi Frontend (`CourierPricingRemoteDatasourceImpl` pada Flutter), parameter ID alamat dikirim dengan key `addressId`:
     ```dart
     queryParameters: {
       'latitude': latitude,
       'longitude': longitude,
       'customerId': customerId,
       'orderTotal': orderTotal,
       'addressId': addressId, // <-- Dikirim sebagai 'addressId'
     }
     ```
   - Di sisi Backend (`CalculateDeliveryFeeRequest.php` pada Laravel), validasi justru mengekspektasikan `customerAddressId`. Akibatnya, `addressId` tidak tervalidasi dan diabaikan dari `$request->validated()`.
     ```php
     return [
         'customerAddressId'  => 'nullable|integer|exists:customer_addresses,id',
         // ...
     ];
     ```

2. **Backend Hardcode Nilai `null` untuk Address di Calculation Engine**:
   - Di dalam class `CourierSettingService::calculateDeliveryFee()`, pemanggilan `pricingEngine->calculate()` justru memberikan argumen statis `null` pada parameter kelima (yang ditujukan untuk object `$address`):
     ```php
     return $this->pricingEngine->calculate(
         $setting,
         $distanceKm,
         $data['orderTotal'] ?? null,
         $data['customerId'] ?? null,
         null // <-- Masalah utamanya di sini: Object Address tidak diambil & tidak diteruskan
     );
     ```
   - Akibat pengiriman nilai `null` ini, fungsi `calculateZoneBased` di `CourierPricingEngine.php` akan langsung memberikan nilai harga flat/default:
     ```php
     if (!$address) return (float) $s->flat_fee; // Flat fee dipanggil karena $address null
     ```

## Saran Perbaikan
1. **Penyesuaian di sisi Frontend (Aplikasi Customer)**:
   Ubah key dari `addressId` menjadi `customerAddressId` saat memanggil API di `CourierPricingRemoteDatasourceImpl.dart` agar seragam dengan form request di Backend. 
2. **Penyesuaian di sisi Backend (Service)**:
   Pada `CourierSettingService.php` function `calculateDeliveryFee`, inisiasi model `CustomerAddress` menggunakan ID yang diberikan, lalu teruskan ke dalam fungsi `calculate()`:
   ```php
   $address = null;
   if (!empty($data['customerAddressId'])) {
       $address = \App\Models\CustomerAddress::find($data['customerAddressId']);
   }

   return $this->pricingEngine->calculate(
       $setting,
       $distanceKm,
       $data['orderTotal'] ?? null,
       $data['customerId'] ?? null,
       $address // <-- Object address kini diteruskan ke engine
   );
   ```