import React, { forwardRef, useState, useCallback } from "react";
import { Check, X } from "lucide-react";
import { ToggleSwitchProps } from "./types";
import { cn } from "@/lib/utils";

const ToggleSwitch = forwardRef<HTMLInputElement, ToggleSwitchProps>(
    (
        {
            label,
            description,
            error,
            success,
            warning,
            hint,
            size = "md",
            status = "default",
            colorScheme = "blue",
            required = false,
            optional = false,
            disabled = false,
            readOnly = false,
            loading = false,
            className = "",
            containerClassName = "",
            labelClassName = "",
            errorClassName = "",
            helperText,
            showOptionalText = true,
            showRequiredIndicator = true,
            showIcons = false,
            onText,
            offText,
            checked,
            defaultChecked = false,
            onChange,
            onFocus,
            onBlur,
            id,
            inputRef,
            ...props
        },
        ref,
    ) => {
        const [isFocused, setIsFocused] = useState(false);
        const [isChecked, setIsChecked] = useState(checked ?? defaultChecked);

        const toggleId =
            id || `toggle-${Math.random().toString(36).substr(2, 9)}`;
        const actualStatus = error
            ? "error"
            : success
              ? "success"
              : warning
                ? "warning"
                : status;

        const handleChange = useCallback(
            (e: React.ChangeEvent<HTMLInputElement>) => {
                if (disabled || readOnly || loading) return;

                const newChecked = e.target.checked;
                setIsChecked(newChecked);
                onChange?.(newChecked, e);
            },
            [disabled, readOnly, loading, onChange],
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

        React.useEffect(() => {
            if (checked !== undefined && checked !== isChecked) {
                setIsChecked(checked);
            }
        }, [checked, isChecked]);

        const sizeClasses = {
            xs: {
                switch: "w-7 h-4",
                thumb: "w-3 h-3",
                translate: "translate-x-3",
                text: "text-xs",
                icon: 10,
                gap: "gap-1.5",
            },
            sm: {
                switch: "w-9 h-5",
                thumb: "w-4 h-4",
                translate: "translate-x-4",
                text: "text-sm",
                icon: 12,
                gap: "gap-2",
            },
            md: {
                switch: "w-11 h-6",
                thumb: "w-5 h-5",
                translate: "translate-x-5",
                text: "text-base",
                icon: 14,
                gap: "gap-2.5",
            },
            lg: {
                switch: "w-14 h-7",
                thumb: "w-6 h-6",
                translate: "translate-x-7",
                text: "text-lg",
                icon: 16,
                gap: "gap-3",
            },
            xl: {
                switch: "w-16 h-8",
                thumb: "w-7 h-7",
                translate: "translate-x-8",
                text: "text-xl",
                icon: 18,
                gap: "gap-3.5",
            },
        };

        const colorSchemeClasses = {
            gray: {
                on: "bg-gray-600",
                off: "bg-border",
                focus: "focus:ring-gray-400",
            },
            primary: {
                on: "bg-primary-600",
                off: "bg-border",
                focus: "focus:ring-primary-500",
            },
            blue: {
                on: "bg-info-600",
                off: "bg-border",
                focus: "focus:ring-info-500",
            },
            green: {
                on: "bg-success-600",
                off: "bg-border",
                focus: "focus:ring-success-500",
            },
            red: {
                on: "bg-error-600",
                off: "bg-border",
                focus: "focus:ring-error-500",
            },
            yellow: {
                on: "bg-warning-500",
                off: "bg-border",
                focus: "focus:ring-warning-400",
            },
            purple: {
                on: "bg-purple-600",
                off: "bg-border",
                focus: "focus:ring-purple-500",
            },
            pink: {
                on: "bg-pink-600",
                off: "bg-border",
                focus: "focus:ring-pink-500",
            },
        };

        const switchClasses = cn(
            "relative inline-flex flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background",
            sizeClasses[size].switch,
            isChecked
                ? colorSchemeClasses[colorScheme].on
                : colorSchemeClasses[colorScheme].off,
            colorSchemeClasses[colorScheme].focus,
            actualStatus === "error" && "border-error-500 focus:ring-error-500",
            actualStatus === "success" && "border-success-500 focus:ring-success-500",
            actualStatus === "warning" && "border-warning-500 focus:ring-warning-500",
            disabled && "opacity-50 cursor-not-allowed grayscale-[0.5]",
            readOnly && "cursor-default",
            loading && "opacity-50 cursor-wait",
        );

        const thumbClasses = cn(
            "pointer-events-none inline-block rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out",
            "flex items-center justify-center",
            sizeClasses[size].thumb,
            isChecked ? sizeClasses[size].translate : "translate-x-0",
        );

        return (
            <div className={cn("flex flex-col", containerClassName)}>
                <div className={cn("flex items-start", sizeClasses[size].gap)}>
                    <div className="flex items-center">
                        <input
                            ref={inputRef || ref}
                            id={toggleId}
                            type="checkbox"
                            checked={isChecked}
                            onChange={handleChange}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            disabled={disabled || loading}
                            readOnly={readOnly}
                            required={required}
                            className="sr-only"
                            aria-invalid={actualStatus === "error"}
                            aria-describedby={cn(
                                error && `${toggleId}-error`,
                                helperText && `${toggleId}-helper`,
                                hint && `${toggleId}-hint`,
                                description && `${toggleId}-description`,
                            )}
                            {...props}
                        />

                        <label
                            htmlFor={toggleId}
                            className={cn(switchClasses, className)}
                            role="switch"
                            aria-checked={isChecked}
                        >
                            <span className={thumbClasses}>
                                {loading && (
                                    <div className="animate-spin text-text-tertiary">
                                        <svg
                                            width={sizeClasses[size].icon}
                                            height={sizeClasses[size].icon}
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
                                )}

                                {!loading && showIcons && (
                                    <div className="text-text-secondary">
                                        {isChecked ? (
                                            <Check
                                                size={sizeClasses[size].icon}
                                                className="text-white"
                                            />
                                        ) : (
                                            <X size={sizeClasses[size].icon} />
                                        )}
                                    </div>
                                )}
                            </span>
                        </label>

                        {(onText || offText) && (
                            <span
                                className={cn(
                                    "ml-2 font-medium",
                                    sizeClasses[size].text,
                                    isChecked
                                        ? "text-text-primary"
                                        : "text-text-secondary",
                                    disabled && "text-text-tertiary",
                                )}
                            >
                                {isChecked ? onText : offText}
                            </span>
                        )}
                    </div>

                    {(label || description) && (
                        <div className="flex-1 min-w-0">
                            {label && (
                                <label
                                    htmlFor={toggleId}
                                    className={cn(
                                        "block font-medium cursor-pointer transition-colors duration-200",
                                        sizeClasses[size].text,
                                        actualStatus === "error"
                                            ? "text-error-600"
                                            : "text-text-primary",
                                        disabled &&
                                            "text-text-tertiary cursor-not-allowed",
                                        labelClassName,
                                    )}
                                >
                                    {label}
                                    {required && showRequiredIndicator && (
                                        <span className="text-error-500 ml-1">
                                            *
                                        </span>
                                    )}
                                    {optional &&
                                        showOptionalText &&
                                        !required && (
                                            <span className="text-text-tertiary text-sm ml-1">
                                                (optional)
                                            </span>
                                        )}
                                </label>
                            )}

                            {description && (
                                <p
                                    id={`${toggleId}-description`}
                                    className={cn(
                                        "mt-1 text-text-secondary leading-relaxed",
                                        size === "xs" ? "text-xs" : "text-sm",
                                        disabled && "text-text-tertiary",
                                    )}
                                >
                                    {description}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-1 space-y-1">
                    {error && (
                        <p
                            id={`${toggleId}-error`}
                            className={cn(
                                "text-sm text-error-600 animate-fadeIn",
                                errorClassName,
                            )}
                        >
                            {Array.isArray(error) ? error[0] : error}
                        </p>
                    )}

                    {success && !error && (
                        <p className="text-sm text-success-600 animate-fadeIn">{success}</p>
                    )}

                    {warning && !error && !success && (
                        <p className="text-sm text-warning-600 animate-fadeIn">{warning}</p>
                    )}

                    {helperText && !error && !success && !warning && (
                        <p
                            id={`${toggleId}-helper`}
                            className="text-sm text-text-secondary"
                        >
                            {helperText}
                        </p>
                    )}

                    {hint && (
                        <p
                            id={`${toggleId}-hint`}
                            className="text-xs text-text-tertiary"
                        >
                            {hint}
                        </p>
                    )}
                </div>
            </div>
        );
    },
);

ToggleSwitch.displayName = "ToggleSwitch";

export default ToggleSwitch;
