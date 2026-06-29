import { Account } from ".";

export interface ReportSection {
    items: Account[];
    total: number;
}

export interface ProfitLossReport {
    period: {
        start: string;
        end: string;
    };
    revenues: ReportSection;
    cogs: ReportSection;
    grossProfit: number;
    grossMargin: number;
    operatingExpenses: ReportSection;
    operatingProfit: number;
    operatingMargin: number;
    otherRevenues: ReportSection;
    otherExpenses: ReportSection;
    netProfit: number;
    netMargin: number;
    totalRevenue: number;
    totalExpense: number;
}

export interface ComparativeChange {
    difference: number;
    percentage: number;
    trend: "increase" | "decrease" | "stable";
}

export interface ComparativeProfitLoss {
    current: ProfitLossReport;
    previous: ProfitLossReport;
    changes: {
        revenue: ComparativeChange;
        grossProfit: ComparativeChange;
        operatingProfit: ComparativeChange;
        netProfit: ComparativeChange;
    };
}

export interface DateRangeOption {
    value: string;
    label: string;
}

