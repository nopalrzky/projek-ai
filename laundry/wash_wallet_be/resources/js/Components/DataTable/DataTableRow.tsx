import React from "react";
import { cn } from "@/lib/utils";
import { DataTableRowProps } from "./types";
import DataTableCell from "./DataTableCell";

const DataTableRow: React.FC<DataTableRowProps> = ({ row }) => {
    return (
        <tr
            className={cn(
                "transition-all duration-200 hover:opacity-80",
                row.getIsSelected() && "opacity-90"
            )}
            style={{
                backgroundColor: row.getIsSelected()
                    ? "var(--color-primary-50)"
                    : "transparent",
            }}
        >
            {row
                .getVisibleCells()
                .map((cell: ReturnType<typeof row.getVisibleCells>[number]) => (
                    <DataTableCell key={cell.id} cell={cell} />
                ))}
        </tr>
    );
};

export default DataTableRow;
