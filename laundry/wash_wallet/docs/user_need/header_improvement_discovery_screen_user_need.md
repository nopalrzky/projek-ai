# User Need: Improvement Header Location Selector pada Discovery Screen

Tanggal: 2026-06-07

## Latar Belakang

Discovery screen customer app Wash Wallet perlu membantu customer memahami lokasi pengantaran yang sedang dipakai sebelum mereka melihat layanan, outlet, ongkir, estimasi, dan availability.

Saat ini kebutuhan utama bukan sekadar membuat header terlihat lebih baik, tetapi membuat header menjadi entry point yang jelas untuk melihat dan mengganti alamat tanpa meninggalkan konteks discovery. Customer harus bisa langsung menjawab:

1. Saya sedang melihat discovery berdasarkan alamat mana?
2. Bagaimana cara mengganti alamat dengan cepat?
3. Apakah saya bisa memilih alamat lewat pencarian, lokasi saat ini, alamat tersimpan, alamat terakhir, atau peta?

Dokumen ini menjadi acuan product need dan UX need untuk AI model lain saat menyusun implementation plan. Dokumen ini tidak mengunci detail final endpoint, package map, schema geocoding, atau desain high fidelity.

## Tujuan

1. Customer selalu melihat alamat aktif pada header Discovery.
2. Customer dapat mengganti alamat dari Discovery tanpa keluar dari screen.
3. Customer dapat memilih alamat melalui beberapa cara: search manual, current location, map picker, alamat favorit, dan alamat terakhir.
4. Customer tidak kehilangan konteks saat berpindah dari bottom sheet ke map picker dan kembali.
5. Discovery content, ongkir, estimasi, dan coverage dapat diperbarui setelah alamat aktif berubah.
6. Header tetap ringkas agar area konten Discovery tidak terganggu.

## Aktor

- Customer
- Customer app
- Backend
- Location/geocoding provider

## Istilah Bisnis

### Discovery Screen

Screen customer app untuk menemukan layanan atau outlet. Konten Discovery dapat dipengaruhi oleh alamat customer karena lokasi memengaruhi jarak, ongkir, estimasi pickup/delivery, dan coverage outlet.

### Header Location Selector

Bagian header Discovery yang menampilkan alamat aktif dan dapat ditekan untuk membuka flow pemilihan alamat.

### Alamat Aktif

Alamat yang sedang dipakai sebagai konteks Discovery dan order. Alamat aktif menjadi dasar untuk menampilkan layanan/outlet yang relevan, menghitung jarak, ongkir, estimasi, dan validasi coverage.

### Bottom Sheet Pilih Lokasi

Panel dari bawah layar yang muncul saat customer menekan alamat di header. Bottom sheet ini menjadi pusat pemilihan alamat tanpa membuat customer keluar dari Discovery.

### Map Picker

Screen atau full-screen modal untuk memilih titik alamat dengan menggeser peta dan pin.

## Masalah Saat Ini

1. Customer dapat melihat hasil Discovery tanpa selalu sadar alamat mana yang sedang dipakai.
2. Mengganti alamat berpotensi memaksa customer keluar dari konteks Discovery.
3. Opsi pemilihan alamat belum dipusatkan dalam satu flow yang jelas.
4. Flow map picker berisiko membuat customer kehilangan state bottom sheet sebelumnya.
5. Jika alamat berubah, Discovery perlu memperbarui data yang bergantung pada lokasi secara konsisten.

## Prinsip UX

1. Header harus ringkas, stabil, dan mudah dipahami.
2. Alamat aktif harus selalu terlihat, kecuali pada state loading awal yang valid.
3. Address selector harus terlihat sebagai elemen yang bisa ditekan.
4. Teks alamat panjang harus memakai ellipsis.
5. Touch target button dan selector harus nyaman untuk mobile.
6. Perubahan alamat harus terasa aman: customer memilih, melihat detail, lalu mengonfirmasi.
7. Customer tidak boleh kehilangan konteks Discovery ketika membuka bottom sheet atau map picker.
8. Jika lokasi gagal didapatkan, aplikasi harus memberi opsi alternatif, bukan dead end.

## Struktur Header Discovery

Header Discovery terdiri dari tiga elemen utama:

```text
[Back] [Address Selector] [Address History]
```

### 1. Back Button

