import React, {
    forwardRef,
    useState,
    useCallback,
    useEffect,
    useRef,
} from "react";
import { NumberInputProps } from "./types";
import { cn } from "@/lib/utils";

const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
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
            min,
            max,
            step = 1,
            precision,
            allowNegative = true,
            allowDecimal = true,
            thousandSeparator = ",",
            decimalSeparator = ".",
            prefix,
            suffix,
            onValueChange,
            clampValueOnBlur = true,
            keepWithinRange = true,
            value,
            onChange,
            onBlur,
            onFocus,
            id,
            inputRef,
            ...props
        },
        ref,
    ) => {
        const [inputValue, setInputValue] = useState("");
        const [isFocused, setIsFocused] = useState(false);

        const internalRef = useRef<HTMLInputElement>(null);
        const actualRef = inputRef || internalRef;

        const inputId =
            id || `number-input-${Math.random().toString(36).substr(2, 9)}`;
        const actualStatus = error
            ? "error"
            : success
                ? "success"
                : warning
                    ? "warning"
                    : status;

        const formatNumber = useCallback(
            (num: number, applyPrecision: boolean = true, rawString?: string): string => {
                if (isNaN(num)) return "";

                let formatted = num.toString();

                if (applyPrecision && precision !== undefined && precision >= 0) {
                    formatted = num.toFixed(precision);
                } else if (!applyPrecision && rawString && rawString.includes(decimalSeparator)) {
                    let userDecimals = rawString.split(decimalSeparator)[1] || "";
                    if (suffix) userDecimals = userDecimals.replace(suffix, "");
                    userDecimals = userDecimals.replace(/[^0-9]/g, "");

                    const integerPartStr = Math.trunc(num).toString();
                    formatted = integerPartStr + "." + userDecimals;
                }

                const parts = formatted.split(".");
                let integerPart = parts[0];
                const decimalPart = parts[1];

                if (thousandSeparator) {
                    integerPart = integerPart.replace(
                        /\B(?=(\d{3})+(?!\d))/g,
                        thousandSeparator,
                    );
                }

                let result = integerPart;
                if (decimalPart !== undefined && allowDecimal) {
                    result += decimalSeparator + decimalPart;
                }

                return result;
            },
            [precision, thousandSeparator, decimalSeparator, allowDecimal, suffix],
        );

        const parseNumber = useCallback(
            (str: string): number | null => {
                if (!str || str.trim() === "") return null;

                let cleanStr = str;
                if (prefix) cleanStr = cleanStr.replace(prefix, "");
                if (suffix) cleanStr = cleanStr.replace(suffix, "");

                cleanStr = cleanStr.replace(
                    new RegExp(`\\${thousandSeparator}`, "g"),
                    "",
                );
                if (decimalSeparator !== ".") {
                    cleanStr = cleanStr.replace(decimalSeparator, ".");
                }

                const parsed = parseFloat(cleanStr);
                return isNaN(parsed) ? null : parsed;
            },
            [prefix, suffix, thousandSeparator, decimalSeparator],
        );

        const clampValue = useCallback(
            (num: number): number => {
                if (!keepWithinRange) return num;

                let clamped = num;
                if (min !== undefined && clamped < min) clamped = min;
                if (max !== undefined && clamped > max) clamped = max;

                return clamped;
            },
            [min, max, keepWithinRange],
        );

        const getDisplayValue = useCallback(
            (num: number | null, applyPrecision: boolean = true, rawString?: string): string => {
                if (num === null) return "";

                let display = formatNumber(num, applyPrecision, rawString);

                if (prefix) display = prefix + display;
                if (suffix) display = display + suffix;

                return display;
            },
            [formatNumber, prefix, suffix],
        );

        useEffect(() => {
            if (isFocused) return;
            if (value !== undefined) {
                const numValue =
                    typeof value === "string" ? parseNumber(value) : value;
                setInputValue(
                    numValue !== null ? getDisplayValue(numValue, true) : "",
                );
            }
        }, [value, isFocused, parseNumber, getDisplayValue]);

        const handleChange = useCallback(
            (e: React.ChangeEvent<HTMLInputElement>) => {
                let newValue = e.target.value;

                if (!allowNegative && newValue.includes("-")) {
                    newValue = newValue.replace("-", "");
                }

                if (!allowDecimal && newValue.includes(decimalSeparator)) {
                    newValue = newValue.replace(decimalSeparator, "");
                }

                const parsedValue = parseNumber(newValue);
                if (parsedValue !== null) {
                    const clampedValue = clampValue(parsedValue);
                    const formatted = getDisplayValue(clampedValue, false, newValue);
                    setInputValue(formatted);
                    onChange?.(e);
                    onValueChange?.(clampedValue, getDisplayValue(clampedValue, true));
                } else {
                    setInputValue(newValue);
                    onChange?.(e);
                    onValueChange?.(null, newValue);
                }
            },
            [
                allowNegative,
                allowDecimal,
                decimalSeparator,
                parseNumber,
                clampValue,
                onChange,
                onValueChange,
            ],
        );

        const handleBlur = useCallback(
            (e: React.FocusEvent<HTMLInputElement>) => {
                setIsFocused(false);

                if (clampValueOnBlur) {
                    const parsedValue = parseNumber(inputValue);
                    if (parsedValue !== null) {
                        const clampedValue = clampValue(parsedValue);
                        const formattedValue = getDisplayValue(clampedValue, true);
                        setInputValue(formattedValue);
                        onValueChange?.(clampedValue, formattedValue);
                    }
                }

                onBlur?.(e);
            },
            [
                clampValueOnBlur,
                inputValue,
                parseNumber,
                clampValue,
                getDisplayValue,
                onValueChange,
                onBlur,
            ],
        );

        const handleFocus = useCallback(
            (e: React.FocusEvent<HTMLInputElement>) => {
                setIsFocused(true);
                onFocus?.(e);
            },
            [onFocus],
        );

        const handleIncrement = useCallback(() => {
            if (disabled || readOnly) return;

            const currentValue = parseNumber(inputValue) || 0;
            const newValue = clampValue(currentValue + step);
            const formattedValue = getDisplayValue(newValue, true);

            setInputValue(formattedValue);
            onValueChange?.(newValue, formattedValue);
        }, [
            disabled,
            readOnly,
            inputValue,
            parseNumber,
            step,
            clampValue,
            getDisplayValue,
            onValueChange,
        ]);

        const handleDecrement = useCallback(() => {
            if (disabled || readOnly) return;

            const currentValue = parseNumber(inputValue) || 0;
            const newValue = clampValue(currentValue - step);
            const formattedValue = getDisplayValue(newValue, true);

            setInputValue(formattedValue);
            onValueChange?.(newValue, formattedValue);
        }, [
            disabled,
            readOnly,
            inputValue,
            parseNumber,
            step,
            clampValue,
            getDisplayValue,
            onValueChange,
        ]);

        const handleKeyDown = useCallback(
            (e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "ArrowUp") {
                    e.preventDefault();
                    handleIncrement();
                } else if (e.key === "ArrowDown") {
                    e.preventDefault();
                    handleDecrement();
                }
            },
            [handleIncrement, handleDecrement],
        );

        const iconSizeClasses = {
            xs: "w-3 h-3",
            sm: "w-4 h-4",
            md: "w-5 h-5",
            lg: "w-6 h-6",
            xl: "w-7 h-7",
        };

        const iconSizes = {
            xs: 12,
            sm: 14,
            md: 16,
            lg: 18,
            xl: 20,
        };

        const baseClasses = cn(
            "transition-all duration-200 ease-in-out",
            "focus:outline-none focus:ring-2 focus:ring-offset-0",
            "placeholder:text-text-tertiary",
            "text-text-primary",
            disabled && "cursor-not-allowed opacity-50",
            readOnly && "cursor-default",
            fullWidth ? "w-full" : "w-auto",
        );

        const variantClasses = {
            default: cn(
                "border rounded-lg",
                "bg-surface",
                "border-border",
                "focus:border-primary-500",
                "focus:ring-primary-500/20",
                actualStatus === "error" && [
                    "border-error-500",
                    "focus:border-error-500",
                    "focus:ring-error-500/20",
                ],
                actualStatus === "success" && [
                    "border-success-500",
                    "focus:border-success-500",
                    "focus:ring-success-500/20",
                ],
                actualStatus === "warning" && [
                    "border-warning-500",
                    "focus:border-warning-500",
                    "focus:ring-warning-500/20",
                ],
                disabled &&
                "bg-surface-muted border-border",
            ),
            outline: cn(
                "border-2 rounded-lg bg-transparent",
                "border-border",
                "focus:border-primary-500",
                "focus:ring-primary-500/20",
                actualStatus === "error" && [
                    "border-error-500",
                    "focus:border-error-500",
                    "focus:ring-error-500/20",
                ],
                disabled && "border-border",
            ),
            filled: cn(
                "border border-transparent rounded-lg",
                "bg-surface-muted",
                "focus:bg-surface",
                "focus:border-primary-500",
                "focus:ring-primary-500/20",
                disabled && "bg-surface-muted opacity-50",
            ),
            underline: cn(
                "border-0 border-b-2 rounded-none bg-transparent",
                "border-border",
                "focus:border-primary-500 focus:ring-0",
                disabled && "border-border",
            ),
            ghost: cn(
                "border border-transparent rounded-lg bg-transparent",
                "hover:bg-surface-muted",
                "focus:bg-surface",
                "focus:border-border",
                "focus:ring-border",
                disabled && "hover:bg-transparent",
            ),
        };

        const sizeClasses = {
            xs: "px-2 py-1 text-xs",
            sm: "px-3 py-1.5 text-sm",
            md: "px-3 py-2 text-base",
            lg: "px-4 py-2.5 text-lg",
            xl: "px-5 py-3 text-xl",
        };

        const hasLeftContent = leftIcon || leftAddon;
        const hasRightContent = rightIcon || rightAddon;

        const inputClasses = cn(
            baseClasses,
            variantClasses[variant],
            sizeClasses[size],
            hasLeftContent && "pl-10",
            hasRightContent && "pr-20",
            className,
        );

        return (
            <div className={cn("flex flex-col", containerClassName)}>
                {label && (
                    <label
                        htmlFor={inputId}
                        className={cn(
                            "block font-medium mb-1.5",
                            sizeClasses[size]?.includes("text-xs")
                                ? "text-xs"
                                : "text-sm",
                            actualStatus === "error"
                                ? "text-error-600"
                                : "text-text-primary",
                            disabled && "text-text-tertiary",
                            labelClassName,
                        )}
                    >
                        {label}
                        {required && showRequiredIndicator && (
                            <span className="text-error-500 ml-1">
                                *
                            </span>
                        )}
                        {optional && showOptionalText && !required && (
                            <span className="text-text-tertiary text-sm ml-1">
                                (optional)
                            </span>
                        )}
                    </label>
                )}

                <div className="relative">
                    {leftAddon && (
                        <div className="absolute left-0 top-0 h-full flex items-center pl-3">
                            {leftAddon}
                        </div>
                    )}

                    {leftIcon && !leftAddon && (
                        <div className="absolute left-0 top-0 h-full flex items-center pl-3 pointer-events-none">
                            <div className="text-text-tertiary">
                                {React.isValidElement(leftIcon)
                                    ? React.cloneElement(leftIcon, {
                                        size: iconSizes[size],
                                        className: iconSizeClasses[size],
                                    } as any)
                                    : leftIcon}
                            </div>
                        </div>
                    )}

                    <input
                        ref={actualRef || ref}
                        id={inputId}
                        type="text"
                        inputMode="numeric"
                        value={inputValue}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        onFocus={handleFocus}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        disabled={disabled || loading}
                        readOnly={readOnly}
                        required={required}
                        className={inputClasses}
                        aria-invalid={actualStatus === "error"}
                        aria-describedby={cn(
                            error && `${inputId}-error`,
                            helperText && `${inputId}-helper`,
                            hint && `${inputId}-hint`,
                        )}
                        {...props}
                    />

                    <div className="absolute right-0 top-0 h-full flex items-center pr-3 gap-1">
                        {loading && (
                            <div className="animate-spin text-text-tertiary">
                                <svg
                                    width={iconSizes[size]}
                                    height={iconSizes[size]}
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

                        {rightIcon && !loading && (
                            <div className="text-text-tertiary">
                                {React.isValidElement(rightIcon)
                                    ? React.cloneElement(rightIcon, {
                                        size: iconSizes[size],
                                        className: iconSizeClasses[size],
                                    } as any)
                                    : rightIcon}
                            </div>
                        )}
                    </div>

                    {rightAddon && (
                        <div className="absolute right-0 top-0 h-full flex items-center pr-3">
                            {rightAddon}
                        </div>
                    )}
                </div>

                <div className="mt-1 space-y-1">
                    {error && (
                        <p
                            id={`${inputId}-error`}
                            className={cn(
                                "text-sm text-error-600",
                                errorClassName,
                            )}
                        >
                            {Array.isArray(error) ? error[0] : error}
                        </p>
                    )}

                    {success && !error && (
                        <p className="text-sm text-success-600">
                            {success}
                        </p>
                    )}

                    {warning && !error && !success && (
                        <p className="text-sm text-warning-600">
                            {warning}
                        </p>
                    )}

                    {helperText && !error && !success && !warning && (
                        <p
                            id={`${inputId}-helper`}
                            className="text-sm text-text-secondary"
                        >
                            {helperText}
                        </p>
                    )}

                    {hint && (
                        <p
                            id={`${inputId}-hint`}
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

NumberInput.displayName = "NumberInput";

export default NumberInput;
