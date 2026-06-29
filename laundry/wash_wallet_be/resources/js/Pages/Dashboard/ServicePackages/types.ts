import {
    ServicePackage,
    ServicePackageFilters,
    Outlet,
    PaginationMeta,
    LaundryService,
} from "@/types";

export interface ServicePackageIndexProps {
    servicePackages: {
        data: ServicePackage[];
        meta: PaginationMeta;
    };
    filterOptions: {
        outlets: Outlet[];
    };
    filters: ServicePackageFilters;
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface ServicePackageCreateProps {
    outlets: Outlet[];
}

export interface ServicePackageEditProps {
    servicePackage: ServicePackage;
    laundryServices: LaundryService[];
}

export interface DeleteServicePackageModalProps {
    isOpen: boolean;
    servicePackage?: ServicePackage;
    onClose: () => void;
    onConfirm: () => void;
    isLoading?: boolean;
}

export interface ServicePackageShowProps {
    servicePackage: ServicePackage;
}

export interface ServicePackageOverviewProps {
    servicePackage: ServicePackage;
}
