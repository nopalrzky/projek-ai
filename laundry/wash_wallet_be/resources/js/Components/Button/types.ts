import { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant =
    | "primary"
    | "secondary"
    | "success"
    | "danger"
    | "warning"
    | "info"
    | "ghost"
    | "outline"
    | "link";

export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";
export type ButtonShape = "rounded" | "pill" | "square";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children?: ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    shape?: ButtonShape;
    loading?: boolean;
    disabled?: boolean;
    fullWidth?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    loadingText?: string;
    href?: string;
    target?: string;
    external?: boolean;
    gradient?: boolean;
    shadow?: boolean;
    isGlass?: boolean;
    ripple?: boolean;
    animateOnHover?: boolean;
    className?: string;
    badge?: ReactNode;
    tooltip?: string;
}
