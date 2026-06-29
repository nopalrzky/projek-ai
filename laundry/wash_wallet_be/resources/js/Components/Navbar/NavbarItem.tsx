import React from "react";
import clsx from "clsx";
import { NavbarItemProps } from "./types";

const NavbarItem: React.FC<NavbarItemProps> = ({
    children,
    active = false,
    href,
    icon,
    badge,
    className,
    ...props
}) => {
    const itemClasses = clsx(
        "relative group flex items-center gap-3 px-4 py-2.5 lg:px-3 lg:py-2",
        "rounded-lg text-sm font-medium transition-all duration-300",
        "hover:scale-105 active:scale-95",
        "focus:outline-none focus:ring-2 focus:ring-offset-2",
        active && "shadow-sm",
        className,
    );

    const itemStyles = {
        color: active
            ? "var(--color-primary-600)"
            : "var(--color-text-primary)",
        backgroundColor: active ? "var(--color-primary-50)" : "transparent",
    };

    const content = (
        <>
            {icon && <span className="flex-shrink-0 w-5 h-5">{icon}</span>}
            <span className="flex-1">{children}</span>
            {badge && (
                <span
                    className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full min-w-[1.25rem] h-5"
                    style={{
                        backgroundColor: "var(--color-primary-500)",
                        color: "#ffffff",
                    }}
                >
                    {badge}
                </span>
            )}

            {active && (
                <div
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 rounded-full hidden lg:block"
                    style={{ backgroundColor: "var(--color-primary-500)" }}
                />
            )}

            <div
                className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
                style={{ backgroundColor: "var(--color-primary-50)" }}
            />
        </>
    );

    if (href) {
        return (
            <a
                href={href}
                className={itemClasses}
                style={itemStyles}
                {...props}
            >
                {content}
            </a>
        );
    }

    return (
        <button className={itemClasses} style={itemStyles} {...props}>
            {content}
        </button>
    );
};

export default NavbarItem;
