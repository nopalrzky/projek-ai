import { BalanceSheetFilters, BalanceSheetReport, Outlet } from "@/types";

export interface BalanceSheetPageProps {
    report: BalanceSheetReport | null;
    outlets: Outlet[];
    filters: BalanceSheetFilters;
}

export interface ComparativeChange {
    difference: number;
    percentage: number;
    trend: "increase" | "decrease" | "stable";
}

export interface ComparativeBalanceSheet {
    current: BalanceSheetReport;
    previous: BalanceSheetReport;
    changes: {
        assets: ComparativeChange;
        liabilities: ComparativeChange;
        equity: ComparativeChange;
    };
}

export interface ComparativeBalanceSheetPageProps {
    comparison: ComparativeBalanceSheet | null;
    outlets: Outlet[];
    filters: {
        outlet_id?: number;
        current_date?: string;
        previous_date?: string;
    };
}
