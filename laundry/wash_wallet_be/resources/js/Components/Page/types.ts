import { ReactNode, ElementType } from "react";

export type StatVariant =
    | "primary"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "default";

export type PageHeaderVariant = "default" | "gradient" | "glass";

export interface PageHeaderProps {
    title: string;
    subtitle?: string | React.ReactNode;
    icon?: ElementType | React.ReactNode;
    badges?: React.ReactNode[];
    actions?: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
    animate?: boolean;
    variant?: PageHeaderVariant;
}

export interface StatItem {
    label: string;
    value: string | number;
    subValue?: string;
    icon: string;
    variant?: StatVariant;
    trend?: string;
    unit?: string;
    progress?: number;
}

export interface StatCardProps {
    item: StatItem;
    animate?: boolean;
    variant?: "default" | "gradient" | "minimal";
}

export interface PageStatsProps {
    stats: StatItem[];
    className?: string;
    columns?: 1 | 2 | 3 | 4;
    animate?: boolean;
    variant?: "default" | "gradient" | "minimal";
}
