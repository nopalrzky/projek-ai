import React from "react";
import { flexRender } from "@tanstack/react-table";
import { DataTableCellProps } from "./types";

const DataTableCell: React.FC<DataTableCellProps> = ({ cell }) => {
    return (
        <td
            className="px-6 py-4 text-sm transition-colors duration-200"
            style={{
                color: "var(--color-text-primary)",
            }}
        >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
    );
};

export default DataTableCell;
