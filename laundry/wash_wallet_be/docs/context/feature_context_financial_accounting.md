# Feature Context - Financial Accounting

## Tujuan Context

Dokumen ini adalah content brief untuk AI lain yang akan menulis konten page feature Financial Accounting WashWallet.

Gaya yang harus dipakai: Actual + Guardrail. Jelaskan accounting yang benar-benar ada di codebase: chart of accounts, journal, accounting period, ledger, profit loss, balance sheet, expense, deposit, petty cash, payroll/order/package/topup/referral auto-journal, owner wallet, bank account, withdrawal, export/print report.

## Ringkasan Feature

Financial Accounting di WashWallet adalah modul pencatatan keuangan untuk owner laundry yang menghubungkan transaksi operasional dengan jurnal dan laporan. Sistem memiliki chart of accounts, journal entries/details, buku besar, laporan laba rugi, neraca, periode akuntansi, approval expense/deposit/petty cash, serta flow wallet withdrawal owner.

Narasi aman: WashWallet membantu owner menjaga transaksi laundry, paket, payroll, topup, referral, expense, deposit, petty cash, dan order payment masuk ke pencatatan accounting yang bisa dilihat sebagai ledger dan report.

## Capability yang Aman Diklaim

- Chart of accounts:
  - Account mendukung owner, outlet, parent account, code, name, type, subtype, account role, transactional flag, active flag, dan system flag.
  - Account service dapat membuat default accounts dan outlet-specific accounts seperti cash, receivable, loan, fine.
  - API account menyediakan list, next code, dan detail.

- Journal entries dan details:
  - Journal entry memiliki outlet, transaction number, date, description, reference type/id, manual flag, dan details.
  - Journal detail menyimpan account, debit, credit, dan memo.
  - Journal entry service mendukung create, update, destroy, restore, force destroy, account balance, dan trial balance.
  - Accounting service memiliki helper update/reverse journal by reference.

- Accounting period:
  - Accounting period per outlet menyimpan start/end date dan closed state.
  - Service/controller mendukung create, close, reopen, dan delete.

- General ledger:
  - Ledger dapat difilter outlet, account, start date, end date.
  - Ledger menghitung opening balance, closing balance, running balance, dan summary.
  - Tersedia compare, print, dan export.

- Profit loss:
  - Laporan laba rugi dibangun dari account revenue/expense dan journal details.
  - Mendukung date range, comparative report, print, dan export.

- Balance sheet:
  - Neraca menghitung asset, liability, equity, current earnings, dan balanced summary.
  - Mendukung compare, print, dan export.

- Expense approval:
  - Expense mendukung create, update, approve, reject, cancel, attachment, source account, expense account, status, dan journal entry.
  - Saat approve, accounting journal dicatat/diperbarui.

- Deposit dan petty cash:
  - Deposit memiliki approval/reject/cancel/destroy dan accounting behavior.
  - Petty cash memiliki approval/reject/cancel/destroy dan accounting behavior.
  - Notification classes tersedia untuk request deposit, expense, dan petty cash.

- Auto-journal dari domain lain:
  - Payroll paid dapat mencatat journal payroll.
  - Loan disbursement dan loan log dapat mencatat journal.
  - Fine log dapat mencatat journal.
  - Topup owner coin dapat mencatat journal.
  - Referral commission dapat mencatat journal.
  - Customer subscription sale, package usage, dan package breakage dapat mencatat journal.
  - Order payment dapat mencatat journal.
  - Prive dapat mencatat journal.

- Owner wallet dan withdrawal:
  - User memiliki `wallet_balance`.
  - Wallet transaction mencatat order wallet income, withdrawal request, withdrawal rejected refund, withdrawal cancelled refund, dan manual adjustment.
  - Owner bank account mengikat user ke withdrawal bank dan dapat diset default.
  - Wallet withdrawal mendukung owner create/cancel dan admin process/mark paid/reject.
  - Withdrawal bank dikelola admin.

- Export/print report:
  - General ledger, profit loss, dan balance sheet memiliki route print dan export.
  - Format export yang divalidasi adalah array, pdf, dan excel pada controller report terkait.

## Source of Truth dari Codebase

- Route accounting, report, expense, deposit, petty cash, wallet, bank account, dan withdrawal ada di `routes/web.php`.
- Account service ada di `app/Services/AccountService.php`.
- Journal service ada di `app/Services/JournalEntryService.php`.
- Accounting orchestration ada di `app/Services/AccountingService.php`.
- Accounting period ada di `app/Services/AccountingPeriodService.php` dan `app/Http/Controllers/Web/AccountingPeriodController.php`.
- General ledger ada di `app/Services/GeneralLedgerService.php` dan `app/Http/Controllers/Web/GeneralLedgerController.php`.
- Profit loss ada di `app/Services/ProfitLossService.php` dan `app/Http/Controllers/Web/ProfitLossController.php`.
- Balance sheet ada di `app/Services/BalanceSheetService.php` dan `app/Http/Controllers/Web/BalanceSheetController.php`.
- Expense, deposit, petty cash, wallet, bank account, dan withdrawal ada di service/controller masing-masing.
- Model utama ada di `app/Models/Account.php`, `app/Models/JournalEntry.php`, `app/Models/JournalDetail.php`, `app/Models/AccountingPeriod.php`, `app/Models/Expense.php`, `app/Models/Deposit.php`, `app/Models/PettyCash.php`, `app/Models/WalletTransaction.php`, `app/Models/WalletWithdrawal.php`, `app/Models/OwnerBankAccount.php`, dan `app/Models/WithdrawalBank.php`.

