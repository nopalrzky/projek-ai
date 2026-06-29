import { FilterConfig } from "@/Components/Filters";
import { Employee, Outlet, Fine } from "@/types";

export const createFineLogFilters = (
    employees: Employee[],
    outlets: Outlet[],
    fines: Fine[],
): FilterConfig[] => [
    {
        type: "select",
        key: "employeeId",
        label: "Karyawan",
        placeholder: "Semua Karyawan",
        options: employees.map((employee) => ({
            value: employee.id,
            label: employee.name,
        })),
        clearable: true,
        searchable: true,
    },
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
        key: "fineId",
        label: "Jenis Denda",
        placeholder: "Semua Jenis Denda",
        options: fines.map((fine) => ({
            value: fine.id,
            label: fine.name,
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
            { value: "unpaid", label: "Belum Dibayar" },
            { value: "paid", label: "Sudah Dibayar" },
            { value: "cancelled", label: "Dibatalkan" },
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
        label: "Jumlah Minimum",
        render: (value, onChange) => (
            <input
                type="number"
                placeholder="Masukkan jumlah minimum"
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
        label: "Jumlah Maksimum",
        render: (value, onChange) => (
            <input
                type="number"
                placeholder="Masukkan jumlah maksimum"
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
