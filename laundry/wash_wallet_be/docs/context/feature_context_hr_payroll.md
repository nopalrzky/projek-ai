# Feature Context - HR & Payroll

## Tujuan Context

Dokumen ini adalah content brief untuk AI lain yang akan menulis konten page feature HR & Payroll WashWallet.

Gaya yang harus dipakai: Actual + Guardrail. HR & Payroll di codebase kuat pada employee, position/permission, salary component, employee salary, process commission, fine, loan, payroll preview/store single/bulk, payroll items, work logs, dan payroll accounting. Attendance table ada, tetapi belum terlihat sebagai route/controller aktif.

## Ringkasan Feature

HR & Payroll di WashWallet membantu owner mengelola karyawan outlet, posisi dan permission, komponen gaji, gaji per karyawan, kasbon, denda, komisi proses produksi, dan payroll bulanan. Payroll dapat dipreview per karyawan atau seluruh karyawan aktif outlet, lalu disimpan sebagai payroll paid dengan payroll items dan jurnal accounting.

Narasi aman: WashWallet menghubungkan pekerjaan produksi dengan komisi, potongan kasbon/denda dengan payroll, dan pembayaran gaji dengan pencatatan accounting.

## Capability yang Aman Diklaim

- Employee management:
  - Employee tersimpan per outlet dengan name, username, password, phone, address, date of birth, avatar, gender, start date, active flag, cutoff days, dan last login.
  - Employee memiliki login mobile cashier/production, token Sanctum, dan FCM device token.
  - Employee dapat punya posisi, salary, process assignment, loan, fine log, expense, order, dan attendance relation.

- Position dan permission:
  - Position tersimpan per outlet dengan slug, active flag, default flag, dan permission list.
  - PositionService dapat membuat default positions untuk outlet dan mengelola permission keys.
  - Middleware `position.permission:*` dipakai di route mobile untuk membatasi akses order, service, customer, payment, production, dan courier.
  - Employee memiliki helper untuk cek permission per outlet dan akses multi-outlet untuk courier.

- Salary component dan employee salary:
  - Salary master memiliki name, type, amount, active flag, dan description.
  - Employee salary mengikat employee ke salary, amount, active flag, dan tanggal effective.
  - Payroll preview membaca monthly salary sebagai base salary dan daily salary sebagai allowance dengan asumsi work days.

- Process dan komisi produksi:
  - Process dapat dibuat dan dihubungkan ke laundry service.
  - Employee process mengikat employee ke process.
  - Employee process commission mendukung commission type per item, per kg, percentage, atau flat.
  - Komisi dapat punya target threshold, bonus amount, rules, effective date, dan active flag.
  - Saat order item process selesai, OrderItemService dapat membuat WorkLog untuk komisi.

- Work logs:
  - WorkLog menyimpan employee, process, order item process, commission rule, quantity, base amount, bonus, total amount, period year/month, dan payroll item.
  - WorkLog unpaid dipakai dalam payroll preview sebagai total commission.
  - Saat payroll disimpan, work logs ditautkan ke payroll item commission.

- Fine dan fine log:
  - Fine master tersedia per outlet.
  - FineLog mencatat employee, fine, amount, date, reason, attachment, status, source account, journal, dan payroll item.
  - Payroll preview menghitung unpaid fine logs dalam periode sebagai deduction.
  - Saat payroll disimpan, fine log ditautkan ke payroll item fine.

- Loan/kasbon:
  - Loan menyimpan employee, outlet, amount, remaining amount, installment, status, date, source account, dan note.
  - LoanLog menyimpan repayment schedule/payment, source payroll/cash/transfer, deposit account, payroll item, dan payment date.
  - Payroll preview mengambil scheduled payroll repayment yang belum terkait payroll item.
  - Saat payroll disimpan, loan log ditautkan ke payroll item loan dan remaining loan diperbarui.

- Payroll preview dan store:
  - API `payrolls/preview` mendukung preview single employee jika employee id dikirim.
  - Jika employee id kosong, preview bulk untuk seluruh active employees pada outlet.
  - Payroll store menerima array `items`, sehingga bisa single atau bulk.
  - Payroll menyimpan employee, bank account, month/year, payment date, transaction number, method, type single/bulk, salary, allowance, commission, overtime, loan deduction, fine, net salary, status, note, dan attachment.
  - Payroll item mencatat earning/deduction dengan category salary, allowance, commission, fine, loan, atau other.
  - Payroll paid memanggil accounting journal.

- Payroll accounting:
  - `AccountingService::recordPayroll` mencatat jurnal payroll.
  - Payroll destroy membalik journal entry jika masih draft.

- Attendance sebagai data model terbatas:
  - Tabel/model `Attendance` ada dengan employee, date, check in/out, dan overtime minutes.
  - PayrollService masih memiliki TODO "Integrate with Attendance" dan memakai assumed work days 30 untuk daily allowance.

## Source of Truth dari Codebase

