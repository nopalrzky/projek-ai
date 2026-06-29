import { ReactNode } from "react";

export interface BreadcrumbItemProps {
    label: string;
    href?: string;
    icon?: ReactNode;
    isLast?: boolean;
}

export interface BreadcrumbProps {
    items: BreadcrumbItemProps[];
    className?: string;
    showHome?: boolean;
    homeHref?: string;
    separator?: ReactNode;
    maxItems?: number;
    maxWidth?: string;
}
