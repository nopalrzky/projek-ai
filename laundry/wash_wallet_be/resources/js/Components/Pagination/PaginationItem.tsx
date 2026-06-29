import React from "react";
import { cn } from "@/lib/utils";
import { PaginationItemProps } from "./types";

const PaginationItem: React.FC<PaginationItemProps> = ({
    page,
    isActive = false,
    isDisabled = false,
    onClick,
    children,
    className,
    size = "default",
    variant = "default",
}) => {
    const handleClick = () => {
        if (!isDisabled && onClick) {
            onClick();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if ((e.key === "Enter" || e.key === " ") && !isDisabled && onClick) {
            e.preventDefault();
            onClick();
        }
    };

    const baseStyles = cn(
        "pagination-item inline-flex items-center justify-center rounded-lg transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/40 focus:ring-offset-1 focus:ring-offset-[var(--color-surface)]",
        "select-none relative",
        !isDisabled &&
            "cursor-pointer hover:-translate-y-px active:translate-y-0",
        isDisabled && "cursor-not-allowed opacity-50",
    );

    const getStyles = () => {
        if (isActive) {
            return {
                className:
                    "pagination-item-active border border-[var(--color-primary-300)] text-white shadow-md",
            };
        }

        if (variant === "minimal") {
            return {
                className:
                    "border border-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-gray-100)] dark:hover:bg-[var(--color-gray-200)]",
            };
        }

        return {
            className: cn(
                "border border-transparent bg-transparent text-[var(--color-text-secondary)]",
                "hover:border-[var(--color-border)] hover:bg-[var(--color-gray-50)]",
                "dark:hover:bg-[var(--color-gray-200)]",
            ),
        };
    };

    const styles = getStyles();

    return (
        <button
            type="button"
            className={cn(baseStyles, styles.className, className)}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            disabled={isDisabled}
            aria-current={isActive ? "page" : undefined}
            aria-label={
                typeof page === "string"
                    ? `Go to ${page} page`
                    : `Go to page ${page}`
            }
            tabIndex={isDisabled ? -1 : 0}
        >
            {children}
        </button>
    );
};

export default PaginationItem;
