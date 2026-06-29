import { ReactNode } from "react";
import {
    ColumnDef,
    SortingState,
    PaginationState,
} from "@tanstack/react-table";

export interface Column<T> {
    key: keyof T | string;
    label: string;
    sortable?: boolean;
    render?: (value: any, row: T) => ReactNode;
    width?: string;
    align?: "left" | "center" | "right";
}

export interface PaginationMeta {
    currentPage: number;
    perPage: number;
    total: number;
    lastPage: number;
    from: number | null;
    to: number | null;
}

export interface DataTableProps<T> {
    data: T[];
    columns: ColumnDef<T>[];
    isLoading?: boolean;
    isEmpty?: boolean;
    hasError?: boolean;
    error?: string | Error;
    pagination?: {
        pageIndex: number;
        pageSize: number;
        pageCount: number;
        total?: number;
    };
    onPaginationChange?: (pagination: PaginationState) => void;
    onSortingChange?: (sorting: SortingState) => void;
    onRowSelectionChange?: (selection: Record<string, boolean>) => void;
    enableSorting?: boolean;
    enablePagination?: boolean;
    enableRowSelection?: boolean;
    className?: string;
    emptyMessage?: string;
    rows?: number;
    pageSize?: number;
}

export interface DataTableHeaderProps {
    headerGroups: any[];
    enableSorting?: boolean;
}

export interface DataTableBodyProps {
    rows: any[];
    columns: ColumnDef<any>[];
    isLoading?: boolean;
    isEmpty?: boolean;
    hasError?: boolean;
    error?: string | Error;
    loadingRows?: number;
    emptyMessage?: string;
}

export interface DataTableRowProps {
    row: any;
}

export interface DataTableCellProps {
    cell: any;
}

export interface DataTableEmptyProps {
    colSpan: number;
    title?: string;
    message?: string;
    variant?: "search" | "no-results" | "error";
}

export interface DataTableLoadingProps {
    rows: number;
    columns: number;
}
