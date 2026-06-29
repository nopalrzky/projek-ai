import { FilterConfig } from "@/Components/Filters";
import { Outlet } from "@/types";

export const createFineFilters = (outlets: Outlet[]): FilterConfig[] => [
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
];
