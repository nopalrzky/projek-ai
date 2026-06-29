import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    AlertCircle,
    CheckCircle,
    Info,
    AlertTriangle,
    XCircle,
    X,
    Bell,
    Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AlertProps } from "./types";

const Alert: React.FC<AlertProps> = ({
    variant = "default",
    size = "md",
    title,
    description,
    children,
    icon,
    showIcon = true,
    closable = false,
    onClose,
    className = "",
    titleClassName = "",
    descriptionClassName = "",
    iconClassName = "",
    closeButtonClassName = "",
    actions,
    border = true,
    rounded = true,
    shadow = true,
    isGlass = false,
    id,
    role = "alert",
    "aria-live": ariaLive = "polite",
}) => {
    const [isVisible, setIsVisible] = useState(true);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300);
    };

    const icons = {
        success: CheckCircle,
        warning: AlertTriangle,
        error: XCircle,
        info: Info,
        primary: Zap,
        secondary: Bell,
        default: AlertCircle,
    };

    const IconComponent = icons[variant] || icons.default;

    const variantStyles = {
        default:
            "bg-[var(--color-gray-50)] text-[var(--color-gray-900)] border-[var(--color-gray-200)] dark:bg-[var(--color-gray-900)] dark:border-[var(--color-gray-800)] dark:text-[var(--color-gray-100)]",
        primary:
            "bg-[var(--color-primary-50)] text-[var(--color-primary-900)] border-[var(--color-primary-200)] dark:bg-[var(--color-primary-950)] dark:border-[var(--color-primary-800)] dark:text-[var(--color-primary-100)]",
        secondary:
            "bg-[var(--color-secondary-50)] text-[var(--color-secondary-900)] border-[var(--color-secondary-200)] dark:bg-[var(--color-secondary-950)] dark:border-[var(--color-secondary-800)] dark:text-[var(--color-secondary-100)]",
        success:
            "bg-[var(--color-secondary-50)] text-[var(--color-secondary-900)] border-[var(--color-secondary-200)] dark:bg-[var(--color-secondary-950)] dark:border-[var(--color-secondary-800)] dark:text-[var(--color-secondary-100)]",
        warning:
            "bg-orange-50 text-orange-900 border-orange-200 dark:bg-orange-950/40 dark:border-orange-900/50 dark:text-orange-200",
        error: "bg-red-50 text-red-900 border-red-200 dark:bg-red-950/40 dark:border-red-900/50 dark:text-red-200",
        info: "bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-950/40 dark:border-blue-900/50 dark:text-blue-200",
    };

    const iconColors = {
        default: "text-[var(--color-gray-500)]",
        primary: "text-[var(--color-primary-500)]",
        secondary: "text-[var(--color-secondary-500)]",
        success: "text-[var(--color-success-500)]",
        warning: "text-orange-500",
        error: "text-red-500",
        info: "text-blue-500",
    };

    const iconSize = size === "sm" ? 18 : size === "lg" ? 24 : 20;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{
                        opacity: 0,
                        scale: 0.98,
                        transition: { duration: 0.2 },
                    }}
                    id={id}
                    role={role}
                    aria-live={ariaLive}
                    className={cn(
                        "relative w-full overflow-hidden flex items-start gap-3",
                        variantStyles[variant],
                        rounded && "rounded-xl",
                        border && "border",
                        shadow && "shadow-sm",
                        isGlass && "glass",
                        size === "sm"
                            ? "p-3 text-sm"
                            : size === "lg"
                              ? "p-6 text-lg"
                              : "p-4 text-base",
                        className,
                    )}
                >
                    <div
                        className={cn(
                            "absolute left-0 top-0 bottom-0 w-1",
                            variant === "primary"
                                ? "bg-[var(--color-primary-500)]"
                                : variant === "success"
                                  ? "bg-[var(--color-success-500)]"
                                  : "bg-transparent",
                        )}
                    />

                    {showIcon && (
                        <div
                            className={cn(
                                "flex-shrink-0 mt-0.5",
                                iconColors[variant],
                                iconClassName,
                            )}
                        >
                            {icon ? (
                                React.isValidElement(icon) &&
                                React.cloneElement(icon as any, {
                                    size: iconSize,
                                })
                            ) : (
                                <IconComponent size={iconSize} />
                            )}
                        </div>
                    )}

                    <div className="flex-1 min-w-0">
                        {title && (
                            <h3
                                className={cn(
                                    "font-bold tracking-tight mb-1 leading-none",
                                    titleClassName,
                                )}
                            >
                                {title}
                            </h3>
                        )}
                        {(description || children) && (
                            <div
                                className={cn(
                                    "opacity-80 leading-relaxed",
                                    descriptionClassName,
                                )}
                            >
                                {description || children}
                            </div>
                        )}
                        {actions && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {actions}
                            </div>
                        )}
                    </div>

                    {closable && (
                        <button
                            onClick={handleClose}
                            className={cn(
                                "flex-shrink-0 -mr-1 -mt-1 p-1.5 rounded-lg transition-all hover:bg-black/5 dark:hover:bg-white/10",
                                iconColors[variant],
                                closeButtonClassName,
                            )}
                        >
                            <X size={16} />
                        </button>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Alert;
