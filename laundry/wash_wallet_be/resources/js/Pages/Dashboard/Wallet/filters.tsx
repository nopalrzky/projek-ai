import { FilterConfig } from "@/Components/Filters";

export const createWalletTransactionFilters = (): FilterConfig[] => [
    {
        type: "select",
        key: "type",
        label: "Tipe Transaksi",
        placeholder: "Semua Tipe",
        options: [
            { value: "order_transfer_income", label: "Pendapatan Transfer" },
            { value: "order_wallet_income", label: "Pendapatan Wallet" },
            { value: "withdrawal_request", label: "Penarikan Saldo" },
            { value: "withdrawal_rejected_refund", label: "Refund Penolakan" },
            {
                value: "withdrawal_cancelled_refund",
                label: "Refund Pembatalan",
            },
            { value: "manual_adjustment", label: "Penyesuaian Manual" },
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
];
