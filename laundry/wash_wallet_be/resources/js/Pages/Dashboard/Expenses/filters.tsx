import { FilterConfig } from "@/Components/Filters";
import { Outlet, Account } from "@/types";

export const createExpenseFilters = (
    outlets: Outlet[],
    expenseAccounts: Account[],
    sourceAccounts: Account[],
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
        key: "expenseAccountId",
        label: "Akun Pengeluaran",
        placeholder: "Semua Akun",
        options: expenseAccounts.map((account) => ({
            value: account.id,
            label: `${account.name} (${account.code})`,
        })),
        clearable: true,
        searchable: true,
    },
    {
        type: "select",
        key: "sourceAccountId",
        label: "Sumber Dana",
        placeholder: "Semua Sumber",
        options: sourceAccounts.map((account) => ({
            value: account.id,
            label: `${account.name} (${account.code})`,
        })),
        clearable: true,
        searchable: true,
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
    {
        type: "select",
        key: "hasAttachment",
        label: "Lampiran",
        placeholder: "Semua",
        options: [
            { value: true, label: "Ada Lampiran" },
            { value: false, label: "Tanpa Lampiran" },
        ],
        clearable: true,
    },
];