- Posisi di sisi kiri.
- Fungsi kembali ke screen sebelumnya sesuai navigation stack.
- Bentuk disarankan icon button dengan area tap minimal 44 x 44 dp.
- Tidak boleh tertutup bottom sheet atau state loading.

### 2. Address Selector

- Posisi di tengah dan menjadi elemen paling dominan pada header.
- Menampilkan alamat aktif secara ringkas.
- Dapat ditekan untuk membuka Bottom Sheet Pilih Lokasi.
- Memakai icon lokasi atau chevron agar affordance clickable jelas.
- Teks wajib ellipsis jika terlalu panjang.

Contoh label:

```text
Jl. Kusuma Bangs...
Rumah
Kampus
Alamat belum dipilih
```

Jika alamat memiliki label dan detail, format yang disarankan:

```text
Rumah - Jl. Demak Jaya II...
```

Jika ruang sangat terbatas, label boleh diprioritaskan:

```text
Rumah
```

### 3. Address History Button

- Posisi di sisi kanan.
- Fungsi membuka daftar alamat terakhir atau alamat tersimpan.
- Untuk MVP, button ini boleh membuka bottom sheet yang sama dengan tab/section `Alamat terakhir`.
- Icon boleh memakai history, list location, atau document location.
- Jika product ingin header lebih clean, fungsi history dapat digabung ke Bottom Sheet Pilih Lokasi dan button kanan dipakai untuk aksi lain yang sudah ada di Discovery.

### Catatan Integrasi dengan Header Discovery Existing

Jika Discovery screen existing sudah memiliki search bar, sort button, atau filter pada header, implementation plan perlu menentukan komposisi yang tidak saling menggantikan.

Rekomendasi:

1. Location selector berada pada top header.
2. Search/sort/filter tetap berada di bawah header atau sebagai row kedua.
3. Address selector tidak boleh menghilangkan kemampuan search/filter Discovery.

## Default State

Saat customer masuk ke Discovery screen:

1. Header tampil di bagian atas.
2. Address selector menampilkan alamat aktif jika tersedia.
3. Jika alamat aktif belum tersedia, tampilkan `Alamat belum dipilih`.
4. Discovery content tetap berada di bawah header.
5. Header tidak terlalu tinggi agar konten Discovery tetap luas.
6. Jika data alamat sedang dimuat, tampilkan skeleton atau label loading yang tidak membuat layout berubah drastis.

Contoh:

```text
[Back] [Pin Jl. Kusuma Bangs... v] [History]
```

## Kebutuhan Pengguna

### 1. Customer Melihat Alamat Aktif

Sebagai customer, saya ingin melihat alamat aktif pada header Discovery agar saya tahu lokasi pengantaran yang sedang digunakan.

Kebutuhan:

- Header menampilkan alamat aktif secara konsisten.
- Jika alamat terlalu panjang, tampilkan versi ringkas dengan ellipsis.
- Jika belum ada alamat, tampilkan state yang jelas dan actionable.
- Alamat aktif harus tetap terlihat setelah customer refresh atau kembali ke Discovery, selama state aplikasi masih valid.

### 2. Customer Membuka Pilihan Lokasi dari Header

Sebagai customer, saya ingin menekan alamat di header agar saya bisa mengganti lokasi tanpa keluar dari Discovery.

Kebutuhan:

- Tap address selector membuka Bottom Sheet Pilih Lokasi.
- Discovery screen tetap terlihat di belakang dengan dim background.
- Bottom sheet dapat ditutup tanpa mengubah alamat.
- Jika customer menutup bottom sheet tanpa konfirmasi, alamat aktif tidak berubah.

### 3. Customer Mencari Alamat Manual

Sebagai customer, saya ingin mencari alamat secara manual agar saya bisa memilih lokasi pengantaran tanpa harus menggunakan GPS atau peta.

Kebutuhan:

- Bottom sheet menyediakan input search alamat.
- Customer dapat mengetik keyword alamat.
- Sistem menampilkan hasil alamat berdasarkan keyword.
- Customer dapat memilih salah satu hasil.
- Setelah hasil dipilih, aplikasi menampilkan detail alamat untuk dikonfirmasi.
- Alamat aktif baru hanya berubah setelah customer menekan `Konfirmasi`.

### 4. Customer Menggunakan Lokasi Saat Ini

