import { LaundryService, Outlet, Category, Unit, Process } from "@/types";

export interface OutletLaundryServiceIndexProps {
    outlet: Outlet;
    isLoading?: boolean;
}

export interface OutletLaundryServiceCreateProps {
    outlet: Outlet;
    categories: Category[];
    units: Unit[];
    processes: Process[];
}

export interface OutletLaundryServiceShowProps {
    outlet: Outlet;
    laundryService: LaundryService;
}

export interface OutletLaundryServiceEditProps {
    outlet: Outlet;
    laundryService: LaundryService;
    categories: Category[];
    units: Unit[];
    processes: Process[];
}

export interface OutletLaundryServiceDeleteModalProps {
    isOpen: boolean;
    laundryService?: LaundryService;
    onClose: () => void;
    onConfirm: (laundryService: LaundryService) => void;
    isLoading: boolean;
}
