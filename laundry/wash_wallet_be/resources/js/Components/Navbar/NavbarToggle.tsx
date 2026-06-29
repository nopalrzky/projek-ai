import React from "react";
import clsx from "clsx";
import { NavbarToggleProps } from "./types";

const NavbarToggle: React.FC<NavbarToggleProps> = ({
    isOpen,
    onToggle,
    className,
    ...props
}) => {
    const toggleClasses = clsx(
        "lg:hidden relative inline-flex items-center justify-center",
        "w-10 h-10 rounded-lg transition-all duration-300",
        "hover:scale-110 active:scale-95",
        "focus:outline-none focus:ring-2 focus:ring-offset-2",
        className
    );

    const toggleStyles = {
        backgroundColor: isOpen
            ? "var(--color-primary-50)"
            : "var(--color-surface)",
        borderColor: "var(--color-border)",
        border: "1px solid",
        boxShadow: isOpen
            ? "0 4px 12px rgba(18, 91, 72, 0.15)"
            : "0 2px 4px rgba(0,0,0,0.05)",
    };

    return (
        <button
            type="button"
            onClick={onToggle}
            className={toggleClasses}
            style={toggleStyles}
            aria-expanded={isOpen}
            aria-label="Toggle navigation menu"
            {...props}
        >
            <div className="w-5 h-5 relative flex flex-col justify-center">
                <span
                    className={clsx(
                        "block h-0.5 w-5 transition-all duration-300 rounded-full",
                        isOpen ? "rotate-45 translate-y-1.5" : "translate-y-0"
                    )}
                    style={{
                        backgroundColor: isOpen
                            ? "var(--color-primary-600)"
                            : "var(--color-text-primary)",
                    }}
                />
                <span
                    className={clsx(
                        "block h-0.5 w-5 mt-1 transition-all duration-300 rounded-full",
                        isOpen ? "opacity-0" : "opacity-100"
                    )}
                    style={{
                        backgroundColor: "var(--color-text-primary)",
                    }}
                />
                <span
                    className={clsx(
                        "block h-0.5 w-5 mt-1 transition-all duration-300 rounded-full",
                        isOpen ? "-rotate-45 -translate-y-1.5" : "translate-y-0"
                    )}
                    style={{
                        backgroundColor: isOpen
                            ? "var(--color-primary-600)"
                            : "var(--color-text-primary)",
                    }}
                />
            </div>
        </button>
    );
};

export default NavbarToggle;
