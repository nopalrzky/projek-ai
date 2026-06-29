import { ReactNode } from "react";

export type FilterType =
    | "search"
    | "select"
    | "multiselect"
    | "daterange"
    | "date"
    | "number"
    | "boolean"
    | "custom";

export interface FilterOption {
    value: any;
    label: string;
    icon?: ReactNode;
    description?: string;
    disabled?: boolean;
}

export interface BaseFilterConfig {
    key: string;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

export interface SearchFilterConfig extends BaseFilterConfig {
    type: "search";
}

export interface SelectFilterConfig extends BaseFilterConfig {
    type: "select";
    options: FilterOption[];
    clearable?: boolean;
    searchable?: boolean;
}

export interface MultiSelectFilterConfig extends BaseFilterConfig {
    type: "multiselect";
    options: FilterOption[];
    maxSelections?: number;
    showSelectedCount?: boolean;
}

export interface DateRangeFilterConfig extends BaseFilterConfig {
    type: "daterange";
    minDate?: Date;
    maxDate?: Date;
    format?: string;
}

export interface DateFilterConfig extends BaseFilterConfig {
    type: "date";
    minDate?: Date;
    maxDate?: Date;
    format?: string;
}

export interface NumberFilterConfig extends BaseFilterConfig {
    type: "number";
    min?: number;
    max?: number;
    step?: number;
}

export interface BooleanFilterConfig extends BaseFilterConfig {
    type: "boolean";
    trueLabel?: string;
    falseLabel?: string;
}

export interface CustomFilterConfig extends BaseFilterConfig {
    type: "custom";
    render: (value: any, onChange: (value: any) => void) => ReactNode;
}

export type FilterConfig =
    | SearchFilterConfig
    | SelectFilterConfig
    | MultiSelectFilterConfig
    | DateRangeFilterConfig
    | DateFilterConfig
    | NumberFilterConfig
    | BooleanFilterConfig
    | CustomFilterConfig;

export interface FilterContainerProps {
    filters: FilterConfig[];
    values: Record<string, any>;
    onChange: (key: string, value: any) => void;
    onReset: () => void;
    hasActiveFilters?: boolean;
    isLoading?: boolean;
    showResetButton?: boolean;
    showApplyButton?: boolean;
    onApply?: () => void;
    layout?: "horizontal" | "vertical" | "grid";
    className?: string;
    mobileCollapsible?: boolean;
}

export interface FilterSearchProps {
    value: string;
    onChange: (value: string) => void;
    onClear?: () => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

export interface FilterSelectProps {
    value: any;
    onChange: (value: any) => void;
    options: FilterOption[];
    placeholder?: string;
    disabled?: boolean;
    clearable?: boolean;
    searchable?: boolean;
    className?: string;
}

export interface FilterMultiSelectProps {
    value: any[];
    onChange: (value: any[]) => void;
    options: FilterOption[];
    placeholder?: string;
    disabled?: boolean;
    maxSelections?: number;
    showSelectedCount?: boolean;
    className?: string;
}

export interface FilterDateRangeProps {
    value: { from?: Date; to?: Date };
    onChange: (value: { from?: Date; to?: Date }) => void;
    placeholder?: string;
    disabled?: boolean;
    minDate?: Date;
    maxDate?: Date;
    format?: string;
    className?: string;
}

export interface FilterGroupProps {
    title?: string;
    children: ReactNode;
    collapsible?: boolean;
    defaultCollapsed?: boolean;
    className?: string;
}

export interface ActiveFilter {
    key: string;
    label: string;
    value: any;
    displayValue: string;
}

export interface QuickFilterConfig {
    key: string;
    label: string;
    value: number;
    icon?: ReactNode;
    color?: "primary" | "success" | "warning" | "error" | "info";
    filterKey: string;
    filterValue: any;
}

export interface FilterGroupConfig {
    title: string;
    filters: FilterConfig[];
    collapsible?: boolean;
    defaultCollapsed?: boolean;
}

export interface FilterBarProps {
    searchValue: string;
    onSearchChange: (value: string) => void;
    searchPlaceholder?: string;

    filters: FilterConfig[];
    filterValues: Record<string, any>;
    onFilterChange: (key: string, value: any) => void;

    filterGroups?: FilterGroupConfig[];
    quickFilters?: QuickFilterConfig[];

    activeFilters?: ActiveFilter[];
    onRemoveFilter: (key: string) => void;
    onClearAllFilters: () => void;

    actionButton?: {
        label: string;
        href?: string;
        onClick?: () => void;
        icon?: ReactNode;
        variant?: "primary" | "secondary" | "outline";
    };
    actions?: ReactNode;

    onApplyFilters?: (values: Record<string, any>) => void;
    autoApply?: boolean;
    initialOpen?: boolean;

    showQuickFilters?: boolean;
    showFilterPills?: boolean;

    className?: string;
}

export interface FilterButtonProps {
    isOpen: boolean;
    onClick: () => void;
    activeCount: number;
    hasUnappliedChanges?: boolean;
    disabled?: boolean;
    className?: string;
}

export interface FilterPanelProps {
    isOpen: boolean;
    filters: FilterConfig[];
    values: Record<string, any>;
    onChange: (key: string, value: any) => void;

    filterGroups?: FilterGroupConfig[];
    quickFilters?: QuickFilterConfig[];

    onClearAll: () => void;
    onApply?: () => void;
    onCancel?: () => void;
    hasUnappliedChanges?: boolean;
    autoApply?: boolean;

    className?: string;
}

export interface FilterPillsProps {
    activeFilters: ActiveFilter[];
    onRemove: (key: string) => void;
    onClearAll: () => void;
    maxVisible?: number;
    className?: string;
}

export interface QuickFiltersProps {
    filters: QuickFilterConfig[];
    onSelect: (filter: QuickFilterConfig) => void;
    className?: string;
}
