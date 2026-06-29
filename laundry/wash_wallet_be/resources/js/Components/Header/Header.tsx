import React, { useState, useCallback, useEffect } from "react";
import {
    Search,
    Sun,
    Moon,
    Settings,
    User,
    LogOut,
    ChevronDown,
    Menu,
} from "lucide-react";
import { Link, usePage, router } from "@inertiajs/react";
import { HeaderProps } from "./types";
import { cn, formatDate, formatTime } from "@/lib/utils";
import { Button } from "@/Components/Button";
import { Avatar } from "@/Components/Avatar";
import { NotificationBell } from "@/Components/NotificationBell";
import DropdownMenu from "@/Components/DropdownMenu/DropdownMenu";

const Header: React.FC<HeaderProps> = ({
    actions,
    searchable = false,
    onSearch,
    className,
    onSidebarToggle,
    onThemeToggle,
    currentTheme,
}) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [currentTime, setCurrentTime] = useState(new Date());
    const { auth } = usePage().props as any;
    const user = auth?.user;

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(timer);
    }, []);

    const handleSearchSubmit = useCallback(() => {
        onSearch?.(searchQuery);
    }, [onSearch, searchQuery]);

    const handleLogout = () => {
        router.post(route("logout"));
    };

    return (
        <header
            className={cn(
                "sticky top-0 h-16 border-b z-header glass flex-shrink-0 transition-all duration-300",
                className,
            )}
        >
            <div className="flex items-center justify-between h-full px-4">
                <div className="flex items-center space-x-4">
                    {onSidebarToggle && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="p-2 -ml-2 lg:hidden text-primary"
                            onClick={onSidebarToggle}
                            aria-label="Toggle Sidebar"
                        >
                            <Menu className="w-5 h-5" />
                        </Button>
                    )}
                    <Link
                        href={route("dashboard")}
                        className="flex items-center space-x-3"
                    >
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 group-hover:scale-105">
                            <img
                                src={"/assets/logo.png"}
                                alt="Logo"
                                className="w-8 h-8 object-contain"
                            />
                        </div>
                        <div className="hidden lg:block">
                            <span className="font-bold text-xl tracking-tight text-primary">
                                WashWallet
                            </span>
                        </div>
                    </Link>
                </div>

                {searchable && (
                    <div className="flex-1 max-w-lg mx-6 group">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Cari pesanan, pelanggan..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleSearchSubmit();
                                    }
                                }}
                                className="form-input pl-10 pr-4 py-2"
                            />
                        </div>
                    </div>
                )}

                <div className="flex items-center space-x-3">
                    {actions}
                    <div className="hidden md:flex flex-col items-end text-right">
                        <div className="text-sm font-semibold leading-none text-primary">
                            {formatTime(
                                currentTime.toLocaleTimeString("en-GB", {
                                    hour12: false,
                                }),
                            )}
                        </div>
                        <div className="text-[10px] uppercase tracking-wider font-medium text-tertiary mt-1">
                            {formatDate(currentTime.toISOString())}
                        </div>
                    </div>

                    <NotificationBell />

                    {onThemeToggle && (
                        <Button
                            type="button"
                            onClick={onThemeToggle}
                            variant="ghost"
                            size="sm"
                            className="p-2.5 rounded-xl hover:bg-surface-muted transition-all active:scale-95"
                            aria-label="Toggle Theme"
                        >
                            {currentTheme === "dark" ? (
                                <Sun className="w-5 h-5 text-primary" />
                            ) : (
                                <Moon className="w-5 h-5 text-primary" />
                            )}
                        </Button>
                    )}

                    <DropdownMenu width="w-72" align="right">
                        <DropdownMenu.Trigger>
                            <div className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-surface-muted transition-all cursor-pointer group">
                                <Avatar
                                    src={user?.avatar}
                                    alt={user?.name || "User"}
                                    name={user?.name || "U"}
                                    size="sm"
                                    className="ring-2 ring-transparent group-hover:ring-primary-500 transition-all"
                                />
                                <div className="hidden lg:block text-left">
                                    <div className="text-sm font-semibold leading-none text-primary">
                                        {user?.name || "User"}
                                    </div>
                                    <div className="text-xs text-tertiary mt-1">
                                        @{user?.username || "username"}
                                    </div>
                                </div>
                                <ChevronDown className="w-4 h-4 text-tertiary group-hover:text-primary transition-colors" />
                            </div>
                        </DropdownMenu.Trigger>

                        <DropdownMenu.Content>
                            <div className="p-4 flex items-center gap-3">
                                <Avatar
                                    src={user?.avatar}
                                    alt={user?.name || "User"}
                                    name={user?.name || "U"}
                                    size="md"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold text-primary truncate">
                                        {user?.name || "User"}
                                    </div>
                                    <div className="text-xs text-secondary truncate">
                                        {user?.email || "user@example.com"}
                                    </div>
                                </div>
                            </div>

                            <DropdownMenu.Separator />

                            <DropdownMenu.Group>
                                <DropdownMenu.Item
                                    icon={<User className="w-4 h-4" />}
                                    href={route("profile.index")}
                                >
                                    Profil Saya
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                    icon={<Settings className="w-4 h-4" />}
                                    href={route("profile.edit")}
                                >
                                    Pengaturan
                                </DropdownMenu.Item>
                            </DropdownMenu.Group>

                            <DropdownMenu.Separator />

                            <DropdownMenu.Item
                                icon={<LogOut className="w-4 h-4" />}
                                onClick={handleLogout}
                                danger
                            >
                                Logout
                            </DropdownMenu.Item>
                        </DropdownMenu.Content>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
};

export default Header;
