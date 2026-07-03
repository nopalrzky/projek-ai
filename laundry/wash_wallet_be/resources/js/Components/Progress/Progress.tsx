import React, { useMemo } from "react";
import { ProgressProps } from "./types";
import { cn } from "@/lib/utils";

const Progress: React.FC<ProgressProps> = ({
    value,
    max = 100,
    variant = "primary",
    size = "md",
    showLabel = false,
    labelPosition = "right",
    label,
    animated = true,
    striped = false,
    indeterminate = false,
    className,
    barClassName,
    labelClassName,
    color,
    showMinMax = false,
    minLabel = "0",
    maxLabel,
    rounded = true,
    thickness = 1,
}) => {
    const percentage = useMemo(() => {
        if (indeterminate) return 100;
        return Math.min(Math.max((value / max) * 100, 0), 100);
    }, [value, max, indeterminate]);

    const sizeClasses = useMemo(() => {
        const heights = {
            xs: 1,
            sm: 1.5,
            md: 2,
            lg: 3,
            xl: 4,
        };

        const textSizes = {
            xs: "text-xs",
            sm: "text-sm",
            md: "text-base",
            lg: "text-lg",
            xl: "text-xl",
        };

        return {
            container: `h-${heights[size]} `,
            text: textSizes[size],
        };
    }, [size, thickness]);

    const variantClasses = useMemo(() => {
        if (color) {
            return {
                background: "",
                text: "",
                style: { backgroundColor: color, color: color },
            };
        }

        const variants = {
            primary: {
                background: "bg-primary-500 dark:bg-primary-600",
                text: "text-primary-600 dark:text-primary-400",
            },
            secondary: {
                background: "bg-secondary-500 dark:bg-secondary-600",
                text: "text-secondary-600 dark:text-secondary-400",
            },
            success: {
                background: "bg-green-500 dark:bg-green-600",
                text: "text-green-600 dark:text-green-400",
            },
            danger: {
                background: "bg-red-500 dark:bg-red-600",
                text: "text-red-600 dark:text-red-400",
            },
            warning: {
                background: "bg-yellow-500 dark:bg-yellow-600",
                text: "text-yellow-600 dark:text-yellow-400",
            },
            info: {
                background: "bg-blue-500 dark:bg-blue-600",
                text: "text-blue-600 dark:text-blue-400",
            },
        };

        return { ...variants[variant], style: {} };
    }, [variant, color]);

    const labelText = useMemo(() => {
        if (label) return label;
        if (showLabel) return `${Math.round(percentage)}%`;
        return null;
    }, [label, showLabel, percentage]);

    const containerLayoutClasses = useMemo(() => {
        const layouts = {
            top: "flex flex-col gap-2",
            right: "flex items-center gap-3",
            bottom: "flex flex-col gap-2",
            inside: "relative",
        };
        return layouts[labelPosition];
    }, [labelPosition]);

    const stripedClasses = striped
        ? "bg-[length:1rem_1rem] bg-[linear-gradient(45deg,rgba(255,255,255,.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)_50%,rgba(255,255,255,.15)_75%,transparent_75%,transparent)]"
        : "";

    const animationClasses = useMemo(() => {
        if (indeterminate) {
            return "animate-progress-indeterminate origin-left";
        }
        if (animated) {
            return "transition-all duration-500 ease-out";
        }
        return "";
    }, [animated, indeterminate]);

    const stripedAnimationClasses =
        striped && animated ? "animate-progress-stripes" : "";

    return (
        <div className={cn("w-full", containerLayoutClasses, className)}>
            {labelPosition === "top" && labelText && (
                <div className="flex items-center justify-between">
                    <span
                        className={cn(
                            "font-medium",
                            sizeClasses.text,
                            variantClasses.text,
                            labelClassName,
                        )}
                        style={variantClasses.style}
                    >
                        {labelText}
                    </span>
                    {showMinMax && (
                        <span
                            className={cn(
                                "text-xs text-gray-500 dark:text-gray-400",
                                labelClassName,
                            )}
                        >
                            {value} / {maxLabel || max}
                        </span>
                    )}
                </div>
            )}

            <div className="flex-1 relative">
                <div
                    className={cn(
                        "w-full overflow-hidden bg-gray-200 dark:bg-gray-700",
                        rounded ? "rounded-full" : "rounded-sm",
                        sizeClasses.container,
                    )}
                    role="progressbar"
                    aria-valuenow={value}
                    aria-valuemin={0}
                    aria-valuemax={max}
                    aria-label={label || "Progress"}
                >
                    <div
                        className={cn(
                            "h-full",
                            variantClasses.background,
                            stripedClasses,
                            animationClasses,
                            stripedAnimationClasses,
                            rounded ? "rounded-full" : "rounded-sm",
                            barClassName,
                        )}
                        style={{
                            width: indeterminate ? "50%" : `${percentage}%`,
                            ...variantClasses.style,
                        }}
                    >
                        {labelPosition === "inside" && labelText && (
                            <div className="flex items-center justify-center h-full px-2">
                                <span
                                    className={cn(
                                        "text-white font-medium text-xs drop-shadow-sm",
                                        labelClassName,
                                    )}
                                >
                                    {labelText}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {showMinMax && labelPosition !== "top" && (
                    <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {minLabel}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {maxLabel || max}
                        </span>
                    </div>
                )}
            </div>

            {labelPosition === "right" && labelText && (
                <span
                    className={cn(
                        "font-medium whitespace-nowrap min-w-[3rem] text-right",
                        sizeClasses.text,
                        variantClasses.text,
                        labelClassName,
                    )}
                    style={variantClasses.style}
                >
                    {labelText}
                </span>
            )}

            {labelPosition === "bottom" && labelText && (
                <div className="flex items-center justify-between">
                    <span
                        className={cn(
                            "font-medium",
                            sizeClasses.text,
                            variantClasses.text,
                            labelClassName,
                        )}
                        style={variantClasses.style}
                    >
                        {labelText}
                    </span>
                    {showMinMax && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {value} / {maxLabel || max}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

Progress.displayName = "Progress";

export default Progress;
