import {
    FineLog,
    FineLogFilters,
    PaginationMeta,
    Employee,
    Outlet,
    Fine,
} from "@/types";

export interface FineLogIndexProps {
    fineLogs: {
        data: FineLog[];
        meta: PaginationMeta;
    };
    employees: Employee[];
    outlets: Outlet[];
    fines: Fine[];
    filters: FineLogFilters;
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface FineLogCreateProps {
    outlets: Outlet[];
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface DeleteFineLogModalProps {
    isOpen: boolean;
    fineLog?: FineLog;
    onClose: () => void;
    onConfirm: (fineLog: FineLog) => void;
    isLoading?: boolean;
}

export interface FineLogShowProps {
    fineLog: FineLog;
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface FineLogOutletProps {
    fineLog: FineLog;
}

export interface FineLogEmployeeProps {
    fineLog: FineLog;
}

export interface FineLogOverviewProps {
    fineLog: FineLog;
}
export interface FineLogPageHeaderProps {
    fineLog: FineLog;
}
