import { FilterConfig } from "@/Components/Filters";

export const createCoinTransactionFilters = (
    typeOptions: Array<{ value: string; label: string }>,
    statusOptions: Array<{ value: string; label: string }>,
): FilterConfig[] => [
    {
        type: "select",
        key: "type",
        label: "Tipe Transaksi",
        placeholder: "Semua Tipe",
        options: typeOptions,
        clearable: true,
    },
    {
        type: "select",
        key: "status",
        label: "Status",
        placeholder: "Semua Status",
        options: statusOptions,
        clearable: true,
    },
    {
        type: "custom",
        key: "startDate",
        label: "Tanggal Mulai",
        render: (value, onChange) => (
            <input
                type="date"
                value={value || ""}
                onChange={(e) => onChange(e.target.value || undefined)}
                className="w-full px-3 py-2 rounded-lg border transition-colors duration-200 text-sm"
                style={{
                    backgroundColor: "var(--color-surface)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text-primary)",
                }}
            />
        ),
    },
    {
        type: "custom",
        key: "endDate",
        label: "Tanggal Selesai",
        render: (value, onChange) => (
            <input
                type="date"
                value={value || ""}
                onChange={(e) => onChange(e.target.value || undefined)}
                className="w-full px-3 py-2 rounded-lg border transition-colors duration-200 text-sm"
                style={{
                    backgroundColor: "var(--color-surface)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text-primary)",
                }}
            />
        ),
    },
];
