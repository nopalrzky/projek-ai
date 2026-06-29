import React from "react";
import { motion } from "framer-motion";
import { RotateCcw, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/Components/Button";
import { Card } from "@/Components/Card";
import FilterGroup from "./FilterGroup";
import QuickFilters from "./QuickFilters";
import FilterSearch from "./FilterSearch";
import FilterSelect from "./FilterSelect";
import FilterMultiSelect from "./FilterMultiSelect";
import FilterDateRange from "./FilterDateRange";
import { FilterPanelProps } from "./types";

const FilterPanel: React.FC<FilterPanelProps> = ({
    isOpen,
    filters,
    values,
    onChange,
    filterGroups,
    quickFilters,
    onClearAll,
    onApply,
    onCancel,
    hasUnappliedChanges = false,
    autoApply = false,
    className,
}) => {
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
                        disabled={filter.disabled}
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
                            disabled={filter.disabled}
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
                            disabled={filter.disabled}
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
                            disabled={filter.disabled}
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

    return (
        <motion.div
            initial={false}
            animate={
                isOpen
                    ? { opacity: 1, height: "auto" }
                    : { opacity: 0, height: 0 }
            }
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className={cn("overflow-hidden", className)}
            style={{ pointerEvents: isOpen ? "auto" : "none" }}
        >
            <Card className="p-6 space-y-6">
                {quickFilters && quickFilters.length > 0 && (
                    <QuickFilters
                        filters={quickFilters}
                        onSelect={(filter) => {
                            onChange(filter.filterKey, filter.filterValue);
                        }}
                    />
                )}

                {filterGroups ? (
                    <div className="space-y-6">
                        {filterGroups.map((group, index) => (
                            <FilterGroup
                                key={index}
                                title={group.title}
                                collapsible={group.collapsible}
                                defaultCollapsed={group.defaultCollapsed}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {group.filters.map((filter) =>
                                        renderFilter(filter),
                                    )}
                                </div>
                            </FilterGroup>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filters.map((filter) => renderFilter(filter))}
                    </div>
                )}

                <div
                    className="flex items-center justify-between pt-4 border-t gap-3"
                    style={{ borderColor: "var(--color-border)" }}
                >
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClearAll}
                        leftIcon={<RotateCcw className="w-4 h-4" />}
                    >
                        Clear All
                    </Button>

                    <div className="flex items-center gap-2">
                        {!autoApply && onCancel && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onCancel}
                                leftIcon={<X className="w-4 h-4" />}
                            >
                                Cancel
                            </Button>
                        )}

                        {onApply && (
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={onApply}
                                leftIcon={<Check className="w-4 h-4" />}
                                disabled={!autoApply && !hasUnappliedChanges}
                            >
                                {hasUnappliedChanges
                                    ? "Apply Changes"
                                    : "Apply Filters"}
                            </Button>
                        )}
                    </div>
                </div>

                {!autoApply && hasUnappliedChanges && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                        style={{
                            backgroundColor: "var(--color-warning-50)",
                            borderColor: "var(--color-warning-200)",
                            color: "var(--color-warning-700)",
                        }}
                    >
                        <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                        You have unsaved filter changes
                    </motion.div>
                )}
            </Card>
        </motion.div>
    );
};

export default FilterPanel;
