import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, RotateCcw, Check } from "lucide-react";
import { Button } from "@/Components/Button";
import { Badge } from "@/Components/Badge";
import { cn } from "@/lib/utils";
import { FilterContainerProps } from "./types";
import FilterSearch from "./FilterSearch";
import FilterSelect from "./FilterSelect";
import FilterMultiSelect from "./FilterMultiSelect";
import FilterDateRange from "./FilterDateRange";

const FilterContainer: React.FC<FilterContainerProps> = ({
    filters,
    values,
    onChange,
    onReset,
    hasActiveFilters = false,
    isLoading = false,
    showResetButton = true,
    showApplyButton = false,
    onApply,
    layout = "horizontal",
    className,
    mobileCollapsible = true,
}) => {
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const activeFiltersCount = filters.filter((filter) => {
        const value = values[filter.key];
        if (value === null || value === undefined || value === "") return false;
        if (Array.isArray(value) && value.length === 0) return false;
        return true;
    }).length;

    const renderFilter = (filter: any) => {
        const value = values[filter.key];

        switch (filter.type) {
            case "search":
                return (
                    <FilterSearch
                        key={filter.key}
                        value={value || ""}
                        onChange={(val) => onChange(filter.key, val)}
                        onClear={() => onChange(filter.key, "")}
                        placeholder={filter.placeholder}
                        disabled={filter.disabled || isLoading}
                        className={filter.className}
                    />
                );

            case "select":
                return (
                    <div key={filter.key} className={filter.className}>
                        {filter.label && (
                            <label
                                className="block text-sm font-medium mb-2"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                {filter.label}
                            </label>
                        )}
                        <FilterSelect
                            value={value}
                            onChange={(val) => onChange(filter.key, val)}
                            options={filter.options}
                            placeholder={filter.placeholder}
                            disabled={filter.disabled || isLoading}
                            clearable={filter.clearable}
                            searchable={filter.searchable}
                        />
                    </div>
                );

            case "multiselect":
                return (
                    <div key={filter.key} className={filter.className}>
                        {filter.label && (
                            <label
                                className="block text-sm font-medium mb-2"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                {filter.label}
                            </label>
                        )}
                        <FilterMultiSelect
                            value={value || []}
                            onChange={(val) => onChange(filter.key, val)}
                            options={filter.options}
                            placeholder={filter.placeholder}
                            disabled={filter.disabled || isLoading}
                            maxSelections={filter.maxSelections}
                            showSelectedCount={filter.showSelectedCount}
                        />
                    </div>
                );

            case "daterange":
                return (
                    <div key={filter.key} className={filter.className}>
                        {filter.label && (
                            <label
                                className="block text-sm font-medium mb-2"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                {filter.label}
                            </label>
                        )}
                        <FilterDateRange
                            value={value || {}}
                            onChange={(val) => onChange(filter.key, val)}
                            placeholder={filter.placeholder}
                            disabled={filter.disabled || isLoading}
                            minDate={filter.minDate}
                            maxDate={filter.maxDate}
                            format={filter.format}
                        />
                    </div>
                );

            case "custom":
                return (
                    <div key={filter.key} className={filter.className}>
                        {filter.label && (
                            <label
                                className="block text-sm font-medium mb-2"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                {filter.label}
                            </label>
                        )}
                        {filter.render(value, (val: unknown) =>
                            onChange(filter.key, val),
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    const layoutClasses = {
        horizontal: "flex flex-wrap items-center gap-4",
        vertical: "flex flex-col gap-4",
        grid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn("rounded-lg border p-4 relative z-10", className)}
            style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-border)",
            }}
        >
            <div className="hidden lg:block">
                <div className={layoutClasses[layout]}>
                    {filters.map((filter) => renderFilter(filter))}

                    <div className="flex items-center gap-2">
                        {showResetButton && hasActiveFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onReset}
                                disabled={isLoading}
                                leftIcon={<RotateCcw className="w-4 h-4" />}
                            >
                                Reset
                            </Button>
                        )}

                        {showApplyButton && onApply && (
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={onApply}
                                disabled={isLoading}
                                leftIcon={<Check className="w-4 h-4" />}
                            >
                                Apply
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {mobileCollapsible && (
                <div className="lg:hidden">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowMobileFilters(!showMobileFilters)}
                        disabled={isLoading}
                        className="w-full"
                    >
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                        {activeFiltersCount > 0 && (
                            <Badge variant="primary" className="ml-2">
                                {activeFiltersCount}
                            </Badge>
                        )}
                    </Button>

                    <AnimatePresence>
                        {showMobileFilters && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 space-y-4"
                            >
                                {filters.map((filter) => renderFilter(filter))}

                                <div className="flex gap-2 pt-2">
                                    {showResetButton && hasActiveFilters && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={onReset}
                                            disabled={isLoading}
                                            className="flex-1"
                                        >
                                            <RotateCcw className="w-4 h-4 mr-2" />
                                            Reset
                                        </Button>
                                    )}

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            setShowMobileFilters(false)
                                        }
                                        className="flex-1"
                                    >
                                        Close
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </motion.div>
    );
};

export default FilterContainer;
