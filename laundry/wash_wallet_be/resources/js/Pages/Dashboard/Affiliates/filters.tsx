import { FilterConfig } from "@/Components/Filters";

export const createAffiliateFilters = (): FilterConfig[] => [
    {
        type: "select",
        key: "status",
        label: "Status",
        placeholder: "Semua Status",
        options: [
            { value: "active", label: "Aktif" },
            { value: "inactive", label: "Tidak Aktif" },
            { value: "pending", label: "Pending" },
            { value: "suspended", label: "Suspended" },
        ],
        clearable: true,
    },
];
