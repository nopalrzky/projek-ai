import { FilterConfig } from "@/Components/Filters";
import { Outlet } from "@/types";

export const createPositionFilters = (outlets: Outlet[]): FilterConfig[] => [
    {
        type: "select",
        key: "outletId",
        label: "Outlet",
        placeholder: "Semua Outlet",
        options: outlets.map((outlet) => ({
            value: outlet.id,
            label: `${outlet.name} (${outlet.code})`,
        })),
        clearable: true,
        searchable: true,
    },
    {
        type: "select",
        key: "isActive",
        label: "Status",
        placeholder: "Semua Status",
        options: [
            { value: "true", label: "Aktif" },
            { value: "false", label: "Nonaktif" },
        ],
        clearable: true,
    },
];
