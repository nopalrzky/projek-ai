import { ReactNode } from "react";

export interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
    children: ReactNode;
    sticky?: boolean;
    transparent?: boolean;
}

export interface NavbarBrandProps extends React.ComponentProps<"a"> {
    children?: React.ReactNode;
    href?: string;
    logo?: React.ReactNode;
}

export interface NavbarToggleProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isOpen: boolean;
    onToggle: () => void;
}

export interface NavbarMenuProps extends React.HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    isOpen?: boolean;
}

export interface NavbarItemProps
    extends React.HTMLAttributes<HTMLAnchorElement | HTMLButtonElement> {
    children: ReactNode;
    active?: boolean;
    href?: string;
    icon?: ReactNode;
    badge?: string | number;
}

export interface NavbarDropdownProps
    extends React.HTMLAttributes<HTMLDivElement> {
    trigger: ReactNode;
    children: ReactNode;
    align?: "left" | "right";
}

export interface DropdownItemProps
    extends React.HTMLAttributes<HTMLAnchorElement | HTMLButtonElement> {
    children: ReactNode;
    href?: string;
    icon?: ReactNode;
    description?: string;
}
