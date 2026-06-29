<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Order;
use App\Models\Loan;
use App\Models\Expense;
use App\Models\FineLog;
use App\Models\LoanLog;
use App\Models\Payroll;
use App\Models\Prive;
use App\Models\Topup;
use App\Models\CoinTransaction;
use App\Models\CustomerSubscription;
use App\Models\JournalEntry;
use App\Models\Outlet;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class AccountingService extends BaseService
{
  /*
    |--------------------------------------------------------------------------
    | Loan Journals
    |--------------------------------------------------------------------------
    */

  public function __construct(
    protected JournalEntryService $journalEntryService,
    protected AccountService $accountService,
  ) {}

  public function recordLoanDisbursement(Loan $loan): void
  {
    try {
      $loan->loadMissing(['employee.outlet', 'sourceAccount']);

      $receivableAccount = $this->resolveSystemAccount('employee_receivable');

      if (!$receivableAccount) {
        throw new Exception('Employee receivable account not found');
      }

      $outletId = $loan->employee?->outlet_id;

      if (!$outletId) {
        throw new Exception('Loan outlet not found through employee relation');
      }

      $journalData = [
        'outletId' => $outletId,
        'date' => $loan->loan_date,
        'referenceType' => Loan::class,
        'referenceId' => $loan->id,
        'description' => "Pencairan kasbon: {$loan->employee->name}",
        'isManual' => false,
        'journalDetails' => [
          [
            'accountId' => $receivableAccount->id,
            'debit' => $loan->amount,
            'credit' => 0,
            'memo' => "Piutang kasbon karyawan: {$loan->employee->name}",
          ],
          [
            'accountId' => $loan->source_account_id,
            'debit' => 0,
            'credit' => $loan->amount,
            'memo' => "Pencairan kasbon dari: {$loan->sourceAccount->name}",
          ],
        ],
      ];

      $this->journalEntryService->store($journalData);

      Log::info('Loan disbursement journal created', [
        'loan_id' => $loan->id,
        'amount' => $loan->amount,
        'type' => 'accounting_journal'
      ]);
    } catch (Exception $e) {
      Log::error('Failed to record loan disbursement', [
        'loan_id' => $loan->id,
        'error' => $e->getMessage(),
        'type' => 'accounting_error'
      ]);
      throw new Exception('Failed to record loan disbursement: ' . $e->getMessage());
    }
  }

  public function recordLoanLog(LoanLog $loanLog): void
  {
    try {
      $loan = $loanLog->loan;
      $loan->loadMissing(['employee.outlet', 'sourceAccount']);
      $receivableAccount = $this->resolveSystemAccount('employee_receivable');

      if (!$receivableAccount) {
        throw new Exception('Employee receivable account not found');
      }

      if (!$loanLog->deposit_account_id) {
        throw new Exception('Deposit account is required for loan payment');
      }

      $depositAccount = $this->resolveAccountById($loanLog->deposit_account_id);

      if (!$depositAccount) {
        throw new Exception('Deposit account not found');
      }

      $outletId = $loan->employee?->outlet_id;

      if (!$outletId) {
        throw new Exception('Loan outlet not found through employee relation');
      }

      $journalData = [
        'outletId' => $outletId,
        'date' => $loanLog->payment_date,
        'referenceType' => LoanLog::class,
        'referenceId' => $loanLog->id,
        'description' => sprintf(
          'Pembayaran Kasbon: %s - Rp %s',
          $loan->employee->name,
          number_format((float) $loanLog->amount, 0, ',', '.')
        ),
        'isManual' => false,
        'journalDetails' => [
          [
            'accountId' => $depositAccount->id,
            'debit' => $loanLog->amount,
            'credit' => 0,
            'memo' => sprintf('Penerimaan pembayaran kasbon via %s', $depositAccount->name),
          ],
          [
            'accountId' => $receivableAccount->id,
            'debit' => 0,
            'credit' => $loanLog->amount,
            'memo' => sprintf('Pengurangan piutang kasbon: %s', $loan->employee->name),
          ],
        ],
      ];

      $this->journalEntryService->store($journalData);

      Log::info('Loan payment journal created', [
        'loan_id' => $loan->id,
        'payment_id' => $loanLog->id,
        'amount' => $loanLog->amount,
        'type' => 'accounting_journal'
      ]);
    } catch (Exception $e) {
      Log::error('Failed to record loan payment', [
        'loan_log_id' => $loanLog->id ?? null,
        'error' => $e->getMessage(),
        'type' => 'accounting_error'
      ]);
      throw new Exception('Failed to record loan payment: ' . $e->getMessage());
    }
  }

  public function recordFineLog(FineLog $fineLog): void
  {
    try {
      $receivableAccount = $this->resolveSystemAccount('employee_receivable');
      $revenueAccount = $this->resolveSystemAccount('fine_revenue');

      if (!$receivableAccount || !$revenueAccount) {
        throw new Exception('Required system accounts not found for fine journal entry');
      }

      $journalData = [
        'outletId' => $fineLog->employee->outlet_id,
        'date' => $fineLog->date,
        'referenceType' => FineLog::class,
        'referenceId' => $fineLog->id,
        'description' => "Denda karyawan: {$fineLog->fine->name} - {$fineLog->employee->full_name}",
        'isManual' => false,
        'journalDetails' => [
          [
            'accountId' => $receivableAccount->id,
            'debit' => $fineLog->amount,
            'credit' => 0,
            'memo' => "Piutang denda karyawan: {$fineLog->employee->full_name}",
          ],
          [
            'accountId' => $revenueAccount->id,
            'debit' => 0,
            'credit' => $fineLog->amount,
            'memo' => "Pendapatan denda: {$fineLog->fine->name}",
          ],
        ],
      ];

      $this->journalEntryService->store($journalData);

      Log::info('Fine log journal created', [
        'fine_log_id' => $fineLog->id,
        'amount' => $fineLog->amount,
        'type' => 'accounting_journal'
      ]);
    } catch (Exception $e) {
      Log::error('Failed to record fine log', [
        'fine_log_id' => $fineLog->id,
        'error' => $e->getMessage(),
        'type' => 'accounting_error'
      ]);
      throw new Exception('Failed to record fine log: ' . $e->getMessage());
    }
  }

  public function recordExpense(Expense $expense): JournalEntry
  {
    try {
      if (!$expense->expense_account_id) {
        throw new Exception('Expense account is required');
      }

      if (!$expense->source_account_id) {
        throw new Exception('Source account is required');
      }

      $expenseAccount = $this->resolveAccountById($expense->expense_account_id);
      $sourceAccount = $this->resolveAccountById($expense->source_account_id);

      if (!$expenseAccount || !$sourceAccount) {
        throw new Exception('Expense or source account not found');
      }

      if ($expenseAccount->type !== 'expense') {
        throw new Exception('Account must be of type expense');
      }

      if ($sourceAccount->type !== 'asset') {
        throw new Exception('Source account must be of type asset');
      }

      $journalData = [
        'outletId' => $expense->outlet_id,
        'date' => $expense->date,
        'referenceType' => Expense::class,
        'referenceId' => $expense->id,
        'description' => sprintf(
          'Pengeluaran: %s',
          $expense->description ?: $expenseAccount->name
        ),
        'isManual' => false,
        'journalDetails' => [
          [
            'accountId' => $expense->expense_account_id,
            'debit' => $expense->amount,
            'credit' => 0,
            'memo' => sprintf(
              'Beban %s: %s',
              $expenseAccount->name,
              $expense->description ?: 'Pengeluaran operasional'
            ),
          ],
          [
            'accountId' => $expense->source_account_id,
            'debit' => 0,
            'credit' => $expense->amount,
            'memo' => sprintf(
              'Pembayaran dari: %s',
              $sourceAccount->name
            ),
          ],
        ],
      ];

      $journalEntry = $this->journalEntryService->store($journalData);

      Log::info('Expense journal created', [
        'expense_id' => $expense->id,
        'amount' => $expense->amount,
        'expense_account' => $expenseAccount->name,
        'source_account' => $sourceAccount->name,
        'journal_entry_id' => $journalEntry->id,
        'type' => 'accounting_journal'
      ]);

      return $journalEntry;
    } catch (Exception $e) {
      Log::error('Failed to record expense', [
        'expense_id' => $expense->id,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'type' => 'accounting_error'
      ]);
      throw new Exception('Failed to record expense: ' . $e->getMessage());
    }
  }

  public function updateExpenseJournal(Expense $expense): void
  {
    try {
      $journalEntry = JournalEntry::query()
        ->byReferenceType(Expense::class)
        ->byReferenceId($expense->id)
        ->latest('id')
        ->first();

      if (!$journalEntry) {
        $this->recordExpense($expense);
        return;
      }

      $expenseAccount = $this->resolveAccountById($expense->expense_account_id);
      $sourceAccount = $this->resolveAccountById($expense->source_account_id);

      if (!$expenseAccount || !$sourceAccount) {
        throw new Exception('Expense or source account not found');
      }

      $this->journalEntryService->update($journalEntry->id, [
        'date' => $expense->date,
        'description' => sprintf(
          'Pengeluaran: %s',
          $expense->description ?: $expenseAccount->name
        ),
        'journalDetails' => [
          [
            'accountId' => $expense->expense_account_id,
            'debit' => $expense->amount,
            'credit' => 0,
            'memo' => sprintf(
              'Beban %s: %s',
              $expenseAccount->name,
              $expense->description ?: 'Pengeluaran operasional'
            ),
          ],
          [
            'accountId' => $expense->source_account_id,
            'debit' => 0,
            'credit' => $expense->amount,
            'memo' => sprintf(
              'Pembayaran dari: %s',
              $sourceAccount->name
            ),
          ],
        ],
      ]);

      Log::info('Expense journal updated', [
        'expense_id' => $expense->id,
        'journal_entry_id' => $journalEntry->id,
        'amount' => $expense->amount,
        'type' => 'accounting_journal'
      ]);
    } catch (Exception $e) {
      Log::error('Failed to update expense journal', [
        'expense_id' => $expense->id,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'type' => 'accounting_error'
      ]);
      throw new Exception('Failed to update expense journal: ' . $e->getMessage());
    }
  }

  public function recordPrive(Prive $prive): void
  {
    try {
      if (!$prive->equity_account_id) {
        throw new Exception('Equity account is required');
      }

      if (!$prive->source_account_id) {
        throw new Exception('Source account is required');
      }

      $equityAccount = $this->resolveAccountById($prive->equity_account_id);
      $sourceAccount = $this->resolveAccountById($prive->source_account_id);

      if (!$equityAccount || !$sourceAccount) {
        throw new Exception('Equity or source account not found');
      }

      $journalData = [
        'outletId' => $prive->outlet_id,
        'date' => $prive->date,
        'referenceType' => Prive::class,
        'referenceId' => $prive->id,
        'description' => sprintf(
          'Penarikan Prive oleh %s%s',
          $prive->user->name ?? 'Owner',
          $prive->description ? ' - ' . $prive->description : ''
        ),
        'isManual' => false,
        'journalDetails' => [
          [
            'accountId' => $prive->equity_account_id,
            'debit' => $prive->amount,
            'credit' => 0,
            'memo' => sprintf('Prive %s: %s', $equityAccount->name, $prive->description ?? 'Penarikan modal'),
          ],
          [
            'accountId' => $prive->source_account_id,
            'debit' => 0,
            'credit' => $prive->amount,
            'memo' => sprintf('Pembayaran prive dari: %s', $sourceAccount->name),
          ],
        ],
      ];

      $this->journalEntryService->store($journalData);

      Log::info('Prive journal created', [
        'prive_id' => $prive->id,
        'amount' => $prive->amount,
        'type' => 'accounting_journal'
      ]);
    } catch (Exception $e) {
      Log::error('Failed to record prive', [
        'prive_id' => $prive->id,
        'error' => $e->getMessage(),
        'type' => 'accounting_error'
      ]);
      throw new Exception('Failed to record prive: ' . $e->getMessage());
    }
  }

  public function recordPayroll(Payroll $payroll): void
  {
    try {
      $payroll->loadMissing('employee');

      $salaryExpenseAccount = $this->resolveSystemAccount('salary_expense');
      $receivableAccount = $this->resolveSystemAccount('employee_receivable');

      if (!$salaryExpenseAccount) {
        throw new Exception('Salary expense account not found');
      }

      if (!$receivableAccount) {
        throw new Exception('Employee receivable account not found');
      }

      if (!$payroll->bank_account_id) {
        throw new Exception('Bank account is required for payroll');
      }

      $bankAccount = $this->resolveAccountById($payroll->bank_account_id);

      if (!$bankAccount) {
        throw new Exception('Bank account not found');
      }

      $outletId = $payroll->employee?->outlet_id;

      if (!$outletId) {
        throw new Exception('Payroll outlet not found through employee relation');
      }

      $grossSalary = $payroll->getGrossSalary();
      $totalDeduction = $payroll->getTotalDeduction();

      $journalData = [
        'outletId' => $outletId,
        'date' => $payroll->payment_date,
        'referenceType' => Payroll::class,
        'referenceId' => $payroll->id,
        'description' => sprintf(
          'Pembayaran Gaji: %s - Periode %s',
          $payroll->employee->name,
          $payroll->getPeriodLabel()
        ),
        'isManual' => false,
        'journalDetails' => [],
      ];

      $journalData['journalDetails'][] = [
        'accountId' => $salaryExpenseAccount->id,
        'debit' => $grossSalary,
        'credit' => 0,
        'memo' => sprintf('Beban gaji %s (Gross: %s)', $payroll->employee->name, number_format($grossSalary, 0, ',', '.')),
      ];

      if ($totalDeduction > 0) {
        $journalData['journalDetails'][] = [
          'accountId' => $receivableAccount->id,
          'debit' => 0,
          'credit' => $totalDeduction,
          'memo' => sprintf('Potongan kasbon & denda: %s', number_format($totalDeduction, 0, ',', '.')),
        ];
      }

      $journalData['journalDetails'][] = [
        'accountId' => $payroll->bank_account_id,
        'debit' => 0,
        'credit' => $payroll->net_salary,
        'memo' => sprintf('Pembayaran gaji bersih via %s: %s', $bankAccount->name, number_format((float) $payroll->net_salary, 0, ',', '.')),
      ];

      $this->journalEntryService->store($journalData);

      Log::info('Payroll journal created', [
        'payroll_id' => $payroll->id,
        'employee_id' => $payroll->employee_id,
        'gross_salary' => $grossSalary,
        'total_deduction' => $totalDeduction,
        'net_salary' => $payroll->net_salary,
        'type' => 'accounting_journal'
      ]);
    } catch (Exception $e) {
      Log::error('Failed to record payroll', [
        'payroll_id' => $payroll->id,
        'error' => $e->getMessage(),
        'type' => 'accounting_error'
      ]);
      throw new Exception('Failed to record payroll: ' . $e->getMessage());
    }
  }

  public function recordTopupJournal(Topup $topup): void
  {
    try {
      $cashAccount = $this->resolveSystemAccount('cash_on_hand');
      $coinLiabilityAccount = $this->getCoinLiabilityAccount();

      if (!$cashAccount || !$coinLiabilityAccount) {
        throw new Exception('Required accounts not found for topup journal');
      }

      $journalData = [
        'outletId' => $topup->outlet_id ?? $this->getDefaultOutletId($topup->user_id),
        'date' => $topup->created_at ?? now(),
        'referenceType' => Topup::class,
        'referenceId' => $topup->id,
        'description' => sprintf(
          'Topup coin #%d - %s',
          $topup->id,
          $topup->outlet_id ? 'Outlet' : 'Master'
        ),
        'isManual' => false,
        'journalDetails' => [
          [
            'accountId' => $cashAccount->id,
            'debit' => $topup->amount_money,
            'credit' => 0,
            'memo' => sprintf('Penerimaan topup coin: Rp %s', number_format($topup->amount_money, 0, ',', '.')),
          ],
          [
            'accountId' => $coinLiabilityAccount->id,
            'debit' => 0,
            'credit' => $topup->amount_money,
            'memo' => sprintf('Kewajiban coin: %s coin', number_format($topup->coin_received, 0, ',', '.')),
          ],
        ],
      ];

      $this->journalEntryService->store($journalData);

      Log::info('Topup journal entry created', [
        'topup_id' => $topup->id,
        'amount' => $topup->amount_money,
        'outlet_id' => $topup->outlet_id,
        'type' => 'accounting_journal'
      ]);
    } catch (Exception $e) {
      Log::error('Failed to record topup journal', [
        'topup_id' => $topup->id,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'type' => 'accounting_error'
      ]);
      throw new Exception('Failed to record topup journal: ' . $e->getMessage());
    }
  }

  public function recordCommissionJournal(
    Topup $topup,
    int $commissionAmount,
    int $referrerId
  ): void {
    try {
      if (!$this->isCommissionJournalEnabled()) {
        Log::info('Commission journal disabled', [
          'topup_id' => $topup->id,
          'type' => 'accounting_info'
        ]);
        return;
      }

      $referralExpenseAccount = $this->getReferralExpenseAccount();
      $coinLiabilityAccount = $this->getCoinLiabilityAccount();

      if (!$referralExpenseAccount || !$coinLiabilityAccount) {
        throw new Exception('Required accounts not found for commission journal');
      }

      $journalData = [
        'outletId' => $topup->outlet_id ?? $this->getDefaultOutletId($topup->user_id),
        'date' => now(),
        'referenceType' => Topup::class,
        'referenceId' => $topup->id,
        'description' => sprintf(
          'Komisi referral - Topup #%d (Referrer: User #%d)',
          $topup->id,
          $referrerId
        ),
        'isManual' => false,
        'journalDetails' => [
          [
            'accountId' => $referralExpenseAccount->id,
            'debit' => $commissionAmount,
            'credit' => 0,
            'memo' => sprintf('Beban komisi referral: %s coin', number_format($commissionAmount, 0, ',', '.')),
          ],
          [
            'accountId' => $coinLiabilityAccount->id,
            'debit' => 0,
            'credit' => $commissionAmount,
            'memo' => sprintf('Kewajiban coin komisi referral: %s coin', number_format($commissionAmount, 0, ',', '.')),
          ],
        ],
      ];

      $this->journalEntryService->store($journalData);

      Log::info('Commission journal entry created', [
        'topup_id' => $topup->id,
        'referrer_id' => $referrerId,
        'commission_amount' => $commissionAmount,
        'type' => 'accounting_journal'
      ]);
    } catch (Exception $e) {
      Log::error('Failed to record commission journal', [
        'topup_id' => $topup->id,
        'referrer_id' => $referrerId,
        'commission_amount' => $commissionAmount,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'type' => 'accounting_error'
      ]);
      Log::warning('Commission journal skipped due to error');
    }
  }

  // ============================================================================
  // NEW COIN ACCOUNTING METHODS
  // ============================================================================

  /**
   * Record owner topup journal entry
   * Ketika owner melakukan topup, coin dianggap sebagai aset internal (bukan beban)
   * 
   * Journal Entry:
   * Debit  : Coin Asset (coin_asset)
   * Credit : - (single entry, hanya menambah aset)
   * 
   * @param int $ownerId Owner user ID
   * @param int|null $outletId Outlet ID, bisa null untuk topup master (non-outlet)
   * @param int $amount Coin amount
   * @param int $topupId Reference to topup record
   * @param string $description Transaction description
   * @return void
   * @throws Exception
   */
  public function recordOwnerTopup(
    int $ownerId,
    ?int $outletId,
    int $amount,
    int $topupId,
    string $description = 'Owner topup coin'
  ): void {
    DB::transaction(function () use ($ownerId, $outletId, $amount, $topupId, $description) {
      try {
        $coinAssetAccount = $this->resolveSystemAccount('coin_asset', $ownerId);

        if (!$coinAssetAccount) {
          throw new Exception('Coin asset account not found');
        }

        $ownerEquityAccount = $this->resolveSystemAccount('owner_equity', $ownerId);

        if (!$ownerEquityAccount) {
          throw new Exception('Owner equity account not found');
        }

        $journalData = [
          'outletId' => $outletId ?? $this->getDefaultOutletId($ownerId),
          'date' => now(),
          'referenceType' => 'topup',
          'referenceId' => $topupId,
          'description' => sprintf(
            '%s - Owner ID: %d, Amount: %s coin',
            $description,
            $ownerId,
            number_format($amount, 0, ',', '.')
          ),
          'isManual' => false,
          'journalDetails' => [
            [
              'accountId' => $coinAssetAccount->id,
              'debit' => $amount,
              'credit' => 0,
              'memo' => 'Penambahan coin sebagai aset owner'
            ],
            [
              'accountId' => $ownerEquityAccount->id,
              'debit' => 0,
              'credit' => $amount,
              'memo' => 'Penambahan modal owner dalam bentuk coin'
            ],
          ],
        ];
        $this->journalEntryService->store($journalData);

        // Record coin transaction
        $this->insertCoinTransaction([
          'user_id' => $ownerId,
          'outlet_id' => $outletId,
          'type' => 'topup',
          'amount' => $amount,
          'reference_type' => 'topup',
          'reference_id' => $topupId,
          'description' => $description,
          'status' => 'completed',
        ]);

        Log::info('Owner topup journal created', [
          'owner_id' => $ownerId,
          'outlet_id' => $outletId,
          'amount' => $amount,
          'topup_id' => $topupId,
          'type' => 'accounting_journal'
        ]);
      } catch (Exception $e) {
        Log::error('Failed to record owner topup', [
          'owner_id' => $ownerId,
          'outlet_id' => $outletId,
          'amount' => $amount,
          'topup_id' => $topupId,
          'error' => $e->getMessage(),
          'trace' => $e->getTraceAsString(),
          'type' => 'accounting_error'
        ]);
        throw new Exception('Failed to record owner topup: ' . $e->getMessage());
      }
    });
  }

  /**
   * Record owner coin usage journal entry
   * Ketika owner menggunakan coin untuk fitur (cetak nota, API, dll)
   * Ini adalah BEBAN operasional
   * 
   * Journal Entry:
   * Debit  : Software Expense (software_expense)
   * Credit : Coin Asset (coin_asset)
   * 
   * @param int $ownerId Owner user ID
   * @param int|null $outletId Outlet ID
   * @param int $amount Coin amount used
   * @param string $referenceType Reference model type
   * @param int $referenceId Reference record ID
   * @param string $description Usage description
   * @return void
   * @throws Exception
   */
  public function recordOwnerCoinUsage(
    int $ownerId,
    ?int $outletId,
    int $amount,
    string $referenceType,
    int $referenceId,
    string $description = 'Owner coin usage'
  ): void {
    DB::transaction(function () use ($ownerId, $outletId, $amount, $referenceType, $referenceId, $description) {
      try {
        // Get required accounts
        $softwareExpenseAccount = $this->resolveSystemAccount('software_expense');
        $coinAssetAccount = $this->resolveSystemAccount('coin_asset');

        if (!$softwareExpenseAccount || !$coinAssetAccount) {
          throw new Exception('Required accounts (software_expense, coin_asset) not found');
        }

        // Create balanced journal entry
        $journalData = [
          'outletId' => $outletId ?? $this->getDefaultOutletId($ownerId),
          'date' => now(),
          'referenceType' => $referenceType,
          'referenceId' => $referenceId,
          'description' => sprintf(
            '%s - Owner ID: %d, Amount: %s coin',
            $description,
            $ownerId,
            number_format($amount, 0, ',', '.')
          ),
          'isManual' => false,
          'journalDetails' => [
            [
              'accountId' => $softwareExpenseAccount->id,
              'debit' => $amount,
              'credit' => 0,
              'memo' => sprintf(
                'Beban penggunaan software/fitur: %s (%s coin)',
                $description,
                number_format($amount, 0, ',', '.')
              ),
            ],
            [
              'accountId' => $coinAssetAccount->id,
              'debit' => 0,
              'credit' => $amount,
              'memo' => sprintf(
                'Pengurangan coin asset: %s coin',
                number_format($amount, 0, ',', '.')
              ),
            ],
          ],
        ];

        $this->journalEntryService->store($journalData);

        // Record coin transaction
        $this->insertCoinTransaction([
          'user_id' => $ownerId,
          'outlet_id' => $outletId,
          'type' => 'usage',
          'amount' => -$amount, // Negative for usage
          'reference_type' => $referenceType,
          'reference_id' => $referenceId,
          'description' => $description,
          'status' => 'completed',
        ]);

        Log::info('Owner coin usage journal created', [
          'owner_id' => $ownerId,
          'outlet_id' => $outletId,
          'amount' => $amount,
          'reference_type' => $referenceType,
          'reference_id' => $referenceId,
          'type' => 'accounting_journal'
        ]);
      } catch (Exception $e) {
        Log::error('Failed to record owner coin usage', [
          'owner_id' => $ownerId,
          'outlet_id' => $outletId,
          'amount' => $amount,
          'reference_type' => $referenceType,
          'reference_id' => $referenceId,
          'error' => $e->getMessage(),
          'trace' => $e->getTraceAsString(),
          'type' => 'accounting_error'
        ]);
        throw new Exception('Failed to record owner coin usage: ' . $e->getMessage());
      }
    });
  }

  /**
   * Record referral commission journal entry
   * Ketika sales/referrer mendapat komisi coin dari referral
   * Ini adalah PENDAPATAN untuk sales
   * 
   * Journal Entry:
   * Debit  : Coin Asset (coin_asset)
   * Credit : Referral Commission Revenue (referral_commission_revenue)
   * 
   * @param int $referrerId Sales/referrer user ID
   * @param int $amount Commission coin amount
   * @param string $referenceType Reference model type (e.g., 'topup')
   * @param int $referenceId Reference record ID
   * @param string $description Commission description
   * @return void
   * @throws Exception
   */
  public function recordReferralCommission(
    int $referrerId,
    int $amount,
    string $referenceType,
    int $referenceId,
    string $description = 'Referral commission'
  ): void {
    DB::transaction(function () use ($referrerId, $amount, $referenceType, $referenceId, $description) {
      try {
        // Get required accounts
        $coinAssetAccount = $this->resolveSystemAccount('coin_asset', $referrerId);
        $commissionRevenueAccount = $this->resolveSystemAccount('referral_commission_revenue', $referrerId);

        if (!$coinAssetAccount || !$commissionRevenueAccount) {
          throw new Exception('Required accounts (coin_asset, referral_commission_revenue) not found');
        }

        // Create balanced journal entry
        $journalData = [
          'outletId' => $this->getDefaultOutletId($referrerId),
          'date' => now(),
          'referenceType' => $referenceType,
          'referenceId' => $referenceId,
          'description' => sprintf(
            '%s - Referrer ID: %d, Amount: %s coin',
            $description,
            $referrerId,
            number_format($amount, 0, ',', '.')
          ),
          'isManual' => false,
          'journalDetails' => [
            [
              'accountId' => $coinAssetAccount->id,
              'debit' => $amount,
              'credit' => 0,
              'memo' => sprintf(
                'Penerimaan coin asset komisi: %s coin',
                number_format($amount, 0, ',', '.')
              ),
            ],
            [
              'accountId' => $commissionRevenueAccount->id,
              'debit' => 0,
              'credit' => $amount,
              'memo' => sprintf(
                'Pendapatan komisi referral: %s',
                $description
              ),
            ],
          ],
        ];

        $this->journalEntryService->store($journalData);

        $this->insertCoinTransaction([
          'user_id' => $referrerId,
          'outlet_id' => null,
          'type' => 'commission',
          'amount' => $amount,
          'reference_type' => $referenceType,
          'reference_id' => $referenceId,
          'description' => $description,
          'status' => 'completed',
        ]);

        Log::info('Referral commission journal created', [
          'referrer_id' => $referrerId,
          'amount' => $amount,
          'reference_type' => $referenceType,
          'reference_id' => $referenceId,
          'type' => 'accounting_journal'
        ]);
      } catch (Exception $e) {
        Log::error('Failed to record referral commission', [
          'referrer_id' => $referrerId,
          'amount' => $amount,
          'reference_type' => $referenceType,
          'reference_id' => $referenceId,
          'error' => $e->getMessage(),
          'trace' => $e->getTraceAsString(),
          'type' => 'accounting_error'
        ]);
        throw new Exception('Failed to record referral commission: ' . $e->getMessage());
      }
    });
  }

  /**
   * Insert coin transaction record
   * Helper method untuk mencatat pergerakan coin di tabel coin_transactions
   * 
   * @param array $data Transaction data
   * @return CoinTransaction
   * @throws Exception
   */
  protected function insertCoinTransaction(array $data): CoinTransaction
  {
    try {
      $balanceBefore = $this->getCurrentCoinBalance($data['user_id'], $data['outlet_id'] ?? null);

      $transactionNumber = $this->generateCoinTransactionNumber();

      $balanceAfter = $balanceBefore + $data['amount'];

      $transaction = CoinTransaction::create([
        'user_id' => $data['user_id'],
        'outlet_id' => $data['outlet_id'] ?? null,
        'transaction_number' => $transactionNumber,
        'type' => $data['type'],
        'amount' => abs($data['amount']),
        'balance_before' => $balanceBefore,
        'balance_after' => $balanceAfter,
        'reference_type' => $data['reference_type'],
        'reference_id' => $data['reference_id'],
        'description' => $data['description'],
        'status' => $data['status'] ?? 'completed',
        'completed_at' => now(),
      ]);

      Log::info('Coin transaction recorded', [
        'transaction_id' => $transaction->id,
        'transaction_number' => $transactionNumber,
        'user_id' => $data['user_id'],
        'outlet_id' => $data['outlet_id'] ?? null,
        'type' => $data['type'],
        'amount' => $data['amount'],
      ]);

      return $transaction;
    } catch (Exception $e) {
      Log::error('Failed to insert coin transaction', [
        'data' => $data,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'type' => 'coin_transaction_error'
      ]);
      throw new Exception('Failed to insert coin transaction: ' . $e->getMessage());
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Get current coin balance for user or outlet
   */
  private function getCurrentCoinBalance(int $userId, ?int $outletId): int
  {
    if ($outletId) {
      $outlet = Outlet::find($outletId);
      return $outlet?->coin_balance ?? 0;
    }

    $user = User::find($userId);
    return $user?->coin_balance ?? 0;
  }

  /**
   * Generate unique coin transaction number
   */
  private function generateCoinTransactionNumber(): string
  {
    do {
      $number = 'CT-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -8));
    } while (CoinTransaction::where('transaction_number', $number)->exists());

    return $number;
  }

  /**
   * Resolve account by id via AccountService::getById (compatible with new AccountService API).
   */
  private function resolveAccountById(int $accountId): ?Account
  {
    try {
      return $this->accountService->getById($accountId);
    } catch (Exception) {
      return null;
    }
  }

  /**
   * Resolve system account by slug.
   * Uses direct model query because AccountService now only exposes getAll/getById.
   */
  private function resolveSystemAccount(string $slug, ?int $ownerId = null): ?Account
  {
    $query = Account::query()
      ->bySlug($slug)
      ->isSystem(true)
      ->whereNull('outlet_id')
      ->active();

    if ($ownerId !== null) {
      $query->byOwnerId($ownerId);
    }

    return $query->first();
  }

  private function resolveOutletCashAccount(int $ownerId, int $outletId): ?Account
  {
    return Account::query()
      ->byOwnerId($ownerId)
      ->byOutletId($outletId)
      ->byAccountRole('cash')
      ->isTransactional(true)
      ->active()
      ->first();
  }

  private function resolvePackageValuePerUnit(CustomerSubscription $subscription, int $laundryServiceId): float
  {
    $subscription->loadMissing('servicePackage.servicePackageItems.laundryService');

    $servicePackage = $subscription->servicePackage;
    if (!$servicePackage) {
      return 0.0;
    }

    $items = $servicePackage->servicePackageItems;
    if ($items->isEmpty()) {
      return 0.0;
    }

    $targetItem = $items->firstWhere('laundry_service_id', $laundryServiceId);
    if (!$targetItem || (float) $targetItem->quantity <= 0) {
      return 0.0;
    }

    $totalNormalValue = 0.0;
    foreach ($items as $item) {
      $servicePrice = (float) ($item->laundryService?->price ?? 0);
      $totalNormalValue += $servicePrice * (float) $item->quantity;
    }

    if ($totalNormalValue <= 0) {
      return 0.0;
    }

    $targetNormalValue = (float) ($targetItem->laundryService?->price ?? 0) * (float) $targetItem->quantity;
    if ($targetNormalValue <= 0) {
      return 0.0;
    }

    $allocatedServiceValue = (float) $subscription->price_paid * ($targetNormalValue / $totalNormalValue);

    return $allocatedServiceValue / (float) $targetItem->quantity;
  }

  private function getCoinLiabilityAccount(): ?Account
  {
    try {
      return $this->resolveSystemAccount('coin_liability');
    } catch (Exception $e) {
      Log::error('Failed to get coin liability account', [
        'error' => $e->getMessage(),
        'type' => 'accounting_error'
      ]);
      return null;
    }
  }

  private function getReferralExpenseAccount(): ?Account
  {
    try {
      return $this->resolveSystemAccount('referral_expense');
    } catch (Exception $e) {
      Log::error('Failed to get referral expense account', [
        'error' => $e->getMessage(),
        'type' => 'accounting_error'
      ]);
      return null;
    }
  }

  private function isCommissionJournalEnabled(): bool
  {
    return config('app.features.referral_commission_journal', false);
  }

  private function getDefaultOutletId(int $userId): int
  {
    $user = \App\Models\User::find($userId);
    $outlet = $user?->outlets()?->first();

    if (!$outlet) {
      Log::warning('No outlet found for user, using system default', [
        'user_id' => $userId,
        'type' => 'accounting_warning'
      ]);
      return 1;
    }

    return $outlet->id;
  }

  public function updateJournalEntry(string $referenceType, int $referenceId, callable $createCallback): void
  {
    try {
      $this->reverseJournalEntry($referenceType, $referenceId);
      $createCallback();

      Log::info('Journal entry updated', [
        'reference_type' => $referenceType,
        'reference_id' => $referenceId,
        'type' => 'accounting_journal'
      ]);
    } catch (Exception $e) {
      Log::error('Failed to update journal entry', [
        'reference_type' => $referenceType,
        'reference_id' => $referenceId,
        'error' => $e->getMessage(),
        'type' => 'accounting_error'
      ]);
      throw new Exception('Failed to update journal entry: ' . $e->getMessage());
    }
  }

  public function reverseJournalEntry(string $referenceType, int $referenceId): void
  {
    try {
      $journalEntries = JournalEntry::query()
        ->byReferenceType($referenceType)
        ->byReferenceId($referenceId)
        ->get(['id']);

      if ($journalEntries->isNotEmpty()) {
        foreach ($journalEntries as $entry) {
          $this->journalEntryService->forceDestroy($entry->id);
        }

        Log::info('Journal entries deleted for update', [
          'reference_type' => $referenceType,
          'reference_id' => $referenceId,
          'deleted_count' => $journalEntries->count(),
          'journal_entry_ids' => $journalEntries->pluck('id')->values()->all(),
          'type' => 'accounting_journal'
        ]);
      } else {
        Log::warning('No journal entry found to reverse', [
          'reference_type' => $referenceType,
          'reference_id' => $referenceId,
          'type' => 'accounting_warning'
        ]);
      }
    } catch (Exception $e) {
      Log::error('Failed to reverse journal entry', [
        'reference_type' => $referenceType,
        'reference_id' => $referenceId,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'type' => 'accounting_error'
      ]);
      throw new Exception('Failed to reverse journal entry: ' . $e->getMessage());
    }
  }

  public function calculateBalance(string $referenceType, int $referenceId, int $accountId): float
  {
    try {
      $journalEntry = JournalEntry::query()
        ->byReferenceType($referenceType)
        ->byReferenceId($referenceId)
        ->with('journalDetails')
        ->latest('id')
        ->first();

      if (!$journalEntry) {
        return 0.0;
      }

      $totalDebit = 0;
      $totalCredit = 0;

      foreach ($journalEntry->journalDetails as $detail) {
        if ($detail->account_id === $accountId) {
          $totalDebit += $detail->debit;
          $totalCredit += $detail->credit;
        }
      }

      return $totalDebit - $totalCredit;
    } catch (Exception $e) {
      Log::error('Failed to calculate balance', [
        'reference_type' => $referenceType,
        'reference_id' => $referenceId,
        'account_id' => $accountId,
        'error' => $e->getMessage(),
        'type' => 'accounting_error'
      ]);
      return 0.0;
    }
  }

  public function recordCustomerSubscriptionSale(CustomerSubscription $subscription): void
  {
    try {
      $subscription->loadMissing(['servicePackage.outlet']);

      $servicePackage = $subscription->servicePackage;
      if (!$servicePackage) {
        throw new Exception('Service package not found for subscription journal');
      }

      $outletId = (int) $servicePackage->outlet_id;
      $ownerId = (int) ($servicePackage->outlet?->owner_id ?? 0);
      $amount = (float) $subscription->price_paid;

      if ($ownerId <= 0 || $outletId <= 0) {
        throw new Exception('Failed to resolve owner/outlet for subscription journal');
      }

      if ($amount <= 0) {
        Log::info('Skipping subscription sale journal because paid amount is zero', [
          'subscription_id' => $subscription->id,
          'type' => 'accounting_journal'
        ]);
        return;
      }

      $cashAccount = $this->resolveOutletCashAccount($ownerId, $outletId);
      $packageLiabilityAccount = $this->resolveSystemAccount('package_liability', $ownerId);

      if (!$cashAccount || !$packageLiabilityAccount) {
        throw new Exception('Required accounts for package sale journal not found');
      }

      $this->journalEntryService->store([
        'outletId' => $outletId,
        'date' => $subscription->purchase_date?->toDateString() ?? now()->toDateString(),
        'description' => "Penjualan paket deposit - Subscription #{$subscription->subscription_code}",
        'referenceType' => CustomerSubscription::class,
        'referenceId' => $subscription->id,
        'isManual' => false,
        'journalDetails' => [
          [
            'accountId' => $cashAccount->id,
            'debit' => $amount,
            'credit' => 0,
            'memo' => "Penerimaan pembayaran paket deposit #{$subscription->subscription_code}",
          ],
          [
            'accountId' => $packageLiabilityAccount->id,
            'debit' => 0,
            'credit' => $amount,
            'memo' => "Pengakuan kewajiban paket deposit #{$subscription->subscription_code}",
          ],
        ],
      ]);

      Log::info('Package sale journal created', [
        'subscription_id' => $subscription->id,
        'amount' => $amount,
        'owner_id' => $ownerId,
        'outlet_id' => $outletId,
        'type' => 'accounting_journal'
      ]);
    } catch (Exception $e) {
      Log::error('Failed to create package sale journal', [
        'subscription_id' => $subscription->id,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'type' => 'accounting_error'
      ]);

      throw new Exception('Failed to create package sale journal: ' . $e->getMessage());
    }
  }

  public function recordPackageUsage(Order $order, int $ownerId, int $outletId, array $usageItems): void
  {
    if (empty($usageItems)) {
      return;
    }

    try {
      $revenueAccount = $this->resolveSystemAccount('laundry_revenue', $ownerId);
      $packageLiabilityAccount = $this->resolveSystemAccount('package_liability', $ownerId);
      $packageDiscountExpenseAccount = $this->resolveSystemAccount('package_discount_expense', $ownerId);

      if (!$revenueAccount || !$packageLiabilityAccount || !$packageDiscountExpenseAccount) {
        throw new Exception('Required accounts for package usage journal not found');
      }

      $totalNormalRevenue = 0.0;
      $totalLiabilityRelease = 0.0;
      $totalPackageDiscount = 0.0;

      foreach ($usageItems as $usage) {
        $subscriptionId = (int) ($usage['subscriptionId'] ?? 0);
        $laundryServiceId = (int) ($usage['laundryServiceId'] ?? 0);
        $quotaUsed = (float) ($usage['quotaUsed'] ?? 0);
        $unitPrice = (float) ($usage['unitPrice'] ?? 0);

        if ($subscriptionId <= 0 || $laundryServiceId <= 0 || $quotaUsed <= 0 || $unitPrice <= 0) {
          continue;
        }

        $subscription = CustomerSubscription::query()
          ->with(['servicePackage.servicePackageItems.laundryService'])
          ->find($subscriptionId);

        if (!$subscription) {
          Log::warning('Skipping package usage journal item because subscription was not found', [
            'order_id' => $order->id,
            'subscription_id' => $subscriptionId,
            'type' => 'accounting_warning'
          ]);
          continue;
        }

        $normalAmount = round($unitPrice * $quotaUsed, 2);
        $packageValuePerUnit = $this->resolvePackageValuePerUnit($subscription, $laundryServiceId);
        $liabilityAmount = round($packageValuePerUnit * $quotaUsed, 2);

        if ($liabilityAmount < 0) {
          $liabilityAmount = 0.0;
        }

        if ($liabilityAmount > $normalAmount) {
          $liabilityAmount = $normalAmount;
        }

        $discountAmount = round($normalAmount - $liabilityAmount, 2);

        $totalNormalRevenue += $normalAmount;
        $totalLiabilityRelease += $liabilityAmount;
        $totalPackageDiscount += $discountAmount;
      }

      $totalNormalRevenue = round($totalNormalRevenue, 2);
      $totalLiabilityRelease = round($totalLiabilityRelease, 2);
      $totalPackageDiscount = round($totalPackageDiscount, 2);

      if ($totalNormalRevenue <= 0) {
        return;
      }

      $debitTotal = round($totalLiabilityRelease + $totalPackageDiscount, 2);
      $delta = round($totalNormalRevenue - $debitTotal, 2);

      if (abs($delta) >= 0.01) {
        $totalPackageDiscount = round($totalPackageDiscount + $delta, 2);
      }

      if ($totalPackageDiscount < 0) {
        $totalLiabilityRelease = round($totalLiabilityRelease + $totalPackageDiscount, 2);
        $totalPackageDiscount = 0.0;
      }

      $journalDetails = [
        [
          'accountId' => $packageLiabilityAccount->id,
          'debit' => $totalLiabilityRelease,
          'credit' => 0,
          'memo' => "Pengurangan kewajiban paket - Order #{$order->order_number}",
        ],
      ];

      if ($totalPackageDiscount > 0) {
        $journalDetails[] = [
          'accountId' => $packageDiscountExpenseAccount->id,
          'debit' => $totalPackageDiscount,
          'credit' => 0,
          'memo' => "Pengakuan diskon paket - Order #{$order->order_number}",
        ];
      }

      $journalDetails[] = [
        'accountId' => $revenueAccount->id,
        'debit' => 0,
        'credit' => $totalNormalRevenue,
        'memo' => "Pengakuan pendapatan layanan dari paket - Order #{$order->order_number}",
      ];

      $this->journalEntryService->store([
        'outletId' => $outletId,
        'date' => $order->order_date?->toDateString() ?? now()->toDateString(),
        'description' => "Pengakuan pemakaian paket deposit - Order #{$order->order_number}",
        'referenceType' => 'order_package_usage',
        'referenceId' => $order->id,
        'isManual' => false,
        'journalDetails' => $journalDetails,
      ]);

      Log::info('Package usage journal created', [
        'order_id' => $order->id,
        'owner_id' => $ownerId,
        'outlet_id' => $outletId,
        'normal_revenue' => $totalNormalRevenue,
        'liability_release' => $totalLiabilityRelease,
        'package_discount' => $totalPackageDiscount,
        'type' => 'accounting_journal'
      ]);
    } catch (Exception $e) {
      Log::error('Failed to create package usage journal', [
        'order_id' => $order->id,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'type' => 'accounting_error'
      ]);

      throw new Exception('Failed to create package usage journal: ' . $e->getMessage());
    }
  }

  public function recordPackageBreakage(CustomerSubscription $subscription): void
  {
    try {
      $subscription->loadMissing([
        'servicePackage.outlet',
        'servicePackage.servicePackageItems.laundryService',
        'customerQuotas',
      ]);

      $servicePackage = $subscription->servicePackage;
      if (!$servicePackage) {
        throw new Exception('Service package not found for package breakage journal');
      }

      $ownerId = (int) ($servicePackage->outlet?->owner_id ?? 0);
      $outletId = (int) $servicePackage->outlet_id;

      if ($ownerId <= 0 || $outletId <= 0) {
        throw new Exception('Failed to resolve owner/outlet for package breakage journal');
      }

      $alreadyRecorded = JournalEntry::query()
        ->byReferenceType('package_breakage')
        ->byReferenceId($subscription->id)
        ->exists();

      if ($alreadyRecorded) {
        return;
      }

      $remainingLiability = 0.0;

      foreach ($subscription->customerQuotas as $quota) {
        $remainingQuota = (float) $quota->remaining_quota;
        if ($remainingQuota <= 0) {
          continue;
        }

        $valuePerUnit = $this->resolvePackageValuePerUnit($subscription, (int) $quota->laundry_service_id);
        if ($valuePerUnit <= 0) {
          continue;
        }

        $remainingLiability += ($valuePerUnit * $remainingQuota);
      }

      $remainingLiability = round($remainingLiability, 2);

      if ($remainingLiability <= 0) {
        return;
      }

      $packageLiabilityAccount = $this->resolveSystemAccount('package_liability', $ownerId);
      $packageBreakageRevenueAccount = $this->resolveSystemAccount('package_breakage_revenue', $ownerId);

      if (!$packageLiabilityAccount || !$packageBreakageRevenueAccount) {
        throw new Exception('Required accounts for package breakage journal not found');
      }

      $this->journalEntryService->store([
        'outletId' => $outletId,
        'date' => now()->toDateString(),
        'description' => "Pengakuan pendapatan hangus paket - Subscription #{$subscription->subscription_code}",
        'referenceType' => 'package_breakage',
        'referenceId' => $subscription->id,
        'isManual' => false,
        'journalDetails' => [
          [
            'accountId' => $packageLiabilityAccount->id,
            'debit' => $remainingLiability,
            'credit' => 0,
            'memo' => "Pengurangan kewajiban paket kadaluarsa #{$subscription->subscription_code}",
          ],
          [
            'accountId' => $packageBreakageRevenueAccount->id,
            'debit' => 0,
            'credit' => $remainingLiability,
            'memo' => "Pendapatan hangus paket #{$subscription->subscription_code}",
          ],
        ],
      ]);

      Log::info('Package breakage journal created', [
        'subscription_id' => $subscription->id,
        'amount' => $remainingLiability,
        'owner_id' => $ownerId,
        'outlet_id' => $outletId,
        'type' => 'accounting_journal'
      ]);
    } catch (Exception $e) {
      Log::error('Failed to create package breakage journal', [
        'subscription_id' => $subscription->id,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'type' => 'accounting_error'
      ]);

      throw new Exception('Failed to create package breakage journal: ' . $e->getMessage());
    }
  }

  /**
   * Create accounting journal entries for order
   */
  public function recordOrderPayment(
    Order $order,
    int $ownerId,
    int $outletId,
    string $paymentStatus,
    ?string $paymentMethod,
    ?int $sourceAccountId,
    float $totalAmount,
    float $paidAmount,
    float $remainingAmount
  ): void {
    try {
      if ($paymentStatus === 'paid_by_package') {
        return;
      }

      $revenueAccount = $this->resolveSystemAccount('laundry_revenue', $ownerId);

      if (!$revenueAccount) {
        throw new Exception('Revenue account not found');
      }

      Log::debug('System account retrieved', [
        'slug' => 'laundry_revenue',
        'owner_id' => $ownerId,
        'account_id' => $revenueAccount->id,
        'account_code' => $revenueAccount->code,
        'account_name' => $revenueAccount->name,
        'type' => 'system_account_access'
      ]);

      if ($paymentStatus === 'paid' && $paidAmount > 0) {
        $paymentAccount = null;

        if ($sourceAccountId) {
          $paymentAccount = Account::find($sourceAccountId);
        } elseif ($paymentMethod === 'cash') {
          $paymentAccount = $this->resolvePaymentAccount($ownerId, $outletId, 'cash', null);
        } elseif ($paymentMethod === 'bank_transfer') {
          $paymentAccount = $this->resolvePaymentAccount($ownerId, $outletId, 'transfer', $sourceAccountId);
        }

        if (!$paymentAccount) {
          throw new Exception("Payment account not found for method: {$paymentMethod}");
        }

        Log::debug('Resolved payment account', [
          'payment_method' => $paymentMethod,
          'outlet_id' => $outletId,
          'account_id' => $paymentAccount->id,
          'account_code' => $paymentAccount->code,
          'account_name' => $paymentAccount->name
        ]);

        if ($paidAmount >= $totalAmount) {
          Log::debug('Creating journal for full payment', [
            'order_id' => $order->id,
            'payment_account' => $paymentAccount->code,
            'revenue_account' => $revenueAccount->code,
            'amount' => $paidAmount
          ]);

          $journalData = [
            'outletId' => $outletId,
            'transactionDate' => now()->toDateString(),
            'description' => "Penjualan Laundry - Order #{$order->order_number}",
            'referenceType' => 'order',
            'referenceId' => $order->id,
            'journalDetails' => [
              [
                'accountId' => $paymentAccount->id,
                'debit' => $paidAmount,
                'credit' => 0,
                'description' => "Pembayaran {$paymentMethod} - Order #{$order->order_number}"
              ],
              [
                'accountId' => $revenueAccount->id,
                'debit' => 0,
                'credit' => $paidAmount,
                'description' => "Pendapatan Laundry - Order #{$order->order_number}"
              ]
            ]
          ];

          Log::debug('Journal data prepared', [
            'journal_data' => $journalData,
            'details_count' => count($journalData['journalDetails'])
          ]);

          $this->journalEntryService->store($journalData);

          Log::info('Journal entry created for full payment', [
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'payment_method' => $paymentMethod,
            'amount' => $paidAmount,
            'payment_account' => $paymentAccount->code,
            'revenue_account' => $revenueAccount->code
          ]);
        } else {
          $accountsReceivable = $this->resolveSystemAccount('accounts_receivable', $ownerId);

          if (!$accountsReceivable) {
            throw new Exception('Accounts receivable account not found');
          }

          Log::debug('Creating journal for partial payment', [
            'order_id' => $order->id,
            'paid_amount' => $paidAmount,
            'remaining_amount' => $remainingAmount,
            'payment_account' => $paymentAccount->code,
            'ar_account' => $accountsReceivable->code,
            'revenue_account' => $revenueAccount->code
          ]);

          $journalData = [
            'outletId' => $outletId,
            'transactionDate' => now()->toDateString(),
            'description' => "Penjualan Laundry (Pembayaran Sebagian) - Order #{$order->order_number}",
            'referenceType' => 'order',
            'referenceId' => $order->id,
            'journalDetails' => [
              [
                'accountId' => $paymentAccount->id,
                'debit' => $paidAmount,
                'credit' => 0,
                'description' => "Pembayaran {$paymentMethod} - Order #{$order->order_number}"
              ],
              [
                'accountId' => $accountsReceivable->id,
                'debit' => $remainingAmount,
                'credit' => 0,
                'description' => "Piutang - Order #{$order->order_number}"
              ],
              [
                'accountId' => $revenueAccount->id,
                'debit' => 0,
                'credit' => $totalAmount,
                'description' => "Pendapatan Laundry - Order #{$order->order_number}"
              ]
            ]
          ];

          Log::debug('Journal data prepared for partial payment', [
            'journal_data' => $journalData,
            'details_count' => count($journalData['journalDetails'])
          ]);

          $this->journalEntryService->store($journalData);

          Log::info('Journal entry created for partial payment', [
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'payment_method' => $paymentMethod,
            'paid_amount' => $paidAmount,
            'remaining_amount' => $remainingAmount,
            'total_amount' => $totalAmount
          ]);
        }
      } elseif ($paymentStatus === 'unpaid') {
        $accountsReceivable = $this->resolveSystemAccount('accounts_receivable', $ownerId);

        if (!$accountsReceivable) {
          throw new Exception('Accounts receivable account not found');
        }

        Log::debug('Creating journal for unpaid order', [
          'order_id' => $order->id,
          'ar_account' => $accountsReceivable->code,
          'revenue_account' => $revenueAccount->code,
          'amount' => $totalAmount
        ]);

        $journalData = [
          'outletId' => $outletId,
          'transactionDate' => now()->toDateString(),
          'description' => "Penjualan Laundry (Belum Dibayar) - Order #{$order->order_number}",
          'referenceType' => 'order',
          'referenceId' => $order->id,
          'journalDetails' => [
            [
              'accountId' => $accountsReceivable->id,
              'debit' => $totalAmount,
              'credit' => 0,
              'description' => "Piutang - Order #{$order->order_number}"
            ],
            [
              'accountId' => $revenueAccount->id,
              'debit' => 0,
              'credit' => $totalAmount,
              'description' => "Pendapatan Laundry - Order #{$order->order_number}"
            ]
          ]
        ];

        Log::debug('Journal data prepared for unpaid order', [
          'journal_data' => $journalData,
          'details_count' => count($journalData['journalDetails'])
        ]);

        $this->journalEntryService->store($journalData);

        Log::info('Journal entry created for unpaid order', [
          'order_id' => $order->id,
          'order_number' => $order->order_number,
          'total_amount' => $totalAmount
        ]);
      }
    } catch (Exception $e) {
      Log::error('Failed to create journal for order', [
        'order_id' => $order->id,
        'payment_status' => $paymentStatus,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);

      throw new Exception("Failed to create accounting journal: {$e->getMessage()}");
    }
  }

  /**
   * Resolve payment account based on payment method
   * 
   * @param int $ownerId
   * @param int $outletId
   * @param string $paymentMethod
   * @param int|null $sourceAccountId
   * @return Account
   * @throws Exception
   */
  protected function resolvePaymentAccount(
    int $ownerId,
    int $outletId,
    string $paymentMethod,
    ?int $sourceAccountId
  ): Account {
    if ($paymentMethod === 'cash') {
      $cashAccount = Account::byOwnerId($ownerId)
        ->byOutletId($outletId)
        ->byAccountRole('cash')
        ->isTransactional(true)
        ->active()
        ->first();

      if (!$cashAccount) {
        throw new Exception("Cash account not found for outlet_id: {$outletId}");
      }

      Log::debug('Resolved cash account', [
        'outlet_id' => $outletId,
        'account_id' => $cashAccount->id,
        'account_code' => $cashAccount->code,
        'account_name' => $cashAccount->name,
      ]);

      return $cashAccount;
    }

    if ($paymentMethod === 'transfer') {
      if (!$sourceAccountId) {
        Log::error('Source account ID missing for transfer', [
          'owner_id' => $ownerId,
          'outlet_id' => $outletId,
          'payment_method' => $paymentMethod,
        ]);
        throw new Exception("Akun tujuan transfer harus dipilih");
      }
      $transferAccount = Account::byId($sourceAccountId)
        ->byOwnerId($ownerId)
        ->isTransactional(true)
        ->active()
        ->first();

      if (!$transferAccount) {
        throw new Exception("Transfer account not found or not accessible: {$sourceAccountId}");
      }

      if (!in_array($transferAccount->account_role, ['bank', 'ewallet'])) {
        throw new Exception("Source account must be bank or e-wallet account");
      }

      Log::debug('Resolved transfer account', [
        'source_account_id' => $sourceAccountId,
        'account_code' => $transferAccount->code,
        'account_name' => $transferAccount->name,
        'account_role' => $transferAccount->account_role,
      ]);

      return $transferAccount;
    }

    throw new Exception("Invalid payment method: {$paymentMethod}");
  }

  /**
   * Get receivable account for outlet
   * 
   * @param int $ownerId
   * @param int $outletId
   * @return Account
   * @throws Exception
   */
  protected function getReceivableAccount(int $ownerId, int $outletId): Account
  {
    $receivableAccount = Account::byOwnerId($ownerId)
      ->byOutletId($outletId)
      ->byAccountRole('receivable')
      ->isTransactional(true)
      ->active()
      ->first();

    if (!$receivableAccount) {
      $receivableAccount = $this->resolveSystemAccount('master_receivable', $ownerId);
    }

    if (!$receivableAccount) {
      throw new Exception("Receivable account not found for owner_id: {$ownerId}");
    }

    Log::debug('Resolved receivable account', [
      'owner_id' => $ownerId,
      'outlet_id' => $outletId,
      'account_id' => $receivableAccount->id,
      'account_code' => $receivableAccount->code,
      'account_name' => $receivableAccount->name,
    ]);

    return $receivableAccount;
  }
}
