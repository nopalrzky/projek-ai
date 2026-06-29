import { FilterConfig } from "@/Components/Filters";
import { Outlet, Account } from "@/types";

export const createPriveFilters = (
    outlets: Outlet[],
    sourceAccounts: Account[],
    equityAccounts: Account[],
): FilterConfig[] => [
    {
        type: "select",
        key: "sourceAccountId",
        label: "Akun Sumber",
        placeholder: "Semua Akun Sumber",
        options: sourceAccounts.map((account) => ({
            value: account.id,
            label: `${account.code} - ${account.name}`,
        })),
        clearable: true,
        searchable: true,
    },
    {
        type: "select",
        key: "equityAccountId",
        label: "Akun Modal",
        placeholder: "Semua Akun Modal",
        options: equityAccounts.map((account) => ({
            value: account.id,
            label: `${account.code} - ${account.name}`,
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
    {
        type: "custom",
        key: "minAmount",
        label: "Jumlah Minimum",
        render: (value, onChange) => (
            <input
                type="number"
                placeholder="Contoh: 100000"
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
        key: "maxAmount",
        label: "Jumlah Maksimum",
        render: (value, onChange) => (
            <input
                type="number"
                placeholder="Contoh: 1000000"
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