## Flow / Entity Utama

1. Owner memiliki chart of accounts default dan outlet-specific account.
2. Transaksi operasional atau financial event membuat journal entry dan journal details.
3. Expense, deposit, petty cash, payroll, loan, fine, package, topup, referral, order payment, dan prive mengarah ke AccountingService.
4. Journal details menjadi sumber general ledger, profit loss, dan balance sheet.
5. Accounting period dapat ditutup atau dibuka kembali untuk kontrol periode.
6. Owner wallet menerima income/adjustment dan dapat mengajukan withdrawal ke bank account.
7. Admin memproses, menandai paid, atau menolak withdrawal.

## Angle Konten untuk Feature Page

- "Transaksi laundry langsung rapi ke jurnal dan laporan."
- "Owner tidak hanya melihat order, tapi juga dampaknya ke ledger, laba rugi, dan neraca."
- "Expense, payroll, paket, topup, referral, dan payment order masuk ke satu struktur accounting."
- "Approval pengeluaran dan petty cash membantu kontrol kas outlet."
- "Withdrawal wallet owner punya alur request sampai admin paid/reject."

## Batas Klaim / Jangan Diklaim

- Jangan klaim bank reconciliation otomatis.
- Jangan klaim integrasi bank langsung untuk mutasi rekening. Yang terlihat adalah Midtrans payment dan withdrawal workflow internal/admin.
- Jangan klaim tax filing, e-Faktur, PPh/PPN automation, atau laporan pajak siap lapor.
- Jangan klaim forecast cashflow, budgeting, atau AI financial insights.
- Jangan klaim audit trail lengkap berbasis immutable ledger. Ada journal reference dan logs, tetapi bukan immutable ledger.
- Jangan klaim multi-currency.
- Jangan klaim automatic bank transfer untuk withdrawal. Admin flow mark paid terlihat, bukan transfer otomatis.
- Jangan klaim PDF/Excel file benar-benar di-generate jika controller saat ini mengembalikan export data ke session. Aman sebut "route export/print tersedia".

## Saran Section Page

- Hero: "Accounting laundry yang terhubung dari transaksi sampai laporan."
- Problem: order, paket, payroll, dan expense tersebar sehingga laporan harus direkap manual.
- Feature block 1: Chart of accounts dan journal.
- Feature block 2: Auto-journal dari transaksi operasional.
- Feature block 3: Expense, deposit, petty cash, dan approval.
- Feature block 4: General ledger, laba rugi, neraca, compare, print, export.
- Feature block 5: Wallet owner, bank account, dan withdrawal workflow.
- Guardrail note internal: hindari klaim compliance pajak dan integrasi bank otomatis.

## Referensi Kode

- `routes/web.php`
- `app/Http/Controllers/Web/AccountController.php`
- `app/Http/Controllers/Web/JournalEntryController.php`
- `app/Http/Controllers/Web/AccountingPeriodController.php`
- `app/Http/Controllers/Web/GeneralLedgerController.php`
- `app/Http/Controllers/Web/ProfitLossController.php`
- `app/Http/Controllers/Web/BalanceSheetController.php`
- `app/Http/Controllers/Web/ExpenseController.php`
- `app/Http/Controllers/Web/DepositController.php`
- `app/Http/Controllers/Web/PettyCashController.php`
- `app/Http/Controllers/Web/WalletController.php`
- `app/Http/Controllers/Web/OwnerBankAccountController.php`
- `app/Http/Controllers/Web/WalletWithdrawalController.php`
- `app/Http/Controllers/Web/Admin/WithdrawalBankController.php`
- `app/Http/Controllers/Web/Admin/AdminWalletWithdrawalController.php`
- `app/Services/AccountService.php`
- `app/Services/AccountingService.php`
- `app/Services/JournalEntryService.php`
- `app/Services/AccountingPeriodService.php`
- `app/Services/GeneralLedgerService.php`
- `app/Services/ProfitLossService.php`
- `app/Services/BalanceSheetService.php`
- `app/Services/ExpenseService.php`
- `app/Services/DepositService.php`
- `app/Services/PettyCashService.php`
- `app/Services/WalletBalanceService.php`
- `app/Services/WalletWithdrawalService.php`
- `app/Services/OwnerBankAccountService.php`
- `app/Models/Account.php`
- `app/Models/JournalEntry.php`
- `app/Models/JournalDetail.php`
- `app/Models/AccountingPeriod.php`
- `app/Models/Expense.php`
- `app/Models/Deposit.php`
- `app/Models/PettyCash.php`
- `app/Models/WalletTransaction.php`
- `app/Models/WalletWithdrawal.php`
- `app/Models/OwnerBankAccount.php`
- `app/Models/WithdrawalBank.php`
- `resources/js/Data/Features/FinancialAccounting.tsx` sebagai copy pembanding, bukan source of truth jika bertentangan dengan backend.
