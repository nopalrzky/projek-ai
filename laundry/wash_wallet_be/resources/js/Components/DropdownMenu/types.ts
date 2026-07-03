import { HTMLAttributes, ReactNode, MouseEvent, RefObject } from "react";

export interface DropdownMenuContextType {
    isOpen: boolean;
    toggle: () => void;
    close: () => void;
    triggerRef: RefObject<HTMLElement>;
}

export interface DropdownMenuProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    align?: "left" | "right" | "center";
    width?: string;
    className?: string;
    isGlass?: boolean;
}

export interface DropdownTriggerProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    className?: string;
    asChild?: boolean;
}

export interface DropdownContentProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    align?: "left" | "right" | "center";
    width?: string;
    isGlass?: boolean;
    sideOffset?: number;
}

export interface DropdownItemProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    icon?: ReactNode;
    href?: string;
    external?: boolean;
    disabled?: boolean;
    danger?: boolean;
    active?: boolean;
    shortcut?: string;
    onClick?: (e: MouseEvent<HTMLDivElement>) => void;
}

export interface DropdownSeparatorProps extends HTMLAttributes<HTMLDivElement> {}

export interface DropdownLabelProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

export interface DropdownGroupProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    label?: string;
}

export interface DropdownShortcutProps extends HTMLAttributes<HTMLSpanElement> {
    children: ReactNode;
}

export interface DropdownMenuTriggerProps {
    children: ReactNode;
    onClick: () => void;
    className?: string;
}
