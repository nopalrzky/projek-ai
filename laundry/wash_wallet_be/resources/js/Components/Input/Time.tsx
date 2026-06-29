import React, {
    forwardRef,
    useState,
    useCallback,
    useEffect,
    useMemo,
} from "react";
import { Clock, ChevronDown, X } from "lucide-react";
import { TimeInputProps } from "./types";
import Button from "@/Components/Button/Button";
import { cn } from "@/lib/utils";

const TimeInput = forwardRef<HTMLInputElement, TimeInputProps>(
    (
        {
            label,
            placeholder = "Pilih waktu...",
            error,
            success,
            warning,
            hint,
            variant = "default",
            size = "md",
            status = "default",
            colorScheme = "blue",
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
            helperText,
            showOptionalText = true,
            showRequiredIndicator = true,
            value,
            onChange,
            onValueChange,
            onFocus,
            onBlur,
            format = "24",
            step = 60,
            min,
            max,
            showSeconds = false,
            showPicker = true,
            timeOptions,
            interval = 30,
            use12Hour = false,
            ampmLabels = { am: "AM", pm: "PM" },
            clearable = true,
            onClear,
            autoFormat = true,
            id,
            inputRef,
            ...props
        },
        ref
    ) => {
        const [isFocused, setIsFocused] = useState(false);
        const [isPickerOpen, setIsPickerOpen] = useState(false);
        const [inputValue, setInputValue] = useState(value || "");

        const inputId =
            id || `time-input-${Math.random().toString(36).substr(2, 9)}`;
        const actualStatus = error
            ? "error"
            : success
            ? "success"
            : warning
            ? "warning"
            : status;

        // Generate time options based on interval
        const generatedTimeOptions = useMemo(() => {
            if (timeOptions) return timeOptions;

            const options = [];
            const totalMinutes = 24 * 60;

            for (let minutes = 0; minutes < totalMinutes; minutes += interval) {
                const hours = Math.floor(minutes / 60);
                const mins = minutes % 60;

                let timeString = `${hours.toString().padStart(2, "0")}:${mins
                    .toString()
                    .padStart(2, "0")}`;
                let displayString = timeString;

                if (use12Hour) {
                    const hour12 =
                        hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
                    const ampm = hours >= 12 ? ampmLabels.pm : ampmLabels.am;
                    displayString = `${hour12}:${mins
                        .toString()
                        .padStart(2, "0")} ${ampm}`;
                }

                if (showSeconds) {
                    timeString += ":00";
                    if (!use12Hour) displayString += ":00";
                }

                options.push({
                    value: timeString,
                    label: displayString,
                });
            }

            return options;
        }, [timeOptions, interval, use12Hour, ampmLabels, showSeconds]);

        // Format time value for display
        const formatTimeForDisplay = useCallback(
            (timeValue: string) => {
                if (!timeValue) return "";

                const [hours, minutes, seconds] = timeValue.split(":");
                const hour = parseInt(hours, 10);
                const min = minutes || "00";
                const sec = seconds || "00";

                if (use12Hour) {
                    const hour12 =
                        hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                    const ampm = hour >= 12 ? ampmLabels.pm : ampmLabels.am;
                    return showSeconds
                        ? `${hour12}:${min}:${sec} ${ampm}`
                        : `${hour12}:${min} ${ampm}`;
                }

                return showSeconds
                    ? `${hours}:${min}:${sec}`
                    : `${hours}:${min}`;
            },
            [use12Hour, ampmLabels, showSeconds]
        );

        // Auto format input as user types
        const autoFormatInput = useCallback(
            (input: string) => {
                if (!autoFormat) return input;

                // Remove all non-digit characters
                const digitsOnly = input.replace(/\D/g, "");

                if (digitsOnly.length === 0) return "";
                if (digitsOnly.length <= 2) return digitsOnly;
                if (digitsOnly.length <= 4)
                    return `${digitsOnly.slice(0, 2)}:${digitsOnly.slice(2)}`;
                if (showSeconds && digitsOnly.length <= 6) {
                    return `${digitsOnly.slice(0, 2)}:${digitsOnly.slice(
                        2,
                        4
                    )}:${digitsOnly.slice(4)}`;
                }

                return showSeconds
                    ? `${digitsOnly.slice(0, 2)}:${digitsOnly.slice(
                          2,
                          4
                      )}:${digitsOnly.slice(4, 6)}`
                    : `${digitsOnly.slice(0, 2)}:${digitsOnly.slice(2, 4)}`;
            },
            [autoFormat, showSeconds]
        );

        // Validate time string
        const isValidTime = useCallback(
            (timeStr: string) => {
                if (!timeStr) return true;

                const timeRegex = showSeconds
                    ? /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/
                    : /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

                if (!timeRegex.test(timeStr)) return false;

                const [hours, minutes, seconds = "00"] = timeStr
                    .split(":")
                    .map(Number);

                if (
                    hours > 23 ||
                    minutes > 59 ||
                    parseInt(seconds.toString()) > 59
                )
                    return false;

                // Check min/max constraints
                if (min && timeStr < min) return false;
                if (max && timeStr > max) return false;

                return true;
            },
            [showSeconds, min, max]
        );

        // Update input value when prop value changes
        useEffect(() => {
            setInputValue(value || "");
        }, [value]);

        // Base classes
        const baseClasses = cn(
            "transition-all duration-200 ease-in-out",
            "focus:outline-none focus:ring-2 focus:ring-offset-0",
            "placeholder:text-gray-400 dark:placeholder:text-gray-500",
            "text-gray-900 dark:text-gray-100",
            disabled && "cursor-not-allowed opacity-60",
            readOnly && "cursor-default",
            fullWidth ? "w-full" : "w-auto"
        );

        const variantClasses = {
            default: cn(
                "border rounded-lg",
                "bg-white dark:bg-gray-800",
                "border-gray-300 dark:border-gray-600",
                "focus:border-blue-500 dark:focus:border-blue-400",
                "focus:ring-blue-500/20 dark:focus:ring-blue-400/20",
                actualStatus === "error" && [
                    "border-red-500 dark:border-red-400",
                    "focus:border-red-500 dark:focus:border-red-400",
                    "focus:ring-red-500/20 dark:focus:ring-red-400/20",
                    "bg-red-50/50 dark:bg-red-900/10",
                ],
                actualStatus === "success" && [
                    "border-green-500 dark:border-green-400",
                    "focus:border-green-500 dark:focus:border-green-400",
                    "focus:ring-green-500/20 dark:focus:ring-green-400/20",
                    "bg-green-50/50 dark:bg-green-900/10",
                ],
                actualStatus === "warning" && [
                    "border-yellow-500 dark:border-yellow-400",
                    "focus:border-yellow-500 dark:focus:border-yellow-400",
                    "focus:ring-yellow-500/20 dark:focus:ring-yellow-400/20",
                    "bg-yellow-50/50 dark:bg-yellow-900/10",
                ],
                disabled && [
                    "bg-gray-50 dark:bg-gray-900/50",
                    "border-gray-200 dark:border-gray-700",
                    "text-gray-400 dark:text-gray-500",
                ]
            ),
            outline: cn(
                "border-2 rounded-lg bg-transparent",
                "border-gray-300 dark:border-gray-600",
                "focus:border-blue-500 dark:focus:border-blue-400",
                "focus:ring-blue-500/20 dark:focus:ring-blue-400/20",
                actualStatus === "error" && [
                    "border-red-500 dark:border-red-400",
                    "focus:border-red-500 dark:focus:border-red-400",
                    "focus:ring-red-500/20 dark:focus:ring-red-400/20",
                ],
                disabled && "border-gray-200 dark:border-gray-700"
            ),
            filled: cn(
                "border border-transparent rounded-lg",
                "bg-gray-100 dark:bg-gray-800",
                "focus:bg-white dark:focus:bg-gray-700",
                "focus:border-blue-500 dark:focus:border-blue-400",
                "focus:ring-blue-500/20 dark:focus:ring-blue-400/20",
                disabled && "bg-gray-50 dark:bg-gray-900/50"
            ),
            underline: cn(
                "border-0 border-b-2 rounded-none bg-transparent",
                "border-gray-300 dark:border-gray-600",
                "focus:border-blue-500 dark:focus:border-blue-400 focus:ring-0",
                disabled && "border-gray-200 dark:border-gray-700"
            ),
            ghost: cn(
                "border border-transparent rounded-lg bg-transparent",
                "hover:bg-gray-50 dark:hover:bg-gray-800",
                "focus:bg-white dark:focus:bg-gray-700",
                "focus:border-gray-300 dark:focus:border-gray-600",
                disabled && "hover:bg-transparent"
            ),
        };

        const sizeClasses = {
            xs: "px-2 py-1 text-xs",
            sm: "px-3 py-1.5 text-sm",
            md: "px-3 py-2 text-base",
            lg: "px-4 py-2.5 text-lg",
            xl: "px-5 py-3 text-xl",
        };

        const iconSizeClasses = {
            xs: 12,
            sm: 14,
            md: 16,
            lg: 18,
            xl: 20,
        };

        const labelSizeClasses = {
            xs: "text-xs",
            sm: "text-sm",
            md: "text-sm",
            lg: "text-base",
            xl: "text-lg",
        };

        const handleInputChange = useCallback(
            (e: React.ChangeEvent<HTMLInputElement>) => {
                const rawValue = e.target.value;
                const formattedValue = autoFormatInput(rawValue);

                setInputValue(formattedValue);

                // Create synthetic event with formatted value
                const syntheticEvent = {
                    ...e,
                    target: {
                        ...e.target,
                        value: formattedValue,
                    },
                };

                onChange?.(
                    syntheticEvent as React.ChangeEvent<HTMLInputElement>
                );

                // Call onValueChange if time is valid or empty
                if (formattedValue === "" || isValidTime(formattedValue)) {
                    onValueChange?.(formattedValue || null);
                }
            },
            [autoFormatInput, onChange, onValueChange, isValidTime]
        );

        const handleFocus = useCallback(
            (e: React.FocusEvent<HTMLInputElement>) => {
                setIsFocused(true);
                onFocus?.(e);
            },
            [onFocus]
        );

        const handleBlur = useCallback(
            (e: React.FocusEvent<HTMLInputElement>) => {
                setIsFocused(false);
                setIsPickerOpen(false);
                onBlur?.(e);
            },
            [onBlur]
        );

        const handleTimeSelect = useCallback(
            (selectedTime: string) => {
                setInputValue(selectedTime);
                setIsPickerOpen(false);

                // Create synthetic event
                const syntheticEvent = {
                    target: { value: selectedTime },
                } as React.ChangeEvent<HTMLInputElement>;

                onChange?.(syntheticEvent);
                onValueChange?.(selectedTime);
            },
            [onChange, onValueChange]
        );

        const handleClear = useCallback(() => {
            setInputValue("");
            setIsPickerOpen(false);

            const syntheticEvent = {
                target: { value: "" },
            } as React.ChangeEvent<HTMLInputElement>;

            onChange?.(syntheticEvent);
            onValueChange?.(null);
            onClear?.();
        }, [onChange, onValueChange, onClear]);

        const togglePicker = useCallback(() => {
            if (!disabled && !readOnly) {
                setIsPickerOpen(!isPickerOpen);
            }
        }, [disabled, readOnly, isPickerOpen]);

        const inputClasses = cn(
            baseClasses,
            variantClasses[variant],
            sizeClasses[size],
            "pl-10", // Space for clock icon
            (clearable || showPicker) && "pr-20", // Space for buttons
            !clearable && !showPicker && rightIcon && "pr-10",
            className
        );

        return (
            <div className={cn("flex flex-col", containerClassName)}>
                {/* Label */}
                {label && (
                    <label
                        htmlFor={inputId}
                        className={cn(
                            "block font-medium mb-1.5",
                            labelSizeClasses[size],
                            actualStatus === "error"
                                ? "text-red-700 dark:text-red-400"
                                : "text-gray-700 dark:text-gray-300",
                            disabled && "text-gray-400 dark:text-gray-500",
                            labelClassName
                        )}
                    >
                        {label}
                        {required && showRequiredIndicator && (
                            <span className="text-red-500 dark:text-red-400 ml-1">
                                *
                            </span>
                        )}
                        {optional && showOptionalText && !required && (
                            <span className="text-gray-400 dark:text-gray-500 text-sm ml-1">
                                (optional)
                            </span>
                        )}
                    </label>
                )}

                {/* Input Container */}
                <div className="relative">
                    {/* Clock Icon */}
                    <div className="absolute left-0 top-0 h-full flex items-center pl-3 pointer-events-none">
                        <div className="text-gray-400 dark:text-gray-500">
                            {leftIcon || <Clock size={iconSizeClasses[size]} />}
                        </div>
                    </div>

                    {/* Input */}
                    <input
                        ref={inputRef || ref}
                        id={inputId}
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder={placeholder}
                        disabled={disabled || loading}
                        readOnly={readOnly}
                        required={required}
                        className={inputClasses}
                        aria-invalid={actualStatus === "error"}
                        aria-describedby={cn(
                            error && `${inputId}-error`,
                            helperText && `${inputId}-helper`,
                            hint && `${inputId}-hint`
                        )}
                        {...props}
                    />

                    {/* Right Icons Container */}
                    <div className="absolute right-0 top-0 h-full flex items-center pr-3 gap-1">
                        {/* Loading Spinner */}
                        {loading && (
                            <div className="animate-spin text-gray-400 dark:text-gray-500">
                                <svg
                                    width={iconSizeClasses[size]}
                                    height={iconSizeClasses[size]}
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

                        {/* Clear Button */}
                        {clearable && inputValue && !loading && (
                            <Button
                                variant="ghost"
                                size="xs"
                                onClick={handleClear}
                                disabled={disabled}
                                className="p-0 h-auto min-h-0 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                                leftIcon={<X size={iconSizeClasses[size]} />}
                            />
                        )}

                        {/* Picker Toggle */}
                        {showPicker && !loading && (
                            <Button
                                variant="ghost"
                                size="xs"
                                onClick={togglePicker}
                                disabled={disabled}
                                className="p-0 h-auto min-h-0 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                                leftIcon={
                                    <ChevronDown size={iconSizeClasses[size]} />
                                }
                            />
                        )}

                        {/* Right Icon */}
                        {rightIcon && !clearable && !showPicker && !loading && (
                            <div className="text-gray-400 dark:text-gray-500">
                                {React.isValidElement(rightIcon)
                                    ? React.cloneElement(rightIcon, {
                                          size: iconSizeClasses[size],
                                      } as any)
                                    : rightIcon}
                            </div>
                        )}
                    </div>

                    {/* Time Picker Dropdown */}
                    {showPicker && isPickerOpen && (
                        <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                            {generatedTimeOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() =>
                                        handleTimeSelect(option.value)
                                    }
                                    className={cn(
                                        "w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150",
                                        inputValue === option.value &&
                                            "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                    )}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Helper Messages */}
                <div className="mt-1 space-y-1">
                    {/* Error Message */}
                    {error && (
                        <p
                            id={`${inputId}-error`}
                            className={cn(
                                "text-sm text-red-600 dark:text-red-400 flex items-start gap-1",
                                errorClassName
                            )}
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

                    {/* Success Message */}
                    {success && !error && (
                        <p className="text-sm text-green-600 dark:text-green-400 flex items-start gap-1">
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

                    {/* Warning Message */}
                    {warning && !error && !success && (
                        <p className="text-sm text-yellow-600 dark:text-yellow-400 flex items-start gap-1">
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

                    {/* Helper Text */}
                    {helperText && !error && !success && !warning && (
                        <p
                            id={`${inputId}-helper`}
                            className="text-sm text-gray-500 dark:text-gray-400"
                        >
                            {helperText}
                        </p>
                    )}

                    {/* Hint */}
                    {hint && (
                        <p
                            id={`${inputId}-hint`}
                            className="text-xs text-gray-400 dark:text-gray-500"
                        >
                            {hint}
                        </p>
                    )}
                </div>
            </div>
        );
    }
);

TimeInput.displayName = "TimeInput";

export default TimeInput;
