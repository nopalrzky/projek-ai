import { Category, Unit, LaundryService, ImportLog, Process } from "@/types";

export interface CategoryLaundryServicesIndexProps {
    category: Category;
    laundryServices: LaundryService[];
    isLoading?: boolean;
}

export interface CategoryLaundryServiceCreateProps {
    category: Category;
    units: Unit[];
    processes: Process[];
    flash: {
        success?: string;
        error?: string;
    };
}

export interface CategoryLaundryServiceEditProps {
    category: Category;
    laundryService: LaundryService;
    units: Unit[];
    processes: Process[];
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface CategoryLaundryServicesProps {
    category: Category;
    laundryServices: LaundryService[];
    isLoading?: boolean;
}

export interface LaundryServiceImportPageProps {
    category: Category;
    type: string;
    config: any;
    flash?: {
        success?: string;
        error?: string;
    };
}
interface PreviewError {
    row: number;
    data: Record<string, any>;
    errors: string[];
}

export interface LaundryServicePreviewPageProps {
    category: Category;
    type: string;
    preview: Record<string, any>[];
    errors: PreviewError[];
    total_rows: number;
    has_more: boolean;
    file_name: string;
}

export interface LaundryServiceResultPageProps {
    importLog: ImportLog;
    category: Category;
}
