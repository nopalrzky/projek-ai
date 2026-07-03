import React, {
    forwardRef,
    useState,
    useCallback,
    useRef,
    useEffect,
} from "react";
import { TextareaProps } from "./types";
import { cn } from "@/lib/utils";

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
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
            helperText,
            showOptionalText = true,
            showRequiredIndicator = true,
            resize = "vertical",
            autoResize = false,
            minRows = 3,
            maxRows = 10,
            showCharacterCount = false,
            maxLength,
            value,
            onChange,
            onFocus,
            onBlur,
            id,
            textareaRef,
            leftIcon,
            ...props
        },
        ref,
    ) => {
        const [isFocused, setIsFocused] = useState(false);
        const [currentValue, setCurrentValue] = useState(value || "");

        const internalRef = useRef<HTMLTextAreaElement>(null);
        const actualRef = textareaRef || internalRef;

        const textareaId =
            id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
        const actualStatus = error
            ? "error"
            : success
              ? "success"
              : warning
                ? "warning"
                : status;

        const adjustHeight = useCallback(() => {
            if (!autoResize || !actualRef.current) return;

            const textarea = actualRef.current;
            textarea.style.height = "auto";

            const scrollHeight = textarea.scrollHeight;
            const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
            const minHeight = lineHeight * minRows;
            const maxHeight = lineHeight * maxRows;

            const newHeight = Math.min(
                Math.max(scrollHeight, minHeight),
                maxHeight,
            );
            textarea.style.height = `${newHeight}px`;
        }, [autoResize, minRows, maxRows, actualRef]);

        const handleChange = useCallback(
            (e: React.ChangeEvent<HTMLTextAreaElement>) => {
                const newValue = e.target.value;

                if (maxLength && newValue.length > maxLength) {
                    return;
                }

                setCurrentValue(newValue);
                onChange?.(e);

                if (autoResize) {
                    setTimeout(adjustHeight, 0);
                }
            },
            [maxLength, onChange, autoResize, adjustHeight],
        );

        const handleFocus = useCallback(
            (e: React.FocusEvent<HTMLTextAreaElement>) => {
                setIsFocused(true);
                onFocus?.(e);
            },
            [onFocus],
        );

        const handleBlur = useCallback(
            (e: React.FocusEvent<HTMLTextAreaElement>) => {
                setIsFocused(false);
                onBlur?.(e);
            },
            [onBlur],
        );

        useEffect(() => {
            if (value !== undefined && value !== currentValue) {
                setCurrentValue(value);
                if (autoResize) {
                    setTimeout(adjustHeight, 0);
                }
            }
        }, [value, currentValue, autoResize, adjustHeight]);

        useEffect(() => {
            if (autoResize && actualRef.current) {
                adjustHeight();
            }
        }, [autoResize, adjustHeight]);

        const characterCount = String(currentValue).length;
        const isOverLimit = maxLength ? characterCount > maxLength : false;

        const baseClasses = cn(
            "transition-all duration-200 ease-in-out",
            "focus:outline-none focus:ring-2 focus:ring-offset-0",
            "placeholder-[var(--color-text-tertiary)]",
            "text-[var(--color-text-primary)]",
            disabled && "cursor-not-allowed opacity-60",
            readOnly && "cursor-default",
            fullWidth ? "w-full" : "w-auto",
        );

        const variantClasses = {
            default: cn(
                "border rounded-lg",
                "bg-[var(--color-surface)]",
                "border-[var(--color-border)]",
                "focus:border-[var(--color-primary-500)]",
                "focus:ring-[var(--color-primary-500)]/20",
                actualStatus === "error" && [
                    "border-[var(--color-error-500)]",
                    "focus:border-[var(--color-error-500)]",
                    "focus:ring-[var(--color-error-500)]/20",
                    "bg-[var(--color-error-500)]/5",
                ],
                actualStatus === "success" && [
                    "border-[var(--color-success-500)]",
                    "focus:border-[var(--color-success-500)]",
                    "focus:ring-[var(--color-success-500)]/20",
                    "bg-[var(--color-success-500)]/5",
                ],
                actualStatus === "warning" && [
                    "border-[var(--color-warning-500)]",
                    "focus:border-[var(--color-warning-500)]",
                    "focus:ring-[var(--color-warning-500)]/20",
                    "bg-[var(--color-warning-500)]/5",
                ],
                disabled && [
                    "bg-[var(--color-gray-100)]",
                    "border-[var(--color-border-light)]",
                    "text-[var(--color-text-tertiary)]",
                ],
            ),
            outline: cn(
                "border-2 rounded-lg bg-transparent",
                "border-[var(--color-border)]",
                "focus:border-[var(--color-primary-500)]",
                "focus:ring-[var(--color-primary-500)]/20",
                actualStatus === "error" && [
                    "border-[var(--color-error-500)]",
                    "focus:border-[var(--color-error-500)]",
                    "focus:ring-[var(--color-error-500)]/20",
                ],
                disabled && "border-[var(--color-border-light)]",
            ),
            filled: cn(
                "border border-transparent rounded-lg",
                "bg-[var(--color-gray-100)]",
                "focus:bg-[var(--color-surface)]",
                "focus:border-[var(--color-primary-500)]",
                "focus:ring-[var(--color-primary-500)]/20",
                actualStatus === "error" && [
                    "bg-[var(--color-error-500)]/5",
                    "focus:border-[var(--color-error-500)]",
                    "focus:ring-[var(--color-error-500)]/20",
                ],
                disabled && "bg-[var(--color-gray-100)]/50",
            ),
            underline: cn(
                "border-0 border-b-2 rounded-none bg-transparent",
                "border-[var(--color-border)]",
                "focus:border-[var(--color-primary-500)] focus:ring-0",
                actualStatus === "error" && [
                    "border-[var(--color-error-500)]",
                    "focus:border-[var(--color-error-500)]",
                ],
                disabled && "border-[var(--color-border-light)]",
            ),
            ghost: cn(
                "border border-transparent rounded-lg bg-transparent",
                "hover:bg-[var(--color-gray-100)]",
                "focus:bg-[var(--color-surface)]",
                "focus:border-[var(--color-border)]",
                "focus:ring-[var(--color-border)]/20",
                disabled && "hover:bg-transparent dark:hover:bg-transparent",
            ),
        };

        const sizeClasses = {
            xs: leftIcon ? "pl-8 pr-2 py-1 text-xs" : "px-2 py-1 text-xs",
            sm: leftIcon ? "pl-9 pr-3 py-1.5 text-sm" : "px-3 py-1.5 text-sm",
            md: leftIcon ? "pl-10 pr-3 py-2 text-base" : "px-3 py-2 text-base",
            lg: leftIcon ? "pl-11 pr-4 py-2.5 text-lg" : "px-4 py-2.5 text-lg",
            xl: leftIcon ? "pl-12 pr-5 py-3 text-xl" : "px-5 py-3 text-xl",
        };

        const resizeClasses = {
            none: "resize-none",
            both: "resize",
            horizontal: "resize-x",
            vertical: "resize-y",
        };

        const labelSizeClasses = {
            xs: "text-xs",
            sm: "text-sm",
            md: "text-sm",
            lg: "text-base",
            xl: "text-lg",
        };

        const textareaClasses = cn(
            baseClasses,
            variantClasses[variant],
            sizeClasses[size],
            !autoResize && resizeClasses[resize],
            className,
        );

        const iconPositionClasses = {
            xs: "left-2 top-2",
            sm: "left-3 top-2.5",
            md: "left-3 top-3",
            lg: "left-4 top-3.5",
            xl: "left-5 top-4",
        };

        return (
            <div className={cn("flex flex-col", containerClassName)}>
                {label && (
                    <label
                        htmlFor={textareaId}
                        className={cn(
                            "block font-medium mb-1.5",
                            labelSizeClasses[size],
                            actualStatus === "error"
                                ? "text-[var(--color-error-600)]"
                                : "text-[var(--color-text-secondary)]",
                            disabled && "text-[var(--color-text-tertiary)]",
                            labelClassName,
                        )}
                    >
                        {label}
                        {required && showRequiredIndicator && (
                            <span className="text-[var(--color-error-500)] ml-1">
                                *
                            </span>
                        )}
                        {optional && showOptionalText && !required && (
                            <span className="text-[var(--color-text-tertiary)] text-sm ml-1">
                                (optional)
                            </span>
                        )}
                    </label>
                )}

                <div className="relative">
                    {leftIcon && (
                        <div
                            className={cn(
                                "absolute z-10 flex items-start pointer-events-none",
                                iconPositionClasses[size],
                            )}
                            style={{
                                color: disabled
                                    ? "var(--color-text-tertiary)"
                                    : isFocused
                                      ? actualStatus === "error"
                                          ? "var(--color-error-500)"
                                          : "var(--color-primary-500)"
                                      : "var(--color-text-tertiary)",
                            }}
                        >
                            {leftIcon}
                        </div>
                    )}

                    {loading && (
                        <div className="absolute inset-0 bg-[var(--color-surface)]/50 flex items-center justify-center z-20 rounded-lg">
                            <div className="animate-spin text-[var(--color-text-tertiary)]">
                                <svg
                                    width={20}
                                    height={20}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="m4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                            </div>
                        </div>
                    )}

                    <textarea
                        ref={actualRef || ref}
                        id={textareaId}
                        value={currentValue}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder={placeholder}
                        disabled={disabled || loading}
                        readOnly={readOnly}
                        required={required}
                        maxLength={maxLength}
                        rows={autoResize ? minRows : undefined}
                        className={textareaClasses}
                        style={{
                            ...(autoResize ? { overflow: "hidden" } : {}),
                            backgroundColor: "var(--color-surface)",
                            borderColor: isFocused
                                ? actualStatus === "error"
                                    ? "var(--color-error-500)"
                                    : actualStatus === "success"
                                      ? "var(--color-success-500)"
                                      : actualStatus === "warning"
                                        ? "var(--color-warning-500)"
                                        : "var(--color-primary-500)"
                                : "var(--color-border)",
                            color: "var(--color-text-primary)",
                        }}
                        aria-invalid={actualStatus === "error"}
                        aria-describedby={cn(
                            error && `${textareaId}-error`,
                            helperText && `${textareaId}-helper`,
                            hint && `${textareaId}-hint`,
                            showCharacterCount && `${textareaId}-count`,
                        )}
                        {...(({ leftIcon: _, ...rest }) => rest)(props as any)}
                    />
                </div>

                {showCharacterCount && (
                    <div className="flex justify-end mt-1">
                        <span
                            id={`${textareaId}-count`}
                            className={cn(
                                "text-xs transition-colors duration-200",
                                isOverLimit
                                    ? "text-[var(--color-error-600)]"
                                    : "text-[var(--color-text-tertiary)]",
                            )}
                            style={{
                                color: isOverLimit
                                    ? "var(--color-error-600)"
                                    : "var(--color-text-tertiary)",
                            }}
                        >
                            {characterCount}
                            {maxLength && `/${maxLength}`}
                        </span>
                    </div>
                )}

                <div className="mt-1 space-y-1">
                    {error && (
                        <p
                            id={`${textareaId}-error`}
                            className={cn(
                                "text-sm flex items-start gap-1",
                                errorClassName,
                            )}
                            style={{ color: "var(--color-error-600)" }}
                        >
                            <svg
                                className="w-4 h-4 mt-0.5 flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <span>
                                {Array.isArray(error) ? error[0] : error}
                            </span>
                        </p>
                    )}

                    {success && !error && (
                        <p
                            className="text-sm flex items-start gap-1"
                            style={{ color: "var(--color-success-600)" }}
                        >
                            <svg
                                className="w-4 h-4 mt-0.5 flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <span>{success}</span>
                        </p>
                    )}

                    {warning && !error && !success && (
                        <p
                            className="text-sm flex items-start gap-1"
                            style={{ color: "var(--color-warning-600)" }}
                        >
                            <svg
                                className="w-4 h-4 mt-0.5 flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <span>{warning}</span>
                        </p>
                    )}

                    {helperText && !error && !success && !warning && (
                        <p
                            id={`${textareaId}-helper`}
                            className="text-sm"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            {helperText}
                        </p>
                    )}

                    {hint && (
                        <p
                            id={`${textareaId}-hint`}
                            className="text-xs"
                            style={{ color: "var(--color-text-tertiary)" }}
                        >
                            {hint}
                        </p>
                    )}
                </div>
            </div>
        );
    },
);

Textarea.displayName = "Textarea";

export default Textarea;
