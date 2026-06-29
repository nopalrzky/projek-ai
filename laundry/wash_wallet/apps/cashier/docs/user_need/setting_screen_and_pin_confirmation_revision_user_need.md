# User Need: Revisi Setting Screen dan PIN Confirmation

## Ringkasan

Dokumen ini berisi kebutuhan produk untuk revisi layar Settings, alur setup PIN dengan confirmation, dan verifikasi ulang PIN setelah aplikasi tidak aktif. User need ini menjadi acuan untuk AI model lain saat menyusun plan implementasi teknis pada aplikasi WashWallet Cashier.

## Latar Belakang

WashWallet Cashier digunakan oleh kasir laundry untuk mengelola transaksi dan operasional outlet. Karena perangkat kasir dapat dipakai bergantian atau ditinggalkan sementara, aplikasi perlu memiliki alur PIN yang jelas, aman, dan tetap nyaman digunakan.

Saat ini user menginginkan revisi pada area Settings dan autentikasi PIN agar:

- Settings lebih jelas sebagai pusat pengaturan akun, printer, dan keamanan.
- User yang belum punya PIN diarahkan membuat PIN di awal penggunaan.
- PIN yang dibuat perlu dikonfirmasi sebelum disimpan.
- User diminta memasukkan PIN ulang setelah aplikasi lama tidak aktif atau dibuka kembali setelah beberapa jam.
- Tampilan input PIN mengikuti referensi gambar yang diberikan, tetapi disesuaikan dengan gaya laundry WashWallet.

## User Need

Sebagai kasir WashWallet, saya membutuhkan halaman Settings yang lebih jelas dan tetap mengikuti gaya aplikasi laundry, sehingga saya dapat menemukan pengaturan akun, printer, dan keamanan PIN dengan mudah.

Sebagai kasir yang baru masuk atau belum memiliki PIN, saya perlu melihat layar setup PIN di awal penggunaan aplikasi, sehingga akun saya dapat diamankan sebelum melanjutkan pekerjaan.

Sebagai kasir yang sedang membuat PIN, saya perlu diarahkan ke layar confirmation setelah mengisi PIN pertama, sehingga saya bisa memastikan PIN yang dibuat sudah benar sebelum disimpan.

Sebagai kasir yang sudah login, saya perlu diminta memasukkan PIN lagi ketika aplikasi dibuka kembali atau tidak ada aktivitas selama sekitar 4 jam, sehingga akun tetap aman saat perangkat kasir ditinggalkan.

Sebagai pengguna, saya ingin layar input PIN dan confirmation terasa sederhana, jelas, dan familiar, dengan input kode berbentuk kotak-kotak, tombol verifikasi yang menonjol, pesan validasi yang mudah dipahami, dan ilustrasi di bagian atas.

Sebagai pengguna aplikasi laundry, saya ingin desain layar PIN tidak terasa seperti phone verification umum, tetapi mengikuti nuansa WashWallet dan laundry, misalnya melalui ikon atau ilustrasi mesin cuci, gelembung, pakaian, struk, kasir, atau elemen operasional laundry.

Sebagai kasir, saya ingin aplikasi menampilkan pesan error saat PIN kosong, belum lengkap, salah, atau confirmation tidak sama, sehingga saya tahu apa yang harus diperbaiki dan bisa mencoba lagi tanpa harus mengulang login penuh.

Sebagai kasir, saya ingin alur re-auth tetap ringan saat sesi hanya stale, sehingga saya cukup input PIN untuk melanjutkan pekerjaan tanpa harus login ulang dengan username dan password.

## Alur yang Diharapkan

### Setup PIN Awal

1. User berhasil login atau aplikasi mendeteksi akun belum memiliki PIN.
2. User diarahkan ke layar setup PIN.
3. User mengisi PIN dengan format 6 digit.
4. Setelah PIN awal valid, user diarahkan ke layar confirmation PIN.
5. User mengisi ulang PIN yang sama.
6. Jika PIN cocok, aplikasi menyimpan PIN dan melanjutkan user ke aplikasi.
7. Jika PIN tidak cocok, aplikasi menampilkan pesan error dan user tetap berada di alur confirmation.

