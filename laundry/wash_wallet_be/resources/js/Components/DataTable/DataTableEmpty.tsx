import React from "react";
import { Empty } from "@/Components/State";
import { DataTableEmptyProps } from "./types";

const DataTableEmpty: React.FC<DataTableEmptyProps> = ({
    colSpan,
    title = "Tidak ada data ditemukan",
    message = "Tidak ada data tersedia",
    variant = "search",
}) => {
    return (
        <tr>
            <td colSpan={colSpan} className="px-6 py-0">
                <div className="min-h-[400px] flex items-center justify-center">
                    <Empty title={title} message={message} variant={variant} />
                </div>
            </td>
        </tr>
    );
};

export default DataTableEmpty;
