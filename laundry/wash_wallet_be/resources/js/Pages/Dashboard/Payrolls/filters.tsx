import { FilterConfig } from "@/Components/Filters";
import { Outlet } from "@/types";

export const createPayrollFilters = (outlets: Outlet[]): FilterConfig[] => [
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
            { value: "draft", label: "Draft" },
            { value: "paid", label: "Lunas" },
            { value: "cancelled", label: "Dibatalkan" },
        ],
        clearable: true,
    },
    {
        type: "select",
        key: "type",
        label: "Tipe",
        placeholder: "Semua Tipe",
        options: [
            { value: "single", label: "Per Karyawan" },
            { value: "bulk", label: "Massal" },
        ],
        clearable: true,
    },
    {
        type: "select",
        key: "paymentMethod",
        label: "Metode Pembayaran",
        placeholder: "Semua Metode",
        options: [
            { value: "transfer", label: "Transfer Bank" },
            { value: "cash", label: "Tunai" },
            { value: "check", label: "Cek" },
        ],
        clearable: true,
    },

    {
        type: "custom",
        key: "month",
        label: "Bulan",
        render: (value, onChange) => (
            <select
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
            >
                <option value="">Semua Bulan</option>
                {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                        {new Date(2024, i, 1).toLocaleString("id-ID", {
                            month: "long",
                        })}
                    </option>
                ))}
            </select>
        ),
    },
    {
        type: "custom",
        key: "year",
        label: "Tahun",
        render: (value, onChange) => (
            <select
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
            >
                <option value="">Semua Tahun</option>
                {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - 2 + i;
                    return (
                        <option key={year} value={year}>
                            {year}
                        </option>
                    );
                })}
            </select>
        ),
    },
];
