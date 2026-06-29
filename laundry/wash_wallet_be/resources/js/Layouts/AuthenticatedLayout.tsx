"use client";

import type React from "react";
import { type PropsWithChildren, useState, useEffect } from "react";
import { Head, usePage } from "@inertiajs/react";
import type { PageProps } from "@/types";
import { Sidebar } from "@/Components/Sidebar";
import { Header } from "@/Components/Header";
import { Breadcrumb } from "@/Components/Breadcrumb";
import { cn } from "@/lib/utils";
import { useThemeContext } from "@/Context/ThemeContext";
import type { AuthenticatedLayoutProps } from "./types";

export default function AuthenticatedLayout({
    title = "Dashboard",
    subtitle,
    searchable = false,
    onSearch,
    headerActions,
    className = "",
    showSidebar = true,
    showHeader = true,
    breadcrumbs,
    children,
}: PropsWithChildren<AuthenticatedLayoutProps>) {
    const { props, url } = usePage<PageProps>();
    const user = props.auth.user;
    const { theme, toggleTheme } = useThemeContext();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    useEffect(() => {
        const savedState = localStorage.getItem("sidebar-collapsed");
        if (savedState !== null) {
            setSidebarCollapsed(JSON.parse(savedState));
        }
    }, []);

    useEffect(() => {
        setMobileSidebarOpen(false);
    }, [url]);

    const handleSidebarToggle = () => {
        if (window.innerWidth < 1024) {
            setMobileSidebarOpen(!mobileSidebarOpen);
        } else {
            const newState = !sidebarCollapsed;
            setSidebarCollapsed(newState);
            localStorage.setItem("sidebar-collapsed", JSON.stringify(newState));
        }
    };

    const processedBreadcrumbs = breadcrumbs?.map((item, index) => ({
        ...item,
        isLast: index === breadcrumbs.length - 1,
    }));

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-background">
            <Head title={title}>
                <meta name="robots" content="noindex,nofollow" />
            </Head>

            {showHeader && (
                <Header
                    user={user}
                    title={title}
                    subtitle={subtitle}
                    searchable={searchable}
                    onSearch={onSearch}
                    actions={headerActions}
                    onSidebarToggle={
                        showSidebar ? handleSidebarToggle : undefined
                    }
                    sidebarCollapsed={sidebarCollapsed}
                    onThemeToggle={toggleTheme}
                    currentTheme={theme}
                />
            )}

            <div className="flex flex-1 overflow-hidden min-h-0 relative">
                {showSidebar && (
                    <div className="z-40 h-full relative">
                        <Sidebar
                            user={user}
                            isCollapsed={sidebarCollapsed}
                            onToggle={handleSidebarToggle}
                            currentUrl={url}
                            mobileOpen={mobileSidebarOpen}
                            onMobileClose={() => setMobileSidebarOpen(false)}
                        />
                    </div>
                )}

                <main className="flex-1 min-w-0 overflow-hidden relative bg-background text-primary">
                    <div className="absolute inset-0 overflow-y-auto overflow-x-hidden custom-scrollbar">
                        <div className="flex flex-col min-h-full">
                            {processedBreadcrumbs &&
                                processedBreadcrumbs.length > 0 && (
                                    <div className="border-b bg-surface px-4 md:px-6 py-3 md:py-4 border-color">
                                        <Breadcrumb
                                            items={processedBreadcrumbs}
                                        />
                                    </div>
                                )}

                            <div className={cn("w-full flex-1", className)}>
                                {children}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export function withAuthenticatedLayout(
    layoutProps: Partial<AuthenticatedLayoutProps> = {},
) {
    return (page: React.ReactElement) => (
        <AuthenticatedLayout {...layoutProps}>{page}</AuthenticatedLayout>
    );
}
