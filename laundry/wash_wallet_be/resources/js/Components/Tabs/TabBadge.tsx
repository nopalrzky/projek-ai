import React, { useMemo } from "react";
import { TabBadgeProps } from "./types";
import { cn } from "@/lib/utils";

const TabBadge: React.FC<TabBadgeProps> = ({
    children,
    variant = "default",
    className = "",
}) => {
    const badgeClasses = useMemo(() => {
        const variants = {
            default:
                "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
            primary:
                "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300",
            secondary:
                "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
            success:
                "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300",
            warning:
                "bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300",
            error: "bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-300",
            info: "bg-info-100 text-info-700 dark:bg-info-900/30 dark:text-info-300",
        };
        return variants[variant];
    }, [variant]);

    return (
        <span
            className={cn(
                "inline-flex items-center justify-center",
                "px-2 py-0.5 text-xs font-medium rounded-full",
                "transition-colors duration-200",
                badgeClasses,
                className,
            )}
        >
            {children}
        </span>
    );
};

export default TabBadge;
