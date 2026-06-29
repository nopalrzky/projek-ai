import { FilterConfig } from "@/Components/Filters/types";

export const createSalaryFilters = (): FilterConfig[] => [
    {
        type: "select",
        key: "type",
        label: "Tipe Komponen",
        placeholder: "Semua Tipe",
        options: [
            { value: "daily", label: "Harian" },
            { value: "monthly", label: "Bulanan" },
            { value: "hourly", label: "Per Jam" },
            { value: "once", label: "Sekali" },
            { value: "overtime", label: "Lembur" },
            { value: "allowance", label: "Tunjangan" },
        ],
        clearable: true,
    },
];
