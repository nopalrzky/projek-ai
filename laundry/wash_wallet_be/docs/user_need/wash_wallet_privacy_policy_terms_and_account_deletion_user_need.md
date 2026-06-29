# User Need: Privacy Policy, Terms of Service, dan Account Deletion WashWallet

Tanggal: 2026-06-23

## 1. Latar Belakang

WashWallet membutuhkan halaman legal publik untuk mendukung kebutuhan publikasi dan review aplikasi mobile di Google Play.

Ekosistem WashWallet terdiri dari 3 aplikasi:

1. Customer App
   - App name: WashWallet
   - Package name: `com.washwallet.customer`
2. Cashier App
   - App name: WashWallet Cashier
   - Package name: `com.washwallet.cashier`
3. Production App
   - App name: WashWallet Production
   - Package name: `com.washwallet.production`

Ketiga aplikasi menggunakan backend dan database yang sama, beroperasi sebagai satu platform WashWallet, dan dikelola oleh organisasi yang sama. Karena itu, kebutuhan legal publik dapat dipenuhi dengan:

1. 1 Privacy Policy untuk seluruh ekosistem WashWallet.
2. 1 Terms of Service untuk seluruh ekosistem WashWallet.
3. 1 Account Deletion Policy untuk seluruh ekosistem WashWallet.

Dokumen ini disusun sebagai acuan kebutuhan sebelum dibuat implementation plan.

## 2. Ringkasan Kondisi Codebase Saat Ini

### Sudah Ada

1. Route publik sudah tersedia di `routes/web.php`:
   - `GET /privacy`
   - `GET /terms`
   - `GET /account-deletion`
2. Ketiga route legal tersebut berada di luar grup auth/dashboard, sehingga secara struktur route sudah ditujukan untuk akses publik tanpa login.
3. View Blade sudah tersedia:
   - `resources/views/public/privacy.blade.php`
   - `resources/views/public/terms.blade.php`
   - `resources/views/public/account-deletion.blade.php`
4. Model dan data operasional utama sudah ada untuk:
   - owner/admin melalui `users`,
   - customer mobile melalui `customer_accounts`, `customers`, dan `customer_addresses`,
   - employee mobile melalui `employees`,
   - order/transaksi melalui `orders`, `order_items`, `order_payment_logs`, `customer_topups`, dan data terkait.
5. Integrasi pihak ketiga yang terlihat di codebase:
   - Firebase Cloud Messaging untuk push notification.
   - Google Maps Platform melalui `GoogleMapsService` untuk distance calculation.
   - Midtrans melalui `MidtransService` untuk payment/topup/order payment.
   - Fonnte melalui `FonnteService` untuk WhatsApp notification dan OTP.

### Gap yang Relevan

1. Isi 3 view legal masih berupa placeholder pendek dan belum memenuhi requirement Privacy Policy, Terms, serta Account Deletion.
2. Belum ada konten yang secara eksplisit menyebut bahwa kebijakan berlaku untuk WashWallet, WashWallet Cashier, dan WashWallet Production.
3. Belum ada penjelasan lengkap tentang kategori data yang dikumpulkan dari customer, employee, transaksi, lokasi, perangkat, media, dan operasional.
4. Belum ada penjelasan lengkap tentang third party service yang digunakan.
5. Belum terlihat endpoint atau workflow self-service khusus untuk account deletion. Saat ini kebutuhan yang realistis adalah menyediakan halaman instruksi account deletion publik.
6. Informasi organisasi, email support, dan website resmi masih dapat menggunakan placeholder sampai data final tersedia.

## 3. Tujuan

Tujuan utama kebutuhan ini adalah:

1. Menyediakan halaman legal publik yang dapat diakses tanpa login oleh user umum, customer, employee, dan Google Play reviewer.
2. Membuat konten Privacy Policy yang menjelaskan pengumpulan, penggunaan, perlindungan, retensi, dan hak pengguna atas data pribadi.
3. Membuat konten Terms of Service yang menjelaskan aturan penggunaan layanan untuk customer, employee, dan pihak yang memakai platform.
4. Membuat konten Account Deletion yang menjelaskan cara meminta penghapusan akun dan batasan retensi data.
5. Mendukung kebutuhan Google Play:
   - Privacy Policy URL,
   - Account Deletion URL,
   - Data Safety Disclosure,
   - App Access Review,
   - Google Play App Review Process.

