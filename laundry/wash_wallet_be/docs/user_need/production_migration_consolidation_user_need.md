# User Need: Konsolidasi Migration untuk Production Fresh Install

Tanggal: 2026-06-16

## 1. Latar Belakang

Project akan mulai masuk ke production dengan kondisi database masih kosong dan belum memiliki data sama sekali. Karena tidak ada data yang perlu dipertahankan, stakeholder ingin migration dirapikan sebelum production agar struktur database final bisa dibuat langsung melalui `php artisan migrate:fresh`.

Masalah yang ingin diatasi:

1. Folder migration sudah terlalu panjang dan berisi banyak migration historis.
2. Banyak migration hanya menambah, mengubah, atau menghapus kolom pada tabel yang sudah dibuat sebelumnya.
3. Beberapa migration historis sudah tidak relevan untuk database kosong karena perubahan akhirnya bisa langsung ditulis di migration `create_*_table` terkait.
4. Beberapa migration data seperti insert setting lebih tepat dipindahkan ke seeder.
5. Target production awal adalah fresh install, bukan upgrade dari database lama.

Dokumen ini disusun sebagai acuan kebutuhan sebelum dibuat implementation plan oleh model AI lain.

## 2. Ringkasan Kondisi Codebase Saat Ini

### Sudah Ada

1. Folder `database/migrations` berisi 99 file migration.
2. Mayoritas file adalah migration `create_*_table`.
3. Ada 18 file migration yang memakai `Schema::table` untuk mengubah tabel existing.
4. Ada beberapa migration raw SQL untuk mengubah enum atau membuat temporary table.
5. Ada migration yang hanya mengisi data `settings`.
6. Ada `database/seeders/SettingSeeder.php` yang sudah menjadi tempat seed setting dasar.
7. `DatabaseSeeder` sudah memanggil `SettingSeeder`.
8. Banyak kolom hasil migration alter sudah dipakai aktif oleh model, service, resource, frontend, atau test, sehingga field-nya tidak boleh hilang.
9. Kondisi database target diasumsikan kosong, sehingga aman melakukan squash/konsolidasi migration sebelum production.

### Gap yang Relevan

1. Migration create utama belum semuanya merepresentasikan schema final.
2. Beberapa migration alter masih berdiri sendiri walaupun bisa digabung ke migration create table asal.
3. Ada potensi duplikasi kolom saat `migrate:fresh` karena sebagian perubahan sudah masuk ke create table, tetapi migration alter lama masih ada.
4. Ada migration yang menambah lalu migration lain menghapus kolom yang sama, misalnya `disabled_days` pada `courier_settings`.
5. Ada migration drop table historis, misalnya `drop_position_roles_table`, yang lebih baik diselesaikan dengan menghapus create table obsolete jika tabel memang tidak dipakai.
6. Ada migration khusus SQLite temporary table untuk `courier_settings` yang seharusnya tidak diperlukan jika baseline schema final sudah benar.
7. Data default setting masih tersebar di migration dan seeder.

## 3. Tujuan

Tujuan utama kebutuhan ini adalah:

1. Menjadikan migration sebagai baseline schema final untuk production fresh install.
2. Menghapus migration historis yang hanya menambah, mengubah, atau menghapus kolom setelah perubahan tersebut dipindahkan ke migration create table terkait.
3. Memastikan `php artisan migrate:fresh` berjalan dari nol tanpa error duplikasi kolom, enum mismatch, temporary table, atau dependency table obsolete.
4. Menjaga semua field yang masih dipakai aplikasi tetap tersedia.
5. Memindahkan seed data default dari migration ke seeder yang sesuai.
6. Membuat struktur migration lebih ringkas, mudah diaudit, dan siap dipakai di production kosong.

## 4. Aktor

1. `developer`
   Merapikan migration, memindahkan perubahan historis ke migration create table, dan menjalankan verifikasi.
