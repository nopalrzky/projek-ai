import { Fine, PaginationMeta, FineFilters, Outlet } from "@/types";

export interface FineIndexProps {
    fines: {
        data: Fine[];
        meta: PaginationMeta;
    };
    filterOptions: {
        outlets: Outlet[];
    };
    filters: FineFilters;
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface FineShowProps {
    fine: Fine;
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface FineEditProps {
    fine: Fine;
    outlets: Outlet[];
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface FineCreateProps {
    outlets: Outlet[];
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface FinePageHeaderProps {
    fine: Fine;
    isLoading: boolean;
}

export interface DeleteFineModalProps {
    isOpen: boolean;
    fine?: Fine;
    onClose: () => void;
    onConfirm: (fine: Fine) => void;
    isLoading: boolean;
}

export interface FineOverviewProps {
    fine: Fine;
}

export interface FineOutletProps {
    fine: Fine;
}
