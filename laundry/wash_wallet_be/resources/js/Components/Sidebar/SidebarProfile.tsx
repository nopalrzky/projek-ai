import React, { useState, useCallback } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Settings, LogOut, ChevronUp, Loader2 } from "lucide-react";
import { SidebarProfileProps } from "./types";
import { cn } from "@/lib/utils";
import { Avatar } from "@/Components/Avatar";
import { Button } from "@/Components/Button";

const SidebarProfile: React.FC<SidebarProfileProps> = ({
    user,
    isCollapsed,
    onSettings,
    onLogout,
    isLoggingOut,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const handleToggle = useCallback(() => {
        if (!isCollapsed) setIsExpanded((prev) => !prev);
    }, [isCollapsed]);

    const profileVariants: Variants = {
        expanded: {
            height: "auto",
            opacity: 1,
            transition: { type: "spring", stiffness: 300, damping: 30 },
        },
        collapsed: {
            height: 0,
            opacity: 0,
            transition: { type: "spring", stiffness: 300, damping: 30 },
        },
    };

    if (isCollapsed) {
        return (
            <div className="p-4 border-t border-[var(--color-border)]">
                <motion.div
                    className="flex justify-center relative"
                    onHoverStart={() => setIsHovered(true)}
                    onHoverEnd={() => setIsHovered(false)}
                >
                    <Avatar
                        name={user.name}
                        src={user.avatar}
                        size="sm"
                        shape="rounded"
                        status="online"
                    />

                    <AnimatePresence>
                        {isHovered && (
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
                                            "px-4 py-3 rounded-xl",
                                            "bg-[var(--color-surface)]",
                                            "shadow-xl shadow-black/15 dark:shadow-black/40",
                                            "border border-[var(--color-border)]",
                                            "backdrop-blur-sm",
                                            "min-w-[180px]",
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar
                                                name={user.name}
                                                src={user.avatar}
                                                size="sm"
                                                shape="rounded"
                                                status="online"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm text-[var(--color-text-primary)] truncate">
                                                    {user.name}
                                                </p>
                                                <p className="text-xs text-[var(--color-text-tertiary)] truncate mt-0.5">
                                                    {user.email}
                                                </p>
                                            </div>
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
                </motion.div>
            </div>
        );
    }

    return (
        <div className="border-t border-[var(--color-border)]">
            <motion.button
                type="button"
                onClick={handleToggle}
                className={cn(
                    "w-full flex items-center justify-between p-4 transition-all duration-200",
                    "hover:bg-[var(--color-gray-50)]",
                    "active:scale-[0.99] focus:outline-none group",
                    isExpanded &&
                        "bg-[var(--color-gray-50)]",
                )}
            >
                <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                        name={user.name}
                        src={user.avatar}
                        size="md"
                        shape="rounded"
                        status="online"
                        className="flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 text-left">
                        <p className="font-semibold text-sm text-[var(--color-text-primary)] truncate group-hover:text-[var(--color-primary-600)] transition-colors">
                            {user.name}
                        </p>
                        <p className="text-xs text-[var(--color-text-tertiary)] truncate">
                            {user.email}
                        </p>
                    </div>
                </div>
                <div className="pl-4">
                    <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                        }}
                        className="text-[var(--color-text-tertiary)] group-hover:text-[var(--color-primary-500)] transition-colors"
                    >
                        <ChevronUp className="w-5 h-5" />
                    </motion.div>
                </div>
            </motion.button>

            <AnimatePresence initial={false}>
                {isExpanded && (
                    <motion.div
                        variants={profileVariants}
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                        className="overflow-hidden"
                    >
                        <div className="px-3 pb-4 space-y-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onSettings}
                                leftIcon={
                                    <Settings className="w-4 h-4 transition-transform group-hover:rotate-45" />
                                }
                                className={cn(
                                    "w-full justify-start gap-3 px-3 py-2.5 rounded-xl group",
                                    "text-[var(--color-text-secondary)] hover:text-[var(--color-primary-700)]",
                                    "hover:bg-[var(--color-primary-50)]",
                                )}
                            >
                                Pengaturan Akun
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onLogout}
                                disabled={isLoggingOut}
                                leftIcon={
                                    isLoggingOut ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                                    )
                                }
                                className={cn(
                                    "w-full justify-start gap-3 px-3 py-2.5 rounded-xl group",
                                    "text-[var(--color-error-600)]",
                                    "hover:bg-[var(--color-error-50)]",
                                    "hover:text-[var(--color-error-700)]",
                                    "disabled:opacity-50 disabled:cursor-not-allowed",
                                )}
                            >
                                {isLoggingOut ? "Keluar..." : "Keluar"}
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SidebarProfile;
