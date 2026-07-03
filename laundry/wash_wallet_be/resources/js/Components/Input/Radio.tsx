import React, { forwardRef, useCallback } from "react";
import { RadioProps, RadioOption } from "./types";
import { cn } from "@/lib/utils";

const Radio = forwardRef<HTMLInputElement, RadioProps>(
    (
        {
            label,
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
            fullWidth = false,
            className = "",
            containerClassName = "",
            labelClassName = "",
            errorClassName = "",
            helperText,
            showOptionalText = true,
            showRequiredIndicator = true,
            options = [],
            direction = "column",
            spacing = "normal",
            value,
            defaultValue,
            onChange,
            id,
            radioRef,
            ...props
        },
        ref
    ) => {
        const groupId =
            id || `radio-group-${Math.random().toString(36).substr(2, 9)}`;
        const actualStatus = error
            ? "error"
            : success
            ? "success"
            : warning
            ? "warning"
            : status;

        const handleChange = useCallback(
            (optionValue: string | number) => {
                if (disabled || readOnly) return;
                onChange?.(optionValue);
            },
            [disabled, readOnly, onChange]
        );

        const sizeClasses = {
            xs: {
                radio: "w-3 h-3",
                text: "text-xs",
                spacing: "gap-1.5",
            },
            sm: {
                radio: "w-4 h-4",
                text: "text-sm",
                spacing: "gap-2",
            },
            md: {
                radio: "w-5 h-5",
                text: "text-base",
                spacing: "gap-2.5",
            },
            lg: {
                radio: "w-6 h-6",
                text: "text-lg",
                spacing: "gap-3",
            },
            xl: {
                radio: "w-7 h-7",
                text: "text-xl",
                spacing: "gap-3.5",
            },
        };

        const colorSchemeClasses = {
            gray: "text-[var(--color-gray-600)] focus:ring-[var(--color-gray-500)]",
            blue: "text-[var(--color-info-600)] focus:ring-[var(--color-info-500)]",
            green: "text-[var(--color-success-600)] focus:ring-[var(--color-success-500)]",
            red: "text-[var(--color-error-600)] focus:ring-[var(--color-error-500)]",
            yellow: "text-[var(--color-warning-600)] focus:ring-[var(--color-warning-500)]",
            purple: "text-[var(--color-purple-600)] focus:ring-[var(--color-purple-500)]",
            pink: "text-[var(--color-rose-600)] focus:ring-[var(--color-rose-500)]",
        };

        const spacingClasses = {
            tight: direction === "row" ? "gap-3" : "gap-1",
            normal: direction === "row" ? "gap-4" : "gap-2",
            loose: direction === "row" ? "gap-6" : "gap-4",
        };

        const directionClasses = {
            row: "flex flex-row flex-wrap",
            column: "flex flex-col",
        };

        const radioClasses = cn(
            "border-[var(--color-gray-300)] focus:ring-2 focus:ring-offset-0",
            sizeClasses[size].radio,
            colorSchemeClasses[colorScheme],
            actualStatus === "error" &&
                "border-[var(--color-error-500)] text-[var(--color-error-600)] focus:ring-[var(--color-error-500)]",
            actualStatus === "success" &&
                "border-[var(--color-success-500)] text-[var(--color-success-600)] focus:ring-[var(--color-success-500)]",
            actualStatus === "warning" &&
                "border-[var(--color-warning-500)] text-[var(--color-warning-600)] focus:ring-[var(--color-warning-500)]",
            disabled && "opacity-50 cursor-not-allowed",
            readOnly && "cursor-default"
        );

        return (
            <div className={cn("flex flex-col", containerClassName)}>
                {label && (
                    <legend
                        className={cn(
                            "block font-medium mb-1.5",
                            sizeClasses[size].text,
                            actualStatus === "error"
                                ? "text-[var(--color-error-700)]"
                                : "text-[var(--color-gray-700)]",
                            disabled && "text-[var(--color-gray-400)]",
                            labelClassName,
                        )}
                    >
                        {label}
                        {required && showRequiredIndicator && (
                            <span className="text-[var(--color-error-500)] ml-1">*</span>
                        )}
                        {optional && showOptionalText && !required && (
                            <span className="text-[var(--color-gray-400)] text-sm ml-1">
                                (optional)
                            </span>
                        )}
                    </legend>
                )}

                <fieldset
                    className={cn(
                        directionClasses[direction],
                        spacingClasses[spacing],
                        fullWidth && "w-full",
                        className,
                    )}
                    disabled={disabled}
                >
                    {options.map((option, index) => {
                        const optionId = `${groupId}-option-${index}`;
                        const isSelected =
                            value !== undefined
                                ? value === option.value
                                : defaultValue === option.value;
                        const isDisabled = disabled || option.disabled;

                        return (
                            <label
                                key={optionId}
                                htmlFor={optionId}
                                className={cn(
                                    "flex items-start cursor-pointer",
                                    sizeClasses[size].spacing,
                                    isDisabled &&
                                        "cursor-not-allowed opacity-50",
                                    readOnly && "cursor-default",
                                )}
                            >
                                <input
                                    ref={
                                        index === 0
                                            ? radioRef || ref
                                            : undefined
                                    }
                                    id={optionId}
                                    type="radio"
                                    name={groupId}
                                    value={option.value}
                                    checked={isSelected}
                                    disabled={isDisabled}
                                    readOnly={readOnly}
                                    onChange={() => handleChange(option.value)}
                                    className={radioClasses}
                                    aria-describedby={cn(
                                        error && `${groupId}-error`,
                                        helperText && `${groupId}-helper`,
                                        hint && `${groupId}-hint`,
                                        option.description &&
                                            `${optionId}-description`,
                                    )}
                                    {...props}
                                />

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        {option.icon && (
                                            <div className="text-[var(--color-gray-500)] flex-shrink-0">
                                                {option.icon}
                                            </div>
                                        )}

                                        <span
                                            className={cn(
                                                "font-medium",
                                                sizeClasses[size].text,
                                                isSelected
                                                    ? "text-[var(--color-gray-900)]"
                                                    : "text-[var(--color-gray-700)]",
                                                isDisabled && "text-[var(--color-gray-400)]",
                                            )}
                                        >
                                            {option.label}
                                        </span>
                                    </div>

                                    {option.description && (
                                        <p
                                            id={`${optionId}-description`}
                                            className={cn(
                                                "mt-1 text-[var(--color-gray-500)]",
                                                size === "xs"
                                                    ? "text-xs"
                                                    : "text-sm",
                                                isDisabled && "text-[var(--color-gray-400)]",
                                            )}
                                        >
                                            {option.description}
                                        </p>
                                    )}
                                </div>
                            </label>
                        );
                    })}
                </fieldset>

                <div className="mt-1 space-y-1">
                    {error && (
                        <p
                            id={`${groupId}-error`}
                            className={cn(
                                "text-sm text-[var(--color-error-600)]",
                                errorClassName,
                            )}
                        >
                            {Array.isArray(error) ? error[0] : error}
                        </p>
                    )}

                    {success && !error && (
                        <p className="text-sm text-[var(--color-success-600)]">{success}</p>
                    )}

                    {warning && !error && !success && (
                        <p className="text-sm text-[var(--color-warning-600)]">{warning}</p>
                    )}

                    {helperText && !error && !success && !warning && (
                        <p
                            id={`${groupId}-helper`}
                            className="text-sm text-[var(--color-gray-500)]"
                        >
                            {helperText}
                        </p>
                    )}

                    {hint && (
                        <p
                            id={`${groupId}-hint`}
                            className="text-xs text-[var(--color-gray-400)]"
                        >
                            {hint}
                        </p>
                    )}
                </div>
            </div>
        );
    }
);

Radio.displayName = "Radio";

export default Radio;
