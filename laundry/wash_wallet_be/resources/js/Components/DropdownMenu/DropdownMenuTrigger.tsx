import React from "react";
import clsx from "clsx";
import { DropdownMenuTriggerProps } from "./types";

const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({
    children,
    onClick,
    className,
}) => {
    const triggerClasses = clsx(
        "cursor-pointer transition-all duration-200 hover:opacity-80",
        className
    );

    return (
        <div
            className={triggerClasses}
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onClick();
                }
            }}
        >
            {children}
        </div>
    );
};

export default DropdownMenuTrigger;
