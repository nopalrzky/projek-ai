import React from "react";
import { ModalBodyProps } from "./types";
import { cn } from "@/lib/utils";

const ModalBody: React.FC<ModalBodyProps> = ({
    children,
    className,
    scrollable = true,
    padding = "md",
    glass = false,
}) => {
    const paddingClasses = {
        none: "",
        sm: "p-3 sm:p-4",
        md: "p-4 sm:p-6",
        lg: "p-6 sm:p-8",
        xl: "p-8 sm:p-10",
    };

    return (
        <div
            className={cn(
                "flex-1 text-left transition-colors duration-200",
                "text-[var(--color-text-secondary)]",
                scrollable &&
                    "overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400",
                glass && "backdrop-blur-sm",
                paddingClasses[padding],
                className,
            )}
        >
            {children}
        </div>
    );
};

export default ModalBody;
