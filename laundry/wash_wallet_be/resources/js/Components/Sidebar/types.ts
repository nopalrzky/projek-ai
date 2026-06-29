import { User } from "@/types";
import { LucideIcon } from "lucide-react";

export interface SidebarItem {
    id: string;
    label: string;
    icon: LucideIcon;
    href?: string;
    onClick?: () => void;
    badge?: string | number;
    children?: SidebarItem[];
    permissions?: string[];
    roles?: string[];
}

export interface SidebarSection {
    id: string;
    title?: string;
    items: SidebarItem[];
    roles?: string[];
}

export interface SidebarProps {
    user: User;
    isCollapsed?: boolean;
    onToggle?: () => void;
    currentUrl?: string;
    className?: string;
    mobileOpen?: boolean;
    onMobileClose?: () => void;
}

export interface SidebarItemProps {
    item: SidebarItem;
    isCollapsed: boolean;
    level?: number;
    activeUrl?: string;
}

export interface SidebarSectionProps {
    section: SidebarSection;
    isCollapsed: boolean;
    activeUrl?: string;
}

export interface SidebarProfileProps {
    user: User;
    isCollapsed: boolean;
    onSettings: () => void;
    onLogout: () => void;
    isLoggingOut?: boolean;
}
