import React from "react";
import { cn } from "@/lib/utils";
import { AvatarFallbackProps } from "./types";

const AvatarFallback: React.FC<AvatarFallbackProps> = ({
    name,
    className,
    children,
    ...props
}) => {
    const getInitials = (fullName?: string) => {
        if (!fullName) return "";
        const names = fullName.trim().split(" ");
        if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    };

    return (
        <div
            className={cn(
                "flex h-full w-full items-center justify-center bg-[var(--color-primary-50)] text-[var(--color-primary-700)] dark:bg-[var(--color-primary-900)] dark:text-[var(--color-primary-100)] font-medium",
                className,
            )}
            {...props}
        >
            {children || getInitials(name)}
        </div>
    );
};

export default AvatarFallback;
