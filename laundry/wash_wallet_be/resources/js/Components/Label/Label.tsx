import React from "react";
import { cn } from "@/lib/utils";
import { LabelProps, LabelSize, LabelTone } from "./types";

const sizeClasses: Record<LabelSize, string> = {
    sm: "text-xs leading-4 gap-1",
    md: "text-sm leading-5 gap-1.5",
    lg: "text-base leading-6 gap-2",
};

const toneClasses: Record<LabelTone, string> = {
    default: "text-[var(--color-text-primary)]",
    muted: "text-[var(--color-text-tertiary)]",
    primary: "text-[var(--color-primary-700)]",
    success: "text-[var(--color-success-700)]",
    warning: "text-[var(--color-warning-700)]",
    danger: "text-[var(--color-error-700)]",
    info: "text-[var(--color-info-700)]",
};

const Label: React.FC<LabelProps> = ({
    children,
    as = "label",
    size = "md",
    tone = "default",
    htmlFor,
    required = false,
    optional = false,
    helperSuffix,
    leftIcon,
    rightIcon,
    className,
    ...props
}) => {
    const Component = as;

    const elementProps = as === "label" ? { htmlFor, ...props } : { ...props };

    return (
        <Component
            className={cn(
                "inline-flex items-center font-medium select-none",
                sizeClasses[size],
                toneClasses[tone],
                className,
            )}
            {...elementProps}
        >
            {leftIcon && (
                <span className="flex-shrink-0 inline-flex">{leftIcon}</span>
            )}

            <span className="inline-flex items-baseline gap-1">
                {children}

                {required && (
                    <span
                        aria-hidden="true"
                        className="text-[var(--color-error-500)] font-semibold"
                    >
                        *
                    </span>
                )}

                {!required && optional && (
                    <span className="text-[var(--color-text-tertiary)] font-normal text-[0.75em]">
                        Opsional
                    </span>
                )}

                {helperSuffix && (
                    <span className="text-[var(--color-text-tertiary)] font-normal text-[0.75em]">
                        {helperSuffix}
                    </span>
                )}
            </span>

            {rightIcon && (
                <span className="flex-shrink-0 inline-flex">{rightIcon}</span>
            )}
        </Component>
    );
};

Label.displayName = "Label";
export default Label;
