import { ReactNode } from "react";

export interface BreadcrumbItem {
    label: string;
    href?: string;
    icon?: ReactNode;
}

export interface AuthenticatedLayoutProps {
    title?: string;
    subtitle?: string;
    header?: ReactNode;
    searchable?: boolean;
    className?: string;
    showSidebar?: boolean;
    showHeader?: boolean;
    onSearch?: (query: string) => void;
    headerActions?: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}
export interface GuestLayoutProps {
    children: React.ReactNode;
    showNavigation?: boolean;
    showFooter?: boolean;
    isFullWidth?: boolean;
}
