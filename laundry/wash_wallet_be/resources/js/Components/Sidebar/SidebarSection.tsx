import React, { useState, useMemo } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { SidebarSectionProps } from "./types";
import SidebarItem from "./SidebarItem";
import { cn } from "@/lib/utils";

const normalizePath = (value?: string): string => {
    if (!value) return "";

    try {
        if (value.startsWith("http://") || value.startsWith("https://")) {
            return new URL(value).pathname;
        }

        if (value.startsWith("/")) {
            return value.split("?")[0].split("#")[0];
        }

        return new URL(value, window.location.origin).pathname;
    } catch {
        return value.split("?")[0].split("#")[0];
    }
};

const SidebarSection: React.FC<SidebarSectionProps> = ({
    section,
    isCollapsed,
    activeUrl = "",
}) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const currentPath = useMemo(() => normalizePath(activeUrl), [activeUrl]);

    const hasActiveItem = useMemo(
        () =>
            section.items.some((item) => {
                const itemPath = normalizePath(item.href);
                return (
                    !!itemPath &&
                    (currentPath === itemPath ||
                        currentPath.startsWith(`${itemPath}/`))
                );
            }),
        [section.items, currentPath],
    );

    const handleToggle = () => {
        if (!isCollapsed) setIsExpanded((prev) => !prev);
    };

    if (section.items.length === 1) {
        return (
            <div className="mb-2">
                <SidebarItem
                    item={section.items[0]}
                    isCollapsed={isCollapsed}
                    level={0}
                    activeUrl={activeUrl}
                />
            </div>
        );
    }

    const sectionVariants: Variants = {
        expanded: {
            height: "auto",
            opacity: 1,
            transition: {
                height: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
                staggerChildren: 0.03,
                delayChildren: 0.05,
            },
        },
        collapsed: {
            height: 0,
            opacity: 0,
            transition: {
                height: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.15 },
            },
        },
    };

    const itemVariants: Variants = {
        expanded: {
            opacity: 1,
            x: 0,
            transition: { type: "spring", stiffness: 300, damping: 25 },
        },
        collapsed: {
            opacity: 0,
            x: -10,
            transition: { duration: 0.1 },
        },
    };

    return (
        <div className="mb-4">
            {!isCollapsed && section.title && (
                <motion.button
                    type="button"
                    onClick={handleToggle}
                    className={cn(
                        "w-full flex items-center justify-between px-3 py-2.5 mb-2",
                        "rounded-xl transition-all duration-200 group",
                        "border border-transparent",
                        "hover:border-[var(--color-primary-200)]",
                        "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/30",
                        hasActiveItem && [
                            "bg-gradient-to-r from-[var(--color-primary-100)]/80 to-transparent",
                            "border-[var(--color-primary-200)]",
                        ],
                    )}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <div className="flex items-center gap-3">
                        <motion.div
                            className={cn(
                                "w-1 h-5 rounded-full transition-all duration-200",
                                hasActiveItem
                                    ? "bg-gradient-to-b from-[var(--color-primary-500)] to-[var(--color-primary-600)]"
                                    : "bg-[var(--color-gray-300)] group-hover:bg-[var(--color-primary-400)]",
                            )}
                            animate={{ height: hasActiveItem ? 24 : 20 }}
                        />
                        <span
                            className={cn(
                                "text-xs font-semibold uppercase tracking-wider transition-colors duration-200",
                                hasActiveItem
                                    ? "text-[var(--color-primary-700)]"
                                    : "text-[var(--color-text-tertiary)] group-hover:text-[var(--color-primary-600)]",
                            )}
                        >
                            {section.title}
                        </span>
                    </div>

                    <motion.div
                        animate={{ rotate: isExpanded ? 0 : -90 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                        }}
                        className={cn(
                            "transition-colors duration-200",
                            hasActiveItem
                                ? "text-[var(--color-primary-600)]"
                                : "text-[var(--color-text-tertiary)] group-hover:text-[var(--color-primary-500)]",
                        )}
                    >
                        <ChevronDown className="w-4 h-4" />
                    </motion.div>
                </motion.button>
            )}

            <AnimatePresence initial={false}>
                {(isCollapsed || isExpanded) && (
                    <motion.div
                        variants={sectionVariants}
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                        className="overflow-hidden"
                    >
                        <ul className="space-y-1">
                            {section.items.map((item, index) => (
                                <motion.li
                                    key={item.id}
                                    variants={itemVariants}
                                >
                                    <SidebarItem
                                        item={item}
                                        isCollapsed={isCollapsed}
                                        level={0}
                                        activeUrl={activeUrl}
                                    />
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SidebarSection;
