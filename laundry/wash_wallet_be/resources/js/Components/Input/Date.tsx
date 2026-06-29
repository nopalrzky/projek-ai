import React, { forwardRef, useState } from "react";
import { Calendar, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DateInputProps } from "./types";

const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
    (
        {
            label,
            placeholder = "Pilih tanggal",
            error,
            success,
            warning,
            hint,
            variant = "default",
            size = "md",
            disabled = false,
            loading = false,
            fullWidth = true,
            className,
            containerClassName,
            leftIcon,
            rightIcon,
            value,
            onChange,
            min,
            max,
            id,
            required,
            optional,
            clearable = true,
            onClear,
            format = "yyyy-MM-dd",
            showCalendarIcon = true,
            ...props
        },
        ref,
    ) => {
        const [isFocused, setIsFocused] = useState(false);
        const inputId =
            id || `date-input-${Math.random().toString(36).substr(2, 9)}`;

        const getDisplayValue = () => {
            if (!value) return "";
            if (value instanceof Date) {
                return value.toISOString().split("T")[0];
            }
            return value;
        };

        const handleClear = (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (onChange) {
                onChange({
                    target: { value: "" },
                } as React.ChangeEvent<HTMLInputElement>);
            }
            onClear?.();
        };

        const hasValue = !!getDisplayValue();
        const hasLeftIcon = leftIcon || showCalendarIcon;

        const baseClasses = cn(
            "relative transition-all duration-200 ease-in-out",
            "focus:outline-none focus:ring-2 focus:ring-offset-0",
            "placeholder:text-[var(--color-text-tertiary)]",
            "text-[var(--color-text-primary)]",
            "font-medium",
            disabled && "cursor-not-allowed opacity-50",
            loading && "cursor-wait",
            fullWidth ? "w-full" : "w-auto",
        );

        const variantClasses = {
            default: cn(
                "border rounded-[var(--radius-md)]",
                "bg-[var(--color-surface)]",
                "border-[var(--color-border)]",
                "hover:border-[var(--color-border-hover)]",
                "focus:border-[var(--color-primary-500)]",
                "focus:ring-[var(--color-primary-500)]/20",
                error && [
                    "border-[var(--color-error-500)]",
                    "focus:border-[var(--color-error-500)]",
                    "focus:ring-[var(--color-error-500)]/20",
                    "bg-red-50/50 dark:bg-red-950/10",
                ],
                success && [
                    "border-[var(--color-success-500)]",
                    "focus:border-[var(--color-success-500)]",
                    "focus:ring-[var(--color-success-500)]/20",
                    "bg-green-50/50 dark:bg-green-950/10",
                ],
                warning && [
                    "border-yellow-500",
                    "focus:border-yellow-500",
                    "focus:ring-yellow-500/20",
                    "bg-yellow-50/50 dark:bg-yellow-950/10",
                ],
                disabled &&
                "bg-[var(--color-gray-50)] dark:bg-[var(--color-gray-900)]",
            ),
            outline: cn(
                "border-2 rounded-[var(--radius-md)] bg-transparent",
                "border-[var(--color-border)]",
                "hover:border-[var(--color-primary-400)]",
                "focus:border-[var(--color-primary-500)]",
                "focus:ring-[var(--color-primary-500)]/20",
                error && [
                    "border-[var(--color-error-500)]",
                    "hover:border-[var(--color-error-600)]",
                ],
            ),
            filled: cn(
                "border border-transparent rounded-[var(--radius-md)]",
                "bg-[var(--color-gray-100)] dark:bg-[var(--color-gray-800)]",
                "hover:bg-[var(--color-gray-200)] dark:hover:bg-[var(--color-gray-700)]",
                "focus:bg-[var(--color-surface)]",
                "focus:border-[var(--color-primary-500)]",
                "focus:ring-[var(--color-primary-500)]/20",
            ),
            underline: cn(
                "border-0 border-b-2 rounded-none bg-transparent px-0",
                "border-[var(--color-border)]",
                "focus:border-[var(--color-primary-500)] focus:ring-0",
            ),
            ghost: cn(
                "border border-transparent rounded-[var(--radius-md)] bg-transparent",
                "hover:bg-[var(--color-gray-100)] dark:hover:bg-[var(--color-gray-800)]",
                "focus:bg-[var(--color-surface)]",
                "focus:border-[var(--color-border)]",
                "focus:ring-[var(--color-border)]/20",
            ),
        };

        const sizeClasses = {
            xs: "px-2 py-1 text-xs h-8",
            sm: "px-3 py-1.5 text-sm h-9",
            md: "px-3 py-2 text-sm h-10",
            lg: "px-4 py-2.5 text-base h-11",
            xl: "px-5 py-3 text-base h-12",
        };

        const iconSizeClasses = {
            xs: "w-3 h-3",
            sm: "w-3.5 h-3.5",
            md: "w-4 h-4",
            lg: "w-5 h-5",
            xl: "w-5 h-5",
        };

        const leftPadding = hasLeftIcon
            ? {
                xs: "pl-8",
                sm: "pl-9",
                md: "pl-10",
                lg: "pl-11",
                xl: "pl-12",
            }[size]
            : "";

        const rightPadding =
            rightIcon || (clearable && hasValue)
                ? {
                    xs: "pr-8",
                    sm: "pr-9",
                    md: "pr-10",
                    lg: "pr-11",
                    xl: "pr-12",
                }[size]
                : "";

        const inputClasses = cn(
            baseClasses,
            variantClasses[variant],
            sizeClasses[size],
            leftPadding,
            rightPadding,
            "[&::-webkit-calendar-picker-indicator]:opacity-0",
            "[&::-webkit-calendar-picker-indicator]:absolute",
            "[&::-webkit-calendar-picker-indicator]:inset-0",
            "[&::-webkit-calendar-picker-indicator]:w-full",
            "[&::-webkit-calendar-picker-indicator]:h-full",
            "[&::-webkit-calendar-picker-indicator]:cursor-pointer",
            className,
        );

        const renderLeftIcon = () => {
            if (leftIcon) {
                return leftIcon;
            }
            if (showCalendarIcon) {
                return <Calendar className={iconSizeClasses[size]} />;
            }
            return null;
        };

        return (
            <div className={cn("relative w-full", containerClassName)}>
                {label && (
                    <label
                        htmlFor={inputId}
                        className={cn(
                            "block text-sm font-medium mb-1.5 transition-colors",
                            error
                                ? "text-[var(--color-error-500)]"
                                : success
                                    ? "text-[var(--color-success-600)]"
                                    : isFocused
                                        ? "text-[var(--color-primary-500)]"
                                        : "text-[var(--color-text-primary)]",
                            disabled && "opacity-50",
                        )}
                    >
                        {label}
                        {required && (
                            <span className="ml-1 text-[var(--color-error-500)]">
                                *
                            </span>
                        )}
                        {optional && !required && (
                            <span className="ml-2 text-xs text-[var(--color-text-tertiary)] font-normal italic">
                                Optional
                            </span>
                        )}
                    </label>
                )}

                <div className="relative">
                    {hasLeftIcon && (
                        <div
                            className={cn(
                                "absolute left-0 top-0 h-full flex items-center pl-3 pointer-events-none z-10",
                            )}
                        >
                            <span
                                className={cn(
                                    "transition-colors flex items-center justify-center",
                                    iconSizeClasses[size],
                                    error
                                        ? "text-[var(--color-error-500)]"
                                        : success
                                            ? "text-[var(--color-success-500)]"
                                            : isFocused
                                                ? "text-[var(--color-primary-500)]"
                                                : "text-[var(--color-text-tertiary)]",
                                )}
                            >
                                {renderLeftIcon()}
                            </span>
                        </div>
                    )}

                    <input
                        ref={ref}
                        id={inputId}
                        type="date"
                        value={getDisplayValue()}
                        onChange={onChange}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder={placeholder}
                        disabled={disabled || loading}
                        min={min}
                        max={max}
                        required={required}
                        className={inputClasses}
                        aria-invalid={error ? "true" : "false"}
                        aria-describedby={
                            error
                                ? `${inputId}-error`
                                : hint
                                    ? `${inputId}-hint`
                                    : undefined
                        }
                        {...props}
                    />

                    {(rightIcon ||
                        (clearable && hasValue && !disabled && !loading)) && (
                            <div className="absolute right-0 top-0 h-full flex items-center pr-3 gap-1 z-10">
                                {clearable && hasValue && !disabled && !loading && (
                                    <button
                                        type="button"
                                        onClick={handleClear}
                                        className={cn(
                                            "p-1 rounded-md transition-all duration-200",
                                            "text-[var(--color-text-tertiary)]",
                                            "hover:text-[var(--color-text-secondary)]",
                                            "hover:bg-[var(--color-gray-100)] dark:hover:bg-[var(--color-gray-800)]",
                                            "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20",
                                            "active:scale-95",
                                        )}
                                        aria-label="Clear date"
                                    >
                                        <X className={iconSizeClasses[size]} />
                                    </button>
                                )}
                                {rightIcon && (
                                    <span
                                        className={cn(
                                            "text-[var(--color-text-tertiary)] flex items-center justify-center",
                                            iconSizeClasses[size],
                                        )}
                                    >
                                        {rightIcon}
                                    </span>
                                )}
                            </div>
                        )}
                </div>

                <div className="mt-1.5 space-y-1">
                    {error && (
                        <p
                            id={`${inputId}-error`}
                            className="text-xs font-medium text-[var(--color-error-500)] animate-in slide-in-from-top-1 flex items-start gap-1.5"
                        >
                            <span>
                                {Array.isArray(error) ? error[0] : error}
                            </span>
                        </p>
                    )}
                    {success && !error && (
                        <p className="text-xs font-medium text-[var(--color-success-600)] dark:text-[var(--color-success-400)] animate-in slide-in-from-top-1">
                            {success}
                        </p>
                    )}
                    {warning && !error && !success && (
                        <p className="text-xs font-medium text-yellow-600 dark:text-yellow-400 animate-in slide-in-from-top-1">
                            {warning}
                        </p>
                    )}
                    {hint && !error && !success && !warning && (
                        <p
                            id={`${inputId}-hint`}
                            className="text-xs text-[var(--color-text-tertiary)] leading-relaxed"
                        >
                            {hint}
                        </p>
                    )}
                </div>
            </div>
        );
    },
);

DateInput.displayName = "DateInput";

export default DateInput;
