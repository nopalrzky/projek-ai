"use client";

import { cn } from "@/lib/utils";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import React, { useMemo, useRef, useState, useEffect } from "react";
import { Fragment } from "react/jsx-runtime";
import type { TabsProps } from "./types";
import TabBadge from "./TabBadge";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

const Tabs: React.FC<TabsProps> = ({
    tabs,
    children,
    defaultIndex = 0,
    selectedIndex,
    onChange,
    variant = "default",
    size = "md",
    fullWidth = false,
    className = "",
    tabListClassName = "",
    tabClassName = "",
    tabPanelsClassName = "",
    tabPanelClassName = "",
    animated = true,
    lazy = false,
    scrollable = false,
    centered = false,
    fitted = false,
}) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showLeftScroll, setShowLeftScroll] = useState(false);
    const [showRightScroll, setShowRightScroll] = useState(false);
    const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);

    const checkScroll = () => {
        const container = scrollContainerRef.current;
        if (!container || !scrollable) return;

        const { scrollLeft, scrollWidth, clientWidth } = container;
        setShowLeftScroll(scrollLeft > 0);
        setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 1);
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener("resize", checkScroll);
        return () => window.removeEventListener("resize", checkScroll);
    }, [scrollable, tabs]);

    const scrollLeft = () => {
        scrollContainerRef.current?.scrollBy({
            left: -200,
            behavior: "smooth",
        });
    };

    const scrollRight = () => {
        scrollContainerRef.current?.scrollBy({ left: 200, behavior: "smooth" });
    };

    const containerClasses = useMemo(
        () => cn("w-full", className),
        [className],
    );

    const tabListClasses = useMemo(() => {
        const baseClasses = cn("flex", "transition-all duration-200", {
            "w-full": fullWidth,
            "justify-center": centered && !fullWidth && !scrollable,
            "overflow-x-auto overflow-y-hidden": scrollable,
            "scrollbar-thin scrollbar-thumb-[var(--color-gray-300)] scrollbar-track-transparent":
                scrollable,
            "hover:scrollbar-thumb-[var(--color-gray-400)]": scrollable,
            "snap-x snap-mandatory": scrollable,
            "-webkit-overflow-scrolling-touch": scrollable,
            "flex-col": variant === "vertical",
            "space-x-1":
                variant !== "vertical" && variant === "pills" && !scrollable,
            "gap-1": scrollable && variant === "pills",
            "space-y-1": variant === "vertical",
        });

        const variantClasses = {
            default: cn(
                "border-b border-[var(--color-border)]",
                "bg-transparent",
            ),
            pills: cn(
                "p-1 bg-[var(--color-gray-100)] dark:bg-[var(--color-surface-muted)]",
                "rounded-lg",
            ),
            underline: cn(
                "border-b border-[var(--color-border)]",
                "bg-transparent",
            ),
            vertical: cn(
                "border-r border-[var(--color-border)]",
                "bg-transparent min-w-[200px]",
            ),
        };

        return cn(baseClasses, variantClasses[variant], tabListClassName);
    }, [variant, fullWidth, centered, scrollable, tabListClassName]);

    const getTabClasses = useMemo(() => {
        const sizeClasses = {
            sm: "px-3 py-1.5 text-sm",
            md: "px-4 py-2 text-sm md:text-base",
            lg: "px-5 py-2.5 md:px-6 md:py-3 text-base md:text-lg",
        };

        return (selected: boolean, disabled: boolean) => {
            const baseClasses = cn(
                "relative inline-flex items-center justify-center",
                "font-medium transition-all duration-200 ease-in-out",
                "focus:outline-none focus:ring-2 focus:ring-offset-2",
                "whitespace-nowrap select-none",
                "snap-start",
                sizeClasses[size],
                {
                    "flex-1": (fitted || fullWidth) && !scrollable,
                    "cursor-not-allowed opacity-50": disabled,
                    "cursor-pointer": !disabled,
                    "flex-shrink-0": scrollable,
                },
            );

            const variantClasses = {
                default: cn(
                    "border-b-2 border-transparent",
                    "hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)]",
                    "focus:ring-[var(--color-primary-500)]/50",
                    {
                        "text-[var(--color-primary-600)] border-[var(--color-primary-600)] dark:text-[var(--color-primary-400)] dark:border-[var(--color-primary-400)]":
                            selected,
                        "text-[var(--color-text-secondary)]": !selected,
                    },
                ),
                pills: cn(
                    "rounded-md",
                    "focus:ring-[var(--color-primary-500)]/50",
                    {
                        "bg-[var(--color-surface)] shadow-sm text-[var(--color-text-primary)]":
                            selected,
                        "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]":
                            !selected,
                    },
                ),
                underline: cn(
                    "border-b-2 border-transparent",
                    "hover:text-[var(--color-text-primary)]",
                    "focus:ring-[var(--color-primary-500)]/50",
                    {
                        "text-[var(--color-primary-600)] border-[var(--color-primary-600)] dark:text-[var(--color-primary-400)] dark:border-[var(--color-primary-400)]":
                            selected,
                        "text-[var(--color-text-secondary)]": !selected,
                    },
                ),
                vertical: cn(
                    "w-full justify-start border-r-2 border-transparent",
                    "hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)]",
                    "focus:ring-[var(--color-primary-500)]/50",
                    {
                        "text-[var(--color-primary-600)] border-[var(--color-primary-600)] bg-[var(--color-primary-50)] dark:text-[var(--color-primary-400)] dark:border-[var(--color-primary-400)] dark:bg-[var(--color-primary-900)]/20":
                            selected,
                        "text-[var(--color-text-secondary)]": !selected,
                    },
                ),
            };

            return cn(baseClasses, variantClasses[variant], tabClassName);
        };
    }, [variant, size, fitted, fullWidth, scrollable, tabClassName]);

    const tabPanelsClasses = useMemo(
        () =>
            cn(
                "mt-4",
                {
                    "ml-4": variant === "vertical",
                    "mt-0": variant === "vertical",
                },
                tabPanelsClassName,
            ),
        [variant, tabPanelsClassName],
    );

    const tabPanelClasses = useMemo(
        () =>
            cn(
                "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary-500)]/50",
                "rounded-md",
                {
                    "transition-all duration-300 ease-in-out": animated,
                },
                tabPanelClassName,
            ),
        [animated, tabPanelClassName],
    );

    return (
        <div className={containerClasses}>
            <TabGroup
                defaultIndex={defaultIndex}
                selectedIndex={selectedIndex}
                onChange={onChange}
                as="div"
                className={variant === "vertical" ? "flex" : undefined}
            >
                <div className="md:hidden mb-4">
                    <Tab.Group
                        selectedIndex={selectedIndex}
                        onChange={onChange}
                    >
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() =>
                                    setIsMobileDropdownOpen(
                                        !isMobileDropdownOpen,
                                    )
                                }
                                className="w-full flex items-center justify-between px-4 py-2.5 text-left bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-sm hover:bg-[var(--color-surface-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent transition-colors"
                            >
                                <span className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-primary)]">
                                    {tabs[selectedIndex ?? defaultIndex]
                                        ?.icon && (
                                        <span className="flex-shrink-0">
                                            {
                                                tabs[
                                                    selectedIndex ??
                                                        defaultIndex
                                                ].icon
                                            }
                                        </span>
                                    )}
                                    <span>
                                        {
                                            tabs[selectedIndex ?? defaultIndex]
                                                ?.label
                                        }
                                    </span>
                                    {tabs[selectedIndex ?? defaultIndex]
                                        ?.badge && (
                                        <TabBadge
                                            variant={
                                                tabs[
                                                    selectedIndex ??
                                                        defaultIndex
                                                ]?.badgeVariant
                                            }
                                        >
                                            {
                                                tabs[
                                                    selectedIndex ??
                                                        defaultIndex
                                                ].badge
                                            }
                                        </TabBadge>
                                    )}
                                </span>
                                <ChevronDown
                                    className={cn(
                                        "w-5 h-5 text-[var(--color-text-tertiary)] transition-transform duration-200",
                                        isMobileDropdownOpen && "rotate-180",
                                    )}
                                />
                            </button>

                            {isMobileDropdownOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() =>
                                            setIsMobileDropdownOpen(false)
                                        }
                                    />
                                    <div className="absolute z-20 w-full mt-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg max-h-[300px] overflow-y-auto">
                                        {tabs.map((tab, index) => (
                                            <button
                                                key={`mobile-tab-${index}`}
                                                type="button"
                                                disabled={tab.disabled}
                                                onClick={() => {
                                                    onChange?.(index);
                                                    setIsMobileDropdownOpen(
                                                        false,
                                                    );
                                                }}
                                                className={cn(
                                                    "w-full flex items-center gap-2 px-4 py-3 text-left text-sm transition-colors",
                                                    "hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text-primary)]",
                                                    "disabled:opacity-50 disabled:cursor-not-allowed",
                                                    (selectedIndex ??
                                                        defaultIndex) === index
                                                        ? "bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]/20 text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)] font-medium"
                                                        : "text-[var(--color-text-secondary)]",
                                                )}
                                            >
                                                {tab.icon && (
                                                    <span className="flex-shrink-0">
                                                        {tab.icon}
                                                    </span>
                                                )}
                                                <span className="flex-1">
                                                    {tab.label}
                                                </span>
                                                {tab.badge && (
                                                    <TabBadge
                                                        variant={
                                                            tab.badgeVariant
                                                        }
                                                    >
                                                        {tab.badge}
                                                    </TabBadge>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </Tab.Group>
                </div>

                <div className="hidden md:block relative">
                    {scrollable && showLeftScroll && (
                        <button
                            onClick={scrollLeft}
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-surface)] shadow-lg border border-[var(--color-border)] hover:bg-[var(--color-surface-muted)] transition-colors"
                            aria-label="Scroll left"
                        >
                            <ChevronLeft className="w-4 h-4 text-[var(--color-text-secondary)]" />
                        </button>
                    )}

                    {scrollable && showLeftScroll && (
                        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[var(--color-surface)] to-transparent z-[5] pointer-events-none" />
                    )}

                    <TabList
                        className={tabListClasses}
                        ref={scrollContainerRef}
                        onScroll={checkScroll}
                    >
                        {tabs.map((tab, index) => (
                            <Tab
                                key={`tab-${index}-${tab.value || tab.label}`}
                                as={Fragment}
                            >
                                {({ selected }) => (
                                    <button
                                        className={getTabClasses(
                                            selected,
                                            tab.disabled || false,
                                        )}
                                        disabled={tab.disabled}
                                        type="button"
                                    >
                                        {tab.icon && (
                                            <span className="mr-2 flex-shrink-0">
                                                {tab.icon}
                                            </span>
                                        )}
                                        <span>{tab.label}</span>
                                        {tab.badge && (
                                            <span className="ml-2 flex-shrink-0">
                                                <TabBadge
                                                    variant={tab.badgeVariant}
                                                >
                                                    {tab.badge}
                                                </TabBadge>
                                            </span>
                                        )}
                                        {variant === "pills" && selected && (
                                            <span className="absolute inset-0 rounded-md ring-2 ring-[var(--color-primary-500)]/20" />
                                        )}
                                    </button>
                                )}
                            </Tab>
                        ))}
                    </TabList>

                    {scrollable && showRightScroll && (
                        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[var(--color-surface)] to-transparent z-[5] pointer-events-none" />
                    )}

                    {scrollable && showRightScroll && (
                        <button
                            onClick={scrollRight}
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-surface)] shadow-lg border border-[var(--color-border)] hover:bg-[var(--color-surface-muted)] transition-colors"
                            aria-label="Scroll right"
                        >
                            <ChevronRight className="w-4 h-4 text-[var(--color-text-secondary)]" />
                        </button>
                    )}
                </div>

                <TabPanels className={tabPanelsClasses}>
                    {React.Children.map(children, (child, index) => (
                        <TabPanel
                            key={`panel-${index}`}
                            className={tabPanelClasses}
                            unmount={lazy}
                        >
                            {child}
                        </TabPanel>
                    ))}
                </TabPanels>
            </TabGroup>
        </div>
    );
};

export default Tabs;
