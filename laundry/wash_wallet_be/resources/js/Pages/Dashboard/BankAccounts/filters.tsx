import { FilterConfig } from "@/Components/Filters";

export const createBankAccountFilters = (): FilterConfig[] => [
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
