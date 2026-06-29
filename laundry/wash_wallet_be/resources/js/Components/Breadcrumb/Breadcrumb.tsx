import React, { useMemo } from "react";
import { Link } from "@inertiajs/react";
import { ChevronRight, Home, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { BreadcrumbProps, BreadcrumbItemProps } from "./types";

const Breadcrumb: React.FC<BreadcrumbProps> = ({
    items,
    className,
    showHome = true,
    homeHref = "/dashboard",
    separator,
    maxItems = 4,
}) => {
    const SeparatorIcon = separator || (
        <ChevronRight className="h-4 w-4 text-[var(--color-text-tertiary)]" />
    );

    const visibleItems = useMemo(() => {
        if (!items || items.length <= maxItems) return items;

        const startItems = items.slice(0, 1);
        const endItems = items.slice(-2);

        const ellipsisItem: BreadcrumbItemProps = {
            label: "...",
            href: undefined,
            isLast: false,
        };

        return [...startItems, ellipsisItem, ...endItems];
    }, [items, maxItems]);

    if (!items || items.length === 0) return null;

    return (
        <nav
            aria-label="Breadcrumb"
            className={cn(
                "flex flex-wrap items-center gap-1.5 text-sm",
                className,
            )}
        >
            {showHome && (
                <>
                    <Link
                        href={homeHref}
                        className={cn(
                            "flex items-center gap-2 rounded-md transition-colors",
                            "text-[var(--color-text-secondary)] hover:text-[var(--color-primary-600)] dark:hover:text-[var(--color-primary-400)]",
                        )}
                        aria-label="Home"
                    >
                        <Home className="h-4 w-4" />
                    </Link>
                    <span className="flex items-center" aria-hidden="true">
                        {SeparatorIcon}
                    </span>
                </>
            )}

            {visibleItems.map((item, index) => {
                const isLastItem = index === visibleItems.length - 1;
                const isEllipsis = item.label === "...";

                return (
                    <React.Fragment key={`${index}-${item.label}`}>
                        <div className="flex items-center gap-1.5">
                            {isEllipsis ? (
                                <span className="flex h-5 w-5 items-center justify-center text-[var(--color-text-tertiary)]">
                                    <MoreHorizontal className="h-4 w-4" />
                                </span>
                            ) : item.href && !isLastItem ? (
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-2 font-medium transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)]",
                                        "text-[var(--color-text-secondary)] hover:text-[var(--color-primary-600)] dark:hover:text-[var(--color-primary-400)]",
                                    )}
                                >
                                    {item.icon && (
                                        <span className="h-4 w-4">
                                            {item.icon}
                                        </span>
                                    )}
                                    {item.label}
                                </Link>
                            ) : (
                                <span
                                    className={cn(
                                        "flex items-center gap-2 font-semibold",
                                        "text-[var(--color-text-primary)]",
                                    )}
                                    aria-current="page"
                                >
                                    {item.icon && (
                                        <span className="h-4 w-4">
                                            {item.icon}
                                        </span>
                                    )}
                                    {item.label}
                                </span>
                            )}
                        </div>

                        {!isLastItem && (
                            <span
                                className="flex items-center"
                                aria-hidden="true"
                            >
                                {SeparatorIcon}
                            </span>
                        )}
                    </React.Fragment>
                );
            })}
        </nav>
    );
};

export default Breadcrumb;
