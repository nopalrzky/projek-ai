import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { router, usePage } from "@inertiajs/react";
import { PageProps } from "@/types";
import { ChevronLeft, Menu, X, Sparkles, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    SidebarProps,
    SidebarItem,
    SidebarSection as SidebarMenuSection,
} from "./types";
import SidebarSection from "./SidebarSection";
import SidebarProfile from "./SidebarProfile";
import { getSidebarMenu } from "./menu";

const Sidebar: React.FC<SidebarProps> = ({
    user,
    isCollapsed: controlledCollapsed,
    onToggle,
    currentUrl,
    className,
    mobileOpen = false,
    onMobileClose,
}) => {
    const [internalCollapsed, setInternalCollapsed] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const { url, props: pageProps } = usePage<PageProps>();
    const activeUrl = currentUrl || url;
    const unreadCount = pageProps.notifications?.unread_count || 0;

    const isCollapsed = controlledCollapsed ?? internalCollapsed;
    const menuSections = useMemo<SidebarMenuSection[]>(
        () => getSidebarMenu(user, unreadCount),
        [user, unreadCount],
    );
    const filteredSections = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        if (!query) return menuSections;

        return menuSections
            .map((section) => {
                const filteredItems = section.items.filter(
                    (item: SidebarItem) => {
                        const labelMatch = item.label
                            .toLowerCase()
                            .includes(query);
                        const childMatch =
                            item.children?.some((child: SidebarItem) =>
                                child.label.toLowerCase().includes(query),
                            ) ?? false;

                        return labelMatch || childMatch;
                    },
                );

                return {
                    ...section,
                    items: filteredItems,
                };
            })
            .filter((section) => section.items.length > 0);
    }, [menuSections, searchQuery]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setInternalCollapsed(true);
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        document.body.style.overflow = mobileOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [mobileOpen]);

    useEffect(() => {
        if (mobileOpen && onMobileClose) {
            onMobileClose();
        }
    }, [activeUrl]);

    const handleToggle = useCallback(() => {
        onToggle ? onToggle() : setInternalCollapsed((prev) => !prev);
    }, [onToggle]);

    const handleLogout = useCallback(() => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);
        router.post(
            route("logout"),
            {},
            {
                preserveState: false,
                onFinish: () => setIsLoggingOut(false),
            },
        );
    }, [isLoggingOut]);

    const handleSettings = useCallback(() => {
        router.visit(route("profile.edit"));
    }, []);

    const sidebarVariants: Variants = {
        expanded: {
            width: 280,
            transition: { type: "spring", stiffness: 300, damping: 30 },
        },
        collapsed: {
            width: 80,
            transition: { type: "spring", stiffness: 300, damping: 30 },
        },
    };

    const overlayVariants: Variants = {
        open: { opacity: 1 },
        closed: { opacity: 0 },
    };

    const mobileMenuVariants: Variants = {
        open: {
            x: 0,
            transition: { type: "spring", stiffness: 400, damping: 40 },
        },
        closed: {
            x: "-100%",
            transition: { type: "spring", stiffness: 400, damping: 40 },
        },
    };

    const logoVariants: Variants = {
        visible: {
            opacity: 1,
            x: 0,
            transition: { type: "spring", stiffness: 300, damping: 25 },
        },
        hidden: {
            opacity: 0,
            x: -20,
            transition: { duration: 0.15 },
        },
    };

    const renderSidebarContent = (isMobile = false) => {
        const showExpanded = !isCollapsed || isMobile;

        return (
            <>
                <div
                    className={cn(
                        "flex items-center justify-between p-4 border-b",
                        "border-[var(--color-border)]",
                        "bg-gradient-to-r from-[var(--color-primary-50)]/50 to-transparent",
                    )}
                >
                    <AnimatePresence mode="wait">
                        {showExpanded && (
                            <motion.div
                                variants={logoVariants}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                className="flex items-center gap-3"
                            >
                                <motion.div
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center",
                                        "bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-700)]",
                                        "shadow-lg shadow-[var(--color-primary-500)]/30",
                                    )}
                                >
                                    <Sparkles className="w-5 h-5 text-[var(--color-primary-50)]" />
                                </motion.div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-lg text-[var(--color-text-primary)]">
                                        Kasir App
                                    </span>
                                    <span className="text-xs text-[var(--color-text-tertiary)]">
                                        Management System
                                    </span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!isMobile && (
                        <motion.button
                            type="button"
                            onClick={handleToggle}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={cn(
                                "p-2.5 rounded-xl transition-colors duration-200",
                                "hover:bg-[var(--color-primary-100)]",
                                "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/50",
                                isCollapsed && "mx-auto",
                            )}
                        >
                            <motion.div
                                animate={{ rotate: isCollapsed ? 180 : 0 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 20,
                                }}
                            >
                                <ChevronLeft className="w-5 h-5 text-[var(--color-text-secondary)]" />
                            </motion.div>
                        </motion.button>
                    )}

                    {mobileOpen && (
                        <motion.button
                            type="button"
                            onClick={onMobileClose}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={cn(
                                "p-2.5 rounded-xl transition-colors duration-200",
                                "hover:bg-[var(--color-primary-100)]",
                            )}
                        >
                            <X className="w-5 h-5 text-[var(--color-text-secondary)]" />
                        </motion.button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-[var(--color-border)] scrollbar-track-transparent">
                    {showExpanded && (
                        <div className="p-3 pb-0">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    onClick={(e) => e.stopPropagation()}
                                    onKeyDown={(e) => e.stopPropagation()}
                                    placeholder="Cari menu..."
                                    className={cn(
                                        "w-full h-10 pl-10 pr-3 rounded-xl text-sm",
                                        "border border-[var(--color-border)]",
                                        "bg-[var(--color-surface)]",
                                        "text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]",
                                        "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/30",
                                    )}
                                />
                            </div>
                        </div>
                    )}

                    <nav className="p-3 space-y-1">
                        {filteredSections.map((section) => (
                            <SidebarSection
                                key={section.id}
                                section={section}
                                isCollapsed={isCollapsed && !isMobile}
                                activeUrl={activeUrl}
                            />
                        ))}

                        {showExpanded && filteredSections.length === 0 && (
                            <div className="px-3 py-6 text-center text-sm text-[var(--color-text-tertiary)]">
                                Menu tidak ditemukan
                            </div>
                        )}
                    </nav>
                </div>

                <SidebarProfile
                    user={user}
                    isCollapsed={isCollapsed && !isMobile}
                    onSettings={handleSettings}
                    onLogout={handleLogout}
                    isLoggingOut={isLoggingOut}
                />
            </>
        );
    };

    return (
        <>
            <motion.aside
                variants={sidebarVariants}
                animate={isCollapsed ? "collapsed" : "expanded"}
                className={cn(
                    "hidden lg:flex flex-col h-full sticky top-0 z-30",
                    "bg-[var(--color-surface)]",
                    "border-r border-[var(--color-border)]",
                    "shadow-xl shadow-black/5 dark:shadow-black/20",
                    className,
                )}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-primary-50)]/20 via-transparent to-[var(--color-primary-50)]/10 pointer-events-none" />
                <div className="relative flex flex-col h-full">
                    {renderSidebarContent()}
                </div>
            </motion.aside>

            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            variants={overlayVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                            transition={{ duration: 0.2 }}
                            onClick={onMobileClose}
                            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        />
                        <motion.aside
                            variants={mobileMenuVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                            className={cn(
                                "lg:hidden fixed inset-y-0 left-0 z-50 w-[280px] flex flex-col",
                                "bg-[var(--color-surface)]",
                                "shadow-2xl shadow-black/25",
                            )}
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-primary-50)]/20 via-transparent to-[var(--color-primary-50)]/10 pointer-events-none" />
                            <div className="relative flex flex-col h-full">
                                {renderSidebarContent(true)}
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Sidebar;
