import React, { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import { NavbarDropdownProps, DropdownItemProps } from "./types";
import { ChevronDown } from "lucide-react";

const NavbarDropdown: React.FC<NavbarDropdownProps> = ({
    trigger,
    children,
    align = "left",
    className,
    ...props
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const dropdownClasses = clsx(
        "absolute top-full left-0 lg:left-auto lg:right-auto mt-2 w-full lg:w-80 rounded-xl shadow-2xl border z-[100]",
        "backdrop-blur-lg transition-all duration-300 transform origin-top",
        align === "right" ? "lg:right-0" : "lg:left-0",
        isOpen
            ? "opacity-100 visible scale-100 translate-y-0"
            : "opacity-0 invisible scale-95 -translate-y-2 pointer-events-none",
        className,
    );

    const dropdownStyles = {
        backgroundColor: "var(--color-surface)",
        borderColor: "var(--color-border)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    };

    return (
        <div className="relative" ref={dropdownRef} {...props}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    "flex items-center gap-2 px-4 py-2.5 lg:px-3 lg:py-2 rounded-lg",
                    "text-sm font-medium transition-all duration-300",
                    "hover:scale-105 active:scale-95",
                    "focus:outline-none focus:ring-2 focus:ring-offset-2 relative group",
                    isOpen && "shadow-sm",
                )}
                style={{
                    color: isOpen
                        ? "var(--color-primary-600)"
                        : "var(--color-text-primary)",
                    backgroundColor: isOpen
                        ? "var(--color-primary-50)"
                        : "transparent",
                }}
            >
                <span>{trigger}</span>
                <ChevronDown
                    className={clsx(
                        "w-4 h-4 transition-transform duration-300",
                        isOpen && "rotate-180",
                    )}
                />

                <div
                    className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
                    style={{ backgroundColor: "var(--color-primary-50)" }}
                />
            </button>

            <div className={dropdownClasses} style={dropdownStyles}>
                <div
                    className="absolute inset-0 opacity-5 rounded-xl pointer-events-none"
                    style={{
                        background: `linear-gradient(135deg, 
                            var(--color-primary-500) 0%, 
                            var(--color-secondary-400) 100%)`,
                    }}
                />

                <div className="relative p-2 space-y-0.5">{children}</div>
            </div>
        </div>
    );
};

export const DropdownItem: React.FC<DropdownItemProps> = ({
    children,
    href,
    icon,
    description,
    className,
    ...props
}) => {
    const itemClasses = clsx(
        "flex items-start gap-3 px-4 py-3 rounded-lg group",
        "text-sm transition-all duration-200",
        "hover:scale-[1.02] active:scale-95 relative overflow-hidden",
        className,
    );

    const content = (
        <>
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10"
                style={{ backgroundColor: "var(--color-primary-50)" }}
            />

            {icon && (
                <div
                    className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-110"
                    style={{
                        backgroundColor: "var(--color-primary-100)",
                    }}
                >
                    <span style={{ color: "var(--color-primary-600)" }}>
                        {icon}
                    </span>
                </div>
            )}
            <div className="flex-1 min-w-0">
                <div
                    className="font-semibold mb-0.5 transition-colors duration-200"
                    style={{
                        color: "var(--color-text-primary)",
                    }}
                >
                    {children}
                </div>
                {description && (
                    <p
                        className="text-xs leading-relaxed"
                        style={{ color: "var(--color-text-tertiary)" }}
                    >
                        {description}
                    </p>
                )}
            </div>
        </>
    );

    if (href) {
        return (
            <a href={href} className={itemClasses} {...props}>
                {content}
            </a>
        );
    }

    return (
        <button className={itemClasses} {...props}>
            {content}
        </button>
    );
};

export default NavbarDropdown;
