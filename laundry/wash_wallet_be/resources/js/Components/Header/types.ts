import { ReactNode } from "react";
import { User } from "@/types";

export interface HeaderProps {
    title?: string;
    subtitle?: string;
    user?: User;
    actions?: ReactNode;
    searchable?: boolean;
    onSearch?: (query: string) => void;
    notifications?: Notification[];
    className?: string;
    onSidebarToggle?: () => void;
    sidebarCollapsed?: boolean;
    onThemeToggle?: () => void;
    currentTheme?: "light" | "dark";
}
