import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import FilterSearch from "./FilterSearch";
import FilterButton from "./FilterButton";
import FilterPanel from "./FilterPanel";
import FilterPills from "./FilterPills";
import { Button } from "@/Components/Button";
import { FilterBarProps } from "./types";

const FilterBar: React.FC<FilterBarProps> = ({
    searchValue,
    onSearchChange,
    searchPlaceholder = "Search...",

    filters,
    filterValues,
    onFilterChange,

    filterGroups,
    quickFilters,

    activeFilters = [],
    onRemoveFilter,
    onClearAllFilters,

    actionButton,
    actions,

    onApplyFilters,
    autoApply = false,
    initialOpen = false,

    showQuickFilters = true,
    showFilterPills = true,

    className,
}) => {
    const [isPanelOpen, setIsPanelOpen] = useState(initialOpen);
    const [pendingValues, setPendingValues] = useState(filterValues);
    const [hasUnappliedChanges, setHasUnappliedChanges] = useState(false);

    useEffect(() => {
        if (!isPanelOpen) {
            setPendingValues(filterValues);
        }
    }, [filterValues]);

    const activeFiltersCount = useMemo(() => {
        return activeFilters.length;
    }, [activeFilters]);

    const handleTogglePanel = () => {
        if (!isPanelOpen) {
            setPendingValues(filterValues);
            setHasUnappliedChanges(false);
        }
        setIsPanelOpen(!isPanelOpen);
    };

    const handleFilterChange = (key: string, value: any) => {
        if (autoApply) {
            onFilterChange(key, value);
        } else {
            setPendingValues((prev) => {
                const newValues = {
                    ...prev,
                    [key]: value,
                };

                const hasChanges = Object.keys(newValues).some(
                    (k) =>
                        JSON.stringify(newValues[k]) !==
                        JSON.stringify(filterValues[k]),
                );
                setHasUnappliedChanges(hasChanges);

                return newValues;
            });
        }
    };

    const handleApplyFilters = () => {
        if (onApplyFilters) {
            onApplyFilters(pendingValues);
            setHasUnappliedChanges(false);
            setIsPanelOpen(false);
            return;
        }

        Object.entries(pendingValues).forEach(([key, value]) => {
            if (JSON.stringify(value) !== JSON.stringify(filterValues[key])) {
                onFilterChange(key, value);
            }
        });

        setHasUnappliedChanges(false);
        setIsPanelOpen(false);
    };

    const handleClearAll = () => {
        const emptyValues = Object.keys(pendingValues).reduce(
            (acc, key) => {
                acc[key] = undefined;
                return acc;
            },
            {} as Record<string, any>,
        );

        if (autoApply) {
            onClearAllFilters();
            setPendingValues(emptyValues);
        } else {
            setPendingValues(emptyValues);
            setHasUnappliedChanges(true);
        }
    };

    const handleCancel = () => {
        setPendingValues(filterValues);
        setHasUnappliedChanges(false);
        setIsPanelOpen(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn("space-y-4", className)}
            style={{
                position: "relative",
                zIndex: 100,
            }}
        >
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <div className="flex-1 w-full sm:w-auto">
                    <FilterSearch
                        value={searchValue}
                        onChange={onSearchChange}
                        placeholder={searchPlaceholder}
                        className="w-full"
                    />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {filters && filters.length > 0 && (
                        <FilterButton
                            isOpen={isPanelOpen}
                            onClick={handleTogglePanel}
                            activeCount={activeFiltersCount}
                            hasUnappliedChanges={hasUnappliedChanges}
                            className="flex-1 sm:flex-initial"
                        />
                    )}

                    {actions}

                    {actionButton && (
                        <Button
                            variant={actionButton.variant || "primary"}
                            size="md"
                            href={actionButton.href}
                            onClick={actionButton.onClick}
                            leftIcon={actionButton.icon}
                            className="flex-1 sm:flex-initial whitespace-nowrap"
                        >
                            {actionButton.label}
                        </Button>
                    )}
                </div>
            </div>

            {showFilterPills && activeFiltersCount > 0 && (
                <FilterPills
                    activeFilters={activeFilters}
                    onRemove={onRemoveFilter}
                    onClearAll={onClearAllFilters}
                />
            )}

            <FilterPanel
                isOpen={isPanelOpen}
                filters={filters}
                values={pendingValues}
                onChange={handleFilterChange}
                filterGroups={filterGroups}
                quickFilters={showQuickFilters ? quickFilters : undefined}
                onClearAll={handleClearAll}
                onApply={handleApplyFilters}
                onCancel={handleCancel}
                hasUnappliedChanges={hasUnappliedChanges}
                autoApply={autoApply}
            />
        </motion.div>
    );
};

export default FilterBar;
