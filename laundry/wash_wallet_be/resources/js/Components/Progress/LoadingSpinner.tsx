import React, { useMemo } from "react";
import { LoadingSpinnerProps } from "./types";
import { cn } from "@/lib/utils";

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = "md",
    variant = "primary",
    fullscreen = false,
    label,
    type = "spinner",
    className,
    backdrop = true,
    backdropOpacity = 80,
    center = false,
}) => {
    const sizeClasses = useMemo(() => {
        const sizes = {
            xs: { spinner: "h-4 w-4 border-2", dots: "gap-1", text: "text-xs" },
            sm: {
                spinner: "h-6 w-6 border-2",
                dots: "gap-1.5",
                text: "text-sm",
            },
            md: {
                spinner: "h-10 w-10 border-3",
                dots: "gap-2",
                text: "text-base",
            },
            lg: {
                spinner: "h-16 w-16 border-4",
                dots: "gap-3",
                text: "text-lg",
            },
            xl: {
                spinner: "h-24 w-24 border-[5px]",
                dots: "gap-4",
                text: "text-xl",
            },
            "2xl": {
                spinner: "h-32 w-32 border-[6px]",
                dots: "gap-5",
                text: "text-2xl",
            },
        };
        return sizes[size];
    }, [size]);

    const variantClasses = useMemo(() => {
        const variants = {
            primary:
                "border-[var(--color-primary-500)] border-t-transparent",
            secondary:
                "border-[var(--color-text-secondary)] border-t-transparent",
            white: "border-white border-t-transparent",
            black: "border-black dark:border-white border-t-transparent",
            current: "border-current border-t-transparent",
        };
        return variants[variant];
    }, [variant]);

    const dotColors = useMemo(() => {
        const colors = {
            primary: "bg-[var(--color-primary-500)]",
            secondary: "bg-[var(--color-text-secondary)]",
            white: "bg-white",
            black: "bg-black dark:bg-white",
            current: "bg-current",
        };
        return colors[variant];
    }, [variant]);

    const renderSpinner = () => {
        switch (type) {
            case "dots":
                return (
                    <div className={cn("flex items-center", sizeClasses.dots)}>
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className={cn(
                                    "rounded-full animate-bounce",
                                    dotColors,
                                    size === "xs"
                                        ? "h-1.5 w-1.5"
                                        : size === "sm"
                                          ? "h-2 w-2"
                                          : size === "md"
                                            ? "h-3 w-3"
                                            : size === "lg"
                                              ? "h-4 w-4"
                                              : size === "xl"
                                                ? "h-6 w-6"
                                                : "h-8 w-8",
                                )}
                                style={{
                                    animationDelay: `${i * 0.15}s`,
                                    animationDuration: "0.6s",
                                }}
                            />
                        ))}
                    </div>
                );

            case "pulse":
                return (
                    <div className="relative">
                        <div
                            className={cn(
                                "rounded-full animate-ping absolute",
                                dotColors,
                                sizeClasses.spinner,
                            )}
                        />
                        <div
                            className={cn(
                                "rounded-full relative",
                                dotColors,
                                sizeClasses.spinner,
                            )}
                        />
                    </div>
                );

            case "bars":
                return (
                    <div className={cn("flex items-end", sizeClasses.dots)}>
                        {[0, 1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className={cn(
                                    "rounded-sm animate-pulse",
                                    dotColors,
                                    size === "xs"
                                        ? "h-3 w-1"
                                        : size === "sm"
                                          ? "h-4 w-1.5"
                                          : size === "md"
                                            ? "h-6 w-2"
                                            : size === "lg"
                                              ? "h-8 w-3"
                                              : size === "xl"
                                                ? "h-12 w-4"
                                                : "h-16 w-5",
                                )}
                                style={{
                                    animationDelay: `${i * 0.15}s`,
                                    animationDuration: "1s",
                                }}
                            />
                        ))}
                    </div>
                );

            case "spinner":
            default:
                return (
                    <div
                        className={cn(
                            "rounded-full animate-spin",
                            sizeClasses.spinner,
                            variantClasses,
                        )}
                        role="status"
                        aria-label="Loading"
                    >
                        <span className="sr-only">Loading...</span>
                    </div>
                );
        }
    };

    const spinnerContent = (
        <div
            className={cn(
                "flex flex-col items-center gap-3",
                center && "justify-center",
            )}
        >
            {renderSpinner()}
            {label && (
                <p
                    className={cn(
                        "font-medium text-[var(--color-text-secondary)]",
                        sizeClasses.text,
                        variant === "white" && "text-white",
                    )}
                >
                    {label}
                </p>
            )}
        </div>
    );

    if (fullscreen) {
        return (
            <div
                className={cn(
                    "fixed inset-0 z-50 flex items-center justify-center",
                    backdrop && `bg-black/${backdropOpacity} backdrop-blur-sm`,
                    className,
                )}
            >
                {spinnerContent}
            </div>
        );
    }

    return (
        <div
            className={cn(
                "inline-flex",
                center && "w-full justify-center",
                className,
            )}
        >
            {spinnerContent}
        </div>
    );
};

LoadingSpinner.displayName = "LoadingSpinner";

export default LoadingSpinner;
