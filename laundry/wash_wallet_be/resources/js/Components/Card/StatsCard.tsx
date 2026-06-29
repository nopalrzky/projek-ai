import React, { forwardRef } from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatsCardProps } from "./types";

const StatsCard = forwardRef<HTMLDivElement, StatsCardProps>(
    (
        {
            label,
            value,
            icon: Icon,
            variant = "default",
            description,
            change,
            loading = false,
            onClick,
            className,
            size = "md",
            bordered = true,
            elevated = false,
            isGlass = false,
            ...props
        },
        ref,
    ) => {
        const variants = {
            default: {
                bg: "bg-[var(--color-surface)]",
                icon: "bg-gradient-to-br from-[var(--color-gray-100)] to-[var(--color-gray-200)] text-[var(--color-gray-600)] dark:from-[var(--color-gray-800)] dark:to-[var(--color-gray-900)] dark:text-[var(--color-gray-300)]",
                text: "text-[var(--color-text-primary)]",
                border: "border-[var(--color-border)]",
            },
            primary: {
                bg: "bg-gradient-to-br from-[var(--color-primary-50)] to-white dark:from-[var(--color-primary-900)]/20 dark:to-transparent",
                icon: "bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-600)] text-white shadow-lg shadow-[var(--color-primary-500)]/20",
                text: "text-[var(--color-primary-900)] dark:text-[var(--color-primary-100)]",
                border: "border-[var(--color-primary-200)] dark:border-[var(--color-primary-800)]",
            },
            success: {
                bg: "bg-gradient-to-br from-[var(--color-success-50)] to-white dark:from-[var(--color-success-900)]/20 dark:to-transparent",
                icon: "bg-gradient-to-br from-[var(--color-success-500)] to-[var(--color-success-600)] text-white shadow-lg shadow-[var(--color-success-500)]/20",
                text: "text-[var(--color-success-900)] dark:text-[var(--color-success-100)]",
                border: "border-[var(--color-success-200)] dark:border-[var(--color-success-800)]",
            },
            warning: {
                bg: "bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20 dark:to-transparent",
                icon: "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/20",
                text: "text-orange-900 dark:text-orange-100",
                border: "border-orange-200 dark:border-orange-800",
            },
            danger: {
                bg: "bg-gradient-to-br from-red-50 to-white dark:from-red-950/20 dark:to-transparent",
                icon: "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/20",
                text: "text-red-900 dark:text-red-100",
                border: "border-red-200 dark:border-red-800",
            },
            info: {
                bg: "bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-transparent",
                icon: "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20",
                text: "text-blue-900 dark:text-blue-100",
                border: "border-blue-200 dark:border-blue-800",
            },
        };

        const sizes = {
            sm: {
                p: "p-3 sm:p-4",
                val: "text-xl sm:text-2xl",
                icon: "p-2",
                iconSize: 18,
            },
            md: {
                p: "p-4 sm:p-5 md:p-6",
                val: "text-2xl sm:text-3xl",
                icon: "p-2.5 sm:p-3",
                iconSize: 24,
            },
            lg: {
                p: "p-5 sm:p-6 md:p-7",
                val: "text-3xl sm:text-4xl",
                icon: "p-3 sm:p-4",
                iconSize: 32,
            },
        };

        const theme = variants[variant];
        const dims = sizes[size];

        if (loading) {
            return (
                <div
                    ref={ref}
                    className={cn(
                        "rounded-[var(--radius-lg)] animate-pulse border border-[var(--color-border)] bg-[var(--color-surface)]",
                        dims.p,
                        className,
                    )}
                    {...props}
                >
                    <div className="flex justify-between items-start gap-4">
                        <div className="space-y-3 w-full">
                            <div className="h-3 sm:h-4 w-1/3 bg-[var(--color-skeleton-via)] rounded" />
                            <div className="h-6 sm:h-8 w-1/2 bg-[var(--color-skeleton-via)] rounded" />
                        </div>
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-[var(--color-skeleton-via)]" />
                    </div>
                    <div className="mt-3 sm:mt-4 h-3 sm:h-4 w-2/3 bg-[var(--color-skeleton-via)] rounded" />
                </div>
            );
        }

        return (
            <div
                ref={ref}
                className={cn(
                    "rounded-[var(--radius-lg)] transition-all duration-300",
                    "hover:scale-[1.02] active:scale-[0.98]",
                    dims.p,
                    theme.bg,
                    bordered && !isGlass && `border ${theme.border}`,
                    elevated &&
                        "shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] dark:shadow-black/20",
                    isGlass &&
                        "glass border-white/20 dark:border-white/10 shadow-xl backdrop-blur-xl",
                    onClick &&
                        "cursor-pointer hover:-translate-y-1 hover:shadow-[var(--shadow-xl)]",
                    className,
                )}
                onClick={onClick}
                {...props}
            >
                <div className="flex justify-between items-start gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-[var(--color-text-secondary)] truncate mb-1">
                            {label}
                        </p>
                        <h3
                            className={cn(
                                "font-bold tracking-tight",
                                dims.val,
                                theme.text,
                            )}
                        >
                            {value}
                        </h3>
                    </div>

                    {Icon && (
                        <div
                            className={cn(
                                "rounded-xl flex-shrink-0 flex items-center justify-center",
                                "transform transition-transform duration-300",
                                "hover:scale-110 hover:rotate-3",
                                theme.icon,
                                dims.icon,
                            )}
                        >
                            {React.isValidElement(Icon) ? (
                                React.cloneElement(Icon as any, {
                                    size: dims.iconSize,
                                })
                            ) : (
                                <span className="font-bold">?</span>
                            )}
                        </div>
                    )}
                </div>

                {(change || description) && (
                    <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                        {change && (
                            <span
                                className={cn(
                                    "inline-flex items-center gap-1 font-medium rounded-full px-2 py-0.5 text-xs",
                                    "transition-all duration-300 hover:scale-105",
                                    change.trend === "up" &&
                                        "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
                                    change.trend === "down" &&
                                        "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
                                    change.trend === "neutral" &&
                                        "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
                                )}
                            >
                                {change.trend === "up" && (
                                    <ArrowUpRight
                                        size={12}
                                        className="sm:w-3.5 sm:h-3.5"
                                    />
                                )}
                                {change.trend === "down" && (
                                    <ArrowDownRight
                                        size={12}
                                        className="sm:w-3.5 sm:h-3.5"
                                    />
                                )}
                                {change.trend === "neutral" && (
                                    <Minus
                                        size={12}
                                        className="sm:w-3.5 sm:h-3.5"
                                    />
                                )}
                                <span className="whitespace-nowrap">
                                    {change.value}
                                </span>
                            </span>
                        )}

                        {description && (
                            <span className="text-[var(--color-text-tertiary)] truncate flex-1">
                                {description}
                            </span>
                        )}
                    </div>
                )}
            </div>
        );
    },
);
StatsCard.displayName = "StatsCard";

export default StatsCard;
