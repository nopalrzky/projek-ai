# User Need: Validasi Ketersediaan Jadwal Kurir Berdasarkan Jam Saat Ini

Tanggal: 2026-06-01

## Latar Belakang

Wash Wallet menyediakan layanan penjemputan dan pengiriman menggunakan kurir berdasarkan jadwal operasional tertentu (slot waktu) di masing-masing outlet. Saat ini, sistem perlu ditingkatkan dalam memvalidasi ketersediaan jadwal kurir berdasarkan waktu riil (jam saat ini) secara lebih presisi. 

Hal ini penting untuk mencegah customer memesan slot waktu yang secara logis sudah terlewat atau sedang berjalan. Membiarkan customer memesan kurir pada rentang waktu yang sedang berjalan atau sudah terlewat berpotensi menimbulkan kendala operasional, karena kurir mungkin sudah berangkat dari outlet dan tidak dapat mengakomodasi pesanan mendadak, atau bahkan sudah selesai beroperasi untuk slot tersebut.

## Tujuan

1. Mencegah customer memilih dan memesan slot waktu kurir yang sudah terlewat di hari yang sama.
2. Mencegah customer memilih dan memesan slot waktu kurir yang sedang berlangsung di hari yang sama (dengan asumsi kurir sudah berangkat beroperasi).
3. Memberikan informasi yang jelas di aplikasi bagi customer mengenai jadwal mana saja yang tersedia dan mana yang sudah tidak bisa dipilih.
4. Memastikan backend memvalidasi ketersediaan waktu secara ketat saat order disubmit.

## Keputusan Bisnis

Aturan baru mengenai validasi jadwal kurir (berlaku untuk pengecekan di hari yang sama):

1. **Jadwal Sudah Terlewat**: Jika jam saat ini melewati batas akhir dari rentang waktu operasional kurir, maka slot jadwal tersebut **disabled** (tidak bisa dipesan).
   - *Contoh*: Outlet memiliki jadwal kurir hari Senin jam 09:00 - 11:00. Jika jam saat ini adalah hari Senin jam 12:00, maka jadwal 09:00 - 11:00 akan disabled.
2. **Jadwal Sedang Berlangsung**: Jika jam saat ini berada di dalam rentang waktu operasional kurir, maka slot jadwal tersebut juga **disabled** (tidak bisa dipesan). Asumsi bisnis: pada rentang waktu tersebut, kurir sudah berangkat, sehingga pemesanan baru untuk slot itu tidak dapat diterima.
   - *Contoh*: Outlet memiliki layanan kurir hari Senin jam 08:00 - 10:00. Jika jam saat ini adalah hari Senin jam 09:00, maka jadwal 08:00 - 10:00 akan disabled.
3. **Jadwal Tersedia**: Slot jadwal kurir hanya bisa dipilih jika jam saat ini **sebelum** jam mulai dari rentang waktu jadwal tersebut.
4. **Hari Berikutnya**: Untuk pemilihan jadwal di hari-hari berikutnya (bukan hari ini), semua slot waktu jadwal yang aktif di outlet akan tersedia secara normal sesuai konfigurasi.
5. **Zona Waktu**: Pengecekan waktu saat ini dan pencocokkan dengan jadwal kurir harus memperhatikan zona waktu yang berlaku untuk outlet tersebut.

## Kebutuhan Pengguna

### 1. Customer Memilih Jadwal Kurir di Aplikasi
- Saat customer berada di halaman pemilihan waktu (pickup/delivery) dan memilih hari ini, sistem harus mengevaluasi seluruh slot waktu yang tersedia berdasarkan jam saat ini.
- Sistem akan men-disable (abu-abu/tidak bisa diklik) slot waktu yang sudah terlewat atau sedang berlangsung.
- Tampilan UI sebaiknya memberikan indikator atau label sederhana (misal: "Sudah lewat" atau "Tidak tersedia") untuk jadwal yang didisable tersebut agar customer paham alasannya.
- Customer hanya diizinkan memilih slot waktu yang belum dimulai (jam mulai > jam saat ini).

### 2. Backend Memvalidasi Pesanan Kurir
- Mengingat waktu dapat berjalan saat customer sedang berada di halaman checkout, Backend wajib memvalidasi ulang slot waktu ketika pesanan di-submit.
- Saat pesanan diterima, Backend membandingkan waktu submit dengan slot waktu kurir yang dipilih customer.
- Jika slot yang dipilih ternyata sudah sedang berlangsung atau sudah lewat (termasuk kondisi delay akibat proses di aplikasi), Backend wajib menolak pesanan kurir tersebut (melemparkan error yang sesuai agar frontend dapat memberitahu customer untuk memilih jadwal yang lain).

## Masalah yang Diselesaikan
1. Customer tidak akan lagi berekspektasi bahwa kurir bisa langsung menjemput saat mereka memesan di slot waktu yang sudah sedang berjalan.
2. Operasional outlet dan kurir menjadi lebih terprediksi dan teratur karena tidak ada *last-minute order* yang masuk secara tiba-tiba di tengah-tengah slot waktu penjemputan.
