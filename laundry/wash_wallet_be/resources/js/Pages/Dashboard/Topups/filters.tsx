import { FilterConfig } from "@/Components/Filters";

export const createTopupFilters = (filterOptions: {
    statusOptions: Array<{ value: string; label: string }>;
    paymentStatusOptions: Array<{ value: string; label: string }>;
}): FilterConfig[] => [
    {
        type: "select",
        key: "status",
        label: "Status",
        placeholder: "Semua Status",
        options: filterOptions.statusOptions,
        clearable: true,
    },
    {
        type: "select",
        key: "paymentStatus",
        label: "Status Pembayaran",
        placeholder: "Semua Status Pembayaran",
        options: filterOptions.paymentStatusOptions,
        clearable: true,
    },
    {
        type: "date",
        key: "startDate",
        label: "Tanggal Mulai",
        placeholder: "Pilih tanggal mulai",
    },
    {
        type: "date",
        key: "endDate",
        label: "Tanggal Akhir",
        placeholder: "Pilih tanggal akhir",
    },
];