2. `owner/operator aplikasi`
   Tidak berinteraksi langsung dengan migration, tetapi membutuhkan sistem production yang stabil.
3. `system`
   Menjalankan migration dan seeder untuk membentuk schema serta data default.
4. `AI planning model`
   Menggunakan dokumen ini sebagai acuan untuk menyusun implementation plan yang aman dan terurut.

## 5. Scope Kebutuhan

Scope utama:

1. Audit seluruh migration.
2. Konsolidasi migration alter ke migration create table asal.
3. Penghapusan migration historis yang sudah berhasil dikonsolidasikan.
4. Pemindahan migration data/default setting ke seeder.
5. Penghapusan migration drop table jika tabel create asal juga dihapus karena obsolete.
6. Verifikasi `php artisan migrate:fresh`.
7. Verifikasi seeder dasar tetap mengisi data yang dibutuhkan aplikasi.

Di luar scope:

1. Migrasi data dari database lama.
2. Backward compatibility untuk database yang sudah berisi data.
3. Menulis data migration untuk production existing.
4. Mengubah fitur bisnis di luar kebutuhan schema final.
5. Refactor model/service/frontend kecuali ada mismatch langsung dengan schema final.

## 6. Prinsip Dasar Kebutuhan

1. Karena belum ada data, final schema boleh langsung ditulis di migration create table.
2. Field yang masih dipakai aplikasi tidak boleh dihapus hanya karena migration alter-nya dihapus.
3. Migration yang hanya mengubah kolom harus dihapus setelah perubahan final dipindahkan ke migration create table terkait.
4. Migration yang hanya menambah kolom harus dihapus setelah kolom final ditambahkan ke migration create table terkait.
5. Migration yang hanya menghapus kolom harus diselesaikan dengan tidak menambahkan kolom tersebut pada migration create table final.
6. Migration yang hanya seed data harus dipindahkan ke seeder.
7. Baseline schema harus bisa berjalan di database production target.
8. Jika test suite memakai SQLite, baseline schema juga perlu tetap kompatibel dengan SQLite atau plan harus menjelaskan batasannya.
9. Jangan menghapus tabel create utama yang masih direferensikan model, service, foreign key, route, test, atau frontend.
10. Setelah konsolidasi, urutan migration harus tetap memenuhi foreign key dependency.

## 7. Temuan Awal dari Audit Migration

### Jumlah dan Jenis Migration

1. Total migration saat audit awal: 99 file.
2. Kandidat `Schema::table`: 18 file.
3. Kandidat migration data setting: 3 file.
4. Kandidat migration raw SQL/temporary table yang perlu dikonsolidasikan: beberapa file pada domain `courier_settings` dan `order_status_histories`.
5. Kandidat create/drop obsolete table: `position_roles`.

### Migration yang Mengubah Tabel Existing

File yang perlu dievaluasi untuk digabung ke migration create table asal:

1. `2026_05_09_123428_add_name_and_description_to_settings_table.php`
2. `2026_05_15_045300_add_location_fields_to_customer_addresses_table.php`
3. `2026_05_15_045343_alter_courier_pricing_zones_location_type.php`
4. `2026_05_15_101137_change_location_id_to_string_in_courier_pricing_zones_table.php`
5. `2026_05_15_111806_add_disabled_days_to_courier_settings_table.php`
6. `2026_05_20_182158_add_operational_day_id_to_courier_schedules.php`
7. `2026_05_20_182201_remove_disabled_days_from_courier_settings.php`
8. `2026_05_22_070003_add_is_courier_enabled_to_courier_settings_table.php`
9. `2026_05_25_000001_add_slug_and_is_default_to_positions_table.php`
10. `2026_05_25_000003_add_unique_to_employee_positions.php`
11. `2026_05_29_000000_add_supports_courier_to_laundry_services_table.php`
12. `2026_05_29_143246_add_pending_dropoff_status_to_orders_table.php`
13. `2026_05_29_151708_add_timezone_to_outlets_table.php`
14. `2026_05_30_000001_add_wallet_balance_to_users_table.php`
15. `2026_06_06_000001_add_unconditional_free_shipping_to_courier_settings.php`
16. `2026_06_06_000002_add_default_price_to_courier_settings.php`
17. `2026_06_12_000001_add_device_id_to_employee_device_tokens_table.php`
18. `2026_06_13_000002_alter_order_status_histories_system_actor.php`

