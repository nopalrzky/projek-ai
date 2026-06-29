import { ReactNode } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
    FilterConfig,
    FilterGroupConfig,
    QuickFilterConfig,
    ActiveFilter,
} from "@/Components/Filters/types";
import { PaginationMeta } from "@/Components/Pagination/types";

export interface BaseDataViewProps<T> {
    columns: ColumnDef<T>[];
    filters?: FilterConfig[];
    filterGroups?: FilterGroupConfig[];
    quickFilters?: QuickFilterConfig[];
    emptyMessage?: string;
    emptyTitle?: string;
    enableSorting?: boolean;
    enablePagination?: boolean;
    enableRowSelection?: boolean;
    enableFilters?: boolean;
    showFilterContainer?: boolean;
    useFilterBar?: boolean;
    filterLayout?: "horizontal" | "vertical" | "grid";
    pageSize?: number;
    loadingRows?: number;
    className?: string;
    tableClassName?: string;
    filterClassName?: string;
    paginationClassName?: string;
    header?: ReactNode;
    footer?: ReactNode;
    actionButton?: {
        label: string;
        href?: string;
        onClick?: () => void;
        icon?: ReactNode;
        variant?: "primary" | "secondary" | "outline";
    };
    actions?: ReactNode;
    searchPlaceholder?: string;
    onRowClick?: (row: T) => void;
    onRowSelectionChange?: (selectedRows: T[]) => void;
}

export interface DataViewProps<T> extends BaseDataViewProps<T> {
    route: string;
    data: T[];
    meta: PaginationMeta;
    isLoading?: boolean;
    initialFilters?: Record<string, any>;
}

export type { ActiveFilter, FilterGroupConfig, QuickFilterConfig };
