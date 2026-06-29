import { ReactNode, FormHTMLAttributes, HTMLAttributes } from "react";

export interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
    children: ReactNode;
    onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
    loading?: boolean;
}

export interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
    label?: string;
    error?: string;
    success?: string;
    info?: string;
    children: ReactNode;
    required?: boolean;
    optional?: boolean;
    className?: string;
    description?: string;
    disabled?: boolean;
    tooltip?: string;
}

export interface FormGroupProps extends HTMLAttributes<HTMLDivElement> {
    title?: string;
    description?: string;
    children: ReactNode;
    className?: string;
    isGlass?: boolean;
    variant?: "default" | "primary" | "gradient";
}

export interface FormSectionProps extends HTMLAttributes<HTMLDivElement> {
    title: string;
    description?: string;
    children: ReactNode;
    className?: string;
    collapsible?: boolean;
    defaultCollapsed?: boolean;
    icon?: ReactNode;
    badge?: string;
}