Sebagai customer, saya ingin menggunakan lokasi saya saat ini agar saya tidak perlu mengetik alamat secara manual.

Kebutuhan:

- Bottom sheet menyediakan aksi `Gunakan lokasimu saat ini`.
- Jika permission lokasi belum diberikan, aplikasi meminta izin lokasi.
- Jika permission diberikan, aplikasi mengambil koordinat customer.
- Sistem melakukan reverse geocoding untuk menampilkan alamat.
- Customer tetap harus mengonfirmasi alamat sebelum alamat aktif berubah.
- Jika permission ditolak atau GPS gagal, tampilkan pesan error dan opsi alternatif.

Contoh error:

```text
Lokasi tidak ditemukan. Coba aktifkan GPS atau pilih lewat peta.
```

### 5. Customer Memilih Lokasi Lewat Peta

Sebagai customer, saya ingin memilih lokasi lewat peta agar saya bisa menentukan titik pengantaran dengan lebih presisi.

Kebutuhan:

- Bottom sheet menyediakan aksi `Pilih lewat peta`.
- Aksi membuka Map Picker.
- Pin berada di tengah peta.
- Customer dapat menggeser peta untuk mengubah titik.
- Alamat berubah mengikuti posisi pin jika reverse geocoding berhasil.
- Map Picker menyediakan panel konfirmasi alamat.
- Alamat aktif baru hanya berubah setelah customer menekan `Konfirmasi`.

### 6. Customer Melihat Alamat Favorit

Sebagai customer, saya ingin melihat alamat favorit agar saya bisa memilih alamat yang sering digunakan dengan cepat.

Kebutuhan:

- Bottom sheet menampilkan section `Alamat favorit` jika data tersedia.
- Contoh item: `Rumah`, `Kampus`, `Kantor`.
- Setiap item menampilkan label dan detail alamat ringkas.
- Tap alamat favorit memilih alamat tersebut dan menampilkan detail konfirmasi.
- Jika belum ada alamat favorit, section boleh disembunyikan.

### 7. Customer Melihat Alamat Terakhir

Sebagai customer, saya ingin melihat alamat terakhir agar saya tidak perlu mencari ulang lokasi yang baru saja saya pakai.

Kebutuhan:

- Bottom sheet menampilkan section `Alamat terakhir` jika data tersedia.
- Item alamat terakhir ditampilkan ringkas dan mudah dipilih.
- Tap alamat terakhir memilih alamat tersebut dan menampilkan detail konfirmasi.
- Jika belum ada alamat terakhir, section boleh disembunyikan atau menampilkan empty state ringan.

### 8. Customer Kembali dari Map Picker Tanpa Kehilangan State

Sebagai customer, saya ingin kembali dari halaman peta tanpa kehilangan konteks pemilihan alamat sebelumnya.

Kebutuhan:

- Jika customer membuka Map Picker dari bottom sheet lalu menekan back, customer kembali ke Discovery dengan Bottom Sheet Pilih Lokasi tetap terbuka.
- State bottom sheet sebelumnya tetap dipertahankan.
- Search keyword, daftar hasil, dan section alamat tetap ada jika sebelumnya sudah terisi.
- Alamat aktif tidak berubah jika customer belum konfirmasi.

Flow:

```text
Discovery Screen
-> tap address selector
Bottom Sheet Pilih Lokasi
-> tap Pilih lewat peta
Map Picker
-> tap back
Discovery Screen + Bottom Sheet Pilih Lokasi
```

### 9. Customer Mengonfirmasi Alamat

Sebagai customer, saya ingin mengonfirmasi alamat yang saya pilih agar alamat tersebut menjadi alamat aktif untuk Discovery dan order.

Kebutuhan:

- Button `Konfirmasi` hanya aktif jika alamat valid.
- Setelah customer konfirmasi, bottom sheet atau map picker tertutup.
- Header address berubah sesuai alamat baru.
- Discovery content refresh berdasarkan lokasi baru.
- Ongkir, estimasi, coverage outlet, dan listing layanan dapat menyesuaikan lokasi baru.
- Jika cart sudah berisi item, sistem perlu menangani dampak perubahan coverage sesuai aturan cart/checkout.

## Struktur Bottom Sheet Pilih Lokasi

Urutan komponen yang disarankan:

