import React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { PaginationProps } from "./types";
import PaginationItem from "./PaginationItem";

const Pagination: React.FC<PaginationProps> = ({
    meta,
    onPageChange,
    isLoading,
    className,
    showInfo = true,
    maxVisiblePages = 7,
    variant = "default",
    size = "default",
}) => {
    const { currentPage, lastPage, from, to, total } = meta;

    if (lastPage <= 1 || total === 0) {
        return null;
    }

    const generatePageNumbers = (): (number | string)[] => {
        const pages: (number | string)[] = [];

        if (lastPage <= maxVisiblePages) {
            for (let i = 1; i <= lastPage; i++) {
                pages.push(i);
            }
            return pages;
        }

        pages.push(1);

        const sidePages = Math.floor((maxVisiblePages - 3) / 2);
        let startPage = Math.max(2, currentPage - sidePages);
        let endPage = Math.min(lastPage - 1, currentPage + sidePages);

        if (currentPage <= sidePages + 2) {
            endPage = Math.min(lastPage - 1, maxVisiblePages - 1);
        }

        if (currentPage >= lastPage - sidePages - 1) {
            startPage = Math.max(2, lastPage - maxVisiblePages + 2);
        }

        if (startPage > 2) {
            pages.push("ellipsis-start");
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        if (endPage < lastPage - 1) {
            pages.push("ellipsis-end");
        }

        if (lastPage > 1) {
            pages.push(lastPage);
        }

        return pages;
    };

    const pageNumbers = generatePageNumbers();

    const handlePageChange = (page: number): void => {
        if (
            !isLoading &&
            page >= 1 &&
            page <= lastPage &&
            page !== currentPage
        ) {
            onPageChange(page);
        }
    };

    const handlePrevious = (): void => {
        if (!isLoading && currentPage > 1) {
            handlePageChange(currentPage - 1);
        }
    };

    const handleNext = (): void => {
        if (!isLoading && currentPage < lastPage) {
            handlePageChange(currentPage + 1);
        }
    };

    const sizeClasses = {
        sm: "text-xs gap-1",
        default: "text-sm gap-1",
        lg: "text-base gap-2",
    };

    const variantStyles = {
        default: "",
        compact: "flex-row items-center justify-between",
        minimal: "",
    };

    return (
        <div
            className={cn(
                "pagination-shell flex flex-col transition-all duration-200",
                sizeClasses[size],
                variantStyles[variant],
                variant === "compact" ? "gap-4" : "gap-6",
                isLoading && "opacity-50 pointer-events-none",
                className,
            )}
        >
            {showInfo && variant !== "minimal" && (
                <div
                    className={cn(
                        "pagination-info text-center sm:text-left transition-colors duration-200",
                        size === "sm" && "text-xs",
                        size === "default" && "text-sm",
                        size === "lg" && "text-base",
                    )}
                >
                    <span className="hidden sm:inline">
                        Menampilkan{" "}
                        <span className="font-semibold tabular-nums text-[var(--color-text-primary)]">
                            {from?.toLocaleString("id-ID")}
                        </span>{" "}
                        sampai{" "}
                        <span className="font-semibold tabular-nums text-[var(--color-text-primary)]">
                            {to?.toLocaleString("id-ID")}
                        </span>{" "}
                        dari{" "}
                        <span className="font-semibold tabular-nums text-[var(--color-text-primary)]">
                            {total?.toLocaleString("id-ID")}
                        </span>{" "}
                        hasil
                    </span>
                    <span className="sm:hidden">
                        <span className="font-semibold tabular-nums text-[var(--color-text-primary)]">
                            {from?.toLocaleString("id-ID")}
                        </span>
                        {" - "}
                        <span className="font-semibold tabular-nums text-[var(--color-text-primary)]">
                            {to?.toLocaleString("id-ID")}
                        </span>
                        {" dari "}
                        <span className="font-semibold tabular-nums text-[var(--color-text-primary)]">
                            {total?.toLocaleString("id-ID")}
                        </span>
                    </span>
                </div>
            )}

            <nav
                className={cn(
                    "flex items-center",
                    variant === "compact" ? "justify-end" : "justify-center",
                )}
                aria-label="Pagination Navigation"
                role="navigation"
            >
                <div
                    className={cn(
                        "pagination-track flex items-center rounded-xl transition-all duration-200",
                        size === "sm" && "gap-0.5 p-1",
                        size === "default" && "gap-1 p-1",
                        size === "lg" && "gap-1.5 p-1.5",
                        variant !== "minimal" && "border",
                    )}
                >
                    <PaginationItem
                        page="prev"
                        isDisabled={isLoading || currentPage <= 1}
                        onClick={handlePrevious}
                        size={size}
                        variant={variant}
                        className={cn(
                            "flex items-center justify-center gap-2",
                            size === "sm" && "h-8 px-2 text-xs",
                            size === "default" && "h-9 px-3 text-sm",
                            size === "lg" && "h-10 px-4 text-base",
                        )}
                    >
                        <ChevronLeft
                            className={cn(
                                "transition-transform duration-200",
                                size === "sm" && "w-3 h-3",
                                size === "default" && "w-4 h-4",
                                size === "lg" && "w-5 h-5",
                            )}
                        />
                        {variant !== "minimal" && (
                            <span className="hidden sm:inline">Sebelumnya</span>
                        )}
                    </PaginationItem>

                    <div className="flex items-center gap-0.5">
                        {pageNumbers.map((page, index) => {
                            if (typeof page === "string") {
                                return (
                                    <div
                                        key={`${page}-${index}`}
                                        className={cn(
                                            "pagination-ellipsis flex items-center justify-center",
                                            size === "sm" && "w-8 h-8",
                                            size === "default" && "w-9 h-9",
                                            size === "lg" && "w-10 h-10",
                                        )}
                                        aria-hidden="true"
                                    >
                                        <MoreHorizontal
                                            className={cn(
                                                size === "sm" && "w-3 h-3",
                                                size === "default" && "w-4 h-4",
                                                size === "lg" && "w-5 h-5",
                                            )}
                                        />
                                    </div>
                                );
                            }

                            return (
                                <PaginationItem
                                    key={page}
                                    page={page}
                                    isActive={page === currentPage}
                                    isDisabled={isLoading}
                                    onClick={() => handlePageChange(page)}
                                    size={size}
                                    variant={variant}
                                    className={cn(
                                        "flex items-center justify-center font-medium tabular-nums",
                                        size === "sm" && "w-8 h-8 text-xs",
                                        size === "default" && "w-9 h-9 text-sm",
                                        size === "lg" && "w-10 h-10 text-base",
                                    )}
                                >
                                    {page}
                                </PaginationItem>
                            );
                        })}
                    </div>

                    <PaginationItem
                        page="next"
                        isDisabled={isLoading || currentPage >= lastPage}
                        onClick={handleNext}
                        size={size}
                        variant={variant}
                        className={cn(
                            "flex items-center justify-center gap-2",
                            size === "sm" && "h-8 px-2 text-xs",
                            size === "default" && "h-9 px-3 text-sm",
                            size === "lg" && "h-10 px-4 text-base",
                        )}
                    >
                        {variant !== "minimal" && (
                            <span className="hidden sm:inline">Berikutnya</span>
                        )}
                        <ChevronRight
                            className={cn(
                                "transition-transform duration-200",
                                size === "sm" && "w-3 h-3",
                                size === "default" && "w-4 h-4",
                                size === "lg" && "w-5 h-5",
                            )}
                        />
                    </PaginationItem>
                </div>

                {variant === "default" && lastPage > 10 && !isLoading && (
                    <div className="pagination-jump ml-4 hidden lg:flex items-center gap-2">
                        <span className="text-sm whitespace-nowrap text-[var(--color-text-tertiary)]">
                            Ke halaman:
                        </span>
                        <input
                            type="number"
                            min={1}
                            max={lastPage}
                            defaultValue={currentPage}
                            className="pagination-jump-input w-16 px-2 py-1 text-sm text-center rounded-md border transition-all duration-200 focus:ring-2 focus:outline-none"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    const value = parseInt(
                                        e.currentTarget.value,
                                    );
                                    if (value >= 1 && value <= lastPage) {
                                        handlePageChange(value);
                                    }
                                }
                            }}
                            onBlur={(e) => {
                                const value = parseInt(e.currentTarget.value);
                                if (
                                    value >= 1 &&
                                    value <= lastPage &&
                                    value !== currentPage
                                ) {
                                    handlePageChange(value);
                                } else {
                                    e.currentTarget.value =
                                        currentPage.toString();
                                }
                            }}
                        />
                    </div>
                )}
            </nav>
        </div>
    );
};

export default Pagination;
