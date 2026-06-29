import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { AvatarProps } from "./types";
import AvatarImage from "./AvatarImage";
import AvatarFallback from "./AvatarFallback";

const Avatar: React.FC<AvatarProps> = ({
    src,
    alt,
    name,
    size = "md",
    shape = "circle",
    status,
    bordered = false,
    className,
    children,
    ...props
}) => {
    const [hasError, setHasError] = useState(false);

    const sizeClasses = {
        xs: "h-6 w-6 text-xs",
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-12 w-12 text-base",
        xl: "h-16 w-16 text-xl",
        "2xl": "h-20 w-20 text-2xl",
    };

    const shapeClasses = {
        circle: "rounded-full",
        square: "rounded-md",
        rounded: "rounded-xl",
    };

    const statusColorClasses = {
        online: "bg-green-500",
        offline: "bg-gray-400",
        busy: "bg-red-500",
        away: "bg-yellow-500",
    };

    const statusSizeClasses = {
        xs: "h-1.5 w-1.5",
        sm: "h-2 w-2",
        md: "h-2.5 w-2.5",
        lg: "h-3 w-3",
        xl: "h-4 w-4",
        "2xl": "h-5 w-5",
    };

    return (
        <div className={cn("relative inline-block", className)} {...props}>
            <div
                className={cn(
                    "relative flex overflow-hidden bg-[var(--color-gray-100)] dark:bg-[var(--color-gray-800)] transition-all duration-200",
                    sizeClasses[size],
                    shapeClasses[shape],
                    bordered &&
                    "ring-2 ring-[var(--color-surface)] dark:ring-[var(--color-gray-900)] shadow-sm border border-[var(--color-border)]",
                )}
            >
                {!hasError && src ? (
                    <AvatarImage
                        src={src}
                        alt={alt || name || "Avatar"}
                        onLoadError={() => setHasError(true)}
                    />
                ) : (
                    <AvatarFallback name={name}>{children}</AvatarFallback>
                )}
            </div>

            {status && (
                <span
                    className={cn(
                        "absolute bottom-0 right-0 block rounded-full ring-2 ring-[var(--color-surface)] dark:ring-[var(--color-gray-900)]",
                        statusColorClasses[status],
                        statusSizeClasses[size],
                        shape === "circle"
                            ? "translate-x-0 translate-y-0"
                            : "translate-x-1/4 translate-y-1/4",
                    )}
                />
            )}
        </div>
    );
};

export default Avatar;
