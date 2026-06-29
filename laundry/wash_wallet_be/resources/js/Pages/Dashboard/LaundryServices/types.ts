import {
    LaundryService,
    Category,
    Unit,
    PaginationMeta,
    LaundryServiceFilters,
    Outlet,
    Process,
} from "@/types";

export interface LaundryServiceIndexProps {
    laundryServices: {
        data: LaundryService[];
        meta: PaginationMeta;
    };
    filterOptions: LaundryServiceFilterOptions;
    filters: LaundryServiceFilters;
    flash: {
        success?: string;
        error?: string;
    };
}

export interface LaundryServiceFilterOptions {
    categories: Category[];
    outlets: Outlet[];
    units: Unit[];
    statusOptions: { label: string; value: string }[];
}

export interface LaundryServicePageHeaderProps {
    laundryService: LaundryService;
    isLoading?: boolean;
}

export interface LaundryServiceShowProps {
    laundryService: LaundryService;
    flash: {
        success?: string;
        error?: string;
    };
}
export interface LaundryServiceOverviewProps {
    laundryService: LaundryService;
}

export interface LaundryServiceEditProps {
    laundryService: LaundryService;
    categories: Category[];
    units: Unit[];
    processes: Process[];
    flash: {
        success?: string;
        error?: string;
    };
}

export interface LaundryServiceCreateProps {
    outlets: Outlet[];
    units: Unit[];
    processes: Process[];
    flash: {
        success?: string;
        error?: string;
    };
}

export interface LaundryServiceDeleteModalProps {
    isOpen: boolean;
    laundryService?: LaundryService;
    onClose: () => void;
    onConfirm: (service: LaundryService) => void;
    isLoading: boolean;
}
