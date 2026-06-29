# User Need: Bottom Bar Horizontal Tab dan State Preservation

## Ringkasan

Dokumen ini berisi kebutuhan produk untuk perubahan perilaku bottom bar pada aplikasi WashWallet Cashier. User need ini menjadi acuan untuk AI model lain saat menyusun plan implementasi teknis.

WashWallet Cashier perlu mengubah perilaku bottom bar agar perpindahan tab Home, Dana, Transaksi, dan Setting terasa bergulir kanan-kiri, sekaligus mempertahankan state tiap tab. Jika user pernah membuka Dana sampai ke Setoran Kasir, lalu berpindah ke Home dan kembali ke Dana, aplikasi harus tetap menampilkan Setoran Kasir, bukan reset ke halaman awal Dana.

## Latar Belakang

WashWallet Cashier digunakan oleh kasir laundry untuk mengelola transaksi, keuangan outlet, dan pengaturan operasional. Bottom bar saat ini sudah menjadi navigasi utama untuk area Home, Dana, Transaksi, dan Setting.

Dari pembacaan codebase saat ini:

- Bottom bar item dan route mapping ada di `lib/core/navigation/bottom_nav_helper.dart`.
- Route root saat ini memakai `GoRoute` biasa untuk `/home`, `/finances`, `/orders`, dan `/settings`.
- Navigasi bottom bar memakai `context.go(targetRoute)`.
- Transisi route memakai `slidePage`, tetapi setiap route tetap dibangun sebagai screen terpisah.
- Dana membuka Setoran Kasir, Petty Cash, dan Pengeluaran Outlet dengan `Navigator.push`.
- Transaksi memiliki state lokal seperti filter status, search controller, scroll list, dan navigasi detail order.

Karena root tab belum memakai struktur yang mempertahankan subtree atau navigator per tab, state lokal screen berisiko hilang saat user berpindah route. Perubahan yang diinginkan adalah tab terasa seperti area utama aplikasi yang tetap hidup, bukan seperti halaman baru yang selalu dibangun ulang.

## User Need

Sebagai kasir WashWallet, saya ingin berpindah antar tab bottom bar dengan animasi atau gesture horizontal kanan-kiri, sehingga perpindahan tab terasa natural dan jelas secara arah.

Sebagai kasir, saya ingin setiap tab menyimpan posisi terakhirnya, sehingga saat saya kembali ke tab tersebut saya dapat melanjutkan pekerjaan tanpa mengulang navigasi dari awal.

Sebagai kasir yang membuka tab Dana, saya ingin state Dana tetap tersimpan sampai level submenu atau halaman terakhir, misalnya Setoran Kasir, Saldo Petty Cash, atau Pengeluaran Outlet.

Sebagai kasir yang membuka tab Transaksi, saya ingin filter, pencarian, scroll list, atau halaman transaksi yang sedang saya lihat tetap tersimpan ketika saya pindah ke tab lain lalu kembali.

Sebagai pengguna, saya ingin bottom bar tetap sinkron dengan tab aktif baik saat berpindah lewat tap bottom bar maupun swipe kanan-kiri.

Sebagai kasir, saya ingin perpindahan tab tidak mengganggu pekerjaan yang sedang berjalan pada tab lain, selama pekerjaan tersebut masih berada dalam area root tab yang sama.

## Alur yang Diharapkan

### Pindah dari Home ke Dana

1. User berada di Home.
2. User tap tab Dana atau swipe ke arah tab Dana.
3. Aplikasi berpindah ke Dana dengan gerakan horizontal sesuai arah urutan tab.
4. Bottom bar menandai Dana sebagai tab aktif.
5. Jika Dana belum pernah dibuka, aplikasi menampilkan halaman awal Dana.
6. Jika Dana pernah dibuka sebelumnya, aplikasi menampilkan posisi terakhir di dalam tab Dana.

### Dana Menyimpan Setoran Kasir

