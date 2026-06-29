import React from "react";
import clsx from "clsx";
import { NavbarMenuProps } from "./types";

const NavbarMenu: React.FC<NavbarMenuProps> = ({
    children,
    isOpen = false,
    className,
    ...props
}) => {
    const menuClasses = clsx(
        "lg:flex lg:items-center lg:gap-1",
        "absolute lg:relative top-full lg:top-0 left-0 right-0 lg:left-auto lg:right-auto",
        "w-full lg:w-auto mt-0 lg:mt-0",
        "shadow-xl lg:shadow-none rounded-b-2xl lg:rounded-none",
        "transition-all duration-300 ease-in-out origin-top",
        "overflow-hidden lg:overflow-visible",
        isOpen
            ? "max-h-[80vh] opacity-100 visible"
            : "max-h-0 lg:max-h-none opacity-0 lg:opacity-100 invisible lg:visible",
        className
    );

    const menuStyles = {
        backgroundColor: "var(--color-surface)",
        borderColor: "var(--color-border)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
    };

    return (
        <div className={menuClasses} style={menuStyles} {...props}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:gap-1 p-4 lg:p-0 space-y-1 lg:space-y-0">
                {children}
            </div>
        </div>
    );
};

export default NavbarMenu;
