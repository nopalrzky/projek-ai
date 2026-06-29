import {
    Category,
    Outlet,
    PaginationMeta,
    LaundryService,
    CategoryFilters,
} from "@/types";

export interface CategoryIndexProps {
    categories: {
        data: Category[];
        meta: PaginationMeta;
    };
    filterOptions: {
        outlets: Outlet[];
        statusOptions: Array<{ value: string; label: string }>;
    };
    filters: CategoryFilters;
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface CategoryEditProps {
    category: Category;
    outlets: Outlet[];
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface CategoryCreateProps {
    outlets: Outlet[];
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface CategoryPageHeaderProps {
    category: Category;
    onEdit?: () => void;
    onDelete?: () => void;
    onToggleStatus?: () => void;
    isLoading?: boolean;
}

export interface CategoryShowProps {
    category: Category;
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface CategoryOverviewProps {
    category: Category;
    laundryServices: LaundryService[];
}

export interface CategoryOutletProps {
    outlet: Outlet;
}

export interface CategoryLaundryServicesProps {
    category: Category;
    laundryServices: LaundryService[];
    isLoading: boolean;
}

export interface CategoryDeleteModalProps {
    isOpen: boolean;
    category?: Category;
    onClose: () => void;
    onConfirm: (category: Category) => void;
}

export interface DeleteCategoryModalProps {
    isOpen: boolean;
    category?: Category;
    onClose: () => void;
    onConfirm: (category: Category) => void;
    isLoading?: boolean;
}
