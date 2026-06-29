import { Fine, Outlet } from "@/types";

export interface OutletFinesProps {
    outlet: Outlet;
    fines?: Fine[];
    isLoading?: boolean;
}

export interface FineCreateProps {
    outlet: Outlet;
}

export interface FineEditProps {
    outlet: Outlet;
    fine: Fine;
}

export interface DeleteFineModalProps {
    isOpen: boolean;
    fine?: Fine;
    onClose: () => void;
    onConfirm: (fine: Fine) => void;
    isLoading?: boolean;
}
