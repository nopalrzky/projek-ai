import { FilterConfig } from "@/Components/Filters/types";

export const createFeatureFilters = (): FilterConfig[] => [
    {
        key: "isActive",
        label: "Status",
        type: "select",
        options: [
            { label: "Semua Status", value: "" },
            { label: "Aktif", value: "1" },
            { label: "Nonaktif", value: "0" },
        ],
    },
];