```text
Pilih lokasi

[Input: Cari alamat]

[Gunakan lokasimu saat ini] [Pilih lewat peta]

Alamat favorit
[Rumah]
Jl. Demak Jaya II No.82...

[Kampus]
Jl. Dr. Ir. H. Soekarno No.123...

Alamat terakhir
[Jl. Demak Jaya II No.82]
[Blok I No.19]
```

Aturan:

1. Search input berada dekat bagian atas.
2. Aksi current location dan map picker mudah dijangkau.
3. Alamat favorit lebih tinggi prioritasnya daripada alamat terakhir.
4. Section kosong boleh disembunyikan agar bottom sheet tetap clean.
5. Bottom sheet harus mendukung scroll jika daftar alamat panjang.
6. Bottom sheet harus bisa ditutup dengan drag down atau close button jika pattern aplikasi mendukung.

## Struktur Map Picker

Tampilan minimum:

```text
[Map Area]

Pin tetap di tengah map

Bottom Panel:
Pilih lokasi

Jl. Kusuma Bangsa No.28
Jl. Kusuma Bangsa No.28, Ketabang, Genteng, Surabaya...

[Konfirmasi]
```

Aturan:

1. Pin tetap berada di tengah viewport peta.
2. Customer menggeser peta, bukan menggeser pin.
3. Saat peta bergerak, alamat dapat masuk state loading.
4. Jika reverse geocoding gagal, tetap tampilkan koordinat atau pesan yang jelas.
5. Button `Konfirmasi` disabled jika titik atau alamat belum valid.
6. Back dari map picker mengembalikan customer ke bottom sheet, bukan menutup seluruh flow.

## Alur Bisnis yang Diharapkan

### Alur Membuka Bottom Sheet

1. Customer membuka Discovery.
2. Header menampilkan alamat aktif.
3. Customer tap address selector.
4. Bottom Sheet Pilih Lokasi muncul.
5. Customer memilih salah satu metode pemilihan alamat.

### Alur Search Alamat

1. Customer tap address selector.
2. Bottom sheet muncul.
3. Customer mengetik keyword alamat.
4. Sistem menampilkan hasil alamat.
5. Customer memilih hasil.
6. Sistem menampilkan detail alamat.
7. Customer tap `Konfirmasi`.
8. Header dan Discovery refresh dengan alamat baru.

### Alur Current Location

1. Customer tap `Gunakan lokasimu saat ini`.
2. Aplikasi meminta permission lokasi jika diperlukan.
3. Aplikasi mengambil koordinat device.
4. Sistem mengubah koordinat menjadi alamat.
5. Customer melihat alamat hasil deteksi.
6. Customer tap `Konfirmasi`.
7. Header dan Discovery refresh dengan alamat baru.

### Alur Map Picker

1. Customer tap `Pilih lewat peta`.
2. Aplikasi membuka Map Picker.
3. Customer menggeser peta sampai pin berada pada titik yang tepat.
4. Sistem menampilkan alamat berdasarkan posisi pin.
5. Customer tap `Konfirmasi`.
6. Map Picker tertutup.
7. Header dan Discovery refresh dengan alamat baru.

### Alur Back dari Map Picker

1. Customer membuka Map Picker dari bottom sheet.
2. Customer menekan back.
3. Customer kembali ke Discovery.
4. Bottom sheet tetap terbuka dengan state sebelumnya.
5. Customer dapat memilih metode lain atau menutup bottom sheet.

## Aturan Bisnis

1. Alamat aktif tidak berubah hanya karena customer memilih item sementara.
2. Alamat aktif berubah hanya setelah customer menekan `Konfirmasi`.
3. Discovery content harus direfresh setelah alamat aktif berubah.
4. Data ongkir, estimasi, coverage, dan availability yang bergantung pada lokasi harus dianggap stale setelah alamat berubah.
5. Backend tetap menjadi sumber kebenaran untuk coverage, ongkir final, eligibility order, dan validasi checkout.
6. Jika alamat baru membuat cart tidak valid, sistem harus memberi pesan atau flow resolusi sesuai aturan cart existing.
7. Jika customer tidak memberi permission lokasi, customer tetap harus bisa mencari alamat manual atau memilih lewat peta.
8. Jika geocoding gagal, customer tidak boleh terjebak tanpa opsi lanjut.
9. Jika customer menutup bottom sheet tanpa konfirmasi, tidak ada perubahan alamat.
10. Jika customer menekan back dari bottom sheet, bottom sheet tertutup dan Discovery tetap memakai alamat lama.

