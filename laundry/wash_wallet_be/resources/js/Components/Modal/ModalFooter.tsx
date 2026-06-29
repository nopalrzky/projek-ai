import React from "react";
import { ModalFooterProps } from "./types";
import { cn } from "@/lib/utils";

const ModalFooter: React.FC<ModalFooterProps> = ({
    children,
    className,
    justify = "end",
    padding = "md",
    glass = false,
}) => {
    const justifyClasses = {
        start: "justify-start",
        center: "justify-center",
        end: "justify-end",
        between: "justify-between",
    };

    const paddingClasses = {
        none: "",
        sm: "px-3 py-3 sm:px-4 sm:py-4",
        md: "px-4 py-4 sm:px-6 sm:py-5",
        lg: "px-6 py-5 sm:px-8 sm:py-6",
        xl: "px-8 py-6 sm:px-10 sm:py-7",
    };

    return (
        <div
            className={cn(
                "flex items-center gap-3 border-t transition-colors duration-200",
                "border-[var(--color-border)]",
                glass
                    ? "border-white/20 dark:border-white/10 bg-white/20 dark:bg-black/20"
                    : "bg-[var(--color-gray-50)] dark:bg-[var(--color-gray-900)]/50",
                justifyClasses[justify],
                paddingClasses[padding],
                className,
            )}
        >
            {children}
        </div>
    );
};

export default ModalFooter;
