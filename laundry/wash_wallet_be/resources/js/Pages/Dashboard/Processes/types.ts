import {
    Process,
    PaginationMeta,
    LaundryService,
    Employee,
    ProcessFilters,
} from "@/types";

export interface ProcessIndexProps {
    processes: {
        data: Process[];
        meta: PaginationMeta;
    };
    filterOptions: {
        statusOptions: Array<{ value: string; label: string }>;
    };
    filters: ProcessFilters;
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface ProcessEditProps {
    process: Process;
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface ProcessCreateProps {
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface ProcessPageHeaderProps {
    process: Process;
    onEdit?: () => void;
    onDelete?: () => void;
    onToggleStatus?: () => void;
    isLoading?: boolean;
}

export interface ProcessShowProps {
    process: Process;
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface ProcessOverviewProps {
    process: Process;
    laundryServices: LaundryService[];
    employees: Employee[];
}

export interface ProcessDeleteModalProps {
    isOpen: boolean;
    process?: Process;
    onClose: () => void;
    onConfirm: (process: Process) => void;
}

export interface DeleteProcessModalProps {
    isOpen: boolean;
    process?: Process;
    onClose: () => void;
    onConfirm: () => void;
    isLoading?: boolean;
}
