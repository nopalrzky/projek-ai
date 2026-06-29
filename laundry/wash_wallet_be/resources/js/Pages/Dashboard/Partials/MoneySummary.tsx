import React from "react";
import {
    ArrowDownToLine,
    Banknote,
    ChevronRight,
    Coins,
    Landmark,
    Wallet,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import { Label } from "@/Components/Label";
import { OwnerDashboardMoneySummary } from "../types";

interface MoneySummaryProps {
    money: OwnerDashboardMoneySummary;
}

const formatRupiah = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);

const SummaryRow: React.FC<{
    label: string;
    value: React.ReactNode;
    icon?: React.ReactNode;
    className?: string;
}> = ({ label, value, icon, className }) => (
    <div
        className={`flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 ${className ?? ""}`}
    >
        <span className="flex min-w-0 items-center gap-2 text-sm text-[var(--color-text-secondary)]">
            {icon && (
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface-muted)] text-[var(--color-text-tertiary)]">
                    {icon}
                </span>
            )}
            <span className="truncate">{label}</span>
        </span>
        <span className="shrink-0 text-right text-sm font-semibold text-[var(--color-text-primary)]">
            {value}
        </span>
    </div>
);

const MoneySummary: React.FC<MoneySummaryProps> = ({ money }) => {
    return (
        <Card
            variant="elevated"
            className="flex h-full flex-col overflow-hidden border-[var(--color-primary-100)] bg-[linear-gradient(180deg,var(--color-primary-50),var(--color-surface)_42%,var(--color-surface))] dark:border-[var(--color-primary-200)]/30 dark:bg-[var(--color-surface)]"
        >
            <CardHeader
                className="border-[var(--color-primary-100)] bg-[var(--color-surface-overlay)]"
                action={
                    <Button
                        href={route("wallet-withdrawals.index")}
                        variant="ghost"
                        size="sm"
                        rightIcon={<ChevronRight className="h-3.5 w-3.5" />}
                        className="text-[var(--color-primary-700)] hover:bg-[var(--color-primary-100)]"
                        tooltip="Lihat semua penarikan"
                    >
                        Riwayat
                    </Button>
                }
            >
                <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-primary-600)] text-white shadow-[var(--shadow-sm)]">
                        <Wallet className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                        <CardTitle className="text-base text-[var(--color-text-primary)]">
                            Uang &amp; Aset
                        </CardTitle>
                        <p className="mt-1 truncate text-xs text-[var(--color-text-secondary)]">
                            Saldo, penarikan, koin, kas, dan bank.
                        </p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col gap-5">
                <section className="rounded-[var(--radius-lg)] border border-[var(--color-primary-100)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-sm)]">
                    <Label as="span" size="sm" tone="muted" className="uppercase">
                        Total Saldo Dompet
                    </Label>
                    <div className="mt-2 text-3xl font-bold leading-none tracking-tight text-[var(--color-primary-800)] dark:text-[var(--color-primary-900)]">
                        {formatRupiah(money.walletBalance)}
                    </div>

                    <div className="mt-4 space-y-2">
                        <SummaryRow
                            label="Tersedia ditarik"
                            icon={<ArrowDownToLine className="h-4 w-4" />}
                            value={
                                <Badge variant="success" size="sm" rounded="md">
                                    {formatRupiah(
                                        money.availableWalletBalance,
                                    )}
                                </Badge>
                            }
                        />

                        {money.pendingWithdrawalAmount > 0 && (
                            <SummaryRow
                                label="Proses penarikan"
                                icon={<Banknote className="h-4 w-4" />}
                                value={
                                    <Badge
                                        variant="warning"
                                        size="sm"
                                        rounded="md"
                                    >
                                        {formatRupiah(
                                            money.pendingWithdrawalAmount,
                                        )}
                                    </Badge>
                                }
                            />
                        )}

                        {money.coinBalance > 0 && (
                            <SummaryRow
                                label="Koin"
                                icon={<Coins className="h-4 w-4" />}
                                value={
                                    <Badge
                                        variant="secondary"
                                        size="sm"
                                        rounded="md"
                                        className="bg-[var(--color-accent-100)] text-[var(--color-accent-800)]"
                                    >
                                        {money.coinBalance.toLocaleString(
                                            "id-ID",
                                        )}
                                    </Badge>
                                }
                            />
                        )}
                    </div>
                </section>

                <section className="flex-1">
                    <Label as="span" size="sm" tone="muted" className="uppercase">
                        Ringkasan Kas &amp; Bank
                    </Label>
                    <div className="mt-3 space-y-2">
                        {money.assetSummary.length > 0 ? (
                            money.assetSummary.map((asset, idx) => (
                                <SummaryRow
                                    key={idx}
                                    label={asset.label}
                                    icon={<Landmark className="h-4 w-4" />}
                                    value={asset.formatted}
                                />
                            ))
                        ) : (
                            <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-5 text-center text-sm text-[var(--color-text-tertiary)]">
                                Belum ada data kas / bank
                            </div>
                        )}
                    </div>
                </section>
            </CardContent>

            <CardFooter className="border-[var(--color-primary-100)] bg-[var(--color-surface-muted)]">
                <Button
                    href={route("wallet-withdrawals.create")}
                    variant="primary"
                    fullWidth
                    leftIcon={<ArrowDownToLine className="h-4 w-4" />}
                >
                    Tarik Saldo Tersedia
                </Button>
            </CardFooter>
        </Card>
    );
};

export default MoneySummary;
