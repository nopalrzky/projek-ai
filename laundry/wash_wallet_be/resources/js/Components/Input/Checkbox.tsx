import React, { forwardRef, useState } from "react";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { CheckboxProps } from "./types";

const CheckboxInput = forwardRef<HTMLInputElement, CheckboxProps>(
    (
        {
            label,
            description,
            error,
            success,
            warning,
            size = "md",
            variant = "default",
            className,
            containerClassName,
            id,
            disabled,
            readOnly,
            checked,
            defaultChecked,
            onChange,
            indeterminate = false,
            colorScheme = "blue",
            spacing = "normal",
            children,
            ...props
        },
        ref,
    ) => {
        const checkboxId =
            id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
        const [isFocused, setIsFocused] = useState(false);

        const sizeClasses = {
            xs: "w-3.5 h-3.5",
            sm: "w-4 h-4",
            md: "w-5 h-5",
            lg: "w-6 h-6",
            xl: "w-7 h-7",
        };

        const labelSizeClasses = {
            xs: "text-xs",
            sm: "text-sm",
            md: "text-base",
            lg: "text-lg",
            xl: "text-xl",
        };

        const iconSizeClasses = {
            xs: 10,
            sm: 12,
            md: 14,
            lg: 16,
            xl: 18,
        };

        const spacingClasses = {
            tight: "gap-2",
            normal: "gap-3",
            loose: "gap-4",
        };

        const colorSchemes = {
            gray: {
                checked:
                    "peer-checked:bg-[var(--color-gray-600)] peer-checked:border-[var(--color-gray-600)]",
                focus: "peer-focus:ring-[var(--color-gray-500)]",
            },
            blue: {
                checked:
                    "peer-checked:bg-[var(--color-primary-500)] peer-checked:border-[var(--color-primary-500)]",
                focus: "peer-focus:ring-[var(--color-primary-500)]",
            },
            green: {
                checked:
                    "peer-checked:bg-[var(--color-success-500)] peer-checked:border-[var(--color-success-500)]",
                focus: "peer-focus:ring-[var(--color-success-500)]",
            },
            red: {
                checked: "peer-checked:bg-red-500 peer-checked:border-red-500",
                focus: "peer-focus:ring-red-500",
            },
            yellow: {
                checked:
                    "peer-checked:bg-yellow-500 peer-checked:border-yellow-500",
                focus: "peer-focus:ring-yellow-500",
            },
            purple: {
                checked:
                    "peer-checked:bg-purple-500 peer-checked:border-purple-500",
                focus: "peer-focus:ring-purple-500",
            },
            pink: {
                checked:
                    "peer-checked:bg-pink-500 peer-checked:border-pink-500",
                focus: "peer-focus:ring-pink-500",
            },
        };

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (!disabled && !readOnly) {
                onChange?.(e.target.checked);
            }
        };

        const isSwitch = variant === "switch";

        if (isSwitch) {
            return (
                <div className={cn("flex flex-col", containerClassName)}>
                    <div className="flex items-center">
                        <label
                            htmlFor={checkboxId}
                            className={cn(
                                "relative inline-flex items-center cursor-pointer select-none group",
                                disabled && "cursor-not-allowed opacity-50",
                                readOnly && "cursor-default",
                                spacingClasses[spacing],
                                className,
                            )}
                        >
                            <input
                                ref={ref}
                                type="checkbox"
                                id={checkboxId}
                                className="sr-only peer"
                                disabled={disabled}
                                readOnly={readOnly}
                                checked={checked}
                                defaultChecked={defaultChecked}
                                onChange={handleChange}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                aria-describedby={
                                    error ? `${checkboxId}-error` : undefined
                                }
                                {...props}
                            />
                            <div
                                className={cn(
                                    "relative rounded-full transition-all duration-200",
                                    "bg-[var(--color-gray-300)] dark:bg-[var(--color-gray-600)]",
                                    "peer-checked:bg-[var(--color-primary-500)]",
                                    size === "xs" && "h-4 w-7",
                                    size === "sm" && "h-5 w-9",
                                    size === "md" && "h-6 w-11",
                                    size === "lg" && "h-7 w-12",
                                    size === "xl" && "h-8 w-14",
                                    isFocused && "ring-2 ring-offset-2",
                                    !error && colorSchemes[colorScheme].focus,
                                    error &&
                                    "ring-2 ring-[var(--color-error-500)] bg-red-50 dark:bg-red-950/20",
                                    success &&
                                    "ring-2 ring-[var(--color-success-500)]",
                                    warning && "ring-2 ring-yellow-500",
                                    !disabled &&
                                    !readOnly &&
                                    "group-hover:opacity-90",
                                )}
                            >
                                <span
                                    className={cn(
                                        "absolute top-0.5 left-0.5 transform rounded-full bg-white shadow-md transition-transform duration-200",
                                        size === "xs" && "h-3 w-3",
                                        size === "sm" && "h-4 w-4",
                                        size === "md" && "h-5 w-5",
                                        size === "lg" && "h-6 w-6",
                                        size === "xl" && "h-7 w-7",
                                        checked &&
                                        size === "xs" &&
                                        "translate-x-3",
                                        checked &&
                                        size === "sm" &&
                                        "translate-x-4",
                                        checked &&
                                        size === "md" &&
                                        "translate-x-5",
                                        checked &&
                                        size === "lg" &&
                                        "translate-x-5",
                                        checked &&
                                        size === "xl" &&
                                        "translate-x-6",
                                    )}
                                />
                            </div>
                            {(label || children) && (
                                <div className="flex flex-col">
                                    <span
                                        className={cn(
                                            "font-medium text-[var(--color-text-primary)]",
                                            labelSizeClasses[size],
                                            disabled && "opacity-50",
                                        )}
                                    >
                                        {label || children}
                                    </span>
                                    {description && (
                                        <span
                                            className={cn(
                                                "text-[var(--color-text-secondary)] mt-0.5",
                                                size === "xs" && "text-xs",
                                                size === "sm" && "text-xs",
                                                size === "md" && "text-sm",
                                                size === "lg" && "text-sm",
                                                size === "xl" && "text-base",
                                                disabled && "opacity-50",
                                            )}
                                        >
                                            {description}
                                        </span>
                                    )}
                                </div>
                            )}
                        </label>
                    </div>

                    {error && (
                        <p
                            id={`${checkboxId}-error`}
                            className="mt-2 text-sm text-[var(--color-error-500)] animate-in slide-in-from-top-1 flex items-start gap-1.5"
                        >
                            <span className="font-medium">
                                {Array.isArray(error) ? error[0] : error}
                            </span>
                        </p>
                    )}
                    {success && !error && (
                        <p className="mt-2 text-sm text-[var(--color-success-600)] dark:text-[var(--color-success-400)] animate-in slide-in-from-top-1">
                            {success}
                        </p>
                    )}
                    {warning && !error && !success && (
                        <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400 animate-in slide-in-from-top-1">
                            {warning}
                        </p>
                    )}
                </div>
            );
        }

        return (
            <div className={cn("flex flex-col", containerClassName)}>
                <div
                    className={cn("flex items-start", spacingClasses[spacing])}
                >
                    <label
                        htmlFor={checkboxId}
                        className={cn(
                            "flex items-center h-6 flex-shrink-0",
                            size === "xs" && "h-5",
                            size === "xl" && "h-7",
                            disabled && "cursor-not-allowed",
                            readOnly && "cursor-default",
                            !disabled && !readOnly && "cursor-pointer",
                        )}
                    >
                        <input
                            ref={ref}
                            type="checkbox"
                            id={checkboxId}
                            className="peer sr-only"
                            disabled={disabled}
                            readOnly={readOnly}
                            checked={checked}
                            defaultChecked={defaultChecked}
                            onChange={handleChange}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            aria-describedby={
                                error ? `${checkboxId}-error` : undefined
                            }
                            {...props}
                        />
                        <div
                            className={cn(
                                "flex items-center justify-center rounded-md border-2 transition-all duration-200 cursor-pointer",
                                "border-[var(--color-border)] bg-[var(--color-surface)]",
                                "hover:border-[var(--color-border-hover)]",
                                colorSchemes[colorScheme].checked,
                                sizeClasses[size],
                                isFocused && "ring-2 ring-offset-2",
                                !error && colorSchemes[colorScheme].focus,
                                error &&
                                "border-[var(--color-error-500)] ring-2 ring-[var(--color-error-500)] bg-red-50 dark:bg-red-950/20",
                                success &&
                                "border-[var(--color-success-500)] ring-2 ring-[var(--color-success-500)]",
                                warning &&
                                "border-yellow-500 ring-2 ring-yellow-500",
                                disabled &&
                                "cursor-not-allowed opacity-50 hover:border-[var(--color-border)]",
                                readOnly && "cursor-default",
                                !disabled &&
                                !readOnly &&
                                "group-hover:scale-105 active:scale-95",
                            )}
                        >
                            {indeterminate ? (
                                <Minus
                                    size={iconSizeClasses[size]}
                                    strokeWidth={3}
                                    className={cn(
                                        "text-white transition-all duration-200",
                                        checked || defaultChecked
                                            ? "opacity-100 scale-100"
                                            : "opacity-0 scale-50",
                                    )}
                                />
                            ) : (
                                <Check
                                    size={iconSizeClasses[size]}
                                    strokeWidth={3}
                                    className={cn(
                                        "text-white transition-all duration-200",
                                        checked || defaultChecked
                                            ? "opacity-100 scale-100"
                                            : "opacity-0 scale-50",
                                    )}
                                />
                            )}
                        </div>
                    </label>

                    {(label || children) && (
                        <label
                            htmlFor={checkboxId}
                            className={cn(
                                "flex flex-1 cursor-pointer flex-col select-none group pt-0.5",
                                disabled && "cursor-not-allowed opacity-50",
                                readOnly && "cursor-default",
                            )}
                        >
                            <span
                                className={cn(
                                    "font-medium text-[var(--color-text-primary)] transition-colors",
                                    labelSizeClasses[size],
                                    !disabled &&
                                    !readOnly &&
                                    "group-hover:text-[var(--color-primary-600)] dark:group-hover:text-[var(--color-primary-400)]",
                                )}
                            >
                                {label || children}
                            </span>
                            {description && (
                                <span
                                    className={cn(
                                        "text-[var(--color-text-secondary)] mt-0.5 transition-colors",
                                        size === "xs" && "text-xs",
                                        size === "sm" && "text-xs",
                                        size === "md" && "text-sm",
                                        size === "lg" && "text-sm",
                                        size === "xl" && "text-base",
                                    )}
                                >
                                    {description}
                                </span>
                            )}
                        </label>
                    )}
                </div>

                {error && (
                    <p
                        id={`${checkboxId}-error`}
                        className={cn(
                            "text-sm text-[var(--color-error-500)] animate-in slide-in-from-top-1",
                            "mt-2",
                            (label || children) && "ml-8",
                        )}
                    >
                        {Array.isArray(error) ? error[0] : error}
                    </p>
                )}
                {success && !error && (
                    <p
                        className={cn(
                            "text-sm text-[var(--color-success-600)] dark:text-[var(--color-success-400)] animate-in slide-in-from-top-1",
                            "mt-2",
                            (label || children) && "ml-8",
                        )}
                    >
                        {success}
                    </p>
                )}
                {warning && !error && !success && (
                    <p
                        className={cn(
                            "text-sm text-yellow-600 dark:text-yellow-400 animate-in slide-in-from-top-1",
                            "mt-2",
                            (label || children) && "ml-8",
                        )}
                    >
                        {warning}
                    </p>
                )}
            </div>
        );
    },
);

CheckboxInput.displayName = "CheckboxInput";

export default CheckboxInput;
