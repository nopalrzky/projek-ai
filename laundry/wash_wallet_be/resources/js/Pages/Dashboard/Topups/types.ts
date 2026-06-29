import { Topup, TopupFilters } from "@/types";
import { PaginationMeta } from "@/types";
import { Outlet } from "@/types/outlet";

export interface TopupIndexProps {
    topups: {
        data: Topup[];
        meta: PaginationMeta;
    };
    stats: Array<{
        label: string;
        value: string | number;
        subValue?: string;
        icon: string;
        variant?: "primary" | "success" | "info" | "warning" | "danger";
    }>;
    topupType: "master" | "outlet";
    filterOptions: {
        statusOptions: Array<{ value: string; label: string }>;
        paymentStatusOptions: Array<{ value: string; label: string }>;
    };
    filters: TopupFilters;
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface TopupPageHeaderProps {
    topupType: "master" | "outlet";
    outlet?: Outlet;
}

export interface TopupCreateProps {
    outlets: Outlet[];
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface TopupShowProps {
    topup: Topup;
}
export interface TopupPageHeaderProps {
    topup: Topup;
}

export interface TopupOverviewProps {
    topup: Topup;
}

export interface TopupPaymentDetailsProps {
    topup: Topup;
}
