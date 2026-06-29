import { ColumnDef, Row } from "@tanstack/react-table";

export interface TableProps<T> {
    data: T[];
    columns: ColumnDef<T>[];
    isLoading?: boolean;
    isEmpty?: boolean;
    hasError?: boolean;
    error?: string;
    pagination?: {
        pageIndex: number;
        pageSize: number;
        pageCount: number;
        total: number;
    };
    onPaginationChange?: (pagination: {
        pageIndex: number;
        pageSize: number;
    }) => void;

    onSortingChange?: (sorting: { id: string; desc: boolean }[]) => void;
    onRowSelectionChange?: (selectedRows: Record<string, boolean>) => void;
    enableSorting?: boolean;
    enablePagination?: boolean;
    enableRowSelection?: boolean;
    className?: string;
    emptyMessage?: string;
    pageSize?: number;
    rows?: number;
}
