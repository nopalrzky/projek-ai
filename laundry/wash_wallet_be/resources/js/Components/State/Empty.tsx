import React from "react";
import { Search, Filter, AlertCircle } from "lucide-react";
import { EmptyProps } from "./types";
import { cn } from "@/lib/utils";

const Empty: React.FC<EmptyProps> = ({
    title = "Tidak ada data",
    message = "Tidak ada data yang sesuai dengan kriteria yang Anda cari. Coba ubah filter atau tambah data baru.",
    icon,
    action,
    className,
    variant = "search",
}) => {
    const getVariantConfig = () => {
        switch (variant) {
            case "no-results":
                return {
                    icon: (
                        <AlertCircle
                            className="w-12 h-12"
                            style={{ color: "var(--color-warning-500)" }}
                        />
                    ),
                    title: "Tidak ada hasil",
                    bgColor: "var(--color-warning-50)",
                    borderColor: "var(--color-warning-200)",
                    iconBg: "var(--color-warning-100)",
                };
            case "error":
                return {
                    icon: (
                        <AlertCircle
                            className="w-12 h-12"
                            style={{ color: "var(--color-error-500)" }}
                        />
                    ),
                    title: "Terjadi kesalahan",
                    bgColor: "var(--color-error-50)",
                    borderColor: "var(--color-error-200)",
                    iconBg: "var(--color-error-100)",
                };
            default:
                return {
                    icon: (
                        <div className="relative">
                            <Search
                                className="w-12 h-12"
                                style={{ color: "var(--color-primary-400)" }}
                            />
                            <div
                                className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                                style={{
                                    backgroundColor: "var(--color-primary-500)",
                                }}
                            >
                                <Filter className="w-3 h-3 text-white" />
                            </div>
                        </div>
                    ),
                    title: title,
                    bgColor: "var(--color-primary-50)",
                    borderColor: "var(--color-primary-200)",
                    iconBg: "var(--color-primary-100)",
                };
        }
    };

    const config = getVariantConfig();

    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center text-center py-16",
                className
            )}
        >
            <div className="flex flex-col items-center animate-fadeInUp max-w-md mx-auto">
                <div className="relative mb-8 flex items-center justify-center">
                    {/* Background circles with CSS variables */}
                    <div
                        className="absolute inset-0 w-28 h-28 rounded-full animate-pulse opacity-20"
                        style={{ backgroundColor: config.bgColor }}
                    />
                    <div
                        className="absolute inset-2 w-24 h-24 rounded-full animate-ping opacity-10"
                        style={{ backgroundColor: config.borderColor }}
                    />

                    {/* Main icon container */}
                    <div
                        className="relative w-28 h-28 rounded-full flex items-center justify-center shadow-lg border z-10"
                        style={{
                            background: `linear-gradient(135deg, ${config.iconBg}, ${config.bgColor})`,
                            borderColor: config.borderColor,
                        }}
                    >
                        {icon || config.icon}
                    </div>

                    {/* Floating particles with theme colors */}
                    <div
                        className="absolute -top-2 -right-2 w-3 h-3 rounded-full animate-bounce"
                        style={{
                            backgroundColor: "var(--color-primary-300)",
                            animationDelay: "0.5s",
                        }}
                    />
                    <div
                        className="absolute -bottom-1 -left-3 w-2 h-2 rounded-full animate-bounce"
                        style={{
                            backgroundColor: "var(--color-primary-400)",
                            animationDelay: "1s",
                        }}
                    />
                    <div
                        className="absolute top-1/2 -right-5 w-1.5 h-1.5 rounded-full animate-bounce"
                        style={{
                            backgroundColor: "var(--color-primary-500)",
                            animationDelay: "1.5s",
                        }}
                    />
                </div>

                <div className="space-y-4 text-center w-full">
                    <h3
                        className="text-xl font-semibold leading-tight"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        {config.title}
                    </h3>
                    <p
                        className="leading-relaxed text-base"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        {message}
                    </p>
                </div>

                {action && (
                    <div className="mt-8 flex justify-center w-full">
                        <div className="transform hover:scale-105 transition-transform duration-200">
                            {action}
                        </div>
                    </div>
                )}

                {/* Decorative elements with theme colors */}
                <div className="mt-8 flex justify-center space-x-2 opacity-30">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div
                            key={i}
                            className="w-2 h-2 rounded-full animate-pulse"
                            style={{
                                backgroundColor: "var(--color-text-quaternary)",
                                animationDelay: `${i * 0.5}s`,
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Empty;
