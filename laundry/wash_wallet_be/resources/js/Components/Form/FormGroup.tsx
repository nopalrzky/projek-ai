import React from "react";
import { cn } from "@/lib/utils";
import { FormGroupProps } from "./types";

const FormGroup: React.FC<FormGroupProps> = ({
    title,
    description,
    children,
    className,
    isGlass = false,
    variant = "default",
    ...props
}) => {
    const variants = {
        default: "bg-[var(--color-surface)] border-[var(--color-border)]",
        primary:
            "bg-gradient-to-br from-[var(--color-primary-50)] to-white dark:from-[var(--color-primary-900)]/20 dark:to-transparent border-[var(--color-primary-200)] dark:border-[var(--color-primary-800)]",
        gradient:
            "bg-gradient-to-br from-[var(--color-surface)] via-[var(--color-surface)] to-[var(--color-gray-50)] dark:to-[var(--color-gray-900)] border-[var(--color-border)]",
    };

    return (
        <div
            className={cn(
                "space-y-6 p-6 sm:p-8 rounded-[var(--radius-lg)] border transition-all duration-300",
                "shadow-sm hover:shadow-md",
                isGlass
                    ? "glass bg-white/60 dark:bg-black/40 border-white/20 backdrop-blur-xl"
                    : variants[variant],
                className,
            )}
            {...props}
        >
            {(title || description) && (
                <div className="space-y-2 border-b border-[var(--color-border)]/50 pb-5">
                    {title && (
                        <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--color-text-primary)] flex items-center gap-2">
                            <span className="w-1 h-5 bg-gradient-to-b from-[var(--color-primary-500)] to-[var(--color-primary-700)] rounded-full" />
                            {title}
                        </h3>
                    )}
                    {description && (
                        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed pl-3">
                            {description}
                        </p>
                    )}
                </div>
            )}
            <div className="space-y-6 pt-2">{children}</div>
        </div>
    );
};

export default FormGroup;
