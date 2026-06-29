import { ReactNode } from "react";

export interface TabItem {
    label: string;
    value?: string;
    disabled?: boolean;
    icon?: ReactNode;
    badge?: string | number;
    badgeVariant?:
        | "default"
        | "primary"
        | "secondary"
        | "success"
        | "warning"
        | "error"
        | "info";
}

export interface TabsProps {
    tabs: TabItem[];
    children: ReactNode;
    defaultIndex?: number;
    selectedIndex?: number;
    onChange?: (index: number) => void;
    variant?: "default" | "pills" | "underline" | "vertical";
    size?: "sm" | "md" | "lg";
    fullWidth?: boolean;
    className?: string;
    tabListClassName?: string;
    tabClassName?: string;
    tabPanelsClassName?: string;
    tabPanelClassName?: string;
    animated?: boolean;
    lazy?: boolean;
    scrollable?: boolean;
    centered?: boolean;
    fitted?: boolean;
}

export interface TabBadgeProps {
    children: ReactNode;
    variant?:
        | "default"
        | "primary"
        | "secondary"
        | "success"
        | "warning"
        | "error"
        | "info";
    className?: string;
}
