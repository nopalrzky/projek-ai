import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronDown, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { FilterSelectProps } from "./types";
import { createPortal } from "react-dom";

const FilterSelect: React.FC<FilterSelectProps> = ({
    value,
    onChange,
    options = [],
    placeholder = "Select...",
    disabled = false,
    clearable = false,
    searchable = false,
    className,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [dropdownPosition, setDropdownPosition] = useState({
        top: 0,
        left: 0,
        width: 0,
    });
    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const isSameValue = (left: any, right: any) => {
        if (left === null || left === undefined) return right === left;
        if (right === null || right === undefined) return false;
        return String(left) === String(right);
    };

    const safeOptions = Array.isArray(options) ? options : [];
    const selectedOption = safeOptions.find((opt) =>
        isSameValue(opt.value, value),
    );

    const filteredOptions = searchable
        ? safeOptions.filter((opt) =>
              opt.label.toLowerCase().includes(searchQuery.toLowerCase()),
          )
        : safeOptions;

    useEffect(() => {
        if (isOpen && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setDropdownPosition({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width,
            });
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node) &&
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
                setSearchQuery("");
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const handleSelect = (optionValue: any) => {
        onChange(optionValue);
        setIsOpen(false);
        setSearchQuery("");
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(undefined);
        setSearchQuery("");
    };

    const dropdownContent = (
        <motion.div
            ref={dropdownRef}
            initial={false}
            animate={
                isOpen
                    ? { opacity: 1, y: 0, pointerEvents: "auto" }
                    : { opacity: 0, y: -10, pointerEvents: "none" }
            }
            transition={{ duration: 0.15 }}
            style={{
                position: "absolute",
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                width: `${dropdownPosition.width}px`,
                zIndex: 9999,
            }}
            className="mt-1 rounded-lg border shadow-lg overflow-hidden bg-white dark:bg-gray-800"
        >
            {searchable && (
                <div
                    className="p-2 border-b"
                    style={{ borderColor: "var(--color-border)" }}
                >
                    <div className="relative">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                            style={{
                                color: "var(--color-text-tertiary)",
                            }}
                        />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) =>
                                setSearchQuery(e.target.value)
                            }
                            placeholder="Search..."
                            className="w-full pl-9 pr-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                            style={{
                                backgroundColor: "var(--color-surface)",
                                borderColor: "var(--color-border)",
                                color: "var(--color-text-primary)",
                            }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}

            <div className="max-h-60 overflow-y-auto">
                {filteredOptions.length === 0 ? (
                    <div
                        className="px-3 py-2 text-sm text-center"
                        style={{ color: "var(--color-text-tertiary)" }}
                    >
                        No options found
                    </div>
                ) : (
                    filteredOptions.map((option) => (
                        <button
                            key={String(option.value)}
                            onClick={() => handleSelect(option.value)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-opacity-50 transition-colors"
                            style={{
                                backgroundColor: isSameValue(
                                    value,
                                    option.value,
                                )
                                    ? "var(--color-primary-100)"
                                    : "transparent",
                                color: isSameValue(value, option.value)
                                    ? "var(--color-primary-600)"
                                    : "var(--color-text-primary)",
                            }}
                        >
                            {option.label}
                        </button>
                    ))
                )}
            </div>
        </motion.div>
    );

    return (
        <>
            <div ref={containerRef} className={cn("relative", className)}>
                <button
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                    className="w-full px-3 py-2 rounded-lg border text-left text-sm transition-colors duration-200 flex items-center justify-between"
                    style={{
                        backgroundColor: disabled
                            ? "var(--color-surface-secondary)"
                            : "var(--color-surface)",
                        borderColor: isOpen
                            ? "var(--color-primary-500)"
                            : "var(--color-border)",
                        color: selectedOption
                            ? "var(--color-text-primary)"
                            : "var(--color-text-tertiary)",
                        cursor: disabled ? "not-allowed" : "pointer",
                    }}
                >
                    <span className="truncate">
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>

                    <div className="flex items-center gap-1 ml-2">
                        {clearable &&
                            value !== undefined &&
                            value !== null &&
                            value !== "" &&
                            !disabled && (
                                <X
                                    className="w-4 h-4 hover:opacity-70"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                    onClick={handleClear}
                                />
                            )}
                        <ChevronDown
                            className={cn(
                                "w-4 h-4 transition-transform",
                                isOpen && "rotate-180",
                            )}
                            style={{ color: "var(--color-text-tertiary)" }}
                        />
                    </div>
                </button>
            </div>

            {typeof document !== "undefined" &&
                createPortal(dropdownContent, document.body)}
        </>
    );
};

export default FilterSelect;
