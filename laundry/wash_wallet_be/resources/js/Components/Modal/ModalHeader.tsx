import React from "react";
import { Dialog } from "@headlessui/react";
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
    // Variant icons mapping
    const variantIcons = {
        default: null,
        danger: <AlertTriangle className="w-5 h-5 text-red-500" />,
        warning: <AlertCircle className="w-5 h-5 text-yellow-500" />,
        success: <CheckCircle className="w-5 h-5 text-green-500" />,
        info: <Info className="w-5 h-5 text-blue-500" />,
    };

    // Variant styles
    const variantStyles = {
        default:
            "border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50",
        danger: "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/20",
        warning:
            "border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-900/20",
        success:
            "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/20",
        info: "border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20",
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
                {/* Icon */}
                {displayIcon && (
                    <div className="flex-shrink-0">{displayIcon}</div>
                )}

                {/* Title and Subtitle */}
                <div className="min-w-0 flex-1">
                    {(title || children) && (
                        <Dialog.Title
                            as="h3"
                            className={cn(
                                "text-lg font-semibold truncate",
                                "text-gray-900 dark:text-gray-100",
                                variant === "danger" &&
                                    "text-red-900 dark:text-red-100",
                                variant === "warning" &&
                                    "text-yellow-900 dark:text-yellow-100",
                                variant === "success" &&
                                    "text-green-900 dark:text-green-100",
                                variant === "info" &&
                                    "text-blue-900 dark:text-blue-100",
                            )}
                        >
                            {title || children}
                        </Dialog.Title>
                    )}

                    {subtitle && (
                        <p
                            className={cn(
                                "mt-1 text-sm truncate",
                                "text-gray-600 dark:text-gray-400",
                                variant === "danger" &&
                                    "text-red-700 dark:text-red-300",
                                variant === "warning" &&
                                    "text-yellow-700 dark:text-yellow-300",
                                variant === "success" &&
                                    "text-green-700 dark:text-green-300",
                                variant === "info" &&
                                    "text-blue-700 dark:text-blue-300",
                            )}
                        >
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            {/* Close Button */}
            {showCloseButton && onClose && (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className={cn(
                        "flex-shrink-0 p-2 rounded-lg transition-all duration-200",
                        "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300",
                        "hover:bg-gray-100 dark:hover:bg-gray-700",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                        "dark:focus:ring-offset-gray-900",
                    )}
                    aria-label="Close modal"
                    leftIcon={<X className="w-5 h-5" />}
                />
            )}
        </div>
    );
};

export default ModalHeader;
