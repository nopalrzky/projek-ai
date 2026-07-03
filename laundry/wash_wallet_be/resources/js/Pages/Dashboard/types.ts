export type DashboardPeriod = 'today' | '7d' | '30d' | '90d';

export interface OwnerDashboardMeta {
    period: DashboardPeriod;
    startDate: string;
    endDate: string;
    timezone: string;
    generatedAt: string;
}

export interface OwnerDashboardFilters {
    outletId: number | null;
    outletLabel: string;
}

export interface OwnerDashboardKpis {
    todayRevenue: number;
    todayOrdersCount: number;
    activeOrdersCount: number;
    unpaidOrdersCount: number;
    outstandingAmount: number;
    periodRevenue: number;
    periodExpense: number;
    periodNetProfit: number | null;
    periodOrdersCount: number;
    newCustomersCount: number;
    pendingApprovalsCount: number;
}

export interface AssetSummaryItem {
    slug: string;
    label: string;
    amount: number;
    formatted: string;
}

export interface OwnerDashboardMoneySummary {
    walletBalance: number;
    availableWalletBalance: number;
    pendingWithdrawalAmount: number;
    coinBalance: number;
    assetSummary: AssetSummaryItem[];
}

export interface OwnerDashboardActionItem {
    key: string;
    title: string;
    severity: 'critical' | 'warning' | 'info';
    count?: number;
    amount?: number;
    message: string;
    actionLabel: string;
    actionHref: string;
}

export interface OwnerDashboardOperations {
    orderFunnel: Array<{
        stage: string;
        label: string;
        count: number;
        amount?: number;
    }>;
    recentActiveOrders: Array<{
        id: number;
        orderNumber: string;
        outletName: string;
        customerName: string | null;
        status: string;
        statusLabel: string;
        paymentStatus: string;
        paymentStatusLabel: string;
        totalAmount: number;
        remainingAmount: number;
        orderDate: string | null;
        estimatedCompletion: string | null;
        createdAt: string;
    }>;
    delayedOrders: Array<{
        id: number;
        orderNumber: string;
        outletName: string;
        status: string;
        ageMinutes: number;
        estimatedCompletion: string | null;
    }>;
}

export interface OwnerDashboardFinance {
    revenueExpenseTrend: Array<{
        date: string;
        revenue: number;
        expense: number;
        net: number;
    }>;
    paymentHealth: Array<{
        paymentStatus: string;
        label: string;
        ordersCount: number;
        totalAmount: number;
        paidAmount: number;
        remainingAmount: number;
    }>;
    withdrawalSummary: {
        pendingCount: number;
        processingCount: number;
        paidCount: number;
        pendingAmount: number;
        paidAmount: number;
    };
}

export interface OwnerDashboardOutletSummary {
    totalOutlets: number;
    activeOutlets: number;
    riskyOutletsCount: number;
    topOutlets: Array<{
        id: number;
        name: string;
        revenue: number;
        ordersCount: number;
        activeOrdersCount: number;
        outstandingAmount: number;
        readinessStatus: 'ok' | 'warning' | 'critical';
    }>;
    riskyOutlets: Array<{
        id: number;
        name: string;
        severity: 'warning' | 'critical';
        reasons: string[];
        actionHref: string;
    }>;
}

export interface OwnerDashboardCustomerSummary {
    totalCustomers: number;
    newCustomersCount: number;
    repeatCustomersCount: number;
    inactiveCustomersCount: number;
    topCustomers: Array<{
        id: number;
        name: string;
        ordersCount: number;
        totalSpent: number;
    }>;
}

export interface OwnerDashboardMembershipSummary {
    activeSubscriptionsCount: number;
    expiringSubscriptionsCount: number;
    activeMembershipContractsCount: number;
    expiringMembershipContractsCount: number;
    topPackages: Array<{
        id: number;
        name: string;
        soldCount: number;
        revenue: number;
    }>;
}

export interface OwnerDashboardHrPayrollSummary {
    activeEmployeesCount: number;
    payrollPaidAmount: number;
    payrollPaidCount: number;
    unpaidCommissionAmount: number;
    activeLoanAmount: number;
    fineDeductionAmount: number;
}

export interface OwnerDashboardActivityItem {
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: string;
    href?: string;
}

export interface OwnerDashboardSetupItem {
    key: string;
    label: string;
    status: 'done' | 'pending';
    actionLabel?: string;
    actionHref?: string;
}

export interface OwnerDashboardPayload {
    meta: OwnerDashboardMeta;
    filters: OwnerDashboardFilters;
    kpis: OwnerDashboardKpis;
    money: OwnerDashboardMoneySummary;
    actionCenter: OwnerDashboardActionItem[];
    operations: OwnerDashboardOperations;
    finance: OwnerDashboardFinance;
    outlets: OwnerDashboardOutletSummary;
    customers: OwnerDashboardCustomerSummary;
    membership: OwnerDashboardMembershipSummary;
    hrPayroll: OwnerDashboardHrPayrollSummary;
    activityFeed: OwnerDashboardActivityItem[];
    setupChecklist?: OwnerDashboardSetupItem[];
}

export interface OutletOption {
    id: number;
    name: string;
}

export interface DashboardIndexProps {
    dashboard: OwnerDashboardPayload;
    outlets: OutletOption[];
}

export interface TransactionalAccount {
    id: number;
    code: string;
    name: string;
    slug: string;
    totalDebit: number;
    totalCredit: number;
    balance: number;
    formattedDebit: string;
    formattedCredit: string;
    formattedBalance: string;
    transactionCount: number;
}

export interface AssetShowProps {
    account: {
        id: number;
        name: string;
        slug: string;
        code: string;
        type: string;
    };
    transactionalAccounts: TransactionalAccount[];
    summary: {
        totalDebit: number;
        totalCredit: number;
        balance: number;
        formattedDebit: string;
        formattedCredit: string;
        formattedBalance: string;
        totalAccounts: number;
    };
}
