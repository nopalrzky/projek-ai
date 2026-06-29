import React, { useState, useEffect } from "react";
import clsx from "clsx";
import { NavbarProps } from "./types";

const Navbar: React.FC<NavbarProps> = ({
    children,
    sticky = true,
    transparent = false,
    className,
    ...props
}) => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        if (sticky) {
            window.addEventListener("scroll", handleScroll);
            return () => window.removeEventListener("scroll", handleScroll);
        }
    }, [sticky]);

    const navbarClasses = clsx(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out",
        "backdrop-blur-md border-b",
        sticky && "sticky top-0",
        isScrolled && "shadow-xl",
        className
    );

    const navbarStyles = {
        backgroundColor:
            transparent && !isScrolled
                ? "rgba(255, 255, 255, 0.8)"
                : "var(--color-surface)",
        borderColor: isScrolled
            ? "var(--color-border)"
            : "rgba(229, 231, 235, 0.3)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
    };

    return (
        <nav className={navbarClasses} style={navbarStyles} {...props}>
            {/* Premium gradient overlay */}
            <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                    background: `linear-gradient(135deg, 
                        var(--color-primary-50) 0%, 
                        transparent 40%, 
                        var(--color-secondary-50) 100%)`,
                }}
            />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex items-center justify-between h-16 lg:h-20">
                    {children}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
