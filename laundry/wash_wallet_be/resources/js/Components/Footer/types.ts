import { ReactNode, HTMLAttributes } from "react";

export interface FooterProps extends HTMLAttributes<HTMLElement> {
    children: ReactNode;
    isGlass?: boolean;
    variant?: "default" | "dark" | "gradient";
}

export interface FooterBrandProps extends HTMLAttributes<HTMLDivElement> {
    children?: ReactNode;
    href?: string;
    logo?: ReactNode;
    title?: string;
    description?: string;
}

export interface FooterLinksProps extends HTMLAttributes<HTMLDivElement> {
    title?: string;
    links: FooterLink[];
}

export interface FooterLink {
    label: string;
    href: string;
    external?: boolean;
}

export interface FooterSocialsProps extends HTMLAttributes<HTMLDivElement> {
    title?: string;
    socials: SocialLink[];
}

export interface SocialLink {
    name: string;
    href: string;
    icon: ReactNode;
}

export interface FooterCopyrightProps extends HTMLAttributes<HTMLDivElement> {
    text?: string;
    year?: number;
    companyName?: string;
    showMadeWith?: boolean;
}