## Loading, Empty, dan Error State

### Loading Alamat Aktif

```text
Memuat alamat...
```

Gunakan skeleton jika pattern aplikasi sudah mendukung.

### Alamat Belum Dipilih

```text
Alamat belum dipilih
```

Tap label ini membuka Bottom Sheet Pilih Lokasi.

### Search Alamat Tidak Ada Hasil

```text
Alamat tidak ditemukan
Coba kata kunci lain atau pilih lewat peta.
```

### Permission Lokasi Ditolak

```text
Izin lokasi belum diberikan
Aktifkan izin lokasi atau pilih alamat secara manual.
```

### GPS atau Current Location Gagal

```text
Lokasi tidak ditemukan
Coba aktifkan GPS atau pilih lewat peta.
```

### Geocoding Gagal di Map Picker

```text
Alamat belum terbaca
Geser peta sedikit atau coba lagi.
```

### Refresh Discovery Gagal Setelah Alamat Berubah

```text
Gagal memuat data untuk lokasi ini
Periksa koneksi kamu dan coba lagi.
```

Alamat aktif yang sudah dikonfirmasi tetap boleh tampil, tetapi konten Discovery harus menampilkan error state yang bisa di-retry.

## Edge Cases

1. Customer belum memiliki alamat tersimpan.
2. Customer belum memilih alamat aktif.
3. Alamat aktif sangat panjang.
4. Customer membuka bottom sheet lalu menutup tanpa konfirmasi.
5. Customer memilih alamat sementara lalu back sebelum konfirmasi.
6. Customer menolak permission lokasi.
7. Permission lokasi ditolak permanen dari system settings.
8. GPS aktif tetapi koordinat gagal didapatkan.
9. Reverse geocoding gagal.
10. Search alamat lambat atau gagal karena koneksi.
11. Search alamat tidak menemukan hasil.
12. Customer berpindah ke map picker lalu back.
13. Customer mengubah alamat saat cart sudah berisi item.
14. Alamat baru berada di luar coverage outlet yang ada di cart.
15. Alamat baru membuat estimasi atau ongkir berubah.
16. Discovery refresh gagal setelah alamat berubah.
17. Customer berada offline.
18. Daftar alamat favorit atau terakhir kosong.
19. Customer menekan address selector berulang saat bottom sheet sedang loading.
20. App resumed dari background saat bottom sheet atau map picker masih aktif.

## Acceptance Criteria

1. Discovery header menampilkan back button, address selector, dan address history action atau equivalent access ke alamat terakhir.
2. Address selector menampilkan alamat aktif jika tersedia.
3. Address selector menampilkan `Alamat belum dipilih` jika belum ada alamat aktif.
4. Teks alamat panjang dipotong dengan ellipsis.
5. Address selector terlihat clickable melalui icon, chevron, atau style interaktif.
6. Tap address selector membuka Bottom Sheet Pilih Lokasi.
7. Bottom sheet muncul di atas Discovery dengan dim background.
8. Menutup bottom sheet tanpa konfirmasi tidak mengubah alamat aktif.
9. Bottom sheet menampilkan search input alamat.
10. Customer dapat mengetik keyword alamat.
11. Search alamat menampilkan daftar hasil jika data tersedia.
12. Search alamat menampilkan empty state jika tidak ada hasil.
13. Customer dapat memilih hasil search alamat.
14. Bottom sheet menampilkan aksi `Gunakan lokasimu saat ini`.
15. Current location meminta permission jika belum diberikan.
16. Jika permission diberikan, aplikasi mengambil koordinat dan menampilkan alamat hasil reverse geocoding.
17. Jika permission ditolak atau lokasi gagal, aplikasi menampilkan error yang jelas dan opsi alternatif.
18. Bottom sheet menampilkan aksi `Pilih lewat peta`.
19. Tap `Pilih lewat peta` membuka Map Picker.
20. Map Picker menampilkan map area, pin tengah, detail alamat, dan button konfirmasi.
21. Menggeser map memperbarui titik lokasi dan alamat jika provider mendukung.
22. Back dari Map Picker mengembalikan customer ke Discovery dengan bottom sheet tetap terbuka.
23. State bottom sheet sebelumnya tetap tersimpan setelah kembali dari Map Picker.
24. Bottom sheet menampilkan alamat favorit jika data tersedia.
25. Bottom sheet menampilkan alamat terakhir jika data tersedia.
26. Section alamat favorit atau terakhir boleh disembunyikan jika kosong.
27. Button `Konfirmasi` disabled jika alamat belum valid.
28. Setelah konfirmasi, header menampilkan alamat baru.
29. Setelah konfirmasi, bottom sheet atau map picker tertutup.
30. Setelah konfirmasi, Discovery content refresh berdasarkan alamat baru.
31. Setelah alamat berubah, data lokasi seperti ongkir, estimasi, coverage, dan availability dihitung ulang atau dimuat ulang.
32. Jika refresh Discovery gagal, aplikasi menampilkan error state dengan aksi retry.
33. Backend tetap memvalidasi coverage dan eligibility saat checkout atau order dibuat.

