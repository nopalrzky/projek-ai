import React, { forwardRef, useState, useCallback, useEffect } from "react";
import { X, Eye, EyeOff, Loader2, Check, AlertCircle } from "lucide-react";
import { InputProps, InputSize } from "./types";
import { cn } from "@/lib/utils";

const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            label,
            placeholder,
            error,
            success,
            warning,
            hint,
            variant = "default",
            size = "md",
            status = "default",
            required = false,
            optional = false,
            disabled = false,
            readOnly = false,
            loading = false,
            fullWidth = true,
            className = "",
            containerClassName = "",
            labelClassName = "",
            errorClassName = "",
            leftIcon,
            rightIcon,
            leftAddon,
            rightAddon,
            helperText,
            showOptionalText = true,
            showRequiredIndicator = true,
            clearable = false,
            onClear,
            maxLength,
            showCharCount = false,
            type = "text",
            value,
            onChange,
            onFocus,
            onBlur,
            id,
            ...props
        },
        ref,
    ) => {
        const [isFocused, setIsFocused] = useState(false);
        const [showPassword, setShowPassword] = useState(false);
        const [charCount, setCharCount] = useState(
            typeof value === "string" ? value.length : 0,
        );

        const inputId =
            id || `input-${Math.random().toString(36).substr(2, 9)}`;
        const isPassword = type === "password";

        const actualStatus = error
            ? "error"
            : success
              ? "success"
              : warning
                ? "warning"
                : status;

        useEffect(() => {
            if (typeof value === "string") {
                setCharCount(value.length);
            }
        }, [value]);

        const handleChange = useCallback(
            (e: React.ChangeEvent<HTMLInputElement>) => {
                const newValue = e.target.value;
                setCharCount(newValue.length);
                onChange?.(e);
            },
            [onChange],
        );

        const handleFocus = useCallback(
            (e: React.FocusEvent<HTMLInputElement>) => {
                setIsFocused(true);
                onFocus?.(e);
            },
            [onFocus],
        );

        const handleBlur = useCallback(
            (e: React.FocusEvent<HTMLInputElement>) => {
                setIsFocused(false);
                onBlur?.(e);
            },
            [onBlur],
        );

        const handleClear = useCallback(() => {
            setCharCount(0);
            onClear?.();

            const event = {
                target: { value: "" },
                currentTarget: { value: "" },
            } as React.ChangeEvent<HTMLInputElement>;

            onChange?.(event);
        }, [onClear, onChange]);

        const togglePasswordVisibility = useCallback(() => {
            setShowPassword(!showPassword);
        }, [showPassword]);

        const sizeClasses: Record<InputSize, string> = {
            xs: "h-8 text-xs px-2.5",
            sm: "h-9 text-sm px-3",
            md: "h-11 text-base px-4",
            lg: "h-14 text-lg px-5",
            xl: "h-16 text-xl px-6",
        };

        const iconSizes: Record<InputSize, number> = {
            xs: 12,
            sm: 14,
            md: 18,
            lg: 20,
            xl: 24,
        };

        const currentIconSize = iconSizes[size] || 18;

        const statusClasses = {
            default:
                "border-[var(--color-border)] focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)]",
            error: "border-[var(--color-error-500)] focus:border-[var(--color-error-500)] focus:ring-[var(--color-error-500)] text-[var(--color-error-600)] bg-[var(--color-error-500)]/5",
            success:
                "border-[var(--color-success-500)] focus:border-[var(--color-success-500)] focus:ring-[var(--color-success-500)] text-[var(--color-success-600)] bg-[var(--color-success-500)]/5",
            warning:
                "border-[var(--color-warning-500)] focus:border-[var(--color-warning-500)] focus:ring-[var(--color-warning-500)] text-[var(--color-warning-500)] bg-[var(--color-warning-400)]/5",
        };

        const inputClasses = cn(
            "form-input w-full transition-all duration-200",
            "text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)]",
            "bg-[var(--color-surface)]",
            "disabled:bg-[var(--color-gray-100)] disabled:cursor-not-allowed disabled:opacity-70",
            sizeClasses[size],
            leftIcon || leftAddon
                ? size === "xs"
                    ? "pl-8"
                    : size === "sm"
                      ? "pl-9"
                      : size === "xl"
                        ? "pl-14"
                        : "pl-11"
                : "",
            rightIcon || rightAddon || isPassword || clearable || loading
                ? size === "xs"
                    ? "pr-8"
                    : size === "sm"
                      ? "pr-9"
                      : size === "xl"
                        ? "pr-14"
                        : "pr-11"
                : "",
            statusClasses[actualStatus as keyof typeof statusClasses],
            className,
        );

        return (
            <div
                className={cn(
                    "flex flex-col w-full gap-1.5",
                    containerClassName,
                )}
            >
                {label && (
                    <div className="flex items-center justify-between">
                        <label
                            htmlFor={inputId}
                            className={cn(
                                "text-sm font-medium text-[var(--color-text-primary)]",
                                labelClassName,
                            )}
                        >
                            {label}
                            {required && showRequiredIndicator && (
                                <span className="ml-1 text-[var(--color-error-500)]">
                                    *
                                </span>
                            )}
                            {optional && showOptionalText && !required && (
                                <span className="ml-1 text-[var(--color-text-tertiary)] text-xs font-normal">
                                    (Opsional)
                                </span>
                            )}
                        </label>
                        {showCharCount && maxLength && (
                            <span
                                className={cn(
                                    "text-xs font-medium",
                                    charCount > maxLength
                                        ? "text-[var(--color-error-500)]"
                                        : "text-[var(--color-text-tertiary)]",
                                )}
                            >
                                {charCount}/{maxLength}
                            </span>
                        )}
                    </div>
                )}

                <div className="relative group">
                    {leftAddon && (
                        <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3 z-10 pointer-events-none">
                            <span className="text-[var(--color-text-tertiary)] text-sm font-medium">
                                {leftAddon}
                            </span>
                        </div>
                    )}

                    {leftIcon && !leftAddon && (
                        <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3.5 z-10 pointer-events-none">
                            <span
                                className={cn(
                                    "transition-colors duration-200",
                                    isFocused
                                        ? "text-[var(--color-primary-500)]"
                                        : "text-[var(--color-text-tertiary)]",
                                )}
                            >
                                {React.cloneElement(
                                    leftIcon as React.ReactElement,
                                    { size: currentIconSize },
                                )}
                            </span>
                        </div>
                    )}

                    <input
                        ref={ref}
                        id={inputId}
                        type={
                            isPassword
                                ? showPassword
                                    ? "text"
                                    : "password"
                                : type
                        }
                        value={value}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder={placeholder}
                        disabled={disabled || loading}
                        readOnly={readOnly}
                        required={required}
                        maxLength={maxLength}
                        className={inputClasses}
                        {...props}
                    />

                    <div className="absolute right-0 top-0 bottom-0 flex items-center pr-3 gap-2 z-10">
                        {loading && (
                            <Loader2
                                className="animate-spin text-[var(--color-primary-500)]"
                                size={currentIconSize}
                            />
                        )}

                        {clearable && value && !loading && !disabled && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="p-1 rounded-full hover:bg-[var(--color-gray-100)] text-[var(--color-text-tertiary)] transition-colors"
                            >
                                <X size={Math.max(12, currentIconSize - 4)} />
                            </button>
                        )}

                        {isPassword && !loading && !disabled && (
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="p-1 rounded-full hover:bg-[var(--color-gray-100)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-200)]"
                            >
                                {showPassword ? (
                                    <EyeOff size={currentIconSize} />
                                ) : (
                                    <Eye size={currentIconSize} />
                                )}
                            </button>
                        )}

                        {rightIcon && !isPassword && !loading && !clearable && (
                            <span className="text-[var(--color-text-tertiary)]">
                                {React.cloneElement(
                                    rightIcon as React.ReactElement,
                                    { size: currentIconSize },
                                )}
                            </span>
                        )}

                        {rightAddon && (
                            <span className="text-[var(--color-text-tertiary)] text-sm font-medium border-l border-[var(--color-border)] pl-2">
                                {rightAddon}
                            </span>
                        )}

                        {actualStatus === "error" &&
                            !loading &&
                            !isPassword && (
                                <AlertCircle
                                    size={currentIconSize}
                                    className="text-[var(--color-error-500)]"
                                />
                            )}

                        {actualStatus === "success" &&
                            !loading &&
                            !isPassword && (
                                <Check
                                    size={currentIconSize}
                                    className="text-[var(--color-success-500)]"
                                />
                            )}
                    </div>
                </div>

                {(helperText || error || success || warning) && (
                    <div className="flex flex-col gap-1 px-1">
                        {error && (
                            <p
                                className={cn(
                                    "text-xs font-medium flex items-center gap-1.5 text-[var(--color-error-600)]",
                                    errorClassName,
                                )}
                            >
                                {typeof error === "string"
                                    ? error
                                    : (error as any)?.message}
                            </p>
                        )}
                        {success && (
                            <p className="text-xs font-medium text-[var(--color-success-600)]">
                                {success}
                            </p>
                        )}
                        {warning && (
                            <p className="text-xs font-medium text-[var(--color-warning-500)]">
                                {warning}
                            </p>
                        )}
                        {helperText && !error && !success && !warning && (
                            <p className="text-xs text-[var(--color-text-secondary)]">
                                {helperText}
                            </p>
                        )}
                    </div>
                )}
            </div>
        );
    },
);

Input.displayName = "Input";

export default Input;
