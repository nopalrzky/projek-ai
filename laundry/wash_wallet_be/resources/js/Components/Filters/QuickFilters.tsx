import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card } from "@/Components/Card";
import { QuickFiltersProps } from "./types";

const QuickFilters: React.FC<QuickFiltersProps> = ({
    filters,
    onSelect,
    className,
}) => {
    const colorStyles = {
        primary: {
            bg: "var(--color-primary-50)",
            border: "var(--color-primary-200)",
            text: "var(--color-primary-700)",
            icon: "var(--color-primary-500)",
        },
        success: {
            bg: "var(--color-success-50)",
            border: "var(--color-success-200)",
            text: "var(--color-success-700)",
            icon: "var(--color-success-500)",
        },
        warning: {
            bg: "var(--color-warning-50)",
            border: "var(--color-warning-200)",
            text: "var(--color-warning-700)",
            icon: "var(--color-warning-500)",
        },
        error: {
            bg: "var(--color-error-50)",
            border: "var(--color-error-200)",
            text: "var(--color-error-700)",
            icon: "var(--color-error-500)",
        },
        info: {
            bg: "var(--color-info-50)",
            border: "var(--color-info-200)",
            text: "var(--color-info-700)",
            icon: "var(--color-info-500)",
        },
    };

    return (
        <div className={cn("space-y-3", className)}>
            <h3
                className="text-sm font-semibold"
                style={{ color: "var(--color-text-secondary)" }}
            >
                Quick Filters
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {filters.map((filter, index) => {
                    const colors = colorStyles[filter.color || "primary"];

                    return (
                        <motion.button
                            key={filter.key}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => onSelect(filter)}
                            className={cn(
                                "relative p-4 rounded-lg border-2 transition-all duration-200",
                                "hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
                                "focus:outline-none focus:ring-2 focus:ring-offset-2",
                                "text-left"
                            )}
                            style={{
                                backgroundColor: colors.bg,
                                borderColor: colors.border,
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <p
                                        className="text-xs font-medium mb-1"
                                        style={{ color: colors.text }}
                                    >
                                        {filter.label}
                                    </p>
                                    <p
                                        className="text-2xl font-bold"
                                        style={{ color: colors.text }}
                                    >
                                        {filter.value}
                                    </p>
                                </div>

                                {filter.icon && (
                                    <div
                                        className="flex-shrink-0 p-2 rounded-lg"
                                        style={{
                                            backgroundColor: "white",
                                            color: colors.icon,
                                        }}
                                    >
                                        {filter.icon}
                                    </div>
                                )}
                            </div>

                            <motion.div
                                className="absolute inset-0 rounded-lg"
                                initial={{ opacity: 0 }}
                                whileHover={{ opacity: 0.1 }}
                                style={{
                                    backgroundColor: colors.text,
                                }}
                            />
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};

export default QuickFilters;
