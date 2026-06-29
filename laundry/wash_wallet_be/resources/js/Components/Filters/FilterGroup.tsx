import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { FilterGroupProps } from "./types";

const FilterGroup: React.FC<FilterGroupProps> = ({
    title,
    children,
    collapsible = false,
    defaultCollapsed = false,
    className,
}) => {
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

    return (
        <div
            className={cn("rounded-lg border p-4", className)}
            style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-border)",
            }}
        >
            {title && (
                <div className="flex items-center justify-between mb-4">
                    <h3
                        className="text-sm font-medium"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        {title}
                    </h3>
                    {collapsible && (
                        <button
                            type="button"
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="p-1 hover:opacity-70 transition-opacity"
                        >
                            <ChevronDown
                                className={cn(
                                    "w-4 h-4 transition-transform",
                                    isCollapsed && "rotate-180"
                                )}
                                style={{ color: "var(--color-text-tertiary)" }}
                            />
                        </button>
                    )}
                </div>
            )}

            <AnimatePresence initial={false}>
                {(!collapsible || !isCollapsed) && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FilterGroup;
