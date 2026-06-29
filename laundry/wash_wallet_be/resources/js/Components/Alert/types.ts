import React from "react";

export type AlertVariant =
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "error"
    | "info";
export type AlertSize = "sm" | "md" | "lg";

export interface AlertProps {
    variant?: AlertVariant;
    size?: AlertSize;
    title?: string;
    description?: string;
    children?: React.ReactNode;
    icon?: React.ReactNode;
    showIcon?: boolean;
    closable?: boolean;
    onClose?: () => void;
    className?: string;
    titleClassName?: string;
    descriptionClassName?: string;
    iconClassName?: string;
    closeButtonClassName?: string;
    actions?: React.ReactNode;
    border?: boolean;
    rounded?: boolean;
    shadow?: boolean;
    isGlass?: boolean;
    id?: string;
    role?: string;
    "aria-live"?: "polite" | "assertive" | "off";
}
