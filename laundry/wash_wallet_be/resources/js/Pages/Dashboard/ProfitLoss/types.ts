import {
    ComparativeProfitLoss,
    DateRangeOption,
    Outlet,
    ProfitLossReport,
} from "@/types";

export interface ProfitLossPageProps {
    report: ProfitLossReport | null;
    outlets: Outlet[];
    filters: {
        outlet_id?: number;
        date_range?: string;
        start_date?: string;
        end_date?: string;
    };
    dateRangeOptions: DateRangeOption[];
}

export interface ComparativeProfitLossPageProps {
    comparison: ComparativeProfitLoss | null;
    outlets: Outlet[];
    filters: {
        outlet_id?: number;
        current_date_range?: string;
        current_start_date?: string;
        current_end_date?: string;
        previous_date_range?: string;
        previous_start_date?: string;
        previous_end_date?: string;
    };
    dateRangeOptions: DateRangeOption[];
}