## 4. Aktor

1. `customer`
   Pengguna aplikasi WashWallet Customer yang membuat akun, mengelola alamat, membuat order, melakukan pembayaran/topup, menerima notifikasi, dan memberi review.
2. `employee`
   Pengguna aplikasi WashWallet Cashier atau WashWallet Production yang memakai akun kerja untuk operasional outlet, produksi, kasir, kurir, dan aktivitas terkait order.
3. `owner/admin`
   Pengguna web/dashboard yang mengelola outlet, employee, layanan, pembayaran, accounting, dan operasional bisnis laundry.
4. `public visitor`
   User umum yang membuka halaman legal tanpa login.
5. `Google Play reviewer`
   Reviewer yang perlu membuka halaman legal publik untuk memverifikasi compliance aplikasi mobile.
6. `support/admin WashWallet`
   Pihak yang menerima dan memproses permintaan terkait data pribadi atau penghapusan akun.

## 5. Scope Kebutuhan

Scope utama:

1. Memperbarui konten halaman publik `/privacy`, `/terms`, dan `/account-deletion`.
2. Memastikan ketiga halaman tetap dapat diakses tanpa autentikasi.
3. Menyusun isi legal yang konsisten untuk 3 aplikasi WashWallet dalam satu ekosistem.
4. Menyediakan instruksi penghapusan akun berbasis kontak support untuk customer dan jalur administrator/support untuk employee.
5. Menjelaskan data yang mungkin dihapus dan data yang mungkin tetap disimpan karena audit, kewajiban hukum, keamanan, dan pencegahan fraud.

Di luar scope:

1. Membuat endpoint self-service account deletion baru.
2. Membuat workflow admin internal untuk memproses deletion request.
3. Membuat sistem ticketing support.
4. Membuat perubahan database untuk anonymization atau deletion.
5. Memberikan legal advice final. Konten tetap perlu legal review sebelum produksi.

## 6. Data dan Sistem yang Harus Tercermin di Dokumen Legal

### 6.1 Data Customer

Privacy Policy harus menjelaskan bahwa WashWallet dapat mengumpulkan dan memproses data customer, termasuk:

1. Informasi akun:
   - nama,
   - nomor telepon,
   - email,
   - gender,
   - tanggal lahir jika diisi,
   - avatar jika tersedia,
   - password terenkripsi,
   - status verifikasi,
   - status aktif,
   - last login,
   - FCM token.
2. Informasi alamat:
   - label alamat,
   - nama dan nomor penerima,
   - jalan/alamat,
   - provinsi/kabupaten/kecamatan/desa,
   - catatan alamat,
   - latitude,
   - longitude,
   - status alamat utama.
3. Informasi transaksi:
   - order laundry,
   - status order,
   - item order,
   - invoice/payment amount,
   - metode pembayaran,
   - Midtrans order id/transaction id,
   - topup customer,
   - deposit balance,
   - riwayat transaksi.
4. Informasi pickup dan delivery:
   - tipe delivery,
   - alamat pickup,
   - alamat delivery,
   - jadwal pickup,
   - jadwal delivery,
   - biaya pickup/delivery,
   - instruksi khusus.
5. Review dan feedback:
   - rating,
   - komentar,
   - nama customer untuk review,
   - status publikasi review.

### 6.2 Data Employee

Privacy Policy harus menjelaskan bahwa WashWallet Cashier dan WashWallet Production memakai akun kerja employee. Data yang dapat dikumpulkan termasuk:

1. Informasi employee:
   - nama,
   - username,
   - nomor telepon,
   - alamat,
   - gender,
   - tanggal lahir,
   - avatar,
   - password terenkripsi,
   - PIN terenkripsi,
   - status aktif,
   - tanggal mulai,
   - outlet,
   - posisi,
   - role/permission,
   - last login.
