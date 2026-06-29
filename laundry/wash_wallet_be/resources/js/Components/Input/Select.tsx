import React, {
    forwardRef,
    useState,
    useEffect,
    useRef,
    useCallback,
    useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronDown,
    Check,
    X,
    Search,
    Loader2,
    Plus,
    AlertCircle,
} from "lucide-react";
import { SelectProps, SelectOption } from "./types";
import { Button } from "@/Components/Button";
import { cn } from "@/lib/utils";

interface GroupedOption {
    isGroup: boolean;
    groupName?: string;
    options: SelectOption[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    (
        {
            label,
            placeholder = "Pilih opsi...",
            error,
            success,
            warning,
            hint,
            variant = "default",
            size = "md",
            status = "default",
            disabled = false,
            loading = false,
            fullWidth = true,
            className = "",
            containerClassName = "",
            labelClassName = "",
            errorClassName = "",
            options = [],
            searchable = false,
            clearable = false,
            multiple = false,
            maxSelectedItems,
            groupBy,
            onSearch,
            onClear,
            renderOption,
            renderSelectedValue,
            loadingText = "Memuat...",
            noOptionsText = "Tidak ada opsi tersedia",
            createOption = false,
            onCreateOption,
            value,
            onChange,
            onFocus,
            onBlur,
            id,
            selectRef,
            leftIcon,
            optional,
            required,
            ...props
        },
        ref,
    ) => {
        const [isOpen, setIsOpen] = useState(false);
        const [searchTerm, setSearchTerm] = useState("");
        const [selectedValues, setSelectedValues] = useState<
            (string | number)[]
        >(() => {
            if (multiple) {
                if (Array.isArray(value)) {
                    return value.filter(
                        (v): v is string | number =>
                            typeof v === "string" || typeof v === "number",
                    );
                }
                return value ? [value as string | number] : [];
            }
            return value ? [value as string | number] : [];
        });
        const [focusedIndex, setFocusedIndex] = useState(-1);
        const [creatingOption, setCreatingOption] = useState(false);

        const containerRef = useRef<HTMLDivElement>(null);
        const inputRef = useRef<HTMLInputElement>(null);
        const listRef = useRef<HTMLUListElement>(null);
        const selectElementRef = useRef<HTMLSelectElement>(null);

        const inputId =
            id || `select-${Math.random().toString(36).substr(2, 9)}`;
        const actualStatus = error
            ? "error"
            : success
              ? "success"
              : warning
                ? "warning"
                : status;

        const isRequired = required && !optional;

        useEffect(() => {
            if (multiple) {
                if (Array.isArray(value)) {
                    const validValues = value.filter(
                        (v): v is string | number =>
                            typeof v === "string" || typeof v === "number",
                    );
                    setSelectedValues(validValues);
                } else if (
                    value !== undefined &&
                    value !== null &&
                    value !== ""
                ) {
                    const singleValue = value as string | number;
                    setSelectedValues([singleValue]);
                } else {
                    setSelectedValues([]);
                }
            } else {
                if (value !== undefined && value !== null && value !== "") {
                    const singleValue = value as string | number;
                    setSelectedValues([singleValue]);
                } else {
                    setSelectedValues([]);
                }
            }
        }, [value, multiple]);

        useEffect(() => {
            if (searchable && onSearch) {
                onSearch(searchTerm);
            }
        }, [onSearch, searchable, searchTerm]);

        const processedOptions = useMemo((): GroupedOption[] => {
            let filtered = options;

            if (searchTerm && searchable) {
                filtered = options.filter((option) =>
                    option.label
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()),
                );
            }

            if (groupBy) {
                const grouped = filtered.reduce(
                    (groups, option) => {
                        const group = option.group || "Lainnya";
                        if (!groups[group]) {
                            groups[group] = [];
                        }
                        groups[group].push(option);
                        return groups;
                    },
                    {} as Record<string, SelectOption[]>,
                );

                return Object.entries(grouped).map(
                    ([groupName, groupOptions]) => ({
                        isGroup: true,
                        groupName,
                        options: groupOptions,
                    }),
                );
            }

            return [{ isGroup: false, options: filtered }];
        }, [options, searchTerm, searchable, groupBy]);

        const flatOptions = useMemo(() => {
            return processedOptions.reduce((flat, group) => {
                return [...flat, ...group.options];
            }, [] as SelectOption[]);
        }, [processedOptions]);

        const selectedOptions = useMemo(() => {
            return options.filter((option) =>
                selectedValues.includes(option.value),
            );
        }, [options, selectedValues]);

        const handleOptionSelect = useCallback(
            (option: SelectOption) => {
                if (option.disabled) return;

                let newSelectedValues: (string | number)[];

                if (multiple) {
                    if (selectedValues.includes(option.value)) {
                        newSelectedValues = selectedValues.filter(
                            (val) => val !== option.value,
                        );
                    } else {
                        if (
                            maxSelectedItems &&
                            selectedValues.length >= maxSelectedItems
                        ) {
                            return;
                        }
                        newSelectedValues = [...selectedValues, option.value];
                    }
                } else {
                    newSelectedValues = [option.value];
                    setIsOpen(false);
                    setSearchTerm("");
                }

                setSelectedValues(newSelectedValues);

                if (onChange) {
                    const eventValue = multiple
                        ? newSelectedValues
                        : (newSelectedValues[0] ?? "");

                    const event = {
                        target: {
                            name: props.name || "",
                            value: eventValue,
                            type: multiple ? "select-multiple" : "select-one",
                            multiple: multiple,
                            selectedOptions: multiple
                                ? newSelectedValues.map((val) => ({
                                      value: val,
                                  }))
                                : newSelectedValues.length > 0
                                  ? [{ value: newSelectedValues[0] }]
                                  : [],
                        },
                        currentTarget: {
                            name: props.name || "",
                            value: eventValue,
                        },
                        type: "change",
                        preventDefault: () => {},
                        stopPropagation: () => {},
                        nativeEvent: {} as Event,
                        bubbles: true,
                        cancelable: true,
                        defaultPrevented: false,
                        eventPhase: 2,
                        isTrusted: true,
                        timeStamp: Date.now(),
                        persist: () => {},
                        isDefaultPrevented: () => false,
                        isPropagationStopped: () => false,
                    } as unknown as React.ChangeEvent<HTMLSelectElement>;

                    onChange(event);
                }
            },
            [selectedValues, multiple, maxSelectedItems, onChange, props.name],
        );

        const handleCreateOption = useCallback(async () => {
            if (!createOption || !onCreateOption || !searchTerm.trim()) return;

            setCreatingOption(true);
            try {
                const newOption = await onCreateOption(searchTerm.trim());
                if (newOption) {
                    handleOptionSelect(newOption);
                    setSearchTerm("");
                }
            } catch (error) {
                console.error("Error creating option:", error);
            } finally {
                setCreatingOption(false);
            }
        }, [createOption, onCreateOption, searchTerm, handleOptionSelect]);

        const handleClear = useCallback(() => {
            setSelectedValues([]);
            setSearchTerm("");
            onClear?.();
            if (onChange) {
                const eventValue = multiple ? [] : "";

                const event = {
                    target: {
                        name: props.name || "",
                        value: eventValue,
                    },
                    currentTarget: {
                        name: props.name || "",
                        value: eventValue,
                    },
                    type: "change",
                    preventDefault: () => {},
                    stopPropagation: () => {},
                    nativeEvent: {} as Event,
                    bubbles: true,
                    cancelable: true,
                    defaultPrevented: false,
                    eventPhase: 2,
                    isTrusted: true,
                    timeStamp: Date.now(),
                    persist: () => {},
                    isDefaultPrevented: () => false,
                    isPropagationStopped: () => false,
                } as React.ChangeEvent<HTMLSelectElement>;

                onChange(event);
            }
        }, [multiple, onChange, onClear, props.name]);

        const handleRemoveItem = useCallback(
            (optionValue: string | number, e: React.MouseEvent) => {
                e.stopPropagation();
                const newSelectedValues = selectedValues.filter(
                    (val) => val !== optionValue,
                );
                setSelectedValues(newSelectedValues);

                if (onChange) {
                    const eventValue = multiple
                        ? newSelectedValues
                        : (newSelectedValues[0] ?? "");

                    const event = {
                        target: {
                            name: props.name || "",
                            value: eventValue,
                        },
                        currentTarget: {
                            name: props.name || "",
                            value: eventValue,
                        },
                        type: "change",
                        preventDefault: () => {},
                        stopPropagation: () => {},
                        nativeEvent: {} as Event,
                        bubbles: true,
                        cancelable: true,
                        defaultPrevented: false,
                        eventPhase: 2,
                        isTrusted: true,
                        timeStamp: Date.now(),
                        persist: () => {},
                        isDefaultPrevented: () => false,
                        isPropagationStopped: () => false,
                    } as React.ChangeEvent<HTMLSelectElement>;

                    onChange(event);
                }
            },
            [selectedValues, onChange, multiple, props.name],
        );

        const handleContainerClick = useCallback(
            (e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();

                if (disabled) return;

                setIsOpen((prev) => !prev);
            },
            [disabled],
        );

        const handleKeyDown = useCallback(
            (e: React.KeyboardEvent) => {
                if (disabled) return;

                switch (e.key) {
                    case "Enter":
                        e.preventDefault();
                        if (!isOpen) {
                            setIsOpen(true);
                        } else if (
                            focusedIndex >= 0 &&
                            flatOptions[focusedIndex]
                        ) {
                            handleOptionSelect(flatOptions[focusedIndex]);
                        } else if (createOption && searchTerm.trim()) {
                            handleCreateOption();
                        }
                        break;

                    case "Escape":
                        e.preventDefault();
                        setIsOpen(false);
                        setSearchTerm("");
                        break;

                    case "ArrowDown":
                        e.preventDefault();
                        if (!isOpen) {
                            setIsOpen(true);
                        } else {
                            setFocusedIndex((prev) =>
                                prev < flatOptions.length - 1 ? prev + 1 : 0,
                            );
                        }
                        break;

                    case "ArrowUp":
                        e.preventDefault();
                        if (isOpen) {
                            setFocusedIndex((prev) =>
                                prev > 0 ? prev - 1 : flatOptions.length - 1,
                            );
                        }
                        break;

                    case "Backspace":
                        if (
                            !searchTerm &&
                            multiple &&
                            selectedValues.length > 0
                        ) {
                            e.preventDefault();
                            const newSelectedValues = selectedValues.slice(
                                0,
                                -1,
                            );
                            setSelectedValues(newSelectedValues);
                            if (onChange) {
                                const event = {
                                    target: {
                                        name: props.name || "",
                                        value: newSelectedValues,
                                    },
                                    currentTarget: {
                                        name: props.name || "",
                                        value: newSelectedValues,
                                    },
                                } as unknown as React.ChangeEvent<HTMLSelectElement>;
                                onChange(event);
                            }
                        }
                        break;

                    default:
                        if (!searchable && !isOpen) {
                            setIsOpen(true);
                        }
                        break;
                }
            },
            [
                disabled,
                isOpen,
                focusedIndex,
                flatOptions,
                handleOptionSelect,
                createOption,
                searchTerm,
                handleCreateOption,
                multiple,
                selectedValues,
                onChange,
                searchable,
                props.name,
            ],
        );

        const handleFocus = useCallback(
            (e: React.FocusEvent<HTMLDivElement>) => {
                if (!disabled) {
                    onFocus?.(e as any);
                }
            },
            [disabled, onFocus],
        );

        const handleBlur = useCallback(
            (e: React.FocusEvent<HTMLDivElement>) => {
                setTimeout(() => {
                    if (
                        containerRef.current &&
                        !containerRef.current.contains(document.activeElement)
                    ) {
                        setIsOpen(false);
                        setFocusedIndex(-1);
                        if (!multiple && !selectedValues.length) {
                            setSearchTerm("");
                        }
                        onBlur?.(e as any);
                    }
                }, 150);
            },
            [multiple, selectedValues.length, onBlur],
        );

        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (
                    containerRef.current &&
                    !containerRef.current.contains(event.target as Node)
                ) {
                    setIsOpen(false);
                    setFocusedIndex(-1);
                }
            };

