import React from "react";
import {
    Activity,
    AlertCircle,
    Archive,
    Banknote,
    CheckCircle2,
    Clock,
    Coins,
    DollarSign,
    Minus,
    Package,
    Receipt,
    Settings,
    ShoppingBag,
    TrendingDown,
    TrendingUp,
    UserCheck,
    Users,
    UserX,
    Wallet,
    type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatCardProps } from "./types";

const STAT_ICON_MAP: Record<string, LucideIcon> = {
    Activity,
    AlertCircle,
    Archive,
    Banknote,
    CheckCircle2,
    Clock,
    Coins,
    DollarSign,
    Package,
    Receipt,
    Settings,
    ShoppingBag,
    TrendingDown,
    TrendingUp,
    UserCheck,
    Users,
    UserX,
    Wallet,
};

const StatCard = ({
    item,
    animate = true,
    variant = "default",
}: StatCardProps) => {
    const Icon = STAT_ICON_MAP[item.icon] || Activity;

    const variantColors = {
        primary: {
            bg: "from-[var(--color-primary-50)] to-[var(--color-primary-100)]/50 dark:from-[var(--color-primary-900)]/20 dark:to-[var(--color-primary-800)]/10",
            iconBg: "bg-[var(--color-primary-500)]",
            iconText: "text-white",
            border: "border-[var(--color-primary-200)] dark:border-[var(--color-primary-700)]/50",
            text: "text-[var(--color-primary-700)] dark:text-[var(--color-primary-400)]",
        },
        success: {
            bg: "from-[var(--color-success-50)] to-[var(--color-success-100)]/50 dark:from-[var(--color-success-900)]/20 dark:to-[var(--color-success-800)]/10",
            iconBg: "bg-[var(--color-success-500)]",
            iconText: "text-white",
            border: "border-[var(--color-success-200)] dark:border-[var(--color-success-700)]/50",
            text: "text-[var(--color-success-700)] dark:text-[var(--color-success-400)]",
        },
        warning: {
            bg: "from-[var(--color-warning-50)] to-[var(--color-warning-100)]/50 dark:from-[var(--color-warning-900)]/20 dark:to-[var(--color-warning-800)]/10",
            iconBg: "bg-[var(--color-warning-500)]",
            iconText: "text-white",
            border: "border-[var(--color-warning-200)] dark:border-[var(--color-warning-700)]/50",
            text: "text-[var(--color-warning-700)] dark:text-[var(--color-warning-400)]",
        },
        danger: {
            bg: "from-[var(--color-error-50)] to-[var(--color-error-100)]/50 dark:from-[var(--color-error-900)]/20 dark:to-[var(--color-error-800)]/10",
            iconBg: "bg-[var(--color-error-500)]",
            iconText: "text-white",
            border: "border-[var(--color-error-200)] dark:border-[var(--color-error-700)]/50",
            text: "text-[var(--color-error-700)] dark:text-[var(--color-error-400)]",
        },
        info: {
            bg: "from-[var(--color-info-50)] to-[var(--color-info-100)]/50 dark:from-[var(--color-info-900)]/20 dark:to-[var(--color-info-800)]/10",
            iconBg: "bg-[var(--color-info-500)]",
            iconText: "text-white",
            border: "border-[var(--color-info-200)] dark:border-[var(--color-info-700)]/50",
            text: "text-[var(--color-info-700)] dark:text-[var(--color-info-400)]",
        },
        default: {
            bg: "from-[var(--color-gray-50)] to-[var(--color-gray-100)]/50 dark:from-[var(--color-gray-800)]/50 dark:to-[var(--color-gray-700)]/20",
            iconBg: "bg-[var(--color-gray-500)]",
            iconText: "text-white",
            border: "border-[var(--color-border)]",
            text: "text-[var(--color-text-secondary)]",
        },
    };

    const colors = variantColors[item.variant || "default"];

    const getTrendIcon = () => {
        if (!item.trend) return null;

        const trendValue = parseFloat(item.trend.replace(/[^0-9.-]/g, ""));
        if (trendValue > 0) {
            return <TrendingUp className="w-4 h-4" />;
        } else if (trendValue < 0) {
            return <TrendingDown className="w-4 h-4" />;
        }
        return <Minus className="w-4 h-4" />;
    };

    const getTrendColor = () => {
        if (!item.trend) return "";
        const trendValue = parseFloat(item.trend.replace(/[^0-9.-]/g, ""));
        if (trendValue > 0)
            return "text-[var(--color-success-600)] dark:text-[var(--color-success-400)]";
        if (trendValue < 0)
            return "text-[var(--color-error-600)] dark:text-[var(--color-error-400)]";
        return "text-[var(--color-text-tertiary)]";
    };

    return (
        <div
            className={cn(
                "group relative overflow-hidden rounded-2xl border-2 transition-all duration-300",
                "bg-gradient-to-br",
                colors.bg,
                colors.border,
                "hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20",
                animate && "hover:scale-[1.02]",
                variant === "minimal" && "rounded-xl border",
            )}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-white/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                    <div
                        className={cn(
                            "flex h-12 w-12 items-center justify-center rounded-xl shadow-lg",
                            colors.iconBg,
                            "group-hover:shadow-xl group-hover:rotate-3 transition-all duration-300",
                        )}
                    >
                        <Icon className={cn("h-6 w-6", colors.iconText)} />
                    </div>

                    {item.trend && (
                        <div
                            className={cn(
                                "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold",
                                "bg-[var(--color-surface)]/80 backdrop-blur-sm border",
                                getTrendColor(),
                            )}
                        >
                            {getTrendIcon()}
                            <span>{item.trend}</span>
                        </div>
                    )}
                </div>

                <div className="space-y-1">
                    <p className="text-sm font-medium text-[var(--color-text-tertiary)] uppercase tracking-wide">
                        {item.label}
                    </p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-[var(--color-text-primary)]">
                            {item.value}
                        </p>
                        {item.unit && (
                            <span className="text-sm text-[var(--color-text-tertiary)] font-medium">
                                {item.unit}
                            </span>
                        )}
                    </div>
                    {item.subValue && (
                        <p className="text-sm text-[var(--color-text-secondary)] flex items-center gap-1.5">
                            <span
                                className={cn(
                                    "w-1.5 h-1.5 rounded-full",
                                    colors.iconBg,
                                )}
                            />
                            {item.subValue}
                        </p>
                    )}
                </div>

                {item.progress !== undefined && (
                    <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-[var(--color-text-tertiary)]">
                                Progress
                            </span>
                            <span className={cn("font-semibold", colors.text)}>
                                {item.progress}%
                            </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-[var(--color-gray-200)] dark:bg-[var(--color-gray-700)] overflow-hidden">
                            <div
                                style={{ width: `${item.progress}%` }}
                                className={cn(
                                    "h-full rounded-full transition-[width] duration-700",
                                    colors.iconBg,
                                )}
                            />
                        </div>
                    </div>
                )}
            </div>

            <div
                className={cn(
                    "absolute bottom-0 left-0 h-1 w-full",
                    "bg-gradient-to-r",
                    colors.iconBg,
                    "transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left",
                )}
            />
        </div>
    );
};

export default StatCard;
