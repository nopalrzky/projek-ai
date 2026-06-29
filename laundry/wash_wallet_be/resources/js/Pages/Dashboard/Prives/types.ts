import { Prive, PriveFilters, PaginationMeta, Outlet, Account } from "@/types";

export interface PriveIndexProps {
    prives: {
        data: Prive[];
        meta: PaginationMeta;
    };
    filterOptions: {
        outlets: Outlet[];
        sourceAccounts: Account[];
        equityAccounts: Account[];
    };
    filters: PriveFilters;
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface PriveTableProps {
    data: Prive[];
    meta: PaginationMeta;
    filters: PriveFilters;
    isLoading: boolean;
    onPaginationChange: (page: number, pageSize: number) => void;
    onSortingChange: (sortOptions: PriveSortOptions) => void;
    onEditPrive: (prive: Prive) => void;
    onViewPrive: (prive: Prive) => void;
    onDeletePrive: (prive: Prive) => void;
}

export interface PriveCreateProps {
    outlets: Outlet[];
    sourceAccounts: Account[];
    equityAccounts: Account[];
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface PriveEditProps {
    prive: Prive;
    outlets: Outlet[];
    sourceAccounts: Account[];
    equityAccounts: Account[];
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface PriveOverviewProps {
    prive: Prive;
}

export interface PriveAccountingInfoProps {
    prive: Prive;
}

export interface PriveShowProps {
    prive: Prive;
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface DeletePriveModalProps {
    isOpen: boolean;
    prive?: Prive;
    onClose: () => void;
    onConfirm: (prive: Prive) => void;
    isLoading: boolean;
}

export interface PriveFiltersProps {
    filters: PriveFilters;
    outlets: Outlet[];
    sourceAccounts: Account[];
    equityAccounts: Account[];
    hasActiveFilters: boolean;
    isLoading: boolean;
    onSearchChange: (searchValue: string) => void;
    onFilterChange: (key: keyof PriveFilters, value: any) => void;
    onResetFilters: () => void;
    onApplyFilters: (filters: Partial<PriveFilters>) => void;
}

export interface PriveSortOptions {
    column: string;
    direction: "asc" | "desc";
}
