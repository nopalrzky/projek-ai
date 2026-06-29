import { ReactNode } from "react";

export interface LoadingProps {
    rows?: number;
    columns?: number;
    type?: "skeleton" | "table" | "card" | "list" | "spinner";
    className?: string;
    size?: "sm" | "md" | "lg";
}

export interface EmptyProps {
    title?: string;
    message?: string;
    icon?: ReactNode;
    action?: ReactNode;
    className?: string;
    variant?: "search" | "no-results" | "error";
    rows?: number;
}

export interface NoDataProps {
    title?: string;
    message?: string;
    icon?: ReactNode;
    action?: ReactNode;
    className?: string;
    variant?: "default" | "database" | "feature";
}

export interface StateProps {
    isLoading?: boolean;
    isEmpty?: boolean;
    hasError?: boolean;
    isOffline?: boolean;
    error?: string | ReactNode;
    children?: ReactNode;
    loadingComponent?: ReactNode;
    emptyComponent?: ReactNode;
    errorComponent?: ReactNode;
    className?: string;
    loadingType?: "skeleton" | "table" | "card" | "list" | "spinner";
    emptyVariant?: "search" | "no-results" | "error";
    size?: "sm" | "md" | "lg";
}

export interface ErrorItem {
    row: number;
    data?: Record<string, any>;
    errors: string[];
}

export interface ErrorListProps {
    errors: ErrorItem[];
    title?: string;
    maxHeight?: string;
    showRowNumber?: boolean;
    showDataPreview?: boolean;
    collapsible?: boolean;
    defaultCollapsed?: boolean;
    className?: string;
    variant?: "default" | "compact" | "detailed";
}
