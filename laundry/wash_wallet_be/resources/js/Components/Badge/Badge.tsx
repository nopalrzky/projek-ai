import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Check,
    AlertTriangle,
    Info,
    Zap,
    Star,
    AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BadgeProps } from "./types";

interface BadgeComponent extends React.FC<BadgeProps> {
    Status: React.FC<{ online?: boolean; className?: string }>;
    Count: React.FC<{ count: number; max?: number; className?: string }>;
    New: React.FC<{ className?: string }>;
    Beta: React.FC<{ className?: string }>;
    Pro: React.FC<{ className?: string }>;
    Premium: React.FC<{ className?: string }>;
}

const Badge: BadgeComponent = ({
    children,
    variant = "default",
    size = "md",
    rounded = "full",
    icon,
    leftIcon,
    rightIcon,
    dismissible = false,
    onDismiss,
    animated = false,
    pulse = false,
    isGlass = false,
    className,
    ...props
}) => {
    const [isVisible, setIsVisible] = useState(true);

    const handleDismiss = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsVisible(false);
        setTimeout(() => onDismiss?.(), 300);
    };

    const variants = {
        default:
            "bg-[var(--color-gray-100)] text-[var(--color-gray-800)] border-[var(--color-gray-200)] dark:bg-[var(--color-gray-800)] dark:text-[var(--color-gray-100)] dark:border-[var(--color-gray-700)]",
        primary:
            "bg-[var(--color-primary-500)] text-white border-transparent shadow-sm shadow-[var(--color-primary-500)]/30",
        secondary:
            "bg-[var(--color-secondary-100)] text-[var(--color-secondary-800)] border-[var(--color-secondary-200)] dark:bg-[var(--color-secondary-900)] dark:text-[var(--color-secondary-100)]",
        success:
            "bg-[var(--color-success-500)] text-white border-transparent shadow-sm shadow-[var(--color-success-500)]/30",
        warning:
            "bg-[var(--color-warning-50)] text-[var(--color-warning-600)] border-[var(--color-warning-400)] shadow-sm shadow-[var(--color-warning-500)]/20",
        danger: "bg-[var(--color-danger-500)] text-white border-transparent shadow-sm shadow-[var(--color-danger-500)]/30",
        error: "bg-[var(--color-error-500)] text-white border-transparent shadow-sm shadow-[var(--color-error-500)]/30",
        info: "bg-[var(--color-info-500)] text-white border-transparent shadow-sm shadow-[var(--color-info-500)]/30",
        outline:
            "bg-transparent border-[var(--color-border)] text-[var(--color-text-secondary)]",
        ghost: "bg-transparent border-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-gray-100)] dark:hover:bg-[var(--color-gray-800)]",
    };

    const sizes = {
        xs: "h-5 px-1.5 text-[10px] gap-1",
        sm: "h-6 px-2.5 text-xs gap-1.5",
        md: "h-7 px-3 text-sm gap-2",
        lg: "h-8 px-4 text-base gap-2.5",
    };

    const radiuses = {
        sm: "rounded-sm",
        md: "rounded-md",
        lg: "rounded-lg",
        full: "rounded-full",
    };

    const defaultIcons = {
        success: <Check size={12} strokeWidth={3} />,
        warning: <AlertTriangle size={12} strokeWidth={3} />,
        error: <X size={12} strokeWidth={3} />,
        info: <Info size={12} strokeWidth={3} />,
        danger: <AlertCircle size={12} strokeWidth={3} />,
    };

    const renderIcon =
        leftIcon || icon ||
        (variant in defaultIcons
            ? defaultIcons[variant as keyof typeof defaultIcons]
            : null);

    const content = (
        <span
            className={cn(
                "inline-flex items-center justify-center font-semibold tracking-wide border transition-all duration-200 select-none",
                variants[variant],
                sizes[size],
                radiuses[rounded],
                isGlass && "glass",
                pulse && "animate-pulse",
                className,
            )}
            {...props}
        >
            {renderIcon && (
                <span className="flex-shrink-0 -ml-0.5">{renderIcon}</span>
            )}
            <span className="truncate">{children}</span>
            {rightIcon && (
                <span className="flex-shrink-0 -mr-0.5">{rightIcon}</span>
            )}

            {dismissible && (
                <button
                    onClick={handleDismiss}
                    className="ml-1.5 -mr-1 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
                >
                    <X size={10} />
                </button>
            )}
        </span>
    );

    if (animated) {
        return (
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{
                            opacity: 0,
                            scale: 0.9,
                            transition: { duration: 0.2 },
                        }}
                        className="inline-block"
                    >
                        {content}
                    </motion.div>
                )}
            </AnimatePresence>
        );
    }

    return isVisible ? content : null;
};

Badge.Status = ({ online, className }) => (
    <Badge
        variant={online ? "success" : "default"}
        size="xs"
        className={cn(
            online ? "bg-green-500 text-white" : "bg-gray-400 text-white",
            className,
        )}
        icon={
            <span
                className={cn(
                    "block w-1.5 h-1.5 rounded-full mr-1",
                    online ? "bg-white" : "bg-white/70",
                )}
            />
        }
    >
        {online ? "Online" : "Offline"}
    </Badge>
);

Badge.Count = ({ count, max = 99, className }) => (
    <Badge
        variant="error"
        size="xs"
        className={cn("px-1.5 min-w-[1.25rem] h-5", className)}
    >
        {count > max ? `${max}+` : count}
    </Badge>
);

Badge.New = ({ className }) => (
    <Badge
        variant="primary"
        size="xs"
        className={cn("bg-blue-600", className)}
        isGlass
    >
        NEW
    </Badge>
);

Badge.Beta = ({ className }) => (
    <Badge variant="warning" size="xs" className={className}>
        BETA
    </Badge>
);

Badge.Pro = ({ className }) => (
    <Badge
        size="xs"
        className={cn(
            "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-none",
            className,
        )}
        icon={<Star size={10} className="fill-white" />}
    >
        PRO
    </Badge>
);

Badge.Premium = ({ className }) => (
    <Badge
        size="xs"
        className={cn(
            "bg-gradient-to-r from-amber-500 to-orange-600 text-white border-none",
            className,
        )}
        icon={<Zap size={10} className="fill-white" />}
    >
        PREMIUM
    </Badge>
);

export default Badge;