### Migration Raw SQL atau Temporary Table

File yang perlu dievaluasi untuk dihapus setelah final schema masuk ke create table:

1. `2026_05_12_082830_alter_courier_settings_enum_columns.php`
2. `2026_05_18_030945_rename_hybrid_to_tiered_in_courier_settings.php`
3. `2026_05_22_123000_convert_courier_settings_enum_to_string_for_sqlite.php`
4. `2026_06_13_000002_alter_order_status_histories_system_actor.php`

### Migration Data Setting

File yang perlu dipindahkan ke `SettingSeeder`:

1. `2026_06_13_000001_seed_auto_accept_order_setting.php`
2. `2026_06_16_000001_seed_auto_accept_lead_time_setting.php`
3. `2026_06_16_000002_seed_auto_accept_max_distance_setting.php`

`SettingSeeder` saat ini baru berisi:

1. `auto_wa_notification`
2. `cod_enabled`

Setting auto accept perlu dipindahkan ke seeder agar migration tetap fokus ke schema.

## 8. Mapping Konsolidasi yang Dibutuhkan

### Tabel `settings`

1. Migration create table final harus langsung memiliki:
   - `key`,
   - `name`,
   - `description`.
2. Jika `2026_05_07_011638_create_settings_table.php` sudah memiliki `name` dan `description`, migration `add_name_and_description_to_settings_table` harus dihapus.
3. Data default setting harus dikelola di `SettingSeeder`, bukan migration.

### Tabel `customer_addresses`

1. Migration create table final harus langsung memiliki field lokasi:
   - `province_id`,
   - `regency_id`,
   - `district_id`,
   - `village_id`,
   - `province_name`,
   - `regency_name`,
   - `district_name`,
   - `village_name`.
2. Migration `add_location_fields_to_customer_addresses_table` harus dihapus setelah field masuk ke create table.

### Tabel `courier_pricing_zones`

1. Migration create table final harus mencerminkan schema yang dipakai service saat ini.
2. Field yang perlu ada:
   - `courier_setting_id`,
   - `location_type`,
   - `location_id` sebagai string,
   - `parent_district_id` nullable,
   - `location_name`,
   - `fee`,
   - `sort_order`.
3. Nilai `location_type` minimal harus mendukung `district` dan `village`.
4. Jika masih perlu kompatibilitas `regency`, implementation plan harus memutuskan secara eksplisit.
5. Migration alter location type dan change `location_id` harus dihapus setelah schema final masuk ke create table.

### Tabel `courier_settings`

1. Migration create table final harus memakai nilai pricing method final yang dipakai aplikasi:
   - `flat_rate`,
   - `distance_based`,
   - `zone_based`,
   - `tiered`.
2. `merchant_subsidy_type` harus memakai nilai final:
   - `fixed_amount`,
   - `percentage`.
3. Field yang perlu ada langsung di create table:
   - `is_courier_enabled`,
   - `default_price`,
   - `unconditional_free_shipping_enabled`,
   - field pricing lain yang sudah ada.
4. Field `disabled_days` tidak perlu ada di schema final jika memang sudah dihapus dan tidak dipakai code.
5. Migration enum/raw SQL, add/remove `disabled_days`, add `is_courier_enabled`, add `default_price`, dan add `unconditional_free_shipping_enabled` harus dihapus setelah create table final benar.
6. Implementation plan perlu memutuskan apakah kolom enum di production tetap memakai `enum` atau diganti `string` agar lebih mudah lintas database dan tidak perlu raw SQL.

