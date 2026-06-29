<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Expense;
use App\Models\Deposit;
use App\Models\PettyCash;
use App\Models\WalletWithdrawal;
use App\Models\User;
use App\Models\Outlet;
use App\Models\Customer;
use App\Models\CustomerSubscription;
use App\Models\MembershipContract;
use App\Models\Employee;
use App\Models\Payroll;
use App\Models\WorkLog;
use App\Models\Loan;
use App\Models\FineLog;
use App\Models\WalletTransaction;
use App\Models\JournalDetail;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class OwnerDashboardService extends BaseService
{
    public function __construct(
        protected DashboardService $dashboardService,
        protected ProfitLossService $profitLossService,
        protected WalletBalanceService $walletBalanceService
    ) {}

    public function buildPayload(int $ownerId, string $period, ?int $outletId): array
    {
        $period = $this->validatePeriod($period);
        $outletIds = $this->resolveOutletIds($ownerId, $outletId);
        
        $timezone = 'Asia/Jakarta';
        if ($outletId) {
            $outlet = Outlet::find($outletId);
            $timezone = $outlet->timezone ?? 'Asia/Jakarta';
        }
        
        [$startDate, $endDate, $today] = $this->resolveDateRange($period, $timezone);

        $outletLabel = 'Semua Outlet';
        if ($outletId) {
            $outletLabel = Outlet::find($outletId)->name ?? 'Outlet Tidak Diketahui';
        }

        return [
            'meta' => $this->buildMeta($period, $outletId, $timezone),
            'filters' => [
                'outletId' => $outletId,
                'outletLabel' => $outletLabel,
            ],
            'kpis' => $this->buildKpis($ownerId, $outletIds, $period, $startDate, $endDate, $today),
            'money' => $this->buildMoneySummary($ownerId, $outletIds),
            'actionCenter' => $this->buildActionCenter($ownerId, $outletIds),
            'operations' => $this->buildOperations($ownerId, $outletIds, $startDate, $endDate, $today),
            'finance' => $this->buildFinance($ownerId, $outletIds, $startDate, $endDate),
            'outlets' => $this->buildOutletSummary($ownerId, $outletIds, $startDate, $endDate),
            'customers' => $this->buildCustomerSummary($ownerId, $outletIds, $startDate, $endDate),
            'membership' => $this->buildMembershipSummary($ownerId, $outletIds),
            'hrPayroll' => $this->buildHrPayrollSummary($ownerId, $outletIds),
            'activityFeed' => $this->buildActivityFeed($ownerId, $outletIds),
            'setupChecklist' => $this->buildSetupChecklist($ownerId),
        ];
    }

    private function buildMeta(string $period, ?int $outletId, string $timezone): array
    {
        [$startDate, $endDate] = $this->resolveDateRange($period, $timezone);
        return [
            'period' => $period,
            'startDate' => $startDate->toDateString(),
            'endDate' => $endDate->toDateString(),
            'timezone' => $timezone,
            'generatedAt' => Carbon::now($timezone)->toISOString(),
        ];
    }

    private function resolveOutletIds(int $ownerId, ?int $outletId): array
    {
        if ($outletId) {
            $outlet = Outlet::byId($outletId)->byOwnerId($ownerId)->first();
            return $outlet ? [$outletId] : [];
        }
        
        return Outlet::byOwnerId($ownerId)->pluck('id')->toArray();
    }

    private function validatePeriod(string $period): string
    {
        return in_array($period, ['today', '7d', '30d', '90d']) ? $period : 'today';
    }

    private function resolveDateRange(string $period, string $timezone): array
    {
        $tz = new \DateTimeZone($timezone);
        $today = Carbon::now($tz)->startOfDay();
        $days = match ($period) {
            '7d'  => 7,
            '30d' => 30,
            '90d' => 90,
            default => 0,
        };

        $startDate = $days > 0 ? $today->copy()->subDays($days - 1) : $today->copy();
        $endDate = $today->copy()->endOfDay();

        return [$startDate, $endDate, $today];
    }

    private function getActiveOrderStatuses(): array
    {
        return [
            Order::STATUS_REQUESTED,
            Order::STATUS_PENDING_DROPOFF,
            Order::STATUS_ACCEPTED,
            Order::STATUS_PICKING_UP,
            Order::STATUS_PICKED_UP,
            Order::STATUS_RECEIVED,
            Order::STATUS_WEIGHING,
            Order::STATUS_READY_TO_PROCESS,
            Order::STATUS_IN_PROGRESS,
            Order::STATUS_READY,
            Order::STATUS_DELIVERING,
        ];
    }

    public function buildKpis(int $ownerId, array $outletIds, string $period, Carbon $startDate, Carbon $endDate, Carbon $today): array
    {
        $cacheKey = "users:{$ownerId}:dashboard:kpis:{$period}:" . implode(',', $outletIds);
        
        return Cache::remember($cacheKey, 60, function () use ($ownerId, $outletIds, $period, $startDate, $endDate, $today) {
            if (empty($outletIds)) return $this->emptyKpis();

            $todayRevenue = Order::whereIn('outlet_id', $outletIds)
                ->whereDate('order_date', $today->toDateString())
                ->whereIn('payment_status', [Order::PAYMENT_STATUS_PAID, Order::PAYMENT_STATUS_COD, Order::PAYMENT_STATUS_PAID_BY_PACKAGE])
                ->sum('paid_amount');

            $todayOrdersCount = Order::whereIn('outlet_id', $outletIds)
                ->whereDate('order_date', $today->toDateString())
                ->count();

            $activeOrdersCount = Order::whereIn('outlet_id', $outletIds)
                ->whereIn('status', $this->getActiveOrderStatuses())
                ->count();

            $unpaidOrders = Order::whereIn('outlet_id', $outletIds)
                ->whereIn('payment_status', [Order::PAYMENT_STATUS_UNPAID, Order::PAYMENT_STATUS_PARTIAL, Order::PAYMENT_STATUS_NOT_YET_PRICED]);
                
            $unpaidOrdersCount = $unpaidOrders->count();
            $outstandingAmount = $unpaidOrders->sum('remaining_amount');

            $periodRevenue = Order::whereIn('outlet_id', $outletIds)
                ->whereBetween('order_date', [$startDate->toDateString(), $endDate->toDateString()])
                ->whereIn('status', [Order::STATUS_COMPLETED, Order::STATUS_DELIVERED])
                ->sum('total_amount');

            $periodExpense = Expense::whereIn('outlet_id', $outletIds)
                ->where('status', 'approved')
                ->whereBetween('date', [$startDate->toDateString(), $endDate->toDateString()])
                ->sum('amount');

            $periodNetProfit = null;
            if (count($outletIds) === 1) {
                try {
                    $profitLoss = $this->profitLossService->getReport(
                        $ownerId,
                        $outletIds[0],
                        $startDate->toDateString(),
                        $endDate->toDateString()
                    );
                    $periodNetProfit = $profitLoss['netProfit'] ?? null;
                } catch (\Exception $e) {
                }
            }

            $periodOrdersCount = Order::whereIn('outlet_id', $outletIds)
                ->whereBetween('order_date', [$startDate->toDateString(), $endDate->toDateString()])
                ->count();

            $newCustomersCount = Customer::whereIn('outlet_id', $outletIds)
                ->whereBetween('created_at', [$startDate->startOfDay(), $endDate->endOfDay()])
                ->count();

            $pendingExpense = Expense::whereIn('outlet_id', $outletIds)->where('status', 'pending')->count();
            $pendingDeposit = Deposit::whereIn('outlet_id', $outletIds)->where('status', 'pending')->count();
            $pendingPettyCash = PettyCash::whereIn('outlet_id', $outletIds)->where('status', 'pending')->count();
            $pendingWithdrawal = WalletWithdrawal::where('user_id', $ownerId)->whereIn('status', [WalletWithdrawal::STATUS_PENDING, WalletWithdrawal::STATUS_PROCESSING])->count();
            
            $pendingApprovalsCount = $pendingExpense + $pendingDeposit + $pendingPettyCash + $pendingWithdrawal;

            return [
                'todayRevenue' => (float) $todayRevenue,
                'todayOrdersCount' => $todayOrdersCount,
                'activeOrdersCount' => $activeOrdersCount,
                'unpaidOrdersCount' => $unpaidOrdersCount,
                'outstandingAmount' => (float) $outstandingAmount,
                'periodRevenue' => (float) $periodRevenue,
                'periodExpense' => (float) $periodExpense,
                'periodNetProfit' => $periodNetProfit !== null ? (float) $periodNetProfit : null,
                'periodOrdersCount' => $periodOrdersCount,
                'newCustomersCount' => $newCustomersCount,
                'pendingApprovalsCount' => $pendingApprovalsCount,
            ];
        });
    }

    private function emptyKpis(): array
    {
        return [
            'todayRevenue' => 0, 'todayOrdersCount' => 0, 'activeOrdersCount' => 0,
            'unpaidOrdersCount' => 0, 'outstandingAmount' => 0, 'periodRevenue' => 0,
            'periodExpense' => 0, 'periodNetProfit' => null, 'periodOrdersCount' => 0,
            'newCustomersCount' => 0, 'pendingApprovalsCount' => 0,
        ];
    }

    public function buildMoneySummary(int $ownerId, array $outletIds): array
    {
        $cacheKey = "users:{$ownerId}:dashboard:money_summary";
        
        return Cache::remember($cacheKey, 60, function () use ($ownerId) {
            $walletStats = $this->walletBalanceService->getStats($ownerId);
            $user = User::find($ownerId);
            $assetSummary = $this->dashboardService->assetSummary($ownerId);

            return [
                'walletBalance' => (float) $walletStats['walletBalance'],
                'availableWalletBalance' => (float) $walletStats['availableBalance'],
                'pendingWithdrawalAmount' => (float) $walletStats['pendingWdrTotal'],
                'coinBalance' => (float) ($user->coin_balance ?? 0),
                'assetSummary' => $assetSummary,
            ];
        });
    }

    public function buildActionCenter(int $ownerId, array $outletIds): array
    {
        $cacheKey = "users:{$ownerId}:dashboard:action_center:" . implode(',', $outletIds);
        
        return Cache::remember($cacheKey, 60, function () use ($ownerId, $outletIds) {
            if (empty($outletIds)) return [];
            $items = [];

            $requestedOrdersCount = Order::whereIn('outlet_id', $outletIds)
                ->whereIn('status', [Order::STATUS_REQUESTED, Order::STATUS_PENDING_DROPOFF])->count();
            if ($requestedOrdersCount > 0) {
                $items[] = [
                    'key' => 'order_new_requests', 'title' => 'Pesanan Baru Menunggu',
                    'severity' => 'critical', 'count' => $requestedOrdersCount,
                    'message' => 'Terdapat pesanan baru yang harus segera diterima atau ditindaklanjuti.',
                    'actionLabel' => 'Lihat Pesanan', 'actionHref' => '/dashboard/orders?status=requested',
                ];
            }

            $staleThreshold = now()->subHours(4);
            $delayedOrdersCount = Order::whereIn('outlet_id', $outletIds)
                ->whereIn('status', $this->getActiveOrderStatuses())
                ->where(function($q) use ($staleThreshold) {
                    $q->where('estimated_completion', '<', now())
                      ->orWhere('updated_at', '<', $staleThreshold);
                })->count();
            if ($delayedOrdersCount > 0) {
                $items[] = [
                    'key' => 'order_delayed', 'title' => 'Pesanan Terlambat / Mandek',
                    'severity' => 'critical', 'count' => $delayedOrdersCount,
                    'message' => 'Ada pesanan yang melewati estimasi selesai atau tidak berubah status dalam 4 jam terakhir.',
                    'actionLabel' => 'Cek Pesanan', 'actionHref' => '/dashboard/orders?status=active&delayed=1',
                ];
            }

            $unpaidAmount = Order::whereIn('outlet_id', $outletIds)
                ->whereIn('payment_status', [Order::PAYMENT_STATUS_UNPAID, Order::PAYMENT_STATUS_PARTIAL])
                ->sum('remaining_amount');
            if ($unpaidAmount > 0) {
                $items[] = [
                    'key' => 'order_unpaid_large', 'title' => 'Tagihan Belum Lunas',
                    'severity' => 'warning', 'amount' => (float) $unpaidAmount,
                    'message' => 'Terdapat piutang pesanan yang belum dibayar lunas oleh pelanggan.',
                    'actionLabel' => 'Lihat Tagihan', 'actionHref' => '/dashboard/orders?payment_status=unpaid',
                ];
            }

            $pendingExpense = Expense::whereIn('outlet_id', $outletIds)->where('status', 'pending');
            $expenseCount = $pendingExpense->count();
            if ($expenseCount > 0) {
                $items[] = [
                    'key' => 'expense_pending', 'title' => 'Persetujuan Pengeluaran',
                    'severity' => 'warning', 'count' => $expenseCount, 'amount' => (float) $pendingExpense->sum('amount'),
                    'message' => 'Pengajuan pengeluaran menunggu persetujuan Anda.',
                    'actionLabel' => 'Review', 'actionHref' => '/dashboard/expenses?status=pending',
                ];
            }

            $pendingDeposit = Deposit::whereIn('outlet_id', $outletIds)->where('status', 'pending');
            $depositCount = $pendingDeposit->count();
            if ($depositCount > 0) {
                $items[] = [
                    'key' => 'deposit_pending', 'title' => 'Persetujuan Deposit Kas',
                    'severity' => 'warning', 'count' => $depositCount, 'amount' => (float) $pendingDeposit->sum('amount'),
                    'message' => 'Setoran kas / deposit menunggu konfirmasi Anda.',
                    'actionLabel' => 'Review', 'actionHref' => '/dashboard/deposits?status=pending',
                ];
            }

            $pendingWithdrawal = WalletWithdrawal::where('user_id', $ownerId)->whereIn('status', [WalletWithdrawal::STATUS_PENDING, WalletWithdrawal::STATUS_PROCESSING]);
            $withdrawalCount = $pendingWithdrawal->count();
            if ($withdrawalCount > 0) {
                $items[] = [
                    'key' => 'withdrawal_pending', 'title' => 'Penarikan Saldo Tertahan',
                    'severity' => 'info', 'count' => $withdrawalCount, 'amount' => (float) $pendingWithdrawal->sum('requested_amount'),
                    'message' => 'Permintaan penarikan saldo pendapatan Anda sedang diproses.',
                    'actionLabel' => 'Cek Status', 'actionHref' => '/dashboard/wallet/withdrawals',
                ];
            }

            $severityOrder = ['critical' => 0, 'warning' => 1, 'info' => 2];
            usort($items, fn($a, $b) => $severityOrder[$a['severity']] <=> $severityOrder[$b['severity']]);

            return $items;
        });
    }

    public function buildOperations(int $ownerId, array $outletIds, Carbon $startDate, Carbon $endDate, Carbon $today): array
    {
        $cacheKey = "users:{$ownerId}:dashboard:operations:" . implode(',', $outletIds);
        
        return Cache::remember($cacheKey, 60, function () use ($outletIds) {
            if (empty($outletIds)) return ['orderFunnel' => [], 'recentActiveOrders' => [], 'delayedOrders' => []];

            $activeOrders = Order::with('outlet', 'customer')
                ->whereIn('outlet_id', $outletIds)
                ->whereIn('status', $this->getActiveOrderStatuses())
                ->get();

            $funnelCounts = [
                'waiting' => 0, 'pickup' => 0, 'received' => 0, 'weighing' => 0,
                'processing' => 0, 'ready' => 0, 'delivery' => 0
            ];

            foreach ($activeOrders as $order) {
                switch ($order->status) {
                    case Order::STATUS_REQUESTED:
                    case Order::STATUS_PENDING_DROPOFF:
                        $funnelCounts['waiting']++; break;
                    case Order::STATUS_ACCEPTED:
                    case Order::STATUS_PICKING_UP:
                    case Order::STATUS_PICKED_UP:
                        $funnelCounts['pickup']++; break;
                    case Order::STATUS_RECEIVED:
                        $funnelCounts['received']++; break;
                    case Order::STATUS_WEIGHING:
                    case Order::STATUS_READY_TO_PROCESS:
                        $funnelCounts['weighing']++; break;
                    case Order::STATUS_IN_PROGRESS:
                        $funnelCounts['processing']++; break;
                    case Order::STATUS_READY:
                        $funnelCounts['ready']++; break;
                    case Order::STATUS_DELIVERING:
                        $funnelCounts['delivery']++; break;
                }
            }

            $orderFunnel = [
                ['stage' => 'waiting', 'label' => 'Menunggu', 'count' => $funnelCounts['waiting']],
                ['stage' => 'pickup', 'label' => 'Pickup', 'count' => $funnelCounts['pickup']],
                ['stage' => 'received', 'label' => 'Diterima', 'count' => $funnelCounts['received']],
                ['stage' => 'weighing', 'label' => 'Ditimbang', 'count' => $funnelCounts['weighing']],
                ['stage' => 'processing', 'label' => 'Diproses', 'count' => $funnelCounts['processing']],
                ['stage' => 'ready', 'label' => 'Siap', 'count' => $funnelCounts['ready']],
                ['stage' => 'delivery', 'label' => 'Delivery', 'count' => $funnelCounts['delivery']],
            ];

            $recentActiveOrders = $activeOrders->sortByDesc('created_at')->take(10)->map(function ($order) {
                return [
                    'id' => $order->id,
                    'orderNumber' => $order->order_number,
                    'outletName' => $order->outlet->name ?? '-',
                    'customerName' => $order->customer->name ?? '-',
                    'status' => $order->status,
                    'statusLabel' => $order->getStatusLabel(),
                    'paymentStatus' => $order->payment_status,
                    'paymentStatusLabel' => $order->getPaymentStatusLabel(),
                    'totalAmount' => (float) $order->total_amount,
                    'remainingAmount' => (float) $order->remaining_amount,
                    'orderDate' => $order->order_date,
                    'estimatedCompletion' => $order->estimated_completion,
                    'createdAt' => $order->created_at->toISOString(),
                ];
            })->values()->toArray();

            $staleThreshold = now()->subHours(4);
            $delayedOrders = $activeOrders->filter(function ($order) use ($staleThreshold) {
                return ($order->estimated_completion && $order->estimated_completion < now()) ||
                       ($order->updated_at < $staleThreshold);
            })->sortByDesc('updated_at')->take(5)->map(function ($order) {
                return [
                    'id' => $order->id,
                    'orderNumber' => $order->order_number,
                    'outletName' => $order->outlet->name ?? '-',
                    'status' => $order->status,
                    'ageMinutes' => $order->updated_at->diffInMinutes(now()),
                    'estimatedCompletion' => $order->estimated_completion,
                ];
            })->values()->toArray();

            return [
                'orderFunnel' => $orderFunnel,
                'recentActiveOrders' => $recentActiveOrders,
                'delayedOrders' => $delayedOrders,
            ];
        });
    }

    public function buildFinance(int $ownerId, array $outletIds, Carbon $startDate, Carbon $endDate): array
    {
        $period = $startDate->diffInDays($endDate) . "d";
        $cacheKey = "users:{$ownerId}:dashboard:finance_trend:{$period}:" . implode(',', $outletIds);
        
        return Cache::remember($cacheKey, 300, function () use ($ownerId, $outletIds, $startDate, $endDate) {
            if (empty($outletIds)) return ['revenueExpenseTrend' => [], 'paymentHealth' => [], 'withdrawalSummary' => []];

            $dates = [];
            $current = $startDate->copy();
            while ($current <= $endDate) {
                $dates[$current->toDateString()] = ['date' => $current->toDateString(), 'revenue' => 0, 'expense' => 0, 'net' => 0];
                $current->addDay();
            }

            $revenues = Order::whereIn('outlet_id', $outletIds)
                ->whereIn('status', [Order::STATUS_COMPLETED, Order::STATUS_DELIVERED])
                ->whereBetween('order_date', [$startDate->toDateString(), $endDate->toDateString()])
                ->selectRaw('DATE(order_date) as date, SUM(total_amount) as total')
                ->groupBy('date')->get();

            foreach ($revenues as $rev) {
                if (isset($dates[$rev->date])) {
                    $dates[$rev->date]['revenue'] = (float) $rev->total;
                    $dates[$rev->date]['net'] += (float) $rev->total;
                }
            }

            $expenses = Expense::whereIn('outlet_id', $outletIds)
                ->where('status', 'approved')
                ->whereBetween('date', [$startDate->toDateString(), $endDate->toDateString()])
                ->selectRaw('DATE(date) as date, SUM(amount) as total')
                ->groupBy('date')->get();

            foreach ($expenses as $exp) {
                if (isset($dates[$exp->date])) {
                    $dates[$exp->date]['expense'] = (float) $exp->total;
                    $dates[$exp->date]['net'] -= (float) $exp->total;
                }
            }

            $paymentHealthRaw = Order::whereIn('outlet_id', $outletIds)
                ->whereBetween('order_date', [$startDate->toDateString(), $endDate->toDateString()])
                ->selectRaw('payment_status, COUNT(*) as count, SUM(total_amount) as total_amount, SUM(paid_amount) as paid_amount, SUM(remaining_amount) as remaining_amount')
                ->groupBy('payment_status')->get();

            $paymentLabels = [
                Order::PAYMENT_STATUS_NOT_YET_PRICED => 'Belum Diberi Harga',
                Order::PAYMENT_STATUS_UNPAID => 'Belum Dibayar',
                Order::PAYMENT_STATUS_PARTIAL => 'Dibayar Sebagian',
                Order::PAYMENT_STATUS_PAID => 'Lunas',
                Order::PAYMENT_STATUS_REFUNDED => 'Refund',
                Order::PAYMENT_STATUS_PAID_BY_PACKAGE => 'Paket',
                Order::PAYMENT_STATUS_COD => 'COD',
            ];

            $paymentHealth = $paymentHealthRaw->map(function ($ph) use ($paymentLabels) {
                return [
                    'paymentStatus' => $ph->payment_status,
                    'label' => $paymentLabels[$ph->payment_status] ?? $ph->payment_status,
                    'ordersCount' => $ph->count,
                    'totalAmount' => (float) $ph->total_amount,
                    'paidAmount' => (float) $ph->paid_amount,
                    'remainingAmount' => (float) $ph->remaining_amount,
                ];
            })->toArray();

            $withdrawals = WalletWithdrawal::where('user_id', $ownerId)->get();
            $withdrawalSummary = [
                'pendingCount' => $withdrawals->where('status', WalletWithdrawal::STATUS_PENDING)->count(),
                'processingCount' => $withdrawals->where('status', WalletWithdrawal::STATUS_PROCESSING)->count(),
                'paidCount' => $withdrawals->where('status', WalletWithdrawal::STATUS_PAID)->where('updated_at', '>=', $startDate)->count(),
                'pendingAmount' => (float) $withdrawals->whereIn('status', [WalletWithdrawal::STATUS_PENDING, WalletWithdrawal::STATUS_PROCESSING])->sum('requested_amount'),
                'paidAmount' => (float) $withdrawals->where('status', WalletWithdrawal::STATUS_PAID)->where('updated_at', '>=', $startDate)->sum('requested_amount'),
            ];

            return [
                'revenueExpenseTrend' => array_values($dates),
                'paymentHealth' => $paymentHealth,
                'withdrawalSummary' => $withdrawalSummary,
            ];
        });
    }

    public function buildOutletSummary(int $ownerId, array $outletIds, Carbon $startDate, Carbon $endDate): array
    {
        $period = $startDate->diffInDays($endDate) . "d";
        $cacheKey = "users:{$ownerId}:dashboard:outlet_ranking:{$period}:" . implode(',', $outletIds);
        
        return Cache::remember($cacheKey, 180, function () use ($ownerId, $outletIds, $startDate, $endDate) {
            if (empty($outletIds)) return ['totalOutlets' => 0, 'activeOutlets' => 0, 'riskyOutletsCount' => 0, 'topOutlets' => [], 'riskyOutlets' => []];

            $outlets = Outlet::with(['operationalDays', 'laundryServices', 'employees', 'outletFeatures'])
                ->whereIn('id', $outletIds)->get();
            
            $topOutlets = [];
            $riskyOutlets = [];

            foreach ($outlets as $outlet) {
                $revenue = Order::where('outlet_id', $outlet->id)
                    ->whereBetween('order_date', [$startDate->toDateString(), $endDate->toDateString()])
                    ->whereIn('status', [Order::STATUS_COMPLETED, Order::STATUS_DELIVERED])
                    ->sum('total_amount');

                $ordersCount = Order::where('outlet_id', $outlet->id)
                    ->whereBetween('order_date', [$startDate->toDateString(), $endDate->toDateString()])
                    ->count();

                $activeOrdersCount = Order::where('outlet_id', $outlet->id)
                    ->whereIn('status', $this->getActiveOrderStatuses())
                    ->count();

                $outstandingAmount = Order::where('outlet_id', $outlet->id)
                    ->whereIn('payment_status', [Order::PAYMENT_STATUS_UNPAID, Order::PAYMENT_STATUS_PARTIAL])
                    ->sum('remaining_amount');

                $reasons = [];
                if ($outlet->laundryServices->isEmpty()) $reasons[] = 'Tidak ada layanan aktif';
                if ($outlet->operationalDays->isEmpty()) $reasons[] = 'Tidak ada jam kerja';
                if ($outlet->employees->where('status', 'active')->isEmpty()) $reasons[] = 'Tidak ada karyawan aktif';

                $readinessStatus = empty($reasons) ? 'ok' : 'critical';

                if (!empty($reasons)) {
                    $riskyOutlets[] = [
                        'id' => $outlet->id,
                        'name' => $outlet->name,
                        'severity' => 'critical',
                        'reasons' => $reasons,
                        'actionHref' => "/dashboard/outlets/{$outlet->id}",
                    ];
                }

                $topOutlets[] = [
                    'id' => $outlet->id,
                    'name' => $outlet->name,
                    'revenue' => (float) $revenue,
                    'ordersCount' => $ordersCount,
                    'activeOrdersCount' => $activeOrdersCount,
                    'outstandingAmount' => (float) $outstandingAmount,
                    'readinessStatus' => $readinessStatus,
                ];
            }

            usort($topOutlets, fn($a, $b) => $b['revenue'] <=> $a['revenue']);

            return [
                'totalOutlets' => $outlets->count(),
                'activeOutlets' => count(array_filter($topOutlets, fn($o) => $o['readinessStatus'] === 'ok')),
                'riskyOutletsCount' => count($riskyOutlets),
                'topOutlets' => $topOutlets,
                'riskyOutlets' => $riskyOutlets,
            ];
        });
    }

    public function buildCustomerSummary(int $ownerId, array $outletIds, Carbon $startDate, Carbon $endDate): array
    {
        $period = $startDate->diffInDays($endDate) . "d";
        $cacheKey = "users:{$ownerId}:dashboard:customer_summary:{$period}:" . implode(',', $outletIds);
        
        return Cache::remember($cacheKey, 300, function () use ($outletIds, $startDate, $endDate) {
            if (empty($outletIds)) return ['totalCustomers' => 0, 'newCustomersCount' => 0, 'repeatCustomersCount' => 0, 'inactiveCustomersCount' => 0, 'topCustomers' => []];

            $totalCustomers = Customer::whereIn('outlet_id', $outletIds)->count();
            
            $newCustomersCount = Customer::whereIn('outlet_id', $outletIds)
                ->whereBetween('created_at', [$startDate->startOfDay(), $endDate->endOfDay()])
                ->count();

            $ninetyDaysAgo = now()->subDays(90);
            $activeCustomerIds = Order::whereIn('outlet_id', $outletIds)
                ->where('created_at', '>=', $ninetyDaysAgo)
                ->select('customer_id')->distinct()->pluck('customer_id')->toArray();
            
            $inactiveCustomersCount = Customer::whereIn('outlet_id', $outletIds)
                ->whereNotIn('id', $activeCustomerIds)
                ->count();

            $repeatCustomersCount = Order::whereIn('outlet_id', $outletIds)
                ->whereBetween('order_date', [$startDate->toDateString(), $endDate->toDateString()])
                ->whereIn('status', [Order::STATUS_COMPLETED, Order::STATUS_DELIVERED])
                ->whereNotNull('customer_id')
                ->select('customer_id')
                ->groupBy('customer_id')
                ->havingRaw('COUNT(*) >= 2')
                ->get()->count();

            $topCustomersRaw = Order::whereIn('outlet_id', $outletIds)
                ->whereBetween('order_date', [$startDate->toDateString(), $endDate->toDateString()])
                ->whereIn('status', [Order::STATUS_COMPLETED, Order::STATUS_DELIVERED])
                ->whereNotNull('customer_id')
                ->selectRaw('customer_id, COUNT(*) as orders_count, SUM(total_amount) as total_spent')
                ->groupBy('customer_id')
                ->orderByDesc('total_spent')
                ->limit(5)
                ->with('customer')
                ->get();

            $topCustomers = $topCustomersRaw->map(function($row) {
                return [
                    'id' => $row->customer_id,
                    'name' => $row->customer->name ?? '-',
                    'ordersCount' => $row->orders_count,
                    'totalSpent' => (float) $row->total_spent,
                ];
            })->toArray();

            return [
                'totalCustomers' => $totalCustomers,
                'newCustomersCount' => $newCustomersCount,
                'repeatCustomersCount' => $repeatCustomersCount,
                'inactiveCustomersCount' => $inactiveCustomersCount,
                'topCustomers' => $topCustomers,
            ];
        });
    }

    public function buildMembershipSummary(int $ownerId, array $outletIds): array
    {
        $cacheKey = "users:{$ownerId}:dashboard:membership_summary:" . implode(',', $outletIds);
        
        return Cache::remember($cacheKey, 300, function () use ($outletIds) {
            if (empty($outletIds)) return ['activeSubscriptionsCount' => 0, 'expiringSubscriptionsCount' => 0, 'activeMembershipContractsCount' => 0, 'expiringMembershipContractsCount' => 0, 'topPackages' => []];

            $thirtyDaysFromNow = now()->addDays(30);

            $subsQuery = CustomerSubscription::whereHas('customer', function($q) use ($outletIds) {
                $q->whereIn('outlet_id', $outletIds);
            })->where('status', 'active');

            $activeSubscriptionsCount = $subsQuery->count();
            $expiringSubscriptionsCount = (clone $subsQuery)->where('expired_at', '<=', $thirtyDaysFromNow)->count();

            $contractsQuery = MembershipContract::whereHas('customer', function($q) use ($outletIds) {
                $q->whereIn('outlet_id', $outletIds);
            })->where('status', MembershipContract::STATUS_ACTIVE);

            $activeMembershipContractsCount = $contractsQuery->count();
            $expiringMembershipContractsCount = (clone $contractsQuery)->where('expired_at', '<=', $thirtyDaysFromNow)->count();

            $topPackages = CustomerSubscription::whereHas('customer', function($q) use ($outletIds) {
                $q->whereIn('outlet_id', $outletIds);
            })->selectRaw('service_package_id, COUNT(*) as sold_count')
              ->groupBy('service_package_id')
              ->orderByDesc('sold_count')
              ->limit(5)
              ->with('servicePackage')
              ->get()->map(function($row) {
                  return [
                      'id' => $row->service_package_id,
                      'name' => $row->servicePackage->name ?? '-',
                      'soldCount' => $row->sold_count,
                      'revenue' => (float) ($row->sold_count * ($row->servicePackage->price ?? 0)),
                  ];
              })->toArray();

            return [
                'activeSubscriptionsCount' => $activeSubscriptionsCount,
                'expiringSubscriptionsCount' => $expiringSubscriptionsCount,
                'activeMembershipContractsCount' => $activeMembershipContractsCount,
                'expiringMembershipContractsCount' => $expiringMembershipContractsCount,
                'topPackages' => $topPackages,
            ];
        });
    }

    public function buildHrPayrollSummary(int $ownerId, array $outletIds): array
    {
        $cacheKey = "users:{$ownerId}:dashboard:hr_payroll:" . implode(',', $outletIds);
        
        return Cache::remember($cacheKey, 300, function () use ($outletIds) {
            if (empty($outletIds)) return ['activeEmployeesCount' => 0, 'payrollPaidAmount' => 0, 'payrollPaidCount' => 0, 'unpaidCommissionAmount' => 0, 'activeLoanAmount' => 0, 'fineDeductionAmount' => 0];

            $activeEmployeesCount = Employee::whereIn('outlet_id', $outletIds)->active()->count();

            $currentMonth = now()->month;
            $currentYear = now()->year;

            $payrolls = Payroll::whereHas('employee', function($q) use ($outletIds) {
                $q->whereIn('outlet_id', $outletIds);
            })
                ->where('month', $currentMonth)
                ->where('year', $currentYear)
                ->where('status', 'paid');
            
            $payrollPaidCount = $payrolls->count();
            $payrollPaidAmount = $payrolls->sum('net_salary');

            $unpaidCommissionAmount = WorkLog::whereIn('employee_id', function($q) use ($outletIds) {
                $q->select('id')->from('employees')->whereIn('outlet_id', $outletIds);
            })
                ->unpaid()
                ->sum('total_amount');

            $activeLoanAmount = Loan::whereIn('employee_id', function($q) use ($outletIds) {
                $q->select('id')->from('employees')->whereIn('outlet_id', $outletIds);
            })->active()->sum('remaining_amount');

            $fineDeductionAmount = FineLog::whereIn('employee_id', function($q) use ($outletIds) {
                $q->select('id')->from('employees')->whereIn('outlet_id', $outletIds);
            })->whereMonth('date', $currentMonth)->whereYear('date', $currentYear)
              ->unpaid()
              ->sum('amount');

            return [
                'activeEmployeesCount' => $activeEmployeesCount,
                'payrollPaidAmount' => (float) $payrollPaidAmount,
                'payrollPaidCount' => $payrollPaidCount,
                'unpaidCommissionAmount' => (float) $unpaidCommissionAmount,
                'activeLoanAmount' => (float) $activeLoanAmount,
                'fineDeductionAmount' => (float) $fineDeductionAmount,
            ];
        });
    }

    public function buildActivityFeed(int $ownerId, array $outletIds, int $limit = 20): array
    {
        $cacheKey = "users:{$ownerId}:dashboard:activity_feed:" . implode(',', $outletIds);
        
        return Cache::remember($cacheKey, 60, function () use ($ownerId, $outletIds, $limit) {
            if (empty($outletIds)) return [];

            $activities = [];

            $orders = Order::with('customer')->whereIn('outlet_id', $outletIds)->orderByDesc('created_at')->take(5)->get();
            foreach ($orders as $order) {
                $activities[] = [
                    'id' => 'order_'.$order->id,
                    'type' => 'order',
                    'title' => "Pesanan {$order->order_number}",
                    'description' => "Status: {$order->getStatusLabel()} - Pelanggan: ".($order->customer->name ?? '-'),
                    'timestamp' => $order->created_at->toISOString(),
                    'href' => "/dashboard/orders/{$order->id}",
                ];
            }

            $walletTxs = WalletTransaction::byUserId($ownerId)->orderByDesc('created_at')->take(5)->get();
            foreach ($walletTxs as $tx) {
                $activities[] = [
                    'id' => 'wallet_'.$tx->id,
                    'type' => 'wallet',
                    'title' => "Transaksi Dompet",
                    'description' => $tx->description,
                    'timestamp' => $tx->created_at->toISOString(),
                    'href' => "/dashboard/wallet",
                ];
            }

            $withdrawals = WalletWithdrawal::byUserId($ownerId)->orderByDesc('created_at')->take(3)->get();
            foreach ($withdrawals as $wdr) {
                $activities[] = [
                    'id' => 'wdr_'.$wdr->id,
                    'type' => 'withdrawal',
                    'title' => "Penarikan Saldo",
                    'description' => "Rp " . number_format($wdr->requested_amount, 0, ',', '.') . " - Status: {$wdr->status}",
                    'timestamp' => $wdr->created_at->toISOString(),
                    'href' => "/dashboard/wallet/withdrawals",
                ];
            }

            usort($activities, fn($a, $b) => strtotime($b['timestamp']) <=> strtotime($a['timestamp']));

            return array_slice($activities, 0, $limit);
        });
    }

    public function buildSetupChecklist(int $ownerId): ?array
    {
        $outlets = Outlet::byOwnerId($ownerId)->get();
        if ($outlets->count() > 0) {
            return null; 
        }

        return [
            [
                'key' => 'create_outlet', 'label' => 'Buat Outlet Pertama Anda',
                'status' => 'pending', 'actionLabel' => 'Buat Outlet', 'actionHref' => '/dashboard/outlets/create',
            ],
            [
                'key' => 'set_schedule', 'label' => 'Atur Jam Operasional',
                'status' => 'pending', 'actionLabel' => 'Pengaturan', 'actionHref' => '/dashboard/outlets',
            ]
        ];
    }
}