2. Informasi perangkat:
   - FCM token,
   - device id,
   - device name,
   - last used time.
3. Informasi operasional:
   - aktivitas kasir,
   - aktivitas produksi,
   - aktivitas kurir,
   - status pekerjaan/order,
   - pickup/delivery activity,
   - order item process,
   - work log,
   - payroll/commission/fine/loan jika fitur terkait digunakan.

### 6.3 Data Owner/Admin

Privacy Policy harus menjelaskan bahwa owner/admin pada dashboard web dapat memiliki data:

1. Nama, username, email, phone, address, password terenkripsi, avatar, status akun, dan last login.
2. Role dan permission.
3. Outlet yang dikelola.
4. Wallet/coin/reward balance.
5. Data rekening owner jika fitur withdrawal digunakan.
6. Data accounting dan transaksi bisnis outlet.

### 6.4 Data Media dan Attachment

Privacy Policy harus menjelaskan penggunaan kamera/galeri dan file upload, termasuk:

1. Avatar customer/employee/owner jika digunakan.
2. Foto bukti pickup.
3. Foto bukti kedatangan/pengantaran.
4. Foto bukti timbang/order.
5. Evidence attachment proses produksi.
6. Attachment transaksi seperti deposit, expense, payroll, atau fine log jika fitur terkait digunakan.

### 6.5 Data Lokasi

Privacy Policy harus menjelaskan penggunaan data lokasi, termasuk:

1. Latitude dan longitude outlet.
2. Latitude dan longitude alamat customer.
3. Lokasi perangkat atau koordinat yang dikirim aplikasi mobile untuk menemukan outlet terdekat.
4. Koordinat yang digunakan untuk menghitung jarak dan biaya pickup/delivery.

Dokumen tidak boleh mengklaim tracking lokasi real-time terus-menerus kecuali plan menemukan implementasi tersebut di codebase.

### 6.6 Data Perangkat, Log, dan Diagnostik

Privacy Policy harus menjelaskan bahwa sistem dapat memproses:

1. FCM token customer.
2. FCM token employee per perangkat.
3. Device id dan device name.
4. User agent.
5. IP address pada OTP.
6. Log aplikasi/server dan diagnostic information untuk keamanan, debugging, dan operasional.

## 7. Third Party Services

Privacy Policy harus menjelaskan penggunaan layanan pihak ketiga berikut:

1. Firebase Cloud Messaging
   - Digunakan untuk push notification ke customer dan employee.
2. Google Maps Platform
   - Digunakan untuk maps/location services, distance calculation, geocoding/place search jika digunakan frontend, dan perhitungan layanan pickup/delivery.
3. Midtrans
   - Digunakan untuk pembayaran order, topup, invoice payment, virtual account, QRIS/e-wallet/payment channel lain yang didukung.
4. Fonnte
   - Digunakan untuk WhatsApp notification dan OTP WhatsApp.

Dokumen tidak boleh mengklaim integrasi pihak ketiga yang tidak terlihat atau tidak disebut dalam requirement.

## 8. User Need Fungsional

### FR-01 Halaman Privacy Policy Publik

1. Sistem harus menyediakan halaman `/privacy`.
2. Halaman harus dapat dibuka tanpa login.
3. Halaman harus menyebut bahwa Privacy Policy berlaku untuk:
   - WashWallet,
   - WashWallet Cashier,
   - WashWallet Production.
4. Halaman harus menjelaskan WashWallet sebagai platform manajemen laundry yang mendukung:
   - pemesanan laundry,
   - pengelolaan operasional laundry,
   - pembayaran,
   - tracking status laundry,
   - pickup dan delivery management.
