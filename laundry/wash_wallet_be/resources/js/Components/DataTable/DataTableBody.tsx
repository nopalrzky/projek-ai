import React from "react";
import { DataTableBodyProps } from "./types";
import DataTableRow from "./DataTableRow";
import DataTableEmpty from "./DataTableEmpty";
import DataTableLoading from "./DataTableLoading";

const DataTableBody: React.FC<DataTableBodyProps> = ({
    rows,
    columns,
    isLoading,
    isEmpty,
    hasError,
    error,
    loadingRows = 5,
    emptyMessage = "Tidak ada data tersedia",
}) => {
    return (
        <tbody
            className="divide-y transition-colors duration-200"
            style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-border)",
            }}
        >
            {isLoading && (
                <DataTableLoading rows={loadingRows} columns={columns.length} />
            )}

            {hasError && !isLoading && (
                <DataTableEmpty
                    colSpan={columns.length}
                    title="Gagal memuat data"
                    message={
                        typeof error === "string"
                            ? error
                            : "Terjadi kesalahan saat memuat data"
                    }
                    variant="error"
                />
            )}

            {isEmpty && !isLoading && !hasError && (
                <DataTableEmpty
                    colSpan={columns.length}
                    title="Tidak ada data ditemukan"
                    message={emptyMessage}
                    variant="search"
                />
            )}

            {!isLoading &&
                !isEmpty &&
                !hasError &&
                rows.map((row) => <DataTableRow key={row.id} row={row} />)}
        </tbody>
    );
};

export default DataTableBody;