### Re-auth PIN Setelah Tidak Aktif

1. User sudah login dan memiliki PIN.
2. Aplikasi mendeteksi tidak ada aktivitas atau aplikasi dibuka kembali setelah sekitar 4 jam.
3. User diarahkan ke layar input PIN.
4. User memasukkan PIN 6 digit.
5. Jika PIN benar, user kembali dapat mengakses aplikasi.
6. Jika PIN salah, aplikasi menampilkan pesan error, membersihkan input, dan user dapat mencoba lagi.
7. Jika aplikasi aktif kembali sebelum 4 jam, user tidak perlu memasukkan PIN ulang.

### Settings

1. User membuka tab atau halaman Settings.
2. User melihat daftar pengaturan yang lebih terstruktur.
3. Settings minimal menampilkan akses ke pengaturan printer, profil atau akun, dan keamanan PIN.
4. Item keamanan PIN menjelaskan bahwa PIN digunakan untuk login cepat dan verifikasi ulang sesi.

## Arahan Desain

Referensi gambar digunakan sebagai inspirasi struktur layar, bukan untuk ditiru persis.

Elemen visual yang perlu dipertahankan dari referensi:

- Ilustrasi utama di bagian atas.
- Judul yang jelas.
- Deskripsi singkat tentang aksi yang harus dilakukan user.
- Input PIN berbentuk beberapa kotak terpisah.
- Pesan validasi di bawah input.
- Tombol utama yang kuat untuk melanjutkan atau verifikasi.

Penyesuaian gaya WashWallet/laundry:

- Gunakan tone visual yang bersih, ringan, dan ramah untuk konteks laundry.
- Gunakan elemen ilustrasi seperti mesin cuci, gelembung, pakaian, hanger, struk, atau kasir laundry.
- Gunakan warna dan komponen yang konsisten dengan design system WashWallet.
- Hindari copywriting yang mengarah ke OTP atau phone number verification karena konteksnya adalah PIN kasir.

## Validasi dan Error State

Sistem perlu menangani kondisi berikut dengan pesan yang jelas:

- PIN kosong.
- PIN belum 6 digit.
- PIN confirmation kosong.
- PIN confirmation belum 6 digit.
- PIN confirmation tidak sama dengan PIN awal.
- PIN salah saat re-auth.
- Proses simpan atau verifikasi PIN gagal dari backend.

Setiap error harus memberi kesempatan user memperbaiki input tanpa kehilangan konteks alur.

## Kriteria Penerimaan

- User baru atau user yang belum memiliki PIN diarahkan ke setup PIN saat awal masuk.
- Setelah setup PIN, user diarahkan ke confirmation PIN sebelum PIN disimpan.
- PIN hanya berhasil disimpan jika PIN awal dan confirmation cocok.
- Aplikasi meminta PIN ulang setelah tidak aktif atau dibuka kembali setelah sekitar 4 jam.
- Aplikasi tidak meminta PIN ulang jika user kembali sebelum batas 4 jam.
- User yang salah memasukkan PIN saat re-auth mendapat pesan error dan bisa mencoba lagi.
- Layar PIN dan confirmation mengikuti referensi input kotak-kotak, tombol verifikasi, pesan validasi, dan ilustrasi atas.
- Visual layar terasa sesuai konteks laundry WashWallet, bukan phone verification generik.
- Settings memiliki akses yang jelas ke area pengaturan akun, printer, dan keamanan PIN.

## Batasan dan Asumsi

- Default timeout sesi stale adalah 4 jam.
- Nama file kebutuhan mengikuti instruksi literal: `docs\iser_need`.
- Dokumen ini hanya mendefinisikan user need dan acceptance criteria, bukan detail implementasi teknis.
- Tidak ada perubahan API atau tipe data yang ditentukan dari dokumen ini.
- Gambar referensi digunakan sebagai inspirasi layout dan interaksi, bukan sebagai aset final.
