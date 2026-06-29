import { FilterConfig } from "@/Components/Filters";

export const createSettingFilters = (): FilterConfig[] => [
    {
        type: "search",
        key: "search",
        label: "Cari Pengaturan",
        placeholder: "Cari berdasarkan key atau nama...",
    },
];
