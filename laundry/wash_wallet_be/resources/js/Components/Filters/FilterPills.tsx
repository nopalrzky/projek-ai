import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/Components/Button";
import { FilterPillsProps } from "./types";

const FilterPills: React.FC<FilterPillsProps> = ({
    activeFilters,
    onRemove,
    onClearAll,
    maxVisible = 5,
    className,
}) => {
    const visibleFilters = activeFilters.slice(0, maxVisible);
    const hiddenCount = activeFilters.length - maxVisible;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn("flex flex-wrap items-center gap-2", className)}
        >
            <span
                className="text-sm font-medium"
                style={{ color: "var(--color-text-secondary)" }}
            >
                Active Filters:
            </span>

            <AnimatePresence mode="popLayout">
                {visibleFilters.map((filter) => (
                    <motion.div
                        key={filter.key}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                        }}
                        className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm",
                            "border transition-all duration-200",
                            "hover:shadow-sm"
                        )}
                        style={{
                            backgroundColor: "var(--color-primary-50)",
                            borderColor: "var(--color-primary-200)",
                            color: "var(--color-primary-700)",
                        }}
                    >
                        <span className="font-medium">{filter.label}:</span>
                        <span className="max-w-[150px] truncate">
                            {filter.displayValue}
                        </span>
                        <button
                            onClick={() => onRemove(filter.key)}
                            className={cn(
                                "ml-1 p-0.5 rounded-full",
                                "hover:bg-primary-200 transition-colors",
                                "focus:outline-none focus:ring-2 focus:ring-primary-400"
                            )}
                            title={`Remove ${filter.label} filter`}
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>

            {hiddenCount > 0 && (
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-sm"
                    style={{
                        backgroundColor: "var(--color-surface-secondary)",
                        color: "var(--color-text-secondary)",
                    }}
                >
                    +{hiddenCount} more
                </motion.div>
            )}

            {activeFilters.length > 0 && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearAll}
                    className="text-sm"
                >
                    Clear All
                </Button>
            )}
        </motion.div>
    );
};

export default FilterPills;