## Rekomendasi Data untuk Plan

Catatan: Bentuk payload final tidak dikunci oleh user need ini. Contoh berikut hanya menjelaskan data yang perlu dipikirkan saat implementation plan.

### Alamat Aktif

```json
{
  "id": 12,
  "label": "Rumah",
  "shortAddress": "Jl. Demak Jaya II No.82",
  "fullAddress": "Jl. Demak Jaya II No.82, Surabaya",
  "latitude": -7.2575,
  "longitude": 112.7521,
  "isPrimary": true
}
```

### Hasil Search Alamat

```json
{
  "placeId": "place_001",
  "title": "Jl. Kusuma Bangsa No.28",
  "subtitle": "Ketabang, Genteng, Surabaya",
  "latitude": -7.2563,
  "longitude": 112.7468,
  "source": "geocoding"
}
```

### State Location Picker

```ts
type LocationPickerState = {
  isBottomSheetOpen: boolean;
  isMapPickerOpen: boolean;
  searchKeyword: string;
  searchResults: AddressSearchResult[];
  selectedAddress: AddressCandidate | null;
  activeAddress: Address | null;
  isResolvingCurrentLocation: boolean;
  isSearchingAddress: boolean;
  errorMessage: string | null;
};
```

## Rekomendasi Komponen untuk Plan

Nama komponen boleh disesuaikan dengan arsitektur app.

```text
DiscoveryHeader
LocationPickerBottomSheet
AddressSearchInput
AddressResultList
SavedAddressList
RecentAddressList
CurrentLocationAction
MapPickerScreen
MapLocationConfirmPanel
```

Contoh props header:

```ts
type DiscoveryHeaderProps = {
  currentAddressLabel: string;
  isAddressLoading: boolean;
  onBack: () => void;
  onAddressPress: () => void;
  onHistoryPress?: () => void;
};
```

Event utama:

```text
onAddressPress -> openLocationBottomSheet
onSearchAddressChanged -> searchAddress
onAddressResultSelected -> selectAddressCandidate
onUseCurrentLocationPress -> requestCurrentLocation
onChooseFromMapPress -> openMapPicker
onMapCameraChanged -> resolveAddressFromPin
onMapBackPress -> closeMapPickerAndRestoreBottomSheet
onConfirmAddress -> setActiveAddressAndRefreshDiscovery
onDismissLocationPicker -> closeWithoutChangingAddress
```

## Prioritas Implementasi

### Phase 1: Header dan Bottom Sheet Foundation

Fokus:

1. Buat header dengan back button, address selector, dan action history jika dibutuhkan.
2. Tampilkan alamat aktif atau fallback `Alamat belum dipilih`.
3. Tap address selector membuka bottom sheet.
4. Bottom sheet menampilkan search input, current location action, map picker action, alamat favorit, dan alamat terakhir secara static atau memakai data existing.
5. Closing bottom sheet tanpa konfirmasi tidak mengubah alamat.

Output yang diharapkan:

- UX dasar sudah bisa dipakai.
- Belum wajib integrasi penuh geocoding, current location, atau map provider jika dependensi belum siap.

### Phase 2: Location Picker Interaction

Fokus:

1. Integrasi search alamat.
2. Integrasi current location permission dan reverse geocoding.
3. Integrasi map picker.
4. Implementasi behavior back dari map picker ke bottom sheet.
5. Tambahkan loading, empty, dan error state.

Output yang diharapkan:

