import { FilterConfig } from "@/Components/Filters";

export const createNotificationFilters = (): FilterConfig[] => [
    {
        type: "select",
        key: "filter",
        label: "Status Baca",
        placeholder: "Semua Status",
        options: [
            { value: "unread", label: "Belum Dibaca" },
            { value: "read", label: "Sudah Dibaca" },
        ],
        clearable: true,
    },
    {
        type: "select",
        key: "type",
        label: "Jenis Notifikasi",
        placeholder: "Semua Jenis",
        options: [
            { value: "deposit", label: "Deposit" },
            { value: "expense", label: "Pengeluaran" },
            { value: "petty_cash", label: "Kas Kecil" },
        ],
        clearable: true,
    },
];
