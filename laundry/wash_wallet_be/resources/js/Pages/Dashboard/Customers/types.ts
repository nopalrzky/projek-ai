import { Customer, CustomerFilters, Outlet, PaginationMeta } from "@/types";

export interface CustomerIndexProps {
    customers: {
        data: Customer[];
        meta: PaginationMeta;
    };
    stats: Array<{
        label: string;
        value: string | number;
        subValue?: string;
        icon: string;
        variant?: "primary" | "success" | "info" | "warning" | "danger";
        trend?: string;
        unit?: string;
        progress?: number;
    }>;
    filterOptions: CustomerFilterOptions;
    filters: CustomerFilters;
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface CustomerFilterOptions {
    outlets: Outlet[];
    statusOptions: {
        value: boolean;
        label: string;
    }[];
    genderOptions: {
        value: string;
        label: string;
    }[];
}

export interface DeleteCustomerModalProps {
    isOpen: boolean;
    customer?: Customer;
    onClose: () => void;
    onConfirm: (customer: Customer) => void;
    isLoading?: boolean;
}

export interface CustomerCreateProps {
    outlets: Outlet[];
    errors?: Record<string, string>;
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface CustomerEditProps {
    customer: Customer;
    outlets: Outlet[];
    errors?: Record<string, string>;
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface CustomerShowProps {
    customer: Customer;
}

export interface CustomerPageHeaderProps {
    customer: Customer;
    isLoading?: boolean;
}

export interface CustomerOverviewProps {
    customer: Customer;
}

export interface CustomerOutletProps {
    customer: Customer;
}
