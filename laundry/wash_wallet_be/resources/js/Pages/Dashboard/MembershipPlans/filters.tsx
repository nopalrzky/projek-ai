import { FilterConfig } from "@/Components/Filters";
import { Outlet } from "@/types";

export const createMembershipPlanFilters = (
    outlets: Outlet[],
): FilterConfig[] => [
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
        key: "isActive",
        label: "Status",
        placeholder: "Semua Status",
        options: [
            { value: "true", label: "Aktif" },
            { value: "false", label: "Nonaktif" },
        ],
        clearable: true,
    },
    {
        type: "custom",
        key: "minPrice",
        label: "Harga Min",
        render: (value, onChange) => (
            <input
                type="number"
                placeholder="Contoh: 50000"
                value={value || ""}
                onChange={(e) =>
                    onChange(
                        e.target.value ? parseFloat(e.target.value) : undefined,
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
        key: "maxPrice",
        label: "Harga Max",
        render: (value, onChange) => (
            <input
                type="number"
                placeholder="Contoh: 250000"
                value={value || ""}
                onChange={(e) =>
                    onChange(
                        e.target.value ? parseFloat(e.target.value) : undefined,
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
        key: "minDurationDays",
        label: "Durasi Min (Hari)",
        render: (value, onChange) => (
            <input
                type="number"
                placeholder="Contoh: 30"
                value={value || ""}
                onChange={(e) =>
                    onChange(
                        e.target.value
                            ? parseInt(e.target.value, 10)
                            : undefined,
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
        key: "maxDurationDays",
        label: "Durasi Max (Hari)",
        render: (value, onChange) => (
            <input
                type="number"
                placeholder="Contoh: 365"
                value={value || ""}
                onChange={(e) =>
                    onChange(
                        e.target.value
                            ? parseInt(e.target.value, 10)
                            : undefined,
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
        key: "minDiscountPercentage",
        label: "Diskon Min (%)",
        render: (value, onChange) => (
            <input
                type="number"
                placeholder="Contoh: 5"
                min="0"
                max="100"
                value={value || ""}
                onChange={(e) =>
                    onChange(
                        e.target.value ? parseFloat(e.target.value) : undefined,
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
        key: "maxDiscountPercentage",
        label: "Diskon Max (%)",
        render: (value, onChange) => (
            <input
                type="number"
                placeholder="Contoh: 50"
                min="0"
                max="100"
                value={value || ""}
                onChange={(e) =>
                    onChange(
                        e.target.value ? parseFloat(e.target.value) : undefined,
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
];