### Tabel `courier_schedules`

1. Migration create table final harus langsung memiliki `operational_day_id` nullable yang mengarah ke `operational_days`.
2. Field `day_of_week` tetap perlu dievaluasi apakah masih dibutuhkan untuk query/compatibility.
3. Migration `add_operational_day_id_to_courier_schedules` harus dihapus setelah field masuk ke create table.
4. Karena database kosong, backfill SQL pada migration lama tidak diperlukan.

### Tabel `positions`

1. Migration create table final harus langsung memiliki:
   - `slug`,
   - `is_default`.
2. Index `slug` harus ada jika masih dipakai.
3. Backfill slug default dari nama posisi tidak diperlukan di migration karena tidak ada data.
4. Jika data posisi default dibutuhkan, data tersebut harus dikelola oleh seeder.

### Tabel `employee_positions`

1. Migration create table final harus langsung memiliki unique constraint:
   - `employee_id`,
   - `position_id`.
2. Cleanup duplicate pada migration lama tidak diperlukan karena database kosong.
3. Migration `add_unique_to_employee_positions` harus dihapus setelah unique constraint masuk ke create table.

### Tabel `position_roles`

1. Tabel `position_roles` terlihat dibuat lalu di-drop oleh migration lain.
2. Jika codebase memang sudah tidak memakai `position_roles`, maka:
   - hapus migration create `position_roles`,
   - hapus migration drop `position_roles`.
3. Jangan hapus `position_permissions` jika tabel tersebut adalah pengganti yang masih dipakai.
4. Implementation plan wajib audit ulang referensi code sebelum menghapus create table obsolete.

### Tabel `laundry_services`

1. Migration create table final harus langsung memiliki:
   - `supports_courier`.
2. Field ini dipakai model, service, resource, seeder, test, dan UI.
3. Migration `add_supports_courier_to_laundry_services_table` harus dihapus setelah field masuk ke create table.

### Tabel `orders`

1. Migration create table final harus langsung mendukung status:
   - `pending_dropoff`.
2. Status lain existing tidak boleh hilang.
3. Implementation plan perlu memutuskan apakah `status` tetap `enum` atau diganti `string` untuk mengurangi migration raw SQL di masa depan.
4. Migration `add_pending_dropoff_status_to_orders_table` harus dihapus setelah status final masuk ke create table.

### Tabel `outlets`

1. Migration create table final harus langsung memiliki:
   - `timezone` default `Asia/Jakarta`.
2. Migration `add_timezone_to_outlets_table` harus dihapus setelah field masuk ke create table.

### Tabel `users`

1. Migration create table final harus langsung memiliki:
   - `wallet_balance`.
2. Field ini dipakai domain wallet dan profile.
3. Migration `add_wallet_balance_to_users_table` harus dihapus setelah field masuk ke create table.

### Tabel `employee_device_tokens`

1. Migration create table final harus langsung memiliki:
   - `device_id` nullable,
   - `token` dengan panjang 512,
   - index `employee_id`,
   - index gabungan `employee_id`, `device_id`.
2. Migration `add_device_id_to_employee_device_tokens_table` harus dihapus setelah field dan index masuk ke create table.

### Tabel `order_status_histories`

1. Migration create table final harus langsung memiliki:
   - `employee_id` nullable,
   - `actor_type` default `employee`,
   - `actor_label` nullable.
2. Field ini dipakai auto accept order dan resource status history.
3. Raw SQL untuk recreate table SQLite tidak diperlukan jika create table final sudah benar.
4. Migration `alter_order_status_histories_system_actor` harus dihapus setelah schema final masuk ke create table.

## 9. User Need Fungsional

### FR-01 Migration Menjadi Baseline Schema Final