- Route employee, position, salary, loan, fine, fine log, payroll ada di `routes/web.php`.
- API preview payroll ada di `routes/web.php` prefix `api/payrolls/preview`.
- Mobile employee auth dan permission ada di `routes/api_mobile_cashier.php` dan `routes/api_mobile_production.php`.
- Employee service/controller ada di `app/Services/EmployeeService.php` dan `app/Http/Controllers/Web/EmployeeController.php`.
- Position service ada di `app/Services/PositionService.php`.
- Salary service dan employee salary service ada di `app/Services/SalaryService.php` dan `app/Services/EmployeeSalaryService.php`.
- Process/commission ada di `app/Services/ProcessService.php`, `app/Models/Process.php`, `app/Models/EmployeeProcess.php`, dan `app/Models/EmployeeProcessCommission.php`.
- Payroll ada di `app/Services/PayrollService.php`, `app/Http/Controllers/Api/PayrollController.php`, dan `app/Http/Controllers/Web/PayrollController.php`.
- Fine dan loan ada di `app/Services/FineService.php`, `app/Services/FineLogService.php`, dan `app/Services/LoanService.php`.
- Work log dan attendance ada di `app/Models/WorkLog.php` dan `app/Models/Attendance.php`.

## Flow / Entity Utama

1. Owner membuat outlet, positions, permission, salary master, process, dan employee.
2. Employee diberi positions dan salary components.
3. Employee produksi diberi process assignment dan optional commission rule.
4. Saat proses order item selesai, system mencatat work log commission jika rule aktif.
5. Fine log dan loan repayment schedule dapat menjadi potongan payroll.
6. Owner membuka payroll preview untuk satu employee atau semua active employees di outlet.
7. Payroll preview menghitung base salary, allowance, commission, fine, loan deduction, gross salary, dan net salary.
8. Payroll store membuat payroll paid, payroll items, mengikat work logs/fine logs/loan logs, dan mencatat accounting journal.

## Angle Konten untuk Feature Page

- "Payroll yang menarik data dari gaji, komisi produksi, denda, dan kasbon."
- "Permission karyawan mengikuti posisi, sehingga mobile app hanya membuka fitur yang relevan."
- "Komisi produksi tidak perlu dihitung manual karena work log dibuat dari proses yang selesai."
- "Preview payroll membantu owner cek total gaji sebelum menyimpan pembayaran."
- "Payroll masuk ke pencatatan accounting, bukan berhenti di slip gaji."

## Batas Klaim / Jangan Diklaim

- Jangan klaim attendance/check-in sebagai fitur aktif end-to-end. Model dan migration ada, tetapi route/controller aktif tidak terlihat.
- Jangan klaim biometric attendance, face recognition, fingerprint, GPS/geolocation attendance, atau anti-fraud attendance.
- Jangan klaim shift scheduling, roster, cuti/leave management, atau approval cuti.
- Jangan klaim auto bank transfer payroll. Payment method dan bank account source ada, tetapi transfer otomatis tidak terlihat.
- Jangan klaim overtime otomatis dari attendance. Payroll masih memakai `totalOvertimeAllowance` input/summary dan daily allowance memakai assumed work days.
- Jangan klaim performance dashboard lengkap seperti attendance rate, rating, atau productivity score kecuali dibatasi ke work logs/commission yang tersedia.
- Jangan klaim tax/PPh payroll automation.

## Saran Section Page

- Hero: "Payroll laundry yang terhubung ke pekerjaan produksi dan potongan karyawan."
- Problem: komisi, kasbon, denda, dan gaji direkap manual setiap bulan.
- Feature block 1: Employee, position, dan permission.
- Feature block 2: Salary component dan employee salary.
- Feature block 3: Process commission dan work logs.
- Feature block 4: Loan/kasbon, fine, dan deduction.
- Feature block 5: Payroll preview single/bulk, payroll items, dan accounting journal.
- Guardrail note internal: jangan menjual attendance/shift/cuti sebagai fitur aktif.

## Referensi Kode

- `routes/web.php`
- `routes/api_mobile_cashier.php`
- `routes/api_mobile_production.php`
- `app/Http/Controllers/Web/EmployeeController.php`
- `app/Http/Controllers/Web/PayrollController.php`
- `app/Http/Controllers/Api/PayrollController.php`
- `app/Services/EmployeeService.php`
- `app/Services/PositionService.php`
- `app/Services/SalaryService.php`
- `app/Services/EmployeeSalaryService.php`
- `app/Services/ProcessService.php`
- `app/Services/PayrollService.php`
- `app/Services/LoanService.php`
- `app/Services/FineService.php`
- `app/Services/FineLogService.php`
- `app/Services/AccountingService.php`
- `app/Services/OrderItemService.php`
- `app/Http/Middleware/CheckPositionPermission.php`
- `app/Models/Employee.php`
- `app/Models/Position.php`
- `app/Models/PositionPermission.php`
- `app/Models/EmployeePosition.php`
- `app/Models/Salary.php`
- `app/Models/EmployeeSalary.php`
- `app/Models/Process.php`
- `app/Models/EmployeeProcess.php`
- `app/Models/EmployeeProcessCommission.php`
- `app/Models/WorkLog.php`
- `app/Models/Loan.php`
- `app/Models/LoanLog.php`
- `app/Models/Fine.php`
- `app/Models/FineLog.php`
- `app/Models/Payroll.php`
- `app/Models/PayrollItem.php`
- `app/Models/Attendance.php`
- `database/migrations/2025_11_14_120340_create_attendances_table.php`
- `resources/js/Data/Features/HrPayroll.tsx` sebagai copy pembanding, bukan source of truth jika bertentangan dengan backend.