            if (isOpen) {
                document.addEventListener("mousedown", handleClickOutside);
                return () =>
                    document.removeEventListener(
                        "mousedown",
                        handleClickOutside,
                    );
            }
        }, [isOpen]);

        const sizeClasses = {
            xs: "min-h-[28px] px-2 py-1 text-xs",
            sm: "min-h-[32px] px-3 py-1.5 text-sm",
            md: "min-h-[40px] px-3 py-2 text-base",
            lg: "min-h-[44px] px-4 py-2.5 text-lg",
            xl: "min-h-[48px] px-4 py-3 text-xl",
        };

        const variantClasses = {
            default: cn(
                "border rounded-lg transition-all duration-200",
                actualStatus === "error" &&
                    "border-red-500 focus-within:border-red-500",
                actualStatus === "success" &&
                    "border-green-500 focus-within:border-green-500",
                actualStatus === "warning" &&
                    "border-yellow-500 focus-within:border-yellow-500",
                actualStatus === "default" && "focus-within:border-blue-500",
                disabled && "opacity-50 cursor-not-allowed",
                "focus-within:ring-2 focus-within:ring-blue-500/20",
            ),
            outline: cn(
                "border-2 rounded-lg bg-transparent transition-all duration-200",
                "focus-within:ring-2 focus-within:ring-blue-500/20",
                disabled && "opacity-50 cursor-not-allowed",
            ),
            filled: cn(
                "border border-transparent rounded-lg transition-all duration-200",
                "focus-within:ring-2 focus-within:ring-blue-500/20",
                disabled && "opacity-50 cursor-not-allowed",
            ),
            underline: cn(
                "border-0 border-b-2 rounded-none bg-transparent transition-all duration-200",
                "focus-within:border-blue-500",
                disabled && "opacity-50 cursor-not-allowed",
            ),
            ghost: cn(
                "border border-transparent rounded-lg bg-transparent transition-all duration-200",
                "hover:bg-gray-50/50 focus-within:ring-2 focus-within:ring-gray-300/20",
                disabled &&
                    "hover:bg-transparent opacity-50 cursor-not-allowed",
            ),
        };

        const containerClasses = cn(
            "relative cursor-pointer",
            variantClasses[variant],
            sizeClasses[size],
            fullWidth ? "w-full" : "w-auto",
            containerClassName,
        );

        const renderDisplayValue = () => {
            if (renderSelectedValue && selectedOptions.length > 0) {
                return renderSelectedValue(
                    multiple ? selectedOptions : selectedOptions[0],
                );
            }

            if (selectedOptions.length === 0) {
                return (
                    <span
                        className="text-gray-500"
                        style={{ color: "var(--color-text-quaternary)" }}
                    >
                        {placeholder}
                    </span>
                );
            }

            if (multiple) {
                if (selectedOptions.length === 1) {
                    return selectedOptions[0].label;
                }
                return `${selectedOptions.length} dipilih`;
            }

            return selectedOptions[0].label;
        };

        const renderOptionItem = (option: SelectOption, index: number) => {
            const isSelected = selectedValues.includes(option.value);

            if (renderOption) {
                return renderOption(option);
            }

            return (
                <div className="flex items-center space-x-3">
                    {option.icon && (
                        <span className="flex-shrink-0">{option.icon}</span>
                    )}
                    <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                            {option.label}
                        </div>
                        {option.description && (
                            <div
                                className="text-sm truncate"
                                style={{ color: "var(--color-text-tertiary)" }}
                            >
                                {option.description}
                            </div>
                        )}
                    </div>
                    {isSelected && (
                        <Check
                            className="w-4 h-4 flex-shrink-0"
                            style={{ color: "var(--color-primary-500)" }}
                        />
                    )}
                </div>
            );
        };

        const selectValue = multiple
            ? selectedValues.map(String)
            : selectedValues[0] !== undefined
              ? String(selectedValues[0])
              : "";

        return (
            <div className={cn("relative", className)} ref={containerRef}>
                <select
                    ref={selectElementRef}
                    name={props.name}
                    value={selectValue}
                    onChange={() => {}}
                    multiple={multiple}
                    required={isRequired}
                    className="sr-only"
                    tabIndex={-1}
                    aria-required={isRequired}
                >
                    {selectedValues.map((value) => (
                        <option key={value} value={String(value)}>
                            {options.find((opt) => opt.value === value)?.label}
                        </option>
                    ))}
                </select>

                {label && (
                    <label
                        htmlFor={inputId}
                        className={cn(
                            "block text-sm font-medium mb-1.5",
                            disabled && "opacity-50",
                            labelClassName,
                        )}
                        style={{
                            color:
                                actualStatus === "error"
                                    ? "var(--color-error-600)"
                                    : "var(--color-text-primary)",
                        }}
                    >
                        {label}
                        {isRequired && (
                            <span className="text-red-500 ml-1">*</span>
                        )}
                        {optional && (
                            <span className="text-gray-400 text-xs ml-1">
                                (opsional)
                            </span>
                        )}
                    </label>
                )}

                <div
                    className={containerClasses}
                    style={{
                        backgroundColor: "var(--color-surface)",
                        borderColor: isOpen
                            ? "var(--color-primary-500)"
                            : "var(--color-border)",
                        color: "var(--color-text-primary)",
                    }}
                    onClick={handleContainerClick}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    tabIndex={disabled ? -1 : 0}
                    role="combobox"
                    aria-expanded={isOpen}
                    aria-haspopup="listbox"
                    aria-controls={`${inputId}-listbox`}
                >
                    <div className="flex items-center justify-between min-w-0">
                        {leftIcon && (
                            <div className="flex items-center mr-3">
                                <span
                                    className="flex-shrink-0"
                                    style={{
                                        color: disabled
                                            ? "var(--color-text-quaternary)"
                                            : "var(--color-text-tertiary)",
                                    }}
                                >
                                    {leftIcon}
                                </span>
                            </div>
                        )}

                        <div className="flex-1 min-w-0">
                            {multiple && selectedOptions.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                    {selectedOptions.map((option) => (
                                        <motion.span
                                            key={option.value}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded"
                                            style={{
                                                backgroundColor:
                                                    "var(--color-primary-100)",
                                                color: "var(--color-primary-700)",
                                            }}
                                        >
                                            {option.label}
                                            <button
                                                type="button"
                                                onClick={(e) =>
                                                    handleRemoveItem(
                                                        option.value,
                                                        e,
                                                    )
                                                }
                                                className="hover:opacity-70 transition-opacity"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </motion.span>
                                    ))}
                                </div>
                            ) : (
                                <div className="truncate">
                                    {searchable && isOpen ? (
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
                                            onClick={(e) => e.stopPropagation()}
                                            placeholder={
                                                selectedOptions.length > 0
                                                    ? selectedOptions[0].label
                                                    : placeholder
                                            }
                                            className="w-full bg-transparent border-none outline-none"
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                            disabled={disabled}
                                        />
                                    ) : (
                                        renderDisplayValue()
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center space-x-1 ml-2">
                            {loading && (
                                <Loader2
                                    className="w-4 h-4 animate-spin"
                                    style={{
                                        color: "var(--color-text-quaternary)",
                                    }}
                                />
                            )}
                            {clearable &&
                                selectedValues.length > 0 &&
                                !loading && (
                                    <Button
                                        variant="ghost"
                                        size="xs"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleClear();
                                        }}
                                        className="p-0 h-auto min-h-0 hover:opacity-70"
                                        disabled={disabled}
                                    >
                                        <X
                                            className="w-4 h-4"
                                            style={{
                                                color: "var(--color-text-quaternary)",
                                            }}
                                        />
                                    </Button>
                                )}
                            <motion.div
                                animate={{ rotate: isOpen ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ChevronDown
                                    className="w-4 h-4"
                                    style={{
                                        color: "var(--color-text-quaternary)",
                                    }}
                                />
                            </motion.div>
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute z-50 w-full mt-1 border rounded-lg shadow-lg overflow-hidden select-dropdown-content"
                            style={{
                                backgroundColor: "var(--color-surface)",
                                borderColor: "var(--color-border)",
                                boxShadow:
                                    "var(--select-dropdown-shadow, 0 10px 15px -3px rgba(0, 0, 0, 0.1))",
                            }}
                        >
                            {searchable && !multiple && (
                                <div
                                    className="p-2 border-b"
                                    style={{
                                        borderColor: "var(--color-border)",
                                    }}
                                >
                                    <div className="relative">
                                        <Search
                                            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                                            style={{
                                                color: "var(--color-text-quaternary)",
                                            }}
                                        />
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
                                            placeholder="Cari..."
                                            className="w-full pl-9 pr-3 py-2 text-sm border rounded"
                                            style={{
                                                backgroundColor:
                                                    "var(--color-surface)",
                                                borderColor:
                                                    "var(--color-border)",
                                                color: "var(--color-text-primary)",
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            <ul
                                ref={listRef}
                                id={`${inputId}-listbox`}
                                role="listbox"
                                aria-multiselectable={multiple}
                                className="max-h-60 overflow-y-auto"
                            >
                                {loading ? (
                                    <li className="px-3 py-2 text-center">
                                        <div className="flex items-center justify-center space-x-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                {loadingText}
                                            </span>
                                        </div>
                                    </li>
                                ) : processedOptions.length === 0 ||
                                  flatOptions.length === 0 ? (
                                    <>
                                        <li className="px-3 py-8 text-center">
                                            <div className="flex flex-col items-center space-y-2">
                                                <AlertCircle
                                                    className="w-8 h-8"
                                                    style={{
                                                        color: "var(--color-text-quaternary)",
                                                    }}
                                                />
                                                <span
                                                    className="text-sm"
                                                    style={{
                                                        color: "var(--color-text-secondary)",
                                                    }}
                                                >
                                                    {noOptionsText}
                                                </span>
                                            </div>
                                        </li>
                                        {createOption && searchTerm.trim() && (
                                            <li>
                                                <button
                                                    type="button"
                                                    onClick={handleCreateOption}
                                                    disabled={creatingOption}
                                                    className="w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors flex items-center space-x-2"
                                                    style={{
                                                        backgroundColor:
                                                            "transparent",
                                                        color: "var(--color-primary-600)",
                                                    }}
                                                >
                                                    {creatingOption ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Plus className="w-4 h-4" />
                                                    )}
                                                    <span>
                                                        Buat "{searchTerm}"
                                                    </span>
                                                </button>
                                            </li>
                                        )}
                                    </>
                                ) : (
                                    processedOptions.map(
                                        (group, groupIndex) => (
                                            <React.Fragment key={groupIndex}>
                                                {group.isGroup &&
                                                    group.groupName && (
                                                        <li
                                                            className="px-3 py-2 text-xs font-medium uppercase tracking-wide border-b"
                                                            style={{
                                                                color: "var(--color-text-tertiary)",
                                                                backgroundColor:
                                                                    "var(--color-gray-50)",
                                                                borderColor:
                                                                    "var(--color-border)",
                                                            }}
                                                        >
                                                            {group.groupName}
                                                        </li>
                                                    )}
                                                {group.options.map(
                                                    (option, optionIndex) => {
                                                        const globalIndex =
                                                            flatOptions.findIndex(
                                                                (flatOption) =>
                                                                    flatOption.value ===
                                                                    option.value,
                                                            );
                                                        const isSelected =
                                                            selectedValues.includes(
                                                                option.value,
                                                            );
                                                        const isFocused =
                                                            globalIndex ===
                                                            focusedIndex;

                                                        return (
                                                            <motion.li
                                                                key={
                                                                    option.value
                                                                }
                                                                initial={{
                                                                    opacity: 0,
                                                                }}
                                                                animate={{
                                                                    opacity: 1,
                                                                }}
                                                                transition={{
                                                                    delay:
                                                                        optionIndex *
                                                                        0.05,
                                                                }}
                                                                role="option"
                                                                aria-selected={
                                                                    isSelected
                                                                }
                                                            >
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleOptionSelect(
                                                                            option,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        option.disabled
                                                                    }
                                                                    className={cn(
                                                                        "w-full px-3 py-2 text-left transition-colors duration-150",
                                                                        "hover:bg-gray-50 focus:bg-gray-50 focus:outline-none",
                                                                        isFocused &&
                                                                            "bg-gray-50",
                                                                        isSelected &&
                                                                            "bg-blue-50",
                                                                        option.disabled &&
                                                                            "opacity-50 cursor-not-allowed",
                                                                    )}
                                                                    style={{
                                                                        backgroundColor:
                                                                            isFocused
                                                                                ? "var(--color-select-option-focused)"
                                                                                : isSelected
                                                                                  ? "var(--color-select-option-selected)"
                                                                                  : "transparent",
                                                                        color: option.disabled
                                                                            ? "var(--color-text-quaternary)"
                                                                            : "var(--color-text-primary)",
                                                                    }}
                                                                >
                                                                    {renderOptionItem(
                                                                        option,
                                                                        globalIndex,
                                                                    )}
                                                                </button>
                                                            </motion.li>
                                                        );
                                                    },
                                                )}
                                            </React.Fragment>
                                        ),
                                    )
                                )}

                                {createOption &&
                                    searchTerm.trim() &&
                                    flatOptions.length > 0 && (
                                        <li
                                            className="border-t"
                                            style={{
                                                borderColor:
                                                    "var(--color-border)",
                                            }}
                                        >
                                            <button
                                                type="button"
                                                onClick={handleCreateOption}
                                                disabled={creatingOption}
                                                className="w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors flex items-center space-x-2"
                                                style={{
                                                    backgroundColor:
                                                        "transparent",
                                                    color: "var(--color-primary-600)",
                                                }}
                                            >
                                                {creatingOption ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Plus className="w-4 h-4" />
                                                )}
                                                <span>Buat "{searchTerm}"</span>
                                            </button>
                                        </li>
                                    )}
                            </ul>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mt-1 space-y-1">
                    {error && (
                        <p
                            className={cn("text-sm", errorClassName)}
                            style={{ color: "var(--color-error-600)" }}
                        >
                            {Array.isArray(error) ? error[0] : error}
                        </p>
                    )}
                    {success && !error && (
                        <p
                            className="text-sm"
                            style={{ color: "var(--color-success-600)" }}
                        >
                            {success}
                        </p>
                    )}
                    {warning && !error && !success && (
                        <p
                            className="text-sm"
                            style={{ color: "var(--color-warning-600)" }}
                        >
                            {warning}
                        </p>
                    )}
                    {hint && !error && !success && !warning && (
                        <p
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

Select.displayName = "Select";

export default Select;
