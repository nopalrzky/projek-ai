import React from "react";
import { Wallet, Clock, ShieldCheck } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { WalletStatChip } from "./WalletStatChip";

interface WalletBalanceOverviewProps {
    walletBalance: number;
    availableBalance: number;
    pendingWdrTotal: number;
}

export const WalletBalanceOverview: React.FC<WalletBalanceOverviewProps> = ({
    walletBalance,
    availableBalance,
    pendingWdrTotal,
}) => {
    return (
        <div className="space-y-6">
            <div
                className="relative overflow-hidden rounded-[var(--radius-xl)] p-6 border"
                style={{
                    background:
                        "linear-gradient(135deg, var(--color-primary-600) 0%, var(--color-primary-800) 58%, var(--color-primary-900) 100%)",
                    borderColor: "var(--color-primary-700)",
                    boxShadow: "var(--shadow-lg)",
                }}
            >
                <div
                    className="absolute -right-10 -bottom-12 pointer-events-none"
                    style={{ color: "var(--color-primary-200)", opacity: 0.14 }}
                >
                    <Wallet className="w-64 h-64" />
                </div>

                <div
                    className="absolute inset-x-0 top-0 h-px"
                    style={{ backgroundColor: "var(--color-primary-300)" }}
                />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-2">
                        <span
                            className="text-sm font-medium flex items-center gap-2"
                            style={{ color: "var(--color-primary-50)" }}
                        >
                            <Wallet className="w-4 h-4" />
                            Saldo Pendapatan
                        </span>
                        <h2
                            className="text-3xl md:text-4xl font-bold tracking-tight"
                            style={{ color: "var(--color-primary-950)" }}
                        >
                            {formatCurrency(walletBalance)}
                        </h2>
                        <p
                            className="text-sm max-w-xl"
                            style={{ color: "var(--color-primary-100)" }}
                        >
                            Pendapatan yang tercatat dari transaksi customer dan
                            dapat dikelola untuk penarikan dana.
                        </p>
                    </div>

                    <div
                        className="inline-flex items-center gap-2 rounded-[var(--radius-lg)] border px-3 py-2 text-sm font-medium"
                        style={{
                            backgroundColor: "var(--color-primary-700)",
                            borderColor: "var(--color-primary-400)",
                            color: "var(--color-primary-50)",
                        }}
                    >
                        <ShieldCheck className="w-4 h-4" />
                        Saldo Owner
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <WalletStatChip
                    label="Saldo Tersedia"
                    value={formatCurrency(availableBalance)}
                    icon={Wallet}
                    iconColor="var(--color-success-600)"
                    iconBackground="var(--color-success-50)"
                    iconBorderColor="var(--color-success-500)"
                />
                <WalletStatChip
                    label="Penarikan Tertunda"
                    value={formatCurrency(pendingWdrTotal)}
                    icon={Clock}
                    iconColor="var(--color-warning-600)"
                    iconBackground="var(--color-warning-50)"
                    iconBorderColor="var(--color-warning-400)"
                />
            </div>
        </div>
    );
};
