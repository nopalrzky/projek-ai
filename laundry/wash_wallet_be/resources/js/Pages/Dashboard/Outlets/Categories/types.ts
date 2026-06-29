import { Category, ImportLog, LaundryService, Outlet } from "@/types";

export interface OutletCategoryIndexProps {
    outlet: Outlet;
    isLoading?: boolean;
}

export interface OutletCategoryCreateProps {
    outlet: Outlet;
}

export interface OutletCategoryShowProps {
    outlet: Outlet;
    category: Category;
    laundryServices: LaundryService[];
}

export interface OutletCategoryEditProps {
    outlet: Outlet;
    category: Category;
}

export interface OutletCategoryDeleteModalProps {
    isOpen: boolean;
    category?: Category;
    onClose: () => void;
    onConfirm: (category: Category) => void;
    isLoading: boolean;
}

export interface CategoryImportPageProps {
    outlet: Outlet;
    type: string;
    config: any;
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface CategoryPreviewPageProps {
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

export interface CategoryResultPageProps {
    importLog: ImportLog;
    outlet: Outlet;
}