1. User membuka tab Dana.
2. User memilih menu Setoran Kasir.
3. User berpindah ke tab Home.
4. User kembali ke tab Dana.
5. Aplikasi tetap menampilkan Setoran Kasir sebagai posisi terakhir Dana.
6. User dapat kembali ke halaman menu Dana sesuai pola back navigation yang ditentukan implementasi.

### Transaksi Menyimpan Filter dan Posisi

1. User membuka tab Transaksi.
2. User memilih filter, memasukkan pencarian, scroll daftar, atau membuka detail transaksi.
3. User berpindah ke tab lain.
4. User kembali ke tab Transaksi.
5. Aplikasi mempertahankan state terakhir Transaksi, termasuk filter, pencarian, scroll, atau halaman detail jika masih relevan.

### Tap Tab Aktif

1. User berada pada salah satu tab root.
2. User tap tab bottom bar yang sedang aktif.
3. Aplikasi tidak membuat route baru yang sama.
4. Aplikasi tidak mereset state tab secara otomatis.

## Perilaku yang Diharapkan

- Root tab utama tetap: Home, Dana, Transaksi, Setting.
- Perpindahan antar root tab menggunakan arah horizontal berdasarkan urutan tab.
- Pindah dari tab kiri ke kanan terasa bergulir ke kiri atau kanan secara konsisten dengan arah visual UI.
- State masing-masing tab tidak hilang saat user berpindah tab.
- Nested navigation stack tiap tab ikut tersimpan, terutama Dana dan Transaksi.
- Tap tab yang sedang aktif tidak membuat screen baru atau mereset state.
- Bottom bar active index selalu sesuai dengan tab yang sedang tampil.
- Bottom bar tidak muncul pada flow fokus yang bukan root tab jika saat ini memang dirancang sebagai layar detail atau form penuh.
- Perilaku auth guard, redirect, logout, dan switch employee tetap mengikuti aturan yang sudah ada.

## Kriteria Penerimaan

- Dari Home, user bisa berpindah ke Dana dengan transisi horizontal.
- User bisa berpindah antar tab melalui tap bottom bar.
- Jika gesture swipe diterapkan, swipe kanan-kiri harus sinkron dengan active item pada bottom bar.
- Setelah user masuk ke Dana > Setoran Kasir, lalu pindah ke Home, lalu kembali ke Dana, aplikasi tetap berada di Setoran Kasir.
- Setelah user masuk ke Dana > Saldo Petty Cash atau Dana > Pengeluaran Outlet, lalu pindah tab dan kembali, aplikasi tetap berada di halaman terakhir tersebut.
- Setelah user mengatur filter atau pencarian di Transaksi, lalu pindah tab dan kembali, filter atau pencarian tersebut tetap sama.
- Jika user sedang melihat detail transaksi dalam area Transaksi, lalu pindah tab dan kembali, posisi terakhir Transaksi tetap dipertahankan selama tidak ada alasan bisnis untuk memaksa refresh.
- Bottom bar active index selalu sesuai dengan tab yang sedang tampil.
- Tap tab yang sedang aktif tidak menumpuk route duplikat.
- Perpindahan tab tidak menghapus data yang sedang dimuat atau state UI yang masih relevan.
- Navigasi non-root seperti create order, detail order, setup PIN, printer setting, atau flow fokus lain tetap boleh memiliki behavior khusus sesuai kebutuhan layar tersebut.

## Batasan dan Asumsi

- "Geser kanan-kiri" dimaknai sebagai pengalaman horizontal antar tab. Implementasi boleh memakai tap bottom bar dengan animasi slide, dan idealnya mendukung swipe jika tidak mengganggu flow lain.
- State yang perlu dipertahankan mencakup state UI lokal dan nested navigation stack per tab.
- Root tab yang dibahas hanya Home, Dana, Transaksi, dan Setting.
- Customer tetap dianggap secondary route atau quick action, bukan root tab baru, kecuali ada keputusan produk terpisah.
- Dokumen ini hanya mendefinisikan user need dan acceptance criteria, bukan detail implementasi teknis final.
- Tidak ada perubahan API backend atau schema data yang ditentukan dari dokumen ini.
