import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { router, usePage } from "@inertiajs/react";
import { DataTable } from "@/Components/DataTable";
import { FilterBar, FilterContainer } from "@/Components/Filters";
import { Pagination } from "@/Components/Pagination";
import { Button } from "@/Components/Button";
import { cn } from "@/lib/utils";
import { DataViewProps, ActiveFilter } from "./types";

function DataView<T extends Record<string, any>>({
    route,
    data,
    meta,
    columns,
    filters = [],
    filterGroups,
    quickFilters,
    initialFilters = {},
    isLoading = false,
    emptyMessage = "Tidak ada data tersedia",
    enableSorting = true,
    enablePagination = true,
    enableRowSelection = false,
    enableFilters = true,
    showFilterContainer = true,
    useFilterBar = false,
    filterLayout = "horizontal",
    pageSize = 15,
    className,
    tableClassName,
    filterClassName,
    paginationClassName,
    header,
    footer,
    actionButton,
    actions,
    searchPlaceholder,
    onRowSelectionChange,
}: DataViewProps<T>) {
    const { url } = usePage();
    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
        const removeStartListener = router.on("start", () => {
            setIsNavigating(true);
        });

        const removeFinishListener = router.on("finish", () => {
            setIsNavigating(false);
        });

        return () => {
            removeStartListener();
            removeFinishListener();
        };
    }, []);

    const currentFilters = useMemo(() => {
        const queryString = url.split("?")[1] || "";
        const urlParams = new URLSearchParams(queryString);
        const filters: Record<string, any> = { ...initialFilters };

        urlParams.forEach((value, key) => {
            if (key.includes(".")) {
                const [parent, child] = key.split(".");
                if (!filters[parent]) filters[parent] = {};
                filters[parent][child] = value;
            } else {
                filters[key] = value;
            }
        });

        return filters;
    }, [initialFilters, url]);

    const activeFilters = useMemo((): ActiveFilter[] => {
        const active: ActiveFilter[] = [];

        Object.entries(currentFilters).forEach(([key, value]) => {
            if (
                value === null ||
                value === undefined ||
                value === "" ||
                value === "null" ||
                value === "undefined" ||
                (typeof value === "object" &&
                    !value.from &&
                    !value.to &&
                    !value.min &&
                    !value.max)
            )
                return;

            const filter = filters.find((f) => f.key === key);
            if (!filter) return;

            let displayValue = "";

            if (typeof value === "object") {
                if (value.from || value.to) {
                    const from = value.from
                        ? new Date(value.from).toLocaleDateString()
                        : "...";
                    const to = value.to
                        ? new Date(value.to).toLocaleDateString()
                        : "...";
                    displayValue = `${from} - ${to}`;
                }
                if (value.min || value.max) {
                    displayValue = `${value.min || "..."} - ${
                        value.max || "..."
                    }`;
                }
            } else if (filter.type === "select" && filter.options) {
                const option = filter.options.find(
                    (opt) => String(opt.value) === String(value),
                );
                displayValue = option?.label || String(value);
            } else {
                displayValue = String(value);
            }

            active.push({
                key,
                label: filter.label || key,
                value,
                displayValue,
            });
        });

        return active;
    }, [currentFilters, filters]);

    const handleFilterChange = (key: string, value: any) => {
        const params = new URLSearchParams(window.location.search);

        if (value === null || value === undefined || value === "") {
            params.delete(key);
            if (key.includes(".")) {
                const parent = key.split(".")[0];
                params.delete(`${parent}.from`);
                params.delete(`${parent}.to`);
                params.delete(`${parent}.min`);
                params.delete(`${parent}.max`);
            }
        } else if (typeof value === "object") {
            Object.entries(value).forEach(([subKey, subValue]) => {
                if (subValue) {
                    if (subValue instanceof Date) {
                        params.set(
                            `${key}.${subKey}`,
                            subValue.toISOString().split("T")[0],
                        );
                    } else {
                        params.set(`${key}.${subKey}`, String(subValue));
                    }
                } else {
                    params.delete(`${key}.${subKey}`);
                }
            });
        } else {
            params.set(key, String(value));
        }

        params.set("page", "1");

        router.get(route, Object.fromEntries(params.entries()), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleApplyAllFilters = (nextValues: Record<string, any>) => {
        const params = new URLSearchParams(window.location.search);

        filters.forEach((filter) => {
            params.delete(filter.key);
            params.delete(`${filter.key}.from`);
            params.delete(`${filter.key}.to`);
            params.delete(`${filter.key}.min`);
            params.delete(`${filter.key}.max`);
        });

        Object.entries(nextValues).forEach(([key, value]) => {
            if (value === null || value === undefined || value === "") {
                return;
            }

            if (typeof value === "object" && !Array.isArray(value)) {
                Object.entries(value).forEach(([subKey, subValue]) => {
                    if (subValue) {
                        if (subValue instanceof Date) {
                            params.set(
                                `${key}.${subKey}`,
                                subValue.toISOString().split("T")[0],
                            );
                        } else {
                            params.set(`${key}.${subKey}`, String(subValue));
                        }
                    }
                });
                return;
            }

            params.set(key, String(value));
        });

        params.set("page", "1");

        router.get(route, Object.fromEntries(params.entries()), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleRemoveFilter = (key: string) => {
        handleFilterChange(key, null);
    };

    const handleClearAllFilters = () => {
        const params = new URLSearchParams();
        params.set("page", "1");
        params.set("perPage", String(pageSize));

        router.get(route, Object.fromEntries(params.entries()), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(window.location.search);
        params.set("page", String(page));

        router.get(route, Object.fromEntries(params.entries()), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleRowSelectionChange = (selection: Record<string, boolean>) => {
        if (!onRowSelectionChange) return;
        const selectedRows = data.filter((_, idx) => selection[idx.toString()]);
        onRowSelectionChange(selectedRows);
    };

    const shouldShowFilterSection = enableFilters && showFilterContainer;
    const shouldUseFilterBar = shouldShowFilterSection && useFilterBar;
    const shouldShowTopActions =
        (!shouldShowFilterSection || !useFilterBar) &&
        (!!actionButton || !!actions);
    const effectiveIsLoading = isLoading || isNavigating;

    const isEmpty = data.length === 0 && !effectiveIsLoading;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn("space-y-4", className)}
        >
            {header && <div className="mb-4">{header}</div>}

            {shouldShowTopActions && (
                <div
                    className={cn(
                        "flex items-center justify-end gap-3",
                        filterClassName,
                    )}
                >
                    {actions}

                    {actionButton && (
                        <Button
                            variant={actionButton.variant || "primary"}
                            size="md"
                            href={actionButton.href}
                            onClick={actionButton.onClick}
                            leftIcon={actionButton.icon}
                            className="whitespace-nowrap"
                        >
                            {actionButton.label}
                        </Button>
                    )}
                </div>
            )}

            {shouldShowFilterSection &&
                (useFilterBar ? (
                    <FilterBar
                        searchValue={currentFilters.search || ""}
                        onSearchChange={(value) =>
                            handleFilterChange("search", value)
                        }
                        searchPlaceholder={searchPlaceholder}
                        filters={filters}
                        filterValues={currentFilters}
                        onFilterChange={handleFilterChange}
                        filterGroups={filterGroups}
                        quickFilters={quickFilters}
                        activeFilters={activeFilters}
                        onRemoveFilter={handleRemoveFilter}
                        onClearAllFilters={handleClearAllFilters}
                        onApplyFilters={handleApplyAllFilters}
                        actionButton={actionButton}
                        actions={actions}
                        autoApply={false}
                        showQuickFilters={!!quickFilters}
                        showFilterPills={true}
                        className={filterClassName}
                    />
                ) : (
                    <FilterContainer
                        filters={filters}
                        values={currentFilters}
                        onChange={handleFilterChange}
                        onReset={handleClearAllFilters}
                        hasActiveFilters={activeFilters.length > 0}
                        layout={filterLayout}
                        className={filterClassName}
                    />
                ))}

            <DataTable
                data={data}
                columns={columns}
                isLoading={effectiveIsLoading}
                isEmpty={isEmpty}
                enableSorting={enableSorting}
                enablePagination={false}
                enableRowSelection={enableRowSelection}
                emptyMessage={emptyMessage}
                onRowSelectionChange={handleRowSelectionChange}
                className={tableClassName}
            />

            {enablePagination && !isEmpty && (
                <Pagination
                    meta={meta}
                    onPageChange={handlePageChange}
                    className={paginationClassName}
                />
            )}

            {footer && <div className="mt-4">{footer}</div>}
        </motion.div>
    );
}

export default DataView;
