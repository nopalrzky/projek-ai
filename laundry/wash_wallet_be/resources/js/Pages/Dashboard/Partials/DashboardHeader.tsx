import React from "react";
import { usePage, Link } from "@inertiajs/react";
import {
    ShoppingCart,
    ArrowDownToLine,
    FileText,
    TrendingUp,
    RefreshCw,
    Sun,
    Sunset,
    Moon,
    ChevronDown,
    ArrowRight,
} from "lucide-react";
import { DashboardPeriod, OutletOption } from "../types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/id";

dayjs.extend(relativeTime);
dayjs.locale("id");

interface DashboardHeaderProps {
    period: DashboardPeriod;
    outletId: number | null;
    outlets: OutletOption[];
    generatedAt: string;
    onFilterChange: (period: DashboardPeriod, outletId: number | null) => void;
    isUpdating: boolean;
}

const quickActions = [
    {
        label: "Lihat Order",
        routeName: "orders.index",
        icon: ShoppingCart,
        bg: "var(--color-primary-50)",
        border: "var(--color-primary-200)",
        iconColor: "var(--color-primary-600)",
        textColor: "var(--color-primary-700)",
        activeBar: "var(--color-primary-500)",
        iconBg: "var(--color-primary-100)",
    },
    {
        label: "Tarik Saldo",
        routeName: "wallet-withdrawals.create",
        icon: ArrowDownToLine,
        bg: "var(--color-success-50)",
        border: "var(--color-success-200)",
        iconColor: "var(--color-success-600)",
        textColor: "var(--color-success-700)",
        activeBar: "var(--color-success-500)",
        iconBg: "var(--color-success-100)",
    },
    {
        label: "Pengeluaran",
        routeName: "expenses.index",
        icon: FileText,
        bg: "var(--color-warning-50)",
        border: "var(--color-warning-200)",
        iconColor: "var(--color-warning-600)",
        textColor: "var(--color-warning-700)",
        activeBar: "var(--color-warning-500)",
        iconBg: "var(--color-warning-100)",
    },
    {
        label: "Laba Rugi",
        routeName: "profit-loss.index",
        icon: TrendingUp,
        bg: "var(--color-info-50)",
        border: "var(--color-info-200)",
        iconColor: "var(--color-info-600)",
        textColor: "var(--color-info-700)",
        activeBar: "var(--color-info-500)",
        iconBg: "var(--color-info-100)",
    },
];

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    period,
    outletId,
    outlets,
    generatedAt,
    onFilterChange,
    isUpdating,
}) => {
    const { auth } = usePage().props as any;
    const user = auth?.user;

    const currentHour = new Date().getHours();
    const greeting =
        currentHour < 12
            ? "Selamat Pagi"
            : currentHour < 18
            ? "Selamat Siang"
            : "Selamat Malam";

    const GreetingIcon =
        currentHour < 12 ? Sun : currentHour < 18 ? Sunset : Moon;

    const periods: { value: DashboardPeriod; label: string }[] = [
        { value: "today", label: "Hari ini" },
        { value: "7d", label: "7 Hari" },
        { value: "30d", label: "30 Hari" },
        { value: "90d", label: "90 Hari" },
    ];

    return (
        <div className="relative flex flex-col gap-6 lg:gap-8 mb-6">

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="flex flex-col gap-2">
                    <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full glass w-fit shadow-sm">
                        <GreetingIcon
                            className="w-4 h-4"
                            style={{ color: "var(--color-accent-500)" }}
                        />
                        <span
                            className="text-sm font-semibold tracking-wide"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            {greeting}
                        </span>
                    </div>
                    <h1
                        className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Halo, <span className="gradient-text">{user?.name || "Owner"}</span> 👋
                    </h1>
                    <div
                        className="flex items-center gap-2 text-sm mt-1"
                        style={{ color: "var(--color-text-tertiary)" }}
                    >
                        <div className="p-1 rounded-full" style={{ backgroundColor: isUpdating ? 'var(--color-primary-50)' : 'var(--color-surface-muted)' }}>
                            <RefreshCw
                                className={`w-3.5 h-3.5 ${isUpdating ? "animate-spin" : ""}`}
                                style={{ color: isUpdating ? 'var(--color-primary-500)' : 'var(--color-text-tertiary)' }}
                            />
                        </div>
                        <span>
                            Update terakhir:{" "}
                            <span className="font-medium" style={{ color: "var(--color-text-secondary)" }}>
                                {dayjs(generatedAt).fromNow()}
                            </span>
                        </span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 glass p-2 rounded-2xl shadow-sm">
                    <div className="flex p-1 rounded-xl gap-1" style={{ backgroundColor: "var(--color-surface-muted)" }}>
                        {periods.map((p) => (
                            <button
                                key={p.value}
                                onClick={() => onFilterChange(p.value, outletId)}
                                disabled={isUpdating}
                                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 whitespace-nowrap disabled:opacity-60 ${
                                    period === p.value ? "shadow-md scale-105" : "hover:bg-black/5 dark:hover:bg-white/5"
                                }`}
                                style={{
                                    backgroundColor: period === p.value ? "var(--color-primary-500)" : "transparent",
                                    color: period === p.value ? "#ffffff" : "var(--color-text-secondary)",
                                }}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>

                    {outlets.length > 0 && (
                        <div className="relative min-w-[180px]">
                            <select
                                value={outletId === null ? "" : outletId.toString()}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    onFilterChange(period, val === "" ? null : parseInt(val));
                                }}
                                disabled={isUpdating}
                                className="w-full text-sm font-medium rounded-xl pr-10 pl-4 appearance-none transition-all duration-300 disabled:opacity-60 hover:shadow-md focus:ring-2 focus:ring-primary-500 outline-none"
                                style={{
                                    backgroundColor: "var(--color-surface)",
                                    border: "1px solid var(--color-border)",
                                    color: "var(--color-text-primary)",
                                    height: "44px",
                                    cursor: "pointer",
                                }}
                            >
                                <option value="">🏢 Semua Outlet</option>
                                {outlets.map((o) => (
                                    <option key={o.id} value={o.id}>
                                        {o.name}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md pointer-events-none" style={{ backgroundColor: 'var(--color-surface-muted)' }}>
                                <ChevronDown
                                    className="w-4 h-4"
                                    style={{ color: "var(--color-text-secondary)" }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                {quickActions.map(
                    ({ label, routeName, icon: Icon, bg, border, iconColor, textColor, activeBar, iconBg }) => (
                        <Link
                            key={routeName}
                            href={route(routeName)}
                            className="group relative flex flex-col p-5 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 glass"
                            style={{
                                backgroundColor: bg,
                                borderColor: border,
                                borderWidth: '1px',
                                borderStyle: 'solid'
                            }}
                        >
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300" style={{ backgroundColor: textColor }}></div>
                            
                            <div
                                className="absolute bottom-0 left-0 h-1.5 w-0 group-hover:w-full transition-all duration-500 ease-out"
                                style={{ backgroundColor: activeBar }}
                            />

                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm"
                                    style={{ backgroundColor: iconBg }}
                                >
                                    <Icon className="w-6 h-6" style={{ color: iconColor }} />
                                </div>
                                <div className="w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0" style={{ backgroundColor: 'var(--color-surface-overlay)' }}>
                                    <ArrowRight className="w-4 h-4" style={{ color: iconColor }} />
                                </div>
                            </div>
                            
                            <div className="relative z-10">
                                <span
                                    className="text-base font-bold tracking-tight block transition-colors duration-300"
                                    style={{ color: textColor }}
                                >
                                    {label}
                                </span>
                            </div>
                        </Link>
                    )
                )}
            </div>
        </div>
    );
};

export default DashboardHeader;
