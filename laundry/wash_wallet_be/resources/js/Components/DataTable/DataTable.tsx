import React, { useState, useEffect, useMemo } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    SortingState,
    ColumnDef,
} from "@tanstack/react-table";
import { Pagination } from "@/Components/Pagination";
import { cn } from "@/lib/utils";
import { DataTableProps } from "./types";
import DataTableHeader from "./DataTableHeader";
import DataTableBody from "./DataTableBody";

function DataTable<T>({
    data,
    columns,
    isLoading = false,
    isEmpty,
    hasError,
    error,
    pagination,
    onPaginationChange,
    onSortingChange,
    onRowSelectionChange,
    enableSorting = true,
    enablePagination = true,
    enableRowSelection = false,
    className,
    emptyMessage = "Tidak ada data tersedia",
    rows = 5,
    pageSize = 10,
}: DataTableProps<T>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [rowSelection, setRowSelection] = useState({});

    const isDataEmpty = isEmpty ?? (!isLoading && data.length === 0);

    const tableColumns: ColumnDef<T>[] = useMemo(() => {
        if (!enableRowSelection) return columns;

        const selectionColumn: ColumnDef<T> = {
            id: "select",
            header: ({ table }) => (
                <div className="flex items-center justify-center">
                    <input
                        type="checkbox"
                        className="rounded border transition-colors duration-200 focus:ring-2 focus:ring-offset-2"
                        style={{
                            borderColor: "var(--color-border)",
                            backgroundColor: "var(--color-surface)",
                            color: "var(--color-primary-500)",
                        }}
                        checked={table.getIsAllPageRowsSelected()}
                        onChange={table.getToggleAllPageRowsSelectedHandler()}
                        aria-label="Select all rows"
                    />
                </div>
            ),
            cell: ({ row }) => (
                <div className="flex items-center justify-center">
                    <input
                        type="checkbox"
                        className="rounded border transition-colors duration-200 focus:ring-2 focus:ring-offset-2"
                        style={{
                            borderColor: "var(--color-border)",
                            backgroundColor: "var(--color-surface)",
                            color: "var(--color-primary-500)",
                        }}
                        checked={row.getIsSelected()}
                        onChange={row.getToggleSelectedHandler()}
                        aria-label={`Select row ${row.index + 1}`}
                    />
                </div>
            ),
            enableSorting: false,
            size: 50,
        };

        return [selectionColumn, ...columns];
    }, [columns, enableRowSelection]);

    const tableConfig = useMemo(() => {
        const config: any = {
            data,
            columns: tableColumns,
            state: {
                sorting,
                rowSelection,
            },
            onSortingChange: setSorting,
            onRowSelectionChange: setRowSelection,
            getCoreRowModel: getCoreRowModel(),
            enableSorting,
            enableRowSelection,
        };

        if (enableSorting) {
            config.getSortedRowModel = getSortedRowModel();
        }

        if (enablePagination) {
            if (pagination) {
                config.state.pagination = {
                    pageIndex: pagination.pageIndex,
                    pageSize: pagination.pageSize,
                };
                config.manualPagination = true;
                config.pageCount = pagination.pageCount;
            } else {
                config.getPaginationRowModel = getPaginationRowModel();
                config.initialState = {
                    pagination: {
                        pageSize,
                    },
                };
            }
        }

        if (onSortingChange) {
            config.manualSorting = true;
        }

        return config;
    }, [
        data,
        tableColumns,
        sorting,
        rowSelection,
        enableSorting,
        enableRowSelection,
        enablePagination,
        pagination,
        pageSize,
        onSortingChange,
    ]);

    const table = useReactTable(tableConfig);

    useEffect(() => {
        if (onSortingChange && sorting.length > 0) {
            onSortingChange(sorting);
        }
    }, [sorting, onSortingChange]);

    useEffect(() => {
        if (onRowSelectionChange) {
            onRowSelectionChange(rowSelection);
        }
    }, [rowSelection, onRowSelectionChange]);

    const handlePaginationChange = (page: number): void => {
        if (pagination && onPaginationChange) {
            onPaginationChange({
                pageIndex: page - 1,
                pageSize: pagination.pageSize,
            });
        } else {
            table.setPageIndex(page - 1);
        }
    };

    return (
        <div className={cn("space-y-4", className)}>
            <div
                className="rounded-lg border overflow-hidden shadow-sm transition-colors duration-200"
                style={{
                    backgroundColor: "var(--color-surface)",
                    borderColor: "var(--color-border)",
                    position: "relative",
                    zIndex: 1,
                }}
            >
                <div className="overflow-x-auto">
                    <table
                        className="min-w-full divide-y"
                        style={{ borderColor: "var(--color-border)" }}
                    >
                        <DataTableHeader
                            headerGroups={table.getHeaderGroups()}
                            enableSorting={enableSorting}
                        />
                        <DataTableBody
                            rows={table.getRowModel().rows}
                            columns={tableColumns}
                            isLoading={isLoading}
                            isEmpty={isDataEmpty}
                            hasError={hasError}
                            error={error}
                            loadingRows={rows}
                            emptyMessage={emptyMessage}
                        />
                    </table>
                </div>
            </div>

            {enablePagination && !isLoading && !isDataEmpty && !hasError && (
                <div className="flex items-center justify-between">
                    {enableRowSelection && (
                        <div
                            className="text-sm"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            {table.getFilteredSelectedRowModel().rows.length >
                                0 && (
                                <span>
                                    {
                                        table.getFilteredSelectedRowModel().rows
                                            .length
                                    }{" "}
                                    dari{" "}
                                    {table.getFilteredRowModel().rows.length}{" "}
                                    baris dipilih
                                </span>
                            )}
                        </div>
                    )}

                    {pagination ? (
                        <Pagination
                            meta={{
                                currentPage: pagination.pageIndex + 1,
                                lastPage: pagination.pageCount,
                                from:
                                    pagination.pageIndex * pagination.pageSize +
                                    1,
                                to: Math.min(
                                    (pagination.pageIndex + 1) *
                                        pagination.pageSize,
                                    pagination.total || 0
                                ),
                                total: pagination.total || 0,
                            }}
                            onPageChange={handlePaginationChange}
                            variant="default"
                            size="default"
                            className="mt-4"
                        />
                    ) : (
                        <Pagination
                            meta={{
                                currentPage:
                                    table.getState().pagination.pageIndex + 1,
                                lastPage: table.getPageCount(),
                                from:
                                    table.getState().pagination.pageIndex *
                                        table.getState().pagination.pageSize +
                                    1,
                                to: Math.min(
                                    (table.getState().pagination.pageIndex +
                                        1) *
                                        table.getState().pagination.pageSize,
                                    data.length
                                ),
                                total: data.length,
                            }}
                            onPageChange={handlePaginationChange}
                            variant="compact"
                            size="default"
                            className="mt-4"
                        />
                    )}
                </div>
            )}
        </div>
    );
}

export default DataTable;
