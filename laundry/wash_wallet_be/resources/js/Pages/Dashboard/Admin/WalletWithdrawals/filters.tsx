import { FilterConfig } from "@/Components/Filters";

export const createAdminWalletWithdrawalFilters = (): FilterConfig[] => [
    {
        type: "select",
        key: "status",
        label: "Status",
        placeholder: "Semua Status",
        options: [
            { value: "pending", label: "Menunggu" },
            { value: "processing", label: "Diproses" },
            { value: "paid", label: "Dibayar" },
            { value: "rejected", label: "Ditolak" },
            { value: "cancelled", label: "Dibatalkan" },
        ],
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
                className="w-full px-3 py-2 rounded-lg border text-sm"
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
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{
                    backgroundColor: "var(--color-surface)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text-primary)",
                }}
            />
        ),
    },
];