- Customer bisa memilih alamat dari beberapa metode.
- State flow tidak hilang saat pindah antara bottom sheet dan map picker.

### Phase 3: Discovery Refresh dan Validasi Bisnis

Fokus:

1. Setelah alamat dikonfirmasi, update active address.
2. Refresh Discovery berdasarkan lokasi baru.
3. Hitung ulang ongkir, estimasi, coverage, dan availability jika data tersedia.
4. Tangani dampak cart jika alamat baru membuat layanan/outlet tidak eligible.
5. Pastikan backend tetap memvalidasi data final saat checkout.

Output yang diharapkan:

- Perubahan alamat benar-benar memengaruhi pengalaman Discovery dan order.
- Risiko mismatch lokasi dengan cart atau checkout ditangani.

## In Scope

1. Header location selector pada Discovery.
2. Bottom Sheet Pilih Lokasi.
3. Search alamat manual.
4. Current location action.
5. Map picker entry dan flow konfirmasi.
6. Alamat favorit dan alamat terakhir sebagai opsi pemilihan.
7. Behavior back dari map picker ke bottom sheet.
8. Refresh Discovery setelah alamat dikonfirmasi.
9. Loading, empty, dan error state untuk flow pilih lokasi.

## Out of Scope

1. Desain high fidelity final.
2. Pemilihan provider map/geocoding final.
3. Detail endpoint API final.
4. Detail database schema alamat customer.
5. Algoritma ranking Discovery berdasarkan lokasi.
6. Perhitungan ongkir final.
7. Perubahan aturan cart lintas outlet.
8. Push notification atau background location tracking.

## Relasi dengan User Need Lain

Dokumen ini berkaitan dengan:

- `docs/user_need/customer_home_search_discovery_ux_user_need.md`
- `docs/user_need/customer_service_discovery_search_filter_user_need.md`
- `docs/user_need/customer_service_courier_eligibility_user_need.md`
- `docs/user_need/customer_outlet_without_courier_user_need.md`
- `docs/user_need/customer_outlet_operational_hours_user_need.md`

Catatan penting:

1. Dokumen discovery/search/filter mengatur hasil layanan dan filter.
2. Dokumen ini mengatur konteks alamat pada Discovery.
3. Implementation plan harus memastikan location selector tidak menghilangkan search, sort, dan filter yang sudah didefinisikan pada dokumen Discovery lain.
4. Backend tetap menjadi sumber kebenaran untuk coverage, courier eligibility, operational hours, dan checkout.

## Keputusan untuk Plan

1. Header Discovery perlu menampilkan alamat aktif sebagai konteks utama lokasi.
2. Address selector menjadi entry point utama untuk mengganti alamat.
3. Bottom sheet adalah pattern utama untuk memilih lokasi tanpa meninggalkan Discovery.
4. Map picker boleh full-screen, tetapi back harus mengembalikan customer ke bottom sheet.
5. Alamat aktif hanya berubah setelah customer menekan `Konfirmasi`.
6. Discovery harus refresh setelah alamat aktif berubah.
7. MVP boleh memulai dari header dan bottom sheet foundation, lalu menunda integrasi map/geocoding penuh ke fase berikutnya.
8. Plan implementasi perlu memperhitungkan state management agar bottom sheet, map picker, dan Discovery refresh tidak saling merusak state.
9. Plan implementasi perlu menyiapkan fallback jika permission lokasi, geocoding, atau network gagal.
10. Search/sort/filter Discovery yang sudah ada tidak boleh hilang karena penambahan header location selector.

## Draft Task/Jira

Title:

```text
Improve Header Location Selector on Discovery Screen
```

Description:

```text
Improve Discovery header so customer can see the active delivery address, open a location picker bottom sheet, and choose a new address from manual search, current location, saved addresses, recent addresses, or map picker. The selected address should only become active after confirmation. After confirmation, Discovery content must refresh based on the new location while preserving existing search, sort, and filter capabilities.
```

Recommended MVP scope:

1. Build Discovery header with address selector.
2. Open Bottom Sheet Pilih Lokasi from address selector.
3. Show search input, current location action, map picker action, favorite addresses, and recent addresses.
4. Support selecting and confirming an address candidate.
5. Update header address and trigger Discovery refresh after confirmation.
6. Keep full geocoding/map provider integration as next iteration if not technically ready.
