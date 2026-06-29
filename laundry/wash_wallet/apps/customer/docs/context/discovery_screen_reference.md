Berikut adalah deskripsi yang bisa langsung kamu kirim ke AI lain (Claude, Gemini, Codex, Cursor, dsb.) sebagai referensi desain untuk WashWallet.

---

# Referensi UI/UX Discovery Screen WashWallet (Mengacu pada GoFood)

Gunakan tampilan pencarian GoFood sebagai referensi utama untuk halaman Discovery/Pencarian layanan WashWallet. Fokus pada pengalaman pengguna yang cepat, familiar, dan mobile-first.

## 1. Struktur Layout Keseluruhan

Halaman menggunakan pola vertikal scroll dengan urutan:

### Header Sticky

Header selalu berada di atas dan tetap terlihat saat pengguna melakukan scroll.

Komponen header:

* Tombol Back di kiri
* Search Bar di tengah (mengambil hampir seluruh lebar layar)
* Tombol Clear Search (X) di dalam search bar

Contoh:

```
[←] [ Cari layanan laundry............. (X) ]
```

Karakteristik:

* Rounded corner besar (pill shape)
* Background putih
* Shadow sangat tipis
* Tinggi sekitar 44-48px

---

## 2. Horizontal Quick Filter

Tepat di bawah search bar terdapat filter horizontal yang dapat discroll.

Contoh GoFood:

```
[Filter]
[Dibawah 5rb]
[Menu 30rb]
[dll]
```

Adaptasi WashWallet:

```
[Filter]
[Dibawah 10rb]
[Express]
[Satuan]
[Kiloan]
[Pickup]
[Delivery]
[Promo]
[Rating 4.5+]
```

Karakteristik:

* Bentuk capsule/pill
* Tinggi 36-40px
* Scroll horizontal
* Selected state menggunakan warna primary WashWallet
* Unselected state menggunakan border abu-abu tipis

---

## 3. Tombol Filter Utama

Filter icon berada paling kiri sebelum chip filter.

Ketika ditekan membuka Bottom Sheet.

Isi Filter:

### Lokasi

```
Jarak Terdekat
Semua Outlet
```

### Metode Pembayaran

```
Tunai
QRIS
Transfer
E-Wallet
```

### Harga

```
Min Price
Max Price
```

Preset:

```
0 - 10rb
10rb - 25rb
25rb - 50rb
50rb+
```

### Rating

```
★★★★☆
★★★★½
★★★★★
```

### Jenis Layanan

```
Kiloan
Satuan
Karpet
Sepatu
Tas
Bed Cover
```

Bottom Sheet menggunakan tinggi ±80% layar.

---

# 4. Hasil Pencarian Menggunakan Card Outlet

Setiap hasil pencarian ditampilkan dalam bentuk Outlet Card.

Struktur:

```
[Thumbnail Outlet]

Nama Outlet
★★★★☆ 4.8 (500+ ulasan)

Lokasi • 1.2 km
Estimasi selesai 1 hari

[Promo]
[Diskon]
[Voucher]
```

Contoh:

```
Laundry Bersih Mulyosari

⭐ 4.8 (500+ review)

1.2 km • Selesai 24 jam
```

Karakteristik:

* Thumbnail kiri
* Informasi outlet kanan
* Card full width
* Tidak menggunakan border tebal
* Dipisahkan spacing putih

---

# 5. Promo Badge

Seperti GoFood yang menampilkan promo tepat di bawah informasi toko.

WashWallet dapat menggunakan:

```
Diskon 20%
Gratis Pickup
Cashback 10%
Member Price
Express Promo
```

Tampilan:

* Capsule kecil
* Border tipis
* Background soft
* Maksimal 2-3 promo terlihat

---

# 6. Preview Layanan di Dalam Outlet

Di bawah informasi outlet tampil beberapa layanan populer.

GoFood menampilkan makanan.

WashWallet menampilkan layanan.

Contoh:

```
Cuci Kiloan Reguler
Rp7.000/kg

Cuci Express
Rp12.000/kg

Cuci Sepatu
Rp25.000
```

Karakteristik:

* Horizontal scroll
* Thumbnail kecil
* Harga langsung terlihat
* Maksimal 3-5 item preview

---

# 7. Search Experience

Saat user mengetik:

Contoh:

```
"Cuci"
```

Yang muncul:

✅ Layanan

```
Cuci Kiloan
Cuci Express
Cuci Sepatu
```

❌ Jangan tampilkan outlet terlebih dahulu.

Karena user mencari layanan, bukan toko.

Setelah memilih layanan:

```
Cuci Kiloan
```

Baru tampil daftar outlet yang menyediakan layanan tersebut.

Persis seperti GoFood ketika mencari menu makanan.

---

# 8. Floating Cart Bar (Adaptasi)

GoFood memiliki keranjang hijau di bawah.

WashWallet dapat menggunakan:

```
1 layanan dipilih

Total Rp20.000
```

dengan tombol:

```
[Lihat Keranjang]
```

Posisi:

* Fixed bottom
* Floating
* Rounded besar
* Warna primary WashWallet

Muncul hanya ketika cart tidak kosong.

---

# 9. Visual Style

Gunakan prinsip GoFood:

### Spacing

Longgar dan nyaman


### Shadow

Sangat tipis

Jangan menggunakan card yang berat.


# 10. Perubahan Khusus untuk WashWallet

Yang perlu dibedakan dari GoFood:

### Jangan fokus ke outlet

Fokus utama:

```
Layanan → Outlet
```

bukan

```
Outlet → Layanan
```

Karena orang biasanya mencari:

* Cuci kiloan
* Cuci sepatu
* Cuci karpet
* Express laundry

bukan mencari nama outlet.

Urutan ideal:

```
Search layanan
↓
Pilih layanan
↓
Muncul outlet yang menyediakan
↓
Pilih outlet
↓
Pilih varian layanan
↓
Tambah ke cart
```

Ini akan membuat pengalaman Discovery WashWallet terasa familiar seperti GoFood, tetapi tetap sesuai dengan alur bisnis laundry.
