# Feedback Review: Employee Permission Plan

Tanggal: 2026-05-28

Dokumen yang direview:
- `docs/plan/employee_permission_plan.md`
- `docs/spec/employee_permission_owner_flow_user_need.md`

## Findings

### 1. Plan sudah stale terhadap kondisi repo saat ini

Beberapa item di plan masih ditandai sebagai gap, padahal implementasinya sudah ada di codebase saat ini:

- Validasi `permissions` pada:
  - `app/Http/Requests/Outlet/Position/StorePositionRequest.php`
  - `app/Http/Requests/Outlet/Position/UpdatePositionRequest.php`
- `permissionCatalog` sudah dipass dari:
  - `OutletController::createPosition`
  - `OutletController::editPosition`
- Field `permissions` pada `OutletPositionFormData` sudah ada
- Partial dan wiring page untuk owner outlet position juga sudah ada:
  - `PermissionSelector.tsx`
  - `PositionInfoSection.tsx`
  - `PositionStatusSection.tsx`
  - `PositionFormActions.tsx`
  - `Create.tsx`
  - `Edit.tsx`

Implikasi:
- Dokumen ini sudah kurang tepat jika dipakai sebagai implementation plan murni.
- Risiko utamanya adalah implementer mengulang pekerjaan yang sebenarnya sudah selesai.

Saran:
- Ubah posisi dokumen ini dari "implementation plan" menjadi "status review + remaining gaps".
- Jika tetap ingin mempertahankan format plan, beri penanda jelas mana yang sudah selesai dan mana yang masih outstanding.

### 2. Error handling validasi `permissions.*` di UI belum dibahas dengan cukup

Backend sudah menyiapkan validasi item-level untuk `permissions.*.in`, tetapi plan belum membahas bagaimana error tersebut ditampilkan di frontend.

Risiko:
- Jika Laravel mengembalikan error pada key seperti `permissions.0`, `permissions.1`, dan seterusnya, sedangkan komponen frontend hanya membaca `errors.permissions`, maka pesan validasi bisa tidak pernah tampil ke user.

Saran:
- Tambahkan catatan implementasi khusus untuk mapping error array validation pada field `permissions`.
- Pastikan `PermissionSelector` bisa menampilkan error umum maupun error turunan dari `permissions.*`.

### 3. Plan belum punya fase test yang konkret

Spec sudah eksplisit meminta coverage untuk:
- validasi permission,
- sync permission create/update,
- multi-position employee,
- middleware enforcement per outlet.

Tetapi plan saat ini belum memiliki fase test yang jelas, hanya checklist umum sebelum commit.

Saran:
- Tambahkan satu fase khusus test.
- Minimal definisikan target test berikut:
  - request validation menolak permission key invalid,
  - create position menyimpan permission terpilih,
  - update position melakukan full sync permission,
  - employee dengan multi-position mendapat union permission,
  - middleware permission per outlet tetap menolak/mengizinkan dengan benar.

## Open Questions

### 1. Position tanpa permission mau diizinkan atau tidak? tidak boleh, position setidaknya harus punya satu permission

Spec masih membuka dua kemungkinan:
- position tanpa akses tetap boleh dibuat, atau
- minimal harus ada satu permission.

Saat ini plan belum memakukan keputusan tersebut.

Saran:
- Putuskan ini secara eksplisit di dokumen plan karena akan memengaruhi:
  - rule validation,
  - copy UI,
  - acceptance criteria,
  - test case.

### 2. Type `permissions` sebaiknya wajib atau opsional? di buat wajib saja, karena form selalu menginisialisasi sebagai array

Plan mengarah ke `permissions: string[]`, tetapi implementasi type saat ini masih longgar dengan bentuk opsional.

Saran:
- Jika semua form selalu menginisialisasi `permissions` sebagai array, lebih konsisten jika type dibuat wajib.
- Ini membantu mengurangi fallback `|| []` berulang di komponen.

## Rekomendasi Revisi Dokumen

Jika dokumen `docs/plan/employee_permission_plan.md` ingin dipertahankan, revisi minimum yang saya sarankan:

1. Perbarui Ringkasan Gap agar sesuai dengan kondisi repo saat ini.
2. Hapus langkah implementasi yang sudah selesai dari urutan kerja utama.
3. Tambahkan section "Remaining Gaps".
4. Tambahkan section "Test Plan".
5. Tegaskan keputusan bisnis untuk position tanpa permission.
6. Tambahkan catatan khusus untuk error mapping `permissions.*` di frontend.

## Kesimpulan

Arah plan sudah benar dan konsisten dengan kebutuhan bisnis pada spec, tetapi isi plan saat ini tidak lagi akurat sebagai representasi gap implementasi aktual. Improvement paling penting bukan menambah langkah UI/backend yang sudah ada, melainkan merapikan status dokumen, menutup detail error handling array validation, dan menambahkan test plan yang eksplisit.
