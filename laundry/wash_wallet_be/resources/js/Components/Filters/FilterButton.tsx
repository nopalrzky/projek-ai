import React from "react";
import { motion } from "framer-motion";
import { Filter, ChevronDown, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/Components/Badge";
import { FilterButtonProps } from "./types";

const FilterButton: React.FC<FilterButtonProps> = ({
    isOpen,
    onClick,
    activeCount,
    hasUnappliedChanges = false,
    disabled = false,
    className,
}) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "inline-flex items-center gap-2 px-4 py-2.5 rounded-lg",
                "border transition-all duration-200",
                "hover:shadow-sm active:scale-[0.98]",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "focus:outline-none focus:ring-2 focus:ring-offset-2",
                isOpen && "shadow-sm",
                className
            )}
            style={{
                backgroundColor: isOpen
                    ? "var(--color-primary-50)"
                    : "var(--color-surface)",
                borderColor: isOpen
                    ? "var(--color-primary-300)"
                    : hasUnappliedChanges
                    ? "var(--color-warning-300)"
                    : "var(--color-border)",
                color: isOpen
                    ? "var(--color-primary-700)"
                    : "var(--color-text-primary)",
            }}
        >
            <Filter
                className={cn(
                    "w-4 h-4 transition-transform duration-200",
                    isOpen && "text-primary-600"
                )}
            />

            <span className="font-medium text-sm">Filter</span>

            {activeCount > 0 && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                    <Badge
                        variant="primary"
                        size="sm"
                        className="min-w-[20px] h-5 flex items-center justify-center"
                    >
                        {activeCount}
                    </Badge>
                </motion.div>
            )}

            {hasUnappliedChanges && !isOpen && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <AlertCircle
                        className="w-4 h-4"
                        style={{ color: "var(--color-warning-500)" }}
                    />
                </motion.div>
            )}

            {activeCount > 0 && !isOpen && !hasUnappliedChanges && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <Check
                        className="w-4 h-4"
                        style={{ color: "var(--color-success-500)" }}
                    />
                </motion.div>
            )}

            <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
            >
                <ChevronDown className="w-4 h-4" />
            </motion.div>
        </button>
    );
};

export default FilterButton;
