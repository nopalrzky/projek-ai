import React from "react";
import { OwnerDashboardKpis } from "../types";
import {
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    ArrowDownRight,
    Minus,
    ShoppingBag,
    Receipt,
    AlertCircle,
    DollarSign,
} from "lucide-react";

interface KpiGridProps {
    kpis: OwnerDashboardKpis;
}

const formatRupiah = (amount: number) => {
    if (Math.abs(amount) >= 1_000_000_000) {
        return `Rp ${(amount / 1_000_000_000).toFixed(1)}M`;
    }
    if (Math.abs(amount) >= 1_000_000) {
        return `Rp ${(amount / 1_000_000).toFixed(amount % 1_000_000 === 0 ? 0 : 1)}JT`;
    }
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const formatRupiahFull = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);

type ColorScheme = "primary" | "success" | "warning" | "error" | "info" | "purple";

const schemeVars: Record<
    ColorScheme,
    { iconBg: string; iconColor: string; accent: string }
> = {
    primary: {
        iconBg: "var(--color-primary-100)",
        iconColor: "var(--color-primary-600)",
        accent: "var(--color-primary-500)",
    },
    success: {
        iconBg: "var(--color-success-100)",
        iconColor: "var(--color-success-600)",
        accent: "var(--color-success-500)",
    },
    warning: {
        iconBg: "var(--color-warning-100)",
        iconColor: "var(--color-warning-600)",
        accent: "var(--color-warning-500)",
    },
    error: {
        iconBg: "var(--color-error-100)",
        iconColor: "var(--color-error-600)",
        accent: "var(--color-error-500)",
    },
    info: {
        iconBg: "var(--color-info-100)",
        iconColor: "var(--color-info-600)",
        accent: "var(--color-info-500)",
    },
    purple: {
        iconBg: "var(--color-purple-100)",
        iconColor: "var(--color-purple-600)",
        accent: "var(--color-purple-500)",
    },
};

const KpiCard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    trend?: { value: number; label: string; type: "positive" | "negative" | "neutral" };
    colorScheme?: ColorScheme;
}> = ({ title, value, subtitle, icon, trend, colorScheme = "primary" }) => {
    const scheme = schemeVars[colorScheme];

    return (
        <div
            className="card group relative flex h-full min-h-[9.5rem] flex-col gap-4 overflow-hidden p-5 transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: "var(--color-surface)" }}
        >
            <div
                className="absolute top-0 right-0 w-20 h-20 rounded-bl-[40px] opacity-[0.06] transition-opacity group-hover:opacity-[0.1]"
                style={{ background: scheme.accent }}
            />

            <div className="flex justify-between items-start gap-3">
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <p
                        className="text-xs font-semibold uppercase tracking-wider truncate"
                        style={{ color: "var(--color-text-tertiary)" }}
                    >
                        {title}
                    </p>
                    <p
                        className="text-2xl font-bold tracking-tight leading-none truncate"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        {value}
                    </p>
                </div>

                <div
                    className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                    style={{ background: scheme.iconBg }}
                >
                    <span style={{ color: scheme.iconColor }}>{icon}</span>
                </div>
            </div>

            {(subtitle || trend) && (
                <div
                    className="mt-auto flex items-center gap-2 pt-1 text-xs"
                    style={{ borderTop: "1px solid var(--color-border-light)" }}
                >
                    {trend && (
                        <span
                            className="flex items-center gap-0.5 font-semibold"
                            style={{
                                color:
                                    trend.type === "positive"
                                        ? "var(--color-success-600)"
                                        : trend.type === "negative"
                                        ? "var(--color-error-600)"
                                        : "var(--color-text-tertiary)",
                            }}
                        >
                            {trend.type === "positive" ? (
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            ) : trend.type === "negative" ? (
                                <ArrowDownRight className="w-3.5 h-3.5" />
                            ) : (
                                <Minus className="w-3.5 h-3.5" />
                            )}
                            {trend.value}%
                        </span>
                    )}
                    {trend && subtitle && (
                        <span style={{ color: "var(--color-border)" }}>
                            &middot;
                        </span>
                    )}
                    {subtitle && (
                        <span
                            className="truncate"
                            style={{ color: "var(--color-text-tertiary)" }}
                        >
                            {subtitle}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

const KpiGrid: React.FC<KpiGridProps> = ({ kpis }) => {
    return (
        <div className="grid h-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:auto-rows-fr">
            <KpiCard
                title="Pendapatan Hari Ini"
                value={formatRupiah(kpis.todayRevenue)}
                subtitle={`${kpis.todayOrdersCount} pesanan`}
                icon={<TrendingUp className="w-5 h-5" />}
                colorScheme="success"
            />

            <KpiCard
                title="Pesanan Aktif"
                value={kpis.activeOrdersCount}
                subtitle="Sedang diproses"
                icon={<ShoppingBag className="w-5 h-5" />}
                colorScheme="primary"
            />

            <KpiCard
                title="Tagihan Belum Lunas"
                value={kpis.unpaidOrdersCount}
                subtitle={`Total: ${formatRupiah(kpis.outstandingAmount)}`}
                icon={<Receipt className="w-5 h-5" />}
                colorScheme={kpis.unpaidOrdersCount > 5 ? "error" : "warning"}
            />

            <KpiCard
                title="Pendapatan Periode"
                value={formatRupiah(kpis.periodRevenue)}
                subtitle={`${kpis.periodOrdersCount} pesanan selesai`}
                icon={<DollarSign className="w-5 h-5" />}
                colorScheme="info"
            />

            {kpis.periodNetProfit !== null ? (
                <KpiCard
                    title="Laba Bersih"
                    value={formatRupiahFull(kpis.periodNetProfit)}
                    subtitle="Periode dipilih"
                    icon={
                        kpis.periodNetProfit >= 0 ? (
                            <TrendingUp className="w-5 h-5" />
                        ) : (
                            <TrendingDown className="w-5 h-5" />
                        )
                    }
                    colorScheme={kpis.periodNetProfit >= 0 ? "success" : "error"}
                />
            ) : (
                <KpiCard
                    title="Pengeluaran"
                    value={formatRupiah(kpis.periodExpense)}
                    subtitle="Disetujui"
                    icon={<TrendingDown className="w-5 h-5" />}
                    colorScheme="error"
                />
            )}

            <KpiCard
                title="Perlu Persetujuan"
                value={kpis.pendingApprovalsCount}
                subtitle="Menunggu review"
                icon={<AlertCircle className="w-5 h-5" />}
                colorScheme={kpis.pendingApprovalsCount > 0 ? "warning" : "success"}
            />
        </div>
    );
};

export default KpiGrid;
