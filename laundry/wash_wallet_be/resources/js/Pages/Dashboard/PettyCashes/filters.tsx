import { FilterConfig } from "@/Components/Filters";
import { Outlet } from "@/types";

export const createPettyCashFilters = (outlets: Outlet[]): FilterConfig[] => [
    {
        type: "select",
        key: "outletId",
        label: "Outlet",
        placeholder: "Semua Outlet",
        options: outlets.map((outlet) => ({
            value: outlet.id,
            label: `${outlet.name} (${outlet.code})`,
        })),
        clearable: true,
        searchable: true,
    },
    {
        type: "select",
        key: "status",
        label: "Status",
        placeholder: "Semua Status",
        options: [
            { value: "pending", label: "Menunggu Persetujuan" },
            { value: "approved", label: "Disetujui" },
            { value: "rejected", label: "Ditolak" },
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
        label: "Tanggal Akhir",
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
