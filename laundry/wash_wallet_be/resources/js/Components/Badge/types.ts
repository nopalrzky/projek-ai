import React from "react";

export type BadgeVariant =
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "danger"
    | "warning"
    | "error"
    | "info"
    | "outline"
    | "ghost";

export type BadgeSize = "xs" | "sm" | "md" | "lg";
export type BadgeRounded = "sm" | "md" | "lg" | "full";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    children?: React.ReactNode;
    variant?: BadgeVariant;
    size?: BadgeSize;
    rounded?: BadgeRounded;
    icon?: React.ReactNode;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    dismissible?: boolean;
    onDismiss?: () => void;
    animated?: boolean;
    pulse?: boolean;
    isGlass?: boolean; // Fitur baru sesuai app.css
    className?: string;
}
