import { FilterConfig } from "@/Components/Filters";
import { Employee, Outlet } from "@/types";

export const createLoanFilters = (
    employees: Employee[],
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
        key: "status",
        label: "Status",
        placeholder: "Semua Status",
        options: [
            { value: "ongoing", label: "Berjalan" },
            { value: "paid", label: "Lunas" },
            { value: "bad_debt", label: "Macet" },
        ],
        clearable: true,
    },
    {
        type: "select",
        key: "repaymentType",
        label: "Jenis Pembayaran",
        placeholder: "Semua Jenis",
        options: [
            { value: "full", label: "Sekaligus" },
            { value: "installment", label: "Cicilan" },
        ],
        clearable: true,
    },
    {
        type: "custom",
        key: "loanDateFrom",
        label: "Tanggal Kasbon Dari",
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
        key: "loanDateTo",
        label: "Tanggal Kasbon Sampai",
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
        label: "Nominal Kasbon Minimum",
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
        label: "Nominal Kasbon Maksimum",
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
        type: "custom",
        key: "minRemainingAmount",
        label: "Sisa Kasbon Minimum",
        render: (value, onChange) => (
            <input
                type="number"
                placeholder="Masukkan sisa minimum"
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
        key: "maxRemainingAmount",
        label: "Sisa Kasbon Maksimum",
        render: (value, onChange) => (
            <input
                type="number"
                placeholder="Masukkan sisa maksimum"
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
