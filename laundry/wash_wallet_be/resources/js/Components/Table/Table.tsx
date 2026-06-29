import React, { useState, useEffect } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    flexRender,
    SortingState,
    ColumnDef,
} from "@tanstack/react-table";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { Pagination } from "@/Components/Pagination";
import { Empty, Loading } from "@/Components/State";
import { cn } from "@/lib/utils";
import { TableProps } from "./types";

function Table<T>({
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
}: TableProps<T>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [rowSelection, setRowSelection] = useState({});

    const isDataEmpty = isEmpty ?? (!isLoading && data.length === 0);

    const tableColumns: ColumnDef<T>[] = React.useMemo(() => {
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

    const tableConfig = React.useMemo(() => {
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

    const renderSortIcon = (isSorted: false | "asc" | "desc") => {
        const iconStyle = { color: "var(--color-text-quaternary)" };

        if (isSorted === "asc") {
            return (
                <ChevronUp
                    className="w-4 h-4"
                    style={{ color: "var(--color-primary-500)" }}
                />
            );
        }
        if (isSorted === "desc") {
            return (
                <ChevronDown
                    className="w-4 h-4"
                    style={{ color: "var(--color-primary-500)" }}
                />
            );
        }
        return <ChevronsUpDown className="w-4 h-4" style={iconStyle} />;
    };

    return (
        <div className={cn("space-y-4", className)}>
            <div
                className="rounded-lg border overflow-hidden shadow-sm transition-colors duration-200"
                style={{
                    backgroundColor: "var(--color-surface)",
                    borderColor: "var(--color-border)",
                }}
            >
                <div className="overflow-x-auto">
                    <table
                        className="min-w-full divide-y"
                        style={{ borderColor: "var(--color-border)" }}
                    >
                        <thead
                            style={{ backgroundColor: "var(--color-gray-50)" }}
                        >
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <th
                                            key={header.id}
                                            className={cn(
                                                "px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-200",
                                                header.column.getCanSort() &&
                                                    "cursor-pointer select-none hover:opacity-80",
                                                header.id === "select" &&
                                                    "w-12",
                                            )}
                                            style={{
                                                color: "var(--color-text-tertiary)",
                                                width:
                                                    header.getSize() !== 150
                                                        ? header.getSize()
                                                        : undefined,
                                            }}
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            <div className="flex items-center gap-2">
                                                {flexRender(
                                                    header.column.columnDef
                                                        .header,
                                                    header.getContext(),
                                                )}
                                                {header.column.getCanSort() && (
                                                    <span className="transition-colors duration-200">
                                                        {renderSortIcon(
                                                            header.column.getIsSorted(),
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>

                        <tbody
                            className="divide-y transition-colors duration-200"
                            style={{
                                backgroundColor: "var(--color-surface)",
                                borderColor: "var(--color-border)",
                            }}
                        >
                            {isLoading && (
                                <Loading
                                    type="table"
                                    rows={rows}
                                    columns={tableColumns.length}
                                />
                            )}

                            {hasError && !isLoading && (
                                <tr>
                                    <td
                                        colSpan={tableColumns.length}
                                        className="px-6 py-0"
                                    >
                                        <div className="min-h-[400px] flex items-center justify-center">
                                            <Empty
                                                title="Gagal memuat data"
                                                message={
                                                    typeof error === "string"
                                                        ? error
                                                        : "Terjadi kesalahan saat memuat data"
                                                }
                                                variant="error"
                                            />
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {isDataEmpty && !isLoading && !hasError && (
                                <tr>
                                    <td
                                        colSpan={tableColumns.length}
                                        className="px-6 py-0"
                                    >
                                        <div className="min-h-[400px] flex items-center justify-center">
                                            <Empty
                                                title="Tidak ada data ditemukan"
                                                message={emptyMessage}
                                                variant="search"
                                            />
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {!isLoading &&
                                !isDataEmpty &&
                                !hasError &&
                                table.getRowModel().rows.map((row) => (
                                    <tr
                                        key={row.id}
                                        className={cn(
                                            "transition-all duration-200 hover:opacity-80",
                                            row.getIsSelected() && "opacity-90",
                                        )}
                                        style={{
                                            backgroundColor: row.getIsSelected()
                                                ? "var(--color-primary-50)"
                                                : "transparent",
                                        }}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <td
                                                key={cell.id}
                                                className="px-6 py-4 text-sm transition-colors duration-200"
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                }}
                                            >
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                        </tbody>
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
                                    pagination.total || 0,
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
                                    data.length,
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

export default Table;
