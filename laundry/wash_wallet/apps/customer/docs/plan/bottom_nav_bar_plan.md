# Implementasi Bottom Navigation Bar (Comprehensive Plan)

Plan ini bertujuan untuk mengubah struktur *routing* agar mendukung Bottom Navigation Bar dengan memori state per-tab (menggunakan `StatefulShellRoute.indexedStack` dari `go_router`) dan mengintegrasikan ikon aset kustom. Plan ini telah diperkuat untuk memitigasi risiko *state*, *routing*, dan *memory leaks*.

---

## 1. Definisikan Kontrak Route Final
Harus ada batasan jelas mana yang menjadi *root route* (berjalan di atas navbar) dan mana yang menjadi *branch route* (berjalan di dalam navbar).

**Daftar Path Canonical per Tab (Branch Routes):**
1.  **Beranda**: `/home`
2.  **Outlet**: `/outlets`
3.  **Promo**: `/promos`
4.  **Pesanan**: `/orders`
5.  **Akun**: `/profile`

**Aturan Redirect Auth (`app_router.dart`):**
- Auth Redirect (Login/Register/Splash) tetap beroperasi di *root level*.
- Setelah `CustomerAuthAuthenticated`, arahkan ke `/home` jika *state matchedLocation* berada di ranah Auth.
- Tidak ada validasi redirect yang spesifik mengunci ke `/home` secara berlebihan agar user bisa mengakses *deep link* ke `/orders` atau `/profile`.

---

## 2. Handling Route di Luar Tab (Non-Tab Routes)
Halaman detail, create, edit, atau flow yang panjang (contoh: `/customer-addresses`, `/customer-addresses/create`, `/outlet/detail/:id`) **WAJIB** di-push menggunakan `context.push()` ke *root navigator*.
- **Alasan**: Menghindari *bottom navbar* ikut terbawa ke halaman detail yang seharusnya *full screen*, serta menghindari kerusakan *back stack* pada tab.
- Di GoRouter, sub-rute (halaman detail) bisa diletakkan di luar `StatefulShellRoute` pada daftar *routes* utama agar *parentNavigatorKey* mengarah ke root.

---

## 3. Definisikan Kontrak Back Behavior
Prioritas penanganan tombol back Android (`PopScope` atau *default back dispatcher*):
1.  **Di dalam tab (Branch aktif):** Jika user melakukan push ke sub-halaman di *dalam* branch (jika ada), pop halaman tersebut terlebih dahulu.
2.  **Kembali ke Tab Default:** Jika user menekan tombol back pada root branch (misal: `/orders`), **jangan langsung keluar aplikasi**. Arahkan user ke tab default yaitu `/home`.
3.  **Exit App:** Jika user menekan back saat berada di root `/home`, aplikasi baru boleh keluar (close).

---

## 4. Definisikan Strategi State dan Lifecycle
Penempatan *Provider/Cubit* harus presisi untuk menghindari *memory leak* dan *stale data*.
- **Shell-level (Global State):** `CustomerAuthCubit`, `OnboardingCubit`, diletakkan di luar `StatefulShellRoute` agar tidak mati saat pindah tab.
- **Branch-level (Tab State):** Cubit untuk masing-masing tab (contoh: `HomeDashboardCubit`, `OrderListCubit`) dibungkus tepat pada elemen *builder* `GoRoute` masing-masing *branch*. Ini mencegah instance digandakan.
- **Strategi Refresh Data (Stale Data):**
  Untuk mencegah data tertinggal (misal habis mengubah alamat, lalu pindah tab home dan home masih data lama):
  Gunakan event pendengar (*listener*) pada `AppRouter` atau `didPopNext` (RouteAware) jika diperlukan, namun untuk performa terbaik, *trigger* penyegaran dapat diletakkan di `onTap` pada Bottom Navigation saat menekan tab yang sudah aktif, ATAU merefresh data *on-demand* setiap kali tab dirender jika dirasa datanya sangat *volatile*.

---

## 5. Definisikan Kebijakan Reselect Tab
Jika pengguna melakukan *tap* pada tab yang sudah aktif:
- **Kebijakan:** Pop semua halaman di dalam branch tersebut menuju ke halaman awal (root branch), lalu otomatis lakukan *scroll to top* (opsional jika menggunakan `PrimaryScrollController`).
- Ini memberi *feedback* yang konsisten layaknya aplikasi e-commerce besar.

---

## 6. Detail Komponen & Aset
#### `lib/core/presentation/screens/main_navigation_screen.dart`
Membuat `ScaffoldWithNavBar` yang menerima `StatefulNavigationShell`.
- Menggunakan `Image.asset('assets/images/ic_nav_*.png')`.
- Ukuran ikon konsisten (misal: `width: 24, height: 24`).
- Warna ditangani dengan `ColorFilter.mode` berdasarkan status aktif/inaktif menggunakan token `context.colors`.
- Aman dari *safe area* (termasuk *bottom notch* iPhone) dan *keyboard overlap* (atur `resizeToAvoidBottomInset: false` jika form hanya di-handle di luar root).

---

## 7. Acceptance Criteria Non-Fungsional
1.  **Perpindahan Tab Halus:** Tidak ada jeda atau *rebuild* berlebihan saat mengganti tab.
2.  **Scroll Position Aman:** Jika *scroll* ke bawah di `/home`, pergi ke `/profile`, dan kembali ke `/home`, posisi *scroll* tidak ter-reset.
3.  **Memory Management:** RAM tidak *spike* (Batas wajar). Data-data yang tidak tampil sebisa mungkin tidak menggunakan list *infinite* tanpa paginasi di setiap tab sekaligus.
4.  **Tanpa Redirect Loop:** Auth redirect tidak menyebabkan aplikasi nyangkut berpindah antara `/splash` dan `/home`.

---

## 8. Langkah Eksekusi (Jika Di-Approve)

1.  Membangun ulang (re-create) placeholder screen yang sempat hilang/terhapus.
2.  Membuat `MainNavigationScreen`.
3.  Merombak `app_router.dart` dengan memasukkan `StatefulShellRoute.indexedStack`.
4.  Menerapkan *Back Button Contract* dan *Reselect Policy* di dalam `MainNavigationScreen`.
5.  Verifikasi semua Acceptance Criteria.
