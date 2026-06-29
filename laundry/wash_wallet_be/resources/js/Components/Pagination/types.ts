export interface PaginationMeta {
    currentPage: number;
    lastPage: number;
    from: number | null;
    to: number | null;
    total: number;
    perPage?: number;
    hasMorePages?: boolean;
}

export interface BasePaginationProps {
    onPageChange: (page: number) => void;
    className?: string;
    showInfo?: boolean;
    maxVisiblePages?: number;
    variant?: "default" | "compact" | "minimal";
    size?: "sm" | "default" | "lg";
}

export interface PaginationProps extends BasePaginationProps {
    meta: PaginationMeta;
    isLoading?: boolean;
}

export interface PaginationItemProps {
    page: number | string;
    isActive?: boolean;
    isDisabled?: boolean;
    onClick?: () => void;
    children: React.ReactNode;
    className?: string;
    size?: "sm" | "default" | "lg";
    variant?: "default" | "compact" | "minimal";
}