5. Halaman harus menjelaskan kategori data yang dikumpulkan sesuai bagian data di dokumen ini.
6. Halaman harus menjelaskan tujuan penggunaan data:
   - membuat dan mengelola akun,
   - memproses order,
   - mengelola transaksi,
   - mengirim notifikasi,
   - menghitung biaya layanan,
   - menampilkan outlet dan layanan terdekat,
   - menyediakan pickup dan delivery,
   - menyediakan customer support,
   - meningkatkan kualitas layanan,
   - menjaga keamanan sistem,
   - memenuhi kewajiban hukum.
7. Halaman harus menjelaskan third party services.
8. Halaman harus menjelaskan data security, retention, user rights, children's privacy, policy changes, dan contact information.

### FR-02 Halaman Terms of Service Publik

1. Sistem harus menyediakan halaman `/terms`.
2. Halaman harus dapat dibuka tanpa login.
3. Halaman harus menyebut bahwa Terms berlaku untuk:
   - WashWallet,
   - WashWallet Cashier,
   - WashWallet Production.
4. Halaman harus menjelaskan tanggung jawab user/customer:
   - memberikan informasi akurat,
   - menjaga keamanan akun,
   - tidak menyalahgunakan layanan,
   - tidak menggunakan layanan untuk aktivitas ilegal.
5. Halaman harus menjelaskan tanggung jawab employee:
   - employee menggunakan akun kerja,
   - employee bertanggung jawab atas aktivitas akunnya,
   - employee wajib mengikuti kebijakan outlet dan organisasi.
6. Halaman harus menjelaskan pembayaran:
   - pembayaran diproses melalui metode yang tersedia,
   - harga layanan ditentukan oleh outlet laundry,
   - WashWallet dapat bertindak sebagai platform teknologi,
   - pembayaran pihak ketiga dapat mengikuti ketentuan provider pembayaran.
7. Halaman harus menjelaskan service availability dan maintenance.
8. Halaman harus memiliki limitation of liability sesuai praktik umum layanan digital.
9. Halaman harus memiliki contact information yang konsisten dengan Privacy Policy.

### FR-03 Halaman Account Deletion Publik

1. Sistem harus menyediakan halaman `/account-deletion`.
2. Halaman harus dapat dibuka tanpa login.
3. Halaman harus menjelaskan cara customer meminta penghapusan akun.
4. Halaman harus menyediakan instruksi minimal:
   - kirim email ke support,
   - gunakan subject yang jelas, misalnya `Account Deletion Request`,
   - sertakan nomor telepon/email yang terdaftar,
   - sertakan informasi verifikasi yang diperlukan secara aman.
5. Halaman harus menjelaskan bahwa employee pada Cashier dan Production adalah akun kerja.
6. Halaman harus menjelaskan bahwa penghapusan atau penonaktifan akun employee dapat diproses melalui:
   - administrator outlet,
   - administrator sistem,
   - tim support WashWallet.
7. Halaman harus menjelaskan data yang dapat dihapus atau dinonaktifkan, misalnya:
   - akun customer,
   - alamat tersimpan,
   - token perangkat,
   - data profil tertentu.
8. Halaman harus menjelaskan data yang mungkin tetap disimpan, misalnya:
   - riwayat transaksi/order,
   - invoice/payment record,
   - data audit,
   - data keamanan,
   - data yang wajib disimpan menurut hukum.
9. Halaman harus menjelaskan alasan penyimpanan data tertentu:
   - audit,
   - kewajiban hukum,
   - accounting,
   - dispute resolution,
   - pencegahan fraud,
   - keamanan sistem.
10. Halaman harus mencantumkan estimasi waktu pemrosesan. Rekomendasi default: maksimal 30 hari kalender sejak permintaan valid diterima.
11. Halaman harus mencantumkan contact information.

### FR-04 Konsistensi Kontak dan Placeholder

1. Ketiga halaman harus memakai contact information yang konsisten.
2. Jika data final belum tersedia, gunakan placeholder yang jelas, misalnya:
   - Organization: `WashWallet`
   - Email: `support@washwallet.com`
   - Website: `https://washwallet.com`
