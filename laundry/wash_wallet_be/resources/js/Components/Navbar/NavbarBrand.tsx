import React from "react";
import clsx from "clsx";
import { NavbarBrandProps } from "./types";

const NavbarBrand: React.FC<NavbarBrandProps> = ({
    children,
    href,
    logo,
    className,
    ...rest
}) => {
    const brandClasses = clsx(
        "flex items-center gap-3 group transition-all duration-300",
        "hover:scale-105 active:scale-95",
        className,
    );

    return (
        <a href={href || "/"} className={brandClasses} {...rest}>
            <div className="flex items-center justify-center w-10 h-10 lg:w-20 lg:h-16 rounded-xl transition-all duration-300 group-hover:shadow-lg">
                <img
                    src={"/assets/logo.png"}
                    alt="Logo"
                    className="w-6 h-6 lg:w-20 lg:h-20"
                />
            </div>

            <div className="flex flex-col">
                <span
                    className="text-xl lg:text-2xl font-bold leading-tight tracking-tight"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    {children || "WashWallet"}
                </span>
                <span
                    className="text-[10px] lg:text-xs font-medium tracking-wide hidden sm:block"
                    style={{ color: "var(--color-primary-600)" }}
                >
                    Sistem Manajemen Laundry
                </span>
            </div>
        </a>
    );
};

export default NavbarBrand;
