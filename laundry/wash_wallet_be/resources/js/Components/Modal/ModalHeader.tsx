import React from "react";
import { DialogTitle } from "@headlessui/react";
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from "lucide-react";
import { ModalHeaderProps } from "./types";
import { cn } from "@/lib/utils";
import { Button } from "../Button";

const ModalHeader: React.FC<ModalHeaderProps> = ({
    title,
    subtitle,
    onClose,
    showCloseButton = true,
    className,
    variant = "default",
    icon,
    children,
}) => {
    const variantIcons = {
        default: null,
        danger: (
            <AlertTriangle className="w-5 h-5 text-[var(--color-error-500)]" />
        ),
        warning: (
            <AlertCircle className="w-5 h-5 text-[var(--color-warning-500)]" />
        ),
        success: (
            <CheckCircle className="w-5 h-5 text-[var(--color-success-500)]" />
        ),
        info: <Info className="w-5 h-5 text-[var(--color-info-500)]" />,
    };

    const variantStyles = {
        default:
            "border-[var(--color-border)] dark:border-[var(--color-border)] bg-[var(--color-gray-50)]/50 dark:bg-[var(--color-gray-800)]/50",
        danger: "border-[var(--color-error-200)] dark:border-[var(--color-error-800)] bg-[var(--color-error-50)]/50 dark:bg-[var(--color-error-900)]/20",
        warning:
            "border-[var(--color-warning-200)] dark:border-[var(--color-warning-800)] bg-[var(--color-warning-50)]/50 dark:bg-[var(--color-warning-900)]/20",
        success:
            "border-[var(--color-success-200)] dark:border-[var(--color-success-800)] bg-[var(--color-success-50)]/50 dark:bg-[var(--color-success-900)]/20",
        info: "border-[var(--color-info-200)] dark:border-[var(--color-info-800)] bg-[var(--color-info-50)]/50 dark:bg-[var(--color-info-900)]/20",
    };

    const displayIcon = icon || variantIcons[variant];

    return (
        <div
            className={cn(
                "flex items-center justify-between px-6 py-4 border-b transition-colors duration-200",
                variantStyles[variant],
                className,
            )}
        >
            <div className="flex items-center gap-3 min-w-0 flex-1">
                {displayIcon && (
                    <div className="flex-shrink-0">{displayIcon}</div>
                )}

                <div className="min-w-0 flex-1">
                    {(title || children) && (
                        <DialogTitle
                            as="h3"
                            className={cn(
                                "text-lg font-semibold truncate",
                                "text-[var(--color-text-primary)]",
                                variant === "danger" &&
                                    "text-[var(--color-error-900)] dark:text-[var(--color-error-100)]",
                                variant === "warning" &&
                                    "text-[var(--color-warning-900)] dark:text-[var(--color-warning-100)]",
                                variant === "success" &&
                                    "text-[var(--color-success-900)] dark:text-[var(--color-success-100)]",
                                variant === "info" &&
                                    "text-[var(--color-info-900)] dark:text-[var(--color-info-100)]",
                            )}
                        >
                            {title || children}
                        </DialogTitle>
                    )}

                    {subtitle && (
                        <p
                            className={cn(
                                "mt-1 text-sm truncate",
                                "text-[var(--color-text-secondary)]",
                                variant === "danger" &&
                                    "text-[var(--color-error-700)] dark:text-[var(--color-error-300)]",
                                variant === "warning" &&
                                    "text-[var(--color-warning-700)] dark:text-[var(--color-warning-300)]",
                                variant === "success" &&
                                    "text-[var(--color-success-700)] dark:text-[var(--color-success-300)]",
                                variant === "info" &&
                                    "text-[var(--color-info-700)] dark:text-[var(--color-info-300)]",
                            )}
                        >
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            {showCloseButton && onClose && (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className={cn(
                        "flex-shrink-0 p-2 rounded-lg transition-all duration-200",
                        "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]",
                        "hover:bg-[var(--color-gray-100)] dark:hover:bg-[var(--color-gray-700)]",
                        "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:ring-offset-2",
                        "dark:focus:ring-offset-[var(--color-gray-900)]",
                    )}
                    aria-label="Close modal"
                    leftIcon={<X className="w-5 h-5" />}
                />
            )}
        </div>
    );
};

export default ModalHeader;
