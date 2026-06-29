import React from "react";
import { flexRender } from "@tanstack/react-table";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { DataTableHeaderProps } from "./types";

const DataTableHeader: React.FC<DataTableHeaderProps> = ({
    headerGroups,
    enableSorting,
}) => {
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
        <thead style={{ backgroundColor: "var(--color-gray-50)" }}>
            {headerGroups.map((headerGroup) => (
                <tr key={headerGroup.id}>
                    {headerGroup.headers.map(
                        (
                            header: DataTableHeaderProps["headerGroups"][number]["headers"][number]
                        ) => (
                            <th
                                key={header.id}
                                className={cn(
                                    "px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-200",
                                    header.column.getCanSort() &&
                                        "cursor-pointer select-none hover:opacity-80",
                                    header.id === "select" && "w-12"
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
                                        header.column.columnDef.header,
                                        header.getContext()
                                    )}
                                    {header.column.getCanSort() && (
                                        <span className="transition-colors duration-200">
                                            {renderSortIcon(
                                                header.column.getIsSorted()
                                            )}
                                        </span>
                                    )}
                                </div>
                            </th>
                        )
                    )}
                </tr>
            ))}
        </thead>
    );
};

export default DataTableHeader;
