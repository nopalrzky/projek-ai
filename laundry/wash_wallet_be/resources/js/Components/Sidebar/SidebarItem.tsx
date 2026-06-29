import React, { useState, useEffect, useMemo } from "react";
import { Link } from "@inertiajs/react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { SidebarItemProps } from "./types";
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

const SidebarItem: React.FC<SidebarItemProps> = ({
    item,
    isCollapsed,
    level = 0,
    activeUrl = "",
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const hasChildren = item.children && item.children.length > 0;
    const currentPath = useMemo(() => normalizePath(activeUrl), [activeUrl]);
    const itemPath = useMemo(() => normalizePath(item.href), [item.href]);

    const isActive = useMemo(() => {
        if (!itemPath) return false;

        if (item.id === "dashboard") {
            return currentPath === itemPath;
        }

        return (
            currentPath === itemPath || currentPath.startsWith(`${itemPath}/`)
        );
    }, [item.id, itemPath, currentPath]);

    const hasActiveChild = useMemo(
        () =>
            hasChildren &&
            item.children!.some((child) => {
                const childPath = normalizePath(child.href);
                return (
                    !!childPath &&
                    (currentPath === childPath ||
                        currentPath.startsWith(`${childPath}/`))
                );
            }),
        [hasChildren, item.children, currentPath],
    );

    useEffect(() => {
        if (hasActiveChild) setIsExpanded(true);
    }, [hasActiveChild]);

    const handleClick = (e: React.MouseEvent) => {
        if (hasChildren) {
            e.preventDefault();
            setIsExpanded((prev) => !prev);
        } else if (item.onClick) {
            e.preventDefault();
            item.onClick();
        }
    };

    const itemClasses = cn(
        "flex items-center w-full px-3 py-2.5 text-sm font-medium",
        "rounded-xl transition-all duration-200 group relative",
        "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/40",
        {
            [cn(
                "bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-primary-600)]",
                "text-[var(--color-primary-50)] shadow-md shadow-[var(--color-primary-500)]/25",
                "border border-[var(--color-primary-400)]/20",
            )]: isActive,
            [cn(
                "bg-[var(--color-primary-50)]",
                "text-[var(--color-primary-700)]",
            )]: !isActive && hasActiveChild,
            [cn(
                "text-[var(--color-text-secondary)]",
                "hover:bg-[var(--color-primary-50)]",
                "hover:text-[var(--color-primary-700)]",
            )]: !isActive && !hasActiveChild,
            "justify-center": isCollapsed && level === 0,
            "ml-4": level === 1 && !isCollapsed,
            "ml-8": level === 2 && !isCollapsed,
        },
    );

    const iconClasses = cn(
        "flex-shrink-0 w-5 h-5 transition-colors duration-200",
        {
            "mr-3": !isCollapsed || level > 0,
            "text-[var(--color-primary-50)]": isActive,
            "text-[var(--color-primary-600)]":
                !isActive && hasActiveChild,
            "text-[var(--color-text-tertiary)] group-hover:text-[var(--color-primary-500)]":
                !isActive && !hasActiveChild,
        },
    );

    const badgeClasses = cn(
        "ml-auto px-2 py-0.5 text-xs font-semibold rounded-full",
        {
            "bg-[var(--color-primary-50)]/25 text-[var(--color-primary-50)]": isActive,
            "bg-[var(--color-primary-100)] text-[var(--color-primary-700)]":
                !isActive,
        },
    );

    const content = (
        <>
            <motion.span whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <item.icon className={iconClasses} />
            </motion.span>

            {(!isCollapsed || level > 0) && (
                <>
                    <span className="flex-1 text-left truncate">
                        {item.label}
                    </span>
                    {item.badge && (
                        <span className={badgeClasses}>{item.badge}</span>
                    )}
                    {hasChildren && (
                        <motion.span
                            animate={{ rotate: isExpanded ? 0 : -90 }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 20,
                            }}
                        >
                            <ChevronDown
                                className={cn(
                                    "w-4 h-4 transition-colors duration-200",
                                    isActive
                                        ? "text-[var(--color-primary-50)]"
                                        : "text-[var(--color-text-tertiary)] group-hover:text-[var(--color-primary-500)]",
                                )}
                            />
                        </motion.span>
                    )}
                </>
            )}
        </>
    );

    const Component = item.href && !hasChildren ? Link : "button";
    const componentProps =
        item.href && !hasChildren
            ? { href: item.href }
            : { type: "button" as const, onClick: handleClick };

    return (
        <div className="relative">
            <motion.div
                whileHover={isActive ? undefined : { x: 2 }}
                whileTap={{ scale: 0.98 }}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
            >
                <Component
                    className={itemClasses}
                    title={isCollapsed && level === 0 ? item.label : undefined}
                    {...componentProps}
                >
                    {content}
                </Component>
            </motion.div>

            <AnimatePresence>
                {isCollapsed && level === 0 && isHovered && (
                    <motion.div
                        initial={{ opacity: 0, x: -8, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 pointer-events-none"
                    >
                        <div className="relative">
                            <div
                                className={cn(
                                    "px-3 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap",
                                    "bg-[var(--color-surface)]",
                                    "text-[var(--color-text-primary)]",
                                    "shadow-xl shadow-black/15 dark:shadow-black/40",
                                    "border border-[var(--color-border)]",
                                    "backdrop-blur-sm",
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <item.icon className="w-4 h-4 text-[var(--color-primary-500)]" />
                                    <span>{item.label}</span>
                                    {item.badge && (
                                        <span className="px-1.5 py-0.5 text-xs font-semibold rounded-full bg-[var(--color-primary-500)] text-[var(--color-primary-50)]">
                                            {item.badge}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div
                                className={cn(
                                    "absolute right-full top-1/2 -translate-y-1/2 -mr-px",
                                    "border-8 border-transparent",
                                    "border-r-[var(--color-surface)]",
                                )}
                            />
                            <div
                                className={cn(
                                    "absolute right-full top-1/2 -translate-y-1/2",
                                    "border-8 border-transparent",
                                    "border-r-[var(--color-border)]",
                                )}
                                style={{ marginRight: "1px" }}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence initial={false}>
                {hasChildren && isExpanded && (!isCollapsed || level > 0) && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                        }}
                        className="overflow-hidden"
                    >
                        <ul className="mt-1 space-y-1 relative">
                            {!isCollapsed && level === 0 && (
                                <div className="absolute left-5 top-0 bottom-2 w-px bg-gradient-to-b from-[var(--color-primary-200)] to-transparent" />
                            )}
                            {item.children!.map((child, index) => (
                                <motion.li
                                    key={child.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                >
                                    <SidebarItem
                                        item={child}
                                        isCollapsed={isCollapsed}
                                        level={level + 1}
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

export default SidebarItem;
