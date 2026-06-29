import React from "react";

export type LabelSize = "sm" | "md" | "lg";

export type LabelTone =
    | "default"
    | "muted"
    | "primary"
    | "success"
    | "warning"
    | "danger"
    | "info";

export type LabelElement = "label" | "span";

export interface LabelProps
    extends React.LabelHTMLAttributes<HTMLLabelElement> {
    children: React.ReactNode;
    as?: LabelElement;
    size?: LabelSize;
    tone?: LabelTone;
    required?: boolean;
    optional?: boolean;
    helperSuffix?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    className?: string;
}
