import { HTMLAttributes, ReactNode } from "react";
import { LucideIcon } from "lucide-react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    variant?: "default" | "outlined" | "elevated" | "flat";
    hoverable?: boolean;
    isGlass?: boolean;
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    action?: ReactNode;
}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
    children: ReactNode;
}

export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
    children: ReactNode;
}

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    noPadding?: boolean;
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

export interface StatsCardProps extends Omit<
    HTMLAttributes<HTMLDivElement>,
    "title"
> {
    label: string;
    value: string | number;
    icon?: ReactNode | LucideIcon;
    variant?: "default" | "primary" | "success" | "warning" | "danger" | "info";
    description?: string;
    change?: {
        value: number | string;
        trend: "up" | "down" | "neutral";
        label?: string;
    };
    loading?: boolean;
    size?: "sm" | "md" | "lg";
    bordered?: boolean;
    elevated?: boolean;
    isGlass?: boolean;
}