1. Developer dapat menjalankan `php artisan migrate:fresh` pada database kosong.
2. Semua tabel dibuat langsung dalam bentuk final.
3. Tidak ada migration lanjutan yang hanya memperbaiki schema table yang baru saja dibuat.
4. Field final tetap sesuai dengan kebutuhan model, service, request, resource, frontend, dan test.

### FR-02 Migration Alter Kolom Dihapus Setelah Digabung

1. Migration yang hanya menambah kolom harus dipindahkan ke create table asal.
2. Migration yang hanya mengubah tipe/enum/default kolom harus dipindahkan ke create table asal.
3. Migration yang hanya menghapus kolom harus diselesaikan dengan tidak membuat kolom tersebut pada create table final.
4. File migration historis tersebut boleh dihapus setelah perubahan final terbukti masuk ke create table.

### FR-03 Migration Data Dipindahkan ke Seeder

1. Data setting default tidak boleh dibuat lewat migration schema.
2. Setting berikut harus berada di `SettingSeeder`:
   - `auto_wa_notification`,
   - `cod_enabled`,
   - `auto_accept_order`,
   - `auto_accept_lead_time_minutes`,
   - `auto_accept_max_distance_km`.
3. Seeder harus idempotent, misalnya memakai `updateOrCreate`.
4. `DatabaseSeeder` harus tetap memanggil seeder yang dibutuhkan.

### FR-04 Migration Obsolete Table Dihapus dengan Audit

1. Tabel historis yang sudah tidak dipakai tidak perlu dibuat lalu dihapus.
2. Jika `position_roles` memang obsolete, migration create dan drop-nya harus sama-sama dihapus.
3. Sebelum menghapus, implementation plan harus audit referensi di:
   - model,
   - service,
   - controller,
   - seeder,
   - factory,
   - test,
   - frontend jika ada.

### FR-05 Migration Harus Aman untuk Production Fresh Install

1. Migration tidak boleh bergantung pada data lama.
2. Backfill query historis tidak diperlukan untuk database kosong.
3. Raw SQL yang hanya untuk mengonversi schema lama harus dihapus jika create table final sudah benar.
4. Migration harus tetap berjalan pada database production target.
5. Jika test memakai SQLite, implementation plan harus memastikan schema final tetap testable.

### FR-06 Urutan Foreign Key Tetap Valid

1. Migration create table yang menjadi target foreign key harus tetap berjalan sebelum tabel yang mereferensikannya.
2. Penghapusan migration tidak boleh merusak urutan dependency.
3. Jika ada tabel yang dipindah urutan timestamp-nya, plan harus menjelaskan alasannya.
4. `migrate:fresh` tidak boleh gagal karena foreign key table belum ada.

## 10. Aturan Bisnis dan Teknis

1. Target perubahan ini hanya untuk database kosong.
2. Tidak perlu mempertahankan path upgrade dari schema lama.
3. Jangan menghapus kolom yang masih dipakai aplikasi.
4. Jangan menghapus tabel yang masih direferensikan code atau foreign key.
5. Jangan menyimpan data seed di migration jika seeder sudah tersedia.
6. Migration final harus merepresentasikan schema production yang diinginkan saat ini.
7. File migration yang dihapus harus benar-benar sudah diwakili oleh migration create table atau seeder.
8. Setelah konsolidasi, tidak boleh ada migration yang langsung mengubah tabel yang baru dibuat hanya karena histori development.
9. Jika ada enum yang sering berubah, pertimbangkan penggunaan string agar perubahan berikutnya tidak perlu raw SQL migration.
10. `php artisan migrate:fresh --seed` harus menjadi verifikasi utama untuk fresh install.

## 11. Acceptance Criteria

