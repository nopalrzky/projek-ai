# Customer Discovery Typo-Tolerant Search User Need

## Ringkasan

Search layanan pada aplikasi customer Wash Wallet perlu lebih tahan terhadap typo. Saat ini pencarian Discovery masih terasa seperti pencarian berbasis `LIKE` atau substring literal, sehingga layanan yang sebenarnya relevan tidak muncul jika customer salah mengetik beberapa huruf.

Contoh masalah utama:

- Database memiliki banyak layanan bernama `Cuci Kering`.
- Customer mengetik `cci kering`, `cci krinh`, atau `cuci krinh`.
- Sistem tidak menampilkan `Cuci Kering`, padahal maksud customer cukup jelas.

User need ini menjadi acuan untuk membuat plan implementasi oleh AI model lain.

## User Need Utama

Sebagai customer, saya ingin search layanan tetap memahami maksud pencarian saya walaupun ada typo, huruf yang hilang, atau ejaan tidak sempurna, supaya saya tetap bisa menemukan layanan yang relevan seperti `Cuci Kering` tanpa harus mengetik ulang dengan ejaan persis.

## Latar Belakang Masalah

Customer sering mengetik keyword di mobile dengan cepat. Dalam kondisi nyata, typo sangat umum terjadi:

- Huruf awal hilang, misalnya `cci` untuk `cuci`.
- Huruf akhir salah, misalnya `krinh` untuk `kering`.
- Kombinasi typo pada lebih dari satu kata, misalnya `cci krinh`.
- Spasi dan urutan kata masih benar, tetapi ejaan tiap kata tidak sempurna.

Jika search hanya memakai pencocokan literal, customer harus tahu dan mengetik nama layanan dengan tepat. Ini membuat Discovery terasa kurang cerdas dan menghambat customer menemukan layanan yang ingin dipesan.

## Kebutuhan Fungsional

1. Customer dapat mencari layanan laundry dengan keyword bebas.
2. Search harus toleran terhadap typo ringan sampai sedang pada nama layanan umum.
3. Query seperti `cci kering`, `cci krinh`, `cuci krinh`, dan `cuc kering` harus tetap bisa menemukan layanan `Cuci Kering` jika layanan tersebut tersedia.
4. Search tidak boleh hanya bergantung pada kecocokan substring literal.
5. Search perlu mempertimbangkan konteks layanan, terutama nama layanan, kategori layanan, deskripsi layanan, slug, unit, dan nama outlet jika relevan.
6. Hasil yang paling relevan dengan maksud customer harus muncul lebih atas daripada hasil yang hanya kebetulan mirip.
7. Jika sistem mengoreksi atau memahami query sebagai keyword lain, aplikasi dapat menampilkan feedback seperti `Menampilkan hasil untuk "cuci kering"`.
8. Jika typo terlalu berat dan sistem tidak punya match yang cukup yakin, aplikasi tetap menampilkan empty state yang jelas dan/atau saran pencarian.
9. Typo-tolerant search harus tetap menghormati filter aktif seperti outlet, kategori, unit, harga, gratis ongkir, dukungan kurir, lokasi, dan sorting.
10. Customer tidak perlu memilih mode pencarian khusus; typo tolerance menjadi bagian natural dari search Discovery.

## Kriteria Sukses

1. Saat ada layanan `Cuci Kering`, pencarian `cci kering` menampilkan layanan tersebut.
2. Saat ada layanan `Cuci Kering`, pencarian `cci krinh` tetap menampilkan layanan tersebut jika confidence cukup.
3. Saat ada layanan `Cuci Kering`, pencarian `cuci krinh` tetap menampilkan layanan tersebut.
4. Query yang dieja benar tetap menghasilkan hasil yang sama atau lebih baik daripada sebelumnya.
5. Search tidak menampilkan hasil yang terlalu melebar untuk keyword yang tidak berhubungan.
6. Hasil tetap bisa difilter dan diurutkan tanpa kehilangan konteks query.
7. Jika ada corrected query, customer melihat informasi koreksi tanpa harus melakukan aksi tambahan.

## Edge Cases

1. Customer mengetik query kosong.
2. Customer mengetik typo ringan pada satu kata.
3. Customer mengetik typo pada lebih dari satu kata.
4. Customer mengetik keyword yang tidak berhubungan dengan layanan mana pun.
5. Customer memakai filter outlet atau kategori bersamaan dengan query typo.
6. Customer memakai sort seperti `Terkait`, `Termurah`, `Terdekat`, atau `Terbaik` bersama query typo.
7. Ada banyak layanan dengan nama mirip di outlet berbeda.
8. Ada layanan aktif dan tidak aktif dengan nama mirip; hanya layanan yang layak tampil ke customer yang boleh muncul.

## Catatan Konteks Repo

Di aplikasi customer sudah ada konsep `correctedQuery` pada Discovery search result dan widget banner typo correction. Namun alur data saat ini masih belum benar-benar memanfaatkan koreksi query dari backend.

Pada backend Discovery, search layanan customer masih terlihat memakai pencarian `LIKE` pada outlet, kategori, layanan, slug, unit, dan field lokasi. Kebutuhan ini mendorong search customer menjadi fuzzy dan context-aware, bukan sekadar perluasan keyword literal.

Dokumen ini tidak menetapkan detail algoritma final. Plan implementasi boleh memilih pendekatan yang paling sesuai dengan stack saat ini, selama perilaku customer-facing di atas terpenuhi.
