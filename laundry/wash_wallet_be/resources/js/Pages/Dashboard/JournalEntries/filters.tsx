import { FilterConfig } from "@/Components/Filters";
import { Outlet } from "@/types";

export const createJournalEntryFilters = (
    outlets: Outlet[],
): FilterConfig[] => [
    {
        type: "select",
        key: "outletId",
        label: "Outlet",
        placeholder: "Semua Outlet",
        options: [
            { value: "", label: "Semua Outlet" },
            ...outlets.map((outlet) => ({
                value: outlet.id,
                label: `${outlet.name}${
                    outlet.code ? ` (${outlet.code})` : ""
                }`,
            })),
        ],
        clearable: true,
        searchable: true,
    },
    {
        type: "select",
        key: "isManual",
        label: "Jenis Entry",
        placeholder: "Semua Jenis",
        options: [
            { value: "", label: "Semua Jenis" },
            { value: "1", label: "Manual" },
            { value: "0", label: "Otomatis" },
        ],
        clearable: true,
    },
    {
        type: "select",
        key: "referenceType",
        label: "Tipe Referensi",
        placeholder: "Semua Tipe",
        options: [
            { value: "", label: "Semua Tipe" },
            { value: "loan", label: "Kasbon" },
            { value: "loan_payment", label: "Pembayaran Kasbon" },
            { value: "fine_log", label: "Denda" },
            { value: "expense", label: "Pengeluaran" },
            { value: "income", label: "Pemasukan" },
        ],
        clearable: true,
    },
    {
        type: "custom",
        key: "dateFrom",
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
        key: "dateTo",
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
    {
        type: "custom",
        key: "minAmount",
        label: "Nominal Minimum",
        render: (value, onChange) => (
            <input
                type="number"
                placeholder="Masukkan nominal minimum"
                value={value ?? ""}
                onChange={(e) =>
                    onChange(
                        e.target.value ? Number(e.target.value) : undefined,
                    )
                }
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
        key: "maxAmount",
        label: "Nominal Maksimum",
        render: (value, onChange) => (
            <input
                type="number"
                placeholder="Masukkan nominal maksimum"
                value={value ?? ""}
                onChange={(e) =>
                    onChange(
                        e.target.value ? Number(e.target.value) : undefined,
                    )
                }
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
        type: "select",
        key: "balanced",
        label: "Status Balance",
        placeholder: "Semua Status",
        options: [
            { value: "", label: "Semua Status" },
            { value: "1", label: "Balanced" },
            { value: "0", label: "Unbalanced" },
        ],
        clearable: true,
    },
];