1. Semua migration create table terdampak sudah memuat schema final.
2. Migration alter/add/drop kolom yang redundant sudah dihapus.
3. Migration raw SQL yang hanya mengonversi schema lama sudah dihapus jika tidak lagi diperlukan.
4. Migration seed setting sudah dipindahkan ke `SettingSeeder`.
5. `SettingSeeder` mencakup setting auto accept yang sebelumnya ada di migration.
6. Tabel obsolete seperti `position_roles` tidak dibuat lalu dihapus lagi.
7. `php artisan migrate:fresh` berjalan tanpa error.
8. `php artisan migrate:fresh --seed` berjalan tanpa error.
9. Tidak ada error duplikasi kolom pada `settings`, `courier_settings`, atau tabel lain.
10. Tidak ada error missing column untuk field yang dipakai aplikasi seperti `supports_courier`, `wallet_balance`, `operational_day_id`, `actor_type`, `device_id`, dan `timezone`.
11. Test atau minimal smoke check yang relevan untuk schema berjalan setelah konsolidasi.
12. `git diff` menunjukkan penghapusan migration historis hanya setelah perubahan final masuk ke create table/seeder terkait.

## 12. Rencana Verifikasi untuk Implementation Plan

Verifikasi minimal yang perlu dilakukan oleh implementer:

1. Jalankan `php artisan migrate:fresh`.
2. Jalankan `php artisan migrate:fresh --seed`.
3. Jalankan test yang berhubungan dengan domain terdampak jika tersedia:
   - courier pricing,
   - courier schedule,
   - customer order,
   - wallet balance/withdrawal,
   - auto accept order,
   - employee device token,
   - order status history.
4. Jalankan pencarian ulang untuk memastikan tidak ada migration redundant:
   - `Schema::table` untuk alter historis,
   - `dropColumn`,
   - `->change()`,
   - raw SQL alter schema,
   - migration seed setting.
5. Cek `git diff` dan pastikan setiap migration yang dihapus punya pengganti jelas di create table atau seeder.

## 13. Catatan untuk Implementation Plan

Hal yang perlu diputuskan pada plan:

1. Database production target memakai MySQL/MariaDB atau database lain.
2. Apakah kolom status/pricing yang saat ini `enum` akan tetap `enum` atau diganti `string`.
3. Apakah `courier_pricing_zones.location_type` masih perlu mendukung `regency`.
4. Apakah `position_roles` benar-benar obsolete dan aman dihapus.
5. Apakah `withdrawals` lama masih dipakai oleh model `Withdrawal` atau sudah digantikan penuh oleh `wallet_withdrawals`.
6. Apakah semua migration seeder default cukup dipindahkan ke `SettingSeeder`, atau perlu seeder baru khusus setting operasional.
7. Apakah perlu membuat backup branch sebelum menghapus migration historis.
8. Apakah CI/test memakai SQLite sehingga schema final harus menghindari raw SQL khusus database.

## 14. Pertanyaan Terbuka

1. Apakah production benar-benar belum pernah menjalankan migration apa pun?
2. Apakah production target akan selalu dibuat dengan `migrate:fresh --seed`?
3. Apakah tabel `withdrawals` lama masih dibutuhkan atau sudah menjadi legacy setelah `wallet_withdrawals`?
4. Apakah semua setting default wajib masuk saat seed production, atau sebagian hanya untuk local/demo?
5. Apakah status order dan pricing method sebaiknya disimpan sebagai string untuk mengurangi risiko enum migration ke depan?

## 15. Rekomendasi Awal

Rekomendasi untuk implementation plan tahap pertama:

1. Jangan langsung menghapus semua migration.
2. Buat mapping per tabel dari migration alter ke migration create table asal.
3. Update create table terdampak sampai sesuai schema final.
4. Pindahkan setting auto accept ke `SettingSeeder`.
5. Hapus migration alter/drop/data yang sudah terwakili.
6. Audit `position_roles` dan `withdrawals` sebelum memutuskan penghapusan create table legacy.
7. Jalankan `php artisan migrate:fresh --seed`.
8. Jalankan test domain terdampak.
9. Jika ada failure, perbaiki create table final, bukan menghidupkan kembali migration alter historis kecuali benar-benar dibutuhkan.
