import { PaginationMeta, Unit, UnitFilters } from "@/types";

export interface UnitIndexProps {
    units: {
        data: Unit[];
        meta: PaginationMeta;
    };
    filters: UnitFilters;
    flash: {
        success?: string;
        error?: string;
    };
}

export interface UnitsEditProps {
    unit: Unit;
}

export interface UnitTableProps {
    data: Unit[];
    meta: PaginationMeta;
    filters: UnitFilters;
    isLoading: boolean;
    onPaginationChange: (pageIndex: number, pageSize: number) => void;
    onSortingChange: (sorting: any[]) => void;
    onEditUnit: (unit: Unit) => void;
    onViewUnit: (unit: Unit) => void;
    onDeleteUnit: (unit: Unit) => void;
}

export interface UnitFiltersProps {
    filters: UnitFilters;
    hasActiveFilters: boolean;
    isLoading: boolean;
    onSearchChange: (value: string) => void;
    onFilterChange: (key: string, value: any) => void;
    onResetFilters: () => void;
}

export interface DeleteUnitModalProps {
    isOpen: boolean;
    unit?: Unit;
    onClose: () => void;
    onConfirm: (unit: Unit) => void;
    isLoading?: boolean;
}
