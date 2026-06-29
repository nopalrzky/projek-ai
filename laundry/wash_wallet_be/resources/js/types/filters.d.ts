/**
 * Generic pagination metadata from Laravel
 */
export interface PaginationMeta {
    currentPage: number;
    perPage: number;
    total: number;
    lastPage: number;
    from: number | null;
    to: number | null;
}

/**
 * Generic pagination links from Laravel
 */
export interface PaginationLinks {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
}

/**
 * Generic paginated response structure
 */
export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
    links?: PaginationLinks;
}

/**
 * Sort direction types
 */
export type SortDirection = "asc" | "desc";

/**
 * Base filter interface that all filters should extend
 */
export interface BaseFilters {
    search?: string;
    page?: number;
    perPage?: number;
    sortBy?: string;
    sortDirection?: SortDirection;
}

/**
 * Generic sort options
 */
export interface SortOptions {
    column: string;
    direction: SortDirection;
}

/**
 * Filter state status
 */
export interface FilterState {
    isLoading: boolean;
    hasActiveFilters: boolean;
}

/**
 * Inertia visit options for filter requests
 */
export interface InertiaFilterOptions {
    preserveState?: boolean;
    preserveScroll?: boolean;
    replace?: boolean;
    only?: string[];
    onStart?: () => void;
    onFinish?: () => void;
    onSuccess?: () => void;
    onError?: (errors: any) => void;
}

/**
 * Configuration for useInertiaFilters hook
 */
export interface UseInertiaFiltersConfig<T extends BaseFilters> {
    route: string;
    initialFilters: T;
    only?: string[];
    preserveState?: boolean;
    preserveScroll?: boolean;
    debounceMs?: number;
}

/**
 * Return type for useInertiaFilters hook
 */
export interface UseInertiaFiltersReturn<T extends BaseFilters> {
    filters: T;
    isLoading: boolean;
    hasActiveFilters: boolean;
    updateFilter: (key: keyof T, value: any) => void;
    updateFilters: (updates: Partial<T>) => void;
    updateSearch: (search: string) => void;
    updateSort: (sortOptions: SortOptions) => void;
    updatePagination: (page: number, perPage?: number) => void;
    resetFilters: () => void;
    applyFilters: (newFilters: Partial<T>) => void;
}

/**
 * Query parameter transformation options
 */
export interface QueryBuilderOptions {
    camelToSnake?: boolean;
    removeEmpty?: boolean;
    removeUndefined?: boolean;
    removeNull?: boolean;
}