3. Placeholder harus mudah diganti saat informasi legal final tersedia.
4. Implementasi boleh menyertakan catatan internal/komentar kode bahwa konten perlu legal review, tetapi halaman publik sebaiknya tidak menampilkan copy yang membuat halaman terlihat belum siap kecuali memang sengaja diputuskan oleh stakeholder.

### FR-05 Akses Publik Tanpa Login

1. `/privacy`, `/terms`, dan `/account-deletion` tidak boleh membutuhkan autentikasi.
2. Halaman tidak boleh redirect ke login.
3. Halaman tidak boleh bergantung pada session user.
4. Halaman harus bisa dibuka oleh browser biasa dan Google Play reviewer.
5. Jika route diubah ke controller dedicated, tetap pastikan route berada di luar middleware auth.

## 9. Non-Functional Requirements

1. Konten harus mudah dibaca di desktop dan mobile.
2. Halaman harus menggunakan HTML semantik yang sederhana.
3. Halaman harus memiliki title yang jelas.
4. Bahasa utama boleh Indonesia atau Inggris, tetapi harus konsisten. Rekomendasi awal: Indonesia karena mayoritas aplikasi dan dokumen codebase menggunakan Indonesia.
5. Konten tidak boleh memuat klaim yang tidak sesuai codebase, misalnya:
   - tracking lokasi real-time terus menerus,
   - integrasi bank langsung untuk mutasi rekening,
   - penghapusan akun otomatis/self-service jika belum dibuat,
   - notifikasi SMS jika yang ada adalah WhatsApp/Fonnte dan FCM.
6. Halaman harus ringan dan tidak membutuhkan asset frontend besar.
7. Konten legal harus ditulis sebagai informasi umum dan perlu legal review sebelum produksi.

## 10. Acceptance Criteria

1. User umum dapat membuka `/privacy`, `/terms`, dan `/account-deletion` tanpa login.
2. Halaman `/privacy` memuat cakupan 3 aplikasi WashWallet.
3. Halaman `/privacy` memuat kategori data customer, employee, media, perangkat, lokasi, transaksi, review, dan operasional.
4. Halaman `/privacy` memuat Firebase, Google Maps Platform, Midtrans, dan Fonnte sebagai third party services.
5. Halaman `/terms` memuat tanggung jawab user/customer dan employee.
6. Halaman `/terms` memuat aturan pembayaran, service availability, dan limitation of liability.
7. Halaman `/account-deletion` memuat instruksi penghapusan akun customer.
8. Halaman `/account-deletion` memuat penjelasan akun employee sebagai akun kerja dan jalur admin/support.
9. Halaman `/account-deletion` memuat data yang dapat dihapus, data yang mungkin tetap disimpan, alasan retensi, dan estimasi waktu proses.
10. Ketiga halaman memiliki contact information yang konsisten.
11. Tidak ada middleware auth yang membuat Google Play reviewer gagal membuka halaman.

## 11. Rekomendasi untuk Implementation Plan

1. Pertahankan route publik yang sudah ada jika tidak ada kebutuhan controller khusus.
2. Perkaya isi 3 Blade view yang sudah ada daripada membuat sistem baru.
3. Gunakan layout HTML sederhana atau layout publik yang tidak memerlukan login.
4. Hindari implementasi account deletion API dalam plan ini kecuali user secara eksplisit memperluas scope.
5. Tambahkan test HTTP sederhana untuk memastikan 3 route legal public mengembalikan 200 tanpa auth.
6. Jika project memakai feature/browser test, test cukup memverifikasi konten kunci:
   - nama 3 aplikasi,
   - third party service,
   - account deletion request,
   - processing time.

## 12. Assumptions

1. Email support default sementara adalah `support@washwallet.com`.
2. Website resmi default sementara adalah `https://washwallet.com`.
3. Nama organisasi default sementara adalah `WashWallet`.
4. Estimasi waktu proses account deletion default adalah 30 hari kalender.
5. Scope awal hanya memperbarui halaman legal publik, bukan membangun sistem deletion request internal.
6. Konten akhir tetap perlu ditinjau oleh pihak legal atau stakeholder bisnis sebelum dipakai untuk production release.
