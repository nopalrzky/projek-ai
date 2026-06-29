import { Customer, ImportLog, Outlet } from "@/types";

export interface OutletCustomersProps {
    outlet: Outlet;
    isLoading?: boolean;
}

export interface CustomerCreateProps {
    outlet: Outlet;
}

export interface CustomerEditProps {
    outlet: Outlet;
    customer: Customer;
}

export interface DeleteCustomerModalProps {
    isOpen: boolean;
    customer?: Customer;
    onClose: () => void;
    onConfirm: (customer: Customer) => void;
    isLoading: boolean;
}

export interface CustomerImportPageProps {
    outlet: Outlet;
    type: string;
    config: any;
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface CustomerPreviewPageProps {
    outlet: Outlet;
    type: string;
    preview: Record<string, any>[];
    errors: Array<{
        row: number;
        data: any;
        errors: string[];
    }>;
    total_rows: number;
    has_more: boolean;
    file_name: string;
}

export interface CustomerResultPageProps {
    importLog: ImportLog;
    outlet: Outlet;
}
