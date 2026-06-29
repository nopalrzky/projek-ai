import React from "react";
import { LoadingProps } from "./types";
import { cn } from "@/lib/utils";

const Loading: React.FC<LoadingProps> = ({
    rows = 5,
    columns = 4,
    type = "skeleton",
    className,
    size = "md",
}) => {
    const getSizeClasses = () => {
        switch (size) {
            case "sm":
                return "py-8";
            case "lg":
                return "py-20";
            default:
                return "py-12";
        }
    };

    if (type === "table") {
        return (
            <>
                {Array.from({ length: rows }).map((_, rowIndex) => (
                    <tr
                        key={rowIndex}
                        className="group animate-fadeInUp"
                        style={{ animationDelay: `${rowIndex * 100}ms` }}
                    >
                        {Array.from({ length: columns }).map((_, colIndex) => (
                            <td
                                key={colIndex}
                                className="px-6 py-4 whitespace-nowrap"
                            >
                                <div className="flex items-center space-x-3">
                                    {colIndex === 0 && (
                                        <div
                                            className="w-4 h-4 rounded animate-shimmer"
                                            style={{
                                                background:
                                                    "linear-gradient(90deg, var(--color-skeleton-from) 25%, var(--color-skeleton-via) 50%, var(--color-skeleton-from) 75%)",
                                                backgroundSize: "200% 100%",
                                            }}
                                        />
                                    )}
                                    <div className="space-y-2 flex-1">
                                        <div
                                            className="h-4 rounded animate-shimmer"
                                            style={{
                                                width: `${
                                                    Math.random() * 40 + 60
                                                }%`,
                                                background:
                                                    "linear-gradient(90deg, var(--color-skeleton-from) 25%, var(--color-skeleton-via) 50%, var(--color-skeleton-from) 75%)",
                                                backgroundSize: "200% 100%",
                                                animationDelay: `${
                                                    rowIndex * colIndex * 50
                                                }ms`,
                                            }}
                                        />
                                        {(rowIndex + colIndex) % 3 === 0 && (
                                            <div
                                                className="h-3 rounded animate-shimmer"
                                                style={{
                                                    width: `${
                                                        Math.random() * 30 + 40
                                                    }%`,
                                                    background:
                                                        "linear-gradient(90deg, var(--color-skeleton-from) 25%, var(--color-skeleton-via) 50%, var(--color-skeleton-from) 75%)",
                                                    backgroundSize: "200% 100%",
                                                    animationDelay: `${
                                                        rowIndex * colIndex * 75
                                                    }ms`,
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </td>
                        ))}
                    </tr>
                ))}
            </>
        );
    }

    if (type === "card") {
        return (
            <div className={cn("grid gap-6", className)}>
                {Array.from({ length: rows }).map((_, index) => (
                    <div
                        key={index}
                        className="p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-200 animate-fadeInUp"
                        style={{
                            backgroundColor: "var(--color-surface)",
                            borderColor: "var(--color-border)",
                            animationDelay: `${index * 100}ms`,
                        }}
                    >
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="relative">
                                <div
                                    className="w-12 h-12 rounded-full animate-shimmer"
                                    style={{
                                        background:
                                            "linear-gradient(90deg, var(--color-skeleton-from) 25%, var(--color-skeleton-via) 50%, var(--color-skeleton-from) 75%)",
                                        backgroundSize: "200% 100%",
                                    }}
                                />
                                <div
                                    className="absolute inset-0 w-12 h-12 rounded-full animate-pulse opacity-40"
                                    style={{
                                        backgroundColor:
                                            "var(--color-skeleton-overlay)",
                                    }}
                                />
                            </div>
                            <div className="flex-1 space-y-3">
                                <div
                                    className="h-4 rounded-lg animate-shimmer w-3/4"
                                    style={{
                                        background:
                                            "linear-gradient(90deg, var(--color-skeleton-from) 25%, var(--color-skeleton-via) 50%, var(--color-skeleton-from) 75%)",
                                        backgroundSize: "200% 100%",
                                    }}
                                />
                                <div
                                    className="h-3 rounded-lg animate-shimmer w-1/2"
                                    style={{
                                        background:
                                            "linear-gradient(90deg, var(--color-skeleton-from) 25%, var(--color-skeleton-via) 50%, var(--color-skeleton-from) 75%)",
                                        backgroundSize: "200% 100%",
                                        animationDelay: "200ms",
                                    }}
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            {Array.from({ length: 3 }).map((_, lineIndex) => (
                                <div
                                    key={lineIndex}
                                    className="h-3 rounded-lg animate-shimmer"
                                    style={{
                                        width:
                                            lineIndex === 0
                                                ? "100%"
                                                : lineIndex === 1
                                                ? "85%"
                                                : "65%",
                                        background:
                                            "linear-gradient(90deg, var(--color-skeleton-from) 25%, var(--color-skeleton-via) 50%, var(--color-skeleton-from) 75%)",
                                        backgroundSize: "200% 100%",
                                        animationDelay: `${lineIndex * 150}ms`,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (type === "list") {
        return (
            <div className={cn("space-y-4", className)}>
                {Array.from({ length: rows }).map((_, index) => (
                    <div
                        key={index}
                        className="flex items-center space-x-4 p-5 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 animate-fadeInUp"
                        style={{
                            backgroundColor: "var(--color-surface)",
                            borderColor: "var(--color-border)",
                            animationDelay: `${index * 100}ms`,
                        }}
                    >
                        <div className="relative">
                            <div
                                className="w-12 h-12 rounded-full animate-shimmer"
                                style={{
                                    background:
                                        "linear-gradient(90deg, var(--color-skeleton-from) 25%, var(--color-skeleton-via) 50%, var(--color-skeleton-from) 75%)",
                                    backgroundSize: "200% 100%",
                                }}
                            />
                            <div
                                className="absolute inset-0 w-12 h-12 rounded-full animate-pulse opacity-40"
                                style={{
                                    backgroundColor:
                                        "var(--color-skeleton-overlay)",
                                }}
                            />
                        </div>
                        <div className="flex-1 space-y-3">
                            <div
                                className="h-4 rounded-lg animate-shimmer w-3/4"
                                style={{
                                    background:
                                        "linear-gradient(90deg, var(--color-skeleton-from) 25%, var(--color-skeleton-via) 50%, var(--color-skeleton-from) 75%)",
                                    backgroundSize: "200% 100%",
                                }}
                            />
                            <div
                                className="h-3 rounded-lg animate-shimmer w-1/2"
                                style={{
                                    background:
                                        "linear-gradient(90deg, var(--color-skeleton-from) 25%, var(--color-skeleton-via) 50%, var(--color-skeleton-from) 75%)",
                                    backgroundSize: "200% 100%",
                                    animationDelay: "200ms",
                                }}
                            />
                        </div>
                        <div
                            className="w-24 h-10 rounded-lg animate-shimmer"
                            style={{
                                background:
                                    "linear-gradient(90deg, var(--color-skeleton-from) 25%, var(--color-skeleton-via) 50%, var(--color-skeleton-from) 75%)",
                                backgroundSize: "200% 100%",
                                animationDelay: "300ms",
                            }}
                        />
                    </div>
                ))}
            </div>
        );
    }

    if (type === "spinner") {
        return (
            <div
                className={cn(
                    "flex items-center justify-center",
                    getSizeClasses(),
                    className,
                )}
            >
                <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                        <div
                            className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
                            style={{
                                borderColor: "var(--color-skeleton-via)",
                                borderTopColor: "transparent",
                            }}
                        />
                        <div
                            className="absolute inset-2 w-8 h-8 rounded-full border-2 border-b-transparent animate-spin-reverse"
                            style={{
                                borderColor: "var(--color-primary-300)",
                                borderBottomColor: "transparent",
                                animationDuration: "1.5s",
                            }}
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <span
                            className="text-sm font-medium"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            Memuat data
                        </span>
                        <div className="flex space-x-1">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="w-1 h-1 rounded-full animate-bounce"
                                    style={{
                                        backgroundColor:
                                            "var(--color-text-tertiary)",
                                        animationDelay: `${i * 200}ms`,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("space-y-6", getSizeClasses(), className)}>
            {Array.from({ length: rows }).map((_, index) => (
                <div
                    key={index}
                    className="flex space-x-4 animate-fadeInUp"
                    style={{ animationDelay: `${index * 150}ms` }}
                >
                    <div className="relative">
                        <div
                            className="w-14 h-14 rounded-xl animate-shimmer"
                            style={{
                                background:
                                    "linear-gradient(90deg, var(--color-skeleton-from) 25%, var(--color-skeleton-via) 50%, var(--color-skeleton-from) 75%)",
                                backgroundSize: "200% 100%",
                            }}
                        />
                        <div
                            className="absolute inset-0 w-14 h-14 rounded-xl animate-pulse opacity-50"
                            style={{
                                backgroundColor:
                                    "var(--color-skeleton-overlay)",
                            }}
                        />
                    </div>
                    <div className="flex-1 space-y-3 py-2">
                        {Array.from({ length: 3 }).map((_, lineIndex) => (
                            <div
                                key={lineIndex}
                                className="rounded-lg animate-shimmer"
                                style={{
                                    height:
                                        lineIndex === 0
                                            ? "20px"
                                            : lineIndex === 1
                                            ? "16px"
                                            : "12px",
                                    width: `${
                                        Math.random() * (60 - 30) +
                                        30 +
                                        lineIndex * 15
                                    }%`,
                                    background:
                                        "linear-gradient(90deg, var(--color-skeleton-from) 25%, var(--color-skeleton-via) 50%, var(--color-skeleton-from) 75%)",
                                    backgroundSize: "200% 100%",
                                    animationDelay: `${lineIndex * 200}ms`,
                                }}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Loading;
