import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FilterMultiSelectProps } from "./types";

const FilterMultiSelect: React.FC<FilterMultiSelectProps> = ({
    value = [],
    onChange,
    options,
    placeholder = "Select multiple...",
    disabled = false,
    maxSelections,
    showSelectedCount = true,
    className,
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleToggle = (optionValue: any) => {
        const newValue = value.includes(optionValue)
            ? value.filter((v) => v !== optionValue)
            : [...value, optionValue];

        if (maxSelections && newValue.length > maxSelections) {
            return;
        }

        onChange(newValue);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange([]);
    };

    const selectedOptions = options.filter((opt) => value.includes(opt.value));

    return (
        <div className={cn("relative", className)}>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={cn(
                    "w-full px-3 py-2 rounded-lg border transition-colors duration-200",
                    "flex items-center justify-between",
                    "text-sm text-left",
                    disabled && "opacity-50 cursor-not-allowed"
                )}
                style={{
                    backgroundColor: "var(--color-surface)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text-primary)",
                }}
            >
                <span className="truncate">
                    {value.length === 0 ? (
                        <span style={{ color: "var(--color-text-tertiary)" }}>
                            {placeholder}
                        </span>
                    ) : showSelectedCount ? (
                        `${value.length} selected`
                    ) : (
                        selectedOptions.map((opt) => opt.label).join(", ")
                    )}
                </span>

                <div className="flex items-center gap-2">
                    {value.length > 0 && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="hover:opacity-70"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    <ChevronDown
                        className={cn(
                            "w-4 h-4 transition-transform",
                            isOpen && "rotate-180"
                        )}
                    />
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 w-full mt-2 rounded-lg border shadow-lg overflow-hidden"
                        style={{
                            backgroundColor: "var(--color-surface)",
                            borderColor: "var(--color-border)",
                        }}
                    >
                        <div className="max-h-60 overflow-y-auto">
                            {options.map((option) => {
                                const isSelected = value.includes(option.value);
                                const isDisabled = !!(
                                    option.disabled ||
                                    (maxSelections &&
                                        !isSelected &&
                                        value.length >= maxSelections)
                                );

                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() =>
                                            !isDisabled &&
                                            handleToggle(option.value)
                                        }
                                        disabled={isDisabled}
                                        className={cn(
                                            "w-full px-3 py-2 flex items-center gap-3",
                                            "text-sm text-left transition-colors",
                                            "hover:bg-opacity-50",
                                            isSelected && "bg-opacity-20",
                                            isDisabled &&
                                                "opacity-50 cursor-not-allowed"
                                        )}
                                        style={{
                                            backgroundColor: isSelected
                                                ? "var(--color-primary-50)"
                                                : "transparent",
                                        }}
                                    >
                                        <div
                                            className={cn(
                                                "w-4 h-4 rounded border flex items-center justify-center",
                                                isSelected && "border-primary"
                                            )}
                                            style={{
                                                backgroundColor: isSelected
                                                    ? "var(--color-primary-500)"
                                                    : "transparent",
                                                borderColor: isSelected
                                                    ? "var(--color-primary-500)"
                                                    : "var(--color-border)",
                                            }}
                                        >
                                            {isSelected && (
                                                <Check className="w-3 h-3 text-white" />
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <div
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                }}
                                            >
                                                {option.label}
                                            </div>
                                            {option.description && (
                                                <div
                                                    className="text-xs"
                                                    style={{
                                                        color: "var(--color-text-tertiary)",
                                                    }}
                                                >
                                                    {option.description}
                                                </div>
                                            )}
                                        </div>

                                        {option.icon && (
                                            <div className="ml-auto">
                                                {option.icon}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
};

export default FilterMultiSelect;
