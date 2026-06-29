import React from "react";
import { Loading } from "@/Components/State";
import { DataTableLoadingProps } from "./types";

const DataTableLoading: React.FC<DataTableLoadingProps> = ({
    rows,
    columns,
}) => {
    return <Loading type="table" rows={rows} columns={columns} />;
};

export default DataTableLoading;
