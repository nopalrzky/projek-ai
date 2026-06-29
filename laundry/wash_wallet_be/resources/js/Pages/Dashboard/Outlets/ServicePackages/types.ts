import { ServicePackage, Outlet, LaundryService } from "@/types";

export interface OutletServicePackageIndexProps {
    outlet: Outlet;
    isLoading?: boolean;
}

export interface OutletServicePackageCreateProps {
    outlet: Outlet;
    laundryServices: LaundryService[];
}

export interface OutletServicePackageEditProps {
    outlet: Outlet;
    servicePackage: ServicePackage;
    laundryServices: LaundryService[];
}

export interface OutletServicePackageDeleteModalProps {
    isOpen: boolean;
    servicePackage?: ServicePackage;
    onClose: () => void;
    onConfirm: (servicePackage: ServicePackage) => void;
    isLoading?: boolean;
}
