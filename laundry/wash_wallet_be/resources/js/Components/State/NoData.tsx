import React from "react";
import { Inbox, Plus, Sparkles, Database } from "lucide-react";
import { NoDataProps } from "./types";
import { cn } from "@/lib/utils";

const NoData: React.FC<NoDataProps> = ({
    title = "Belum ada data",
    message = "Mulai dengan menambahkan data pertama Anda.",
    icon,
    action,
    className,
    variant = "default",
}) => {
    const getVariantConfig = () => {
        switch (variant) {
            case "database":
                return {
                    icon: (
                        <Database
                            className="w-16 h-16"
                            style={{ color: "var(--color-text-quaternary)" }}
                        />
                    ),
                    gradientFrom: "var(--color-gray-50)",
                    gradientTo: "var(--color-gray-100)",
                    accentColor: "var(--color-gray-500)",
                };
            case "feature":
                return {
                    icon: (
                        <Sparkles
                            className="w-16 h-16"
                            style={{ color: "var(--color-warning-400)" }}
                        />
                    ),
                    gradientFrom: "var(--color-warning-50)",
                    gradientTo: "var(--color-warning-100)",
                    accentColor: "var(--color-warning-500)",
                };
            default:
                return {
                    icon: (
                        <Inbox
                            className="w-16 h-16"
                            style={{ color: "var(--color-text-quaternary)" }}
                        />
                    ),
                    gradientFrom: "var(--color-gray-50)",
                    gradientTo: "var(--color-gray-100)",
                    accentColor: "var(--color-primary-500)",
                };
        }
    };

    const config = getVariantConfig();

    return (
        <div className={cn("text-center py-20", className)}>
            <div className="flex flex-col items-center animate-fadeInUp">
                <div className="relative mb-10">
                    <div
                        className="absolute inset-0 w-32 h-32 rounded-full animate-spin-slow opacity-20"
                        style={{
                            background: `linear-gradient(45deg, var(--color-primary-100), var(--color-purple-100))`,
                        }}
                    />
                    <div
                        className="absolute inset-4 w-24 h-24 rounded-full animate-reverse-spin opacity-30"
                        style={{
                            background: `linear-gradient(-45deg, var(--color-purple-100), var(--color-pink-100))`,
                        }}
                    />
                    <div
                        className="relative w-32 h-32 rounded-full flex items-center justify-center shadow-xl border"
                        style={{
                            background: `linear-gradient(135deg, ${config.gradientFrom}, ${config.gradientTo})`,
                            borderColor: "var(--color-border)",
                        }}
                    >
                        {icon || (
                            <div className="relative">
                                {config.icon}
                                <div
                                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-lg animate-bounce"
                                    style={{
                                        background: `linear-gradient(135deg, ${config.accentColor}, var(--color-primary-600))`,
                                    }}
                                >
                                    <Plus className="w-4 h-4 text-white" />
                                </div>
                            </div>
                        )}
                    </div>

                    <Sparkles
                        className="absolute -top-3 -left-3 w-5 h-5 animate-twinkle"
                        style={{ color: "var(--color-warning-400)" }}
                    />
                    <Sparkles
                        className="absolute -bottom-2 -right-4 w-4 h-4 animate-twinkle"
                        style={{
                            color: "var(--color-primary-400)",
                            animationDelay: "1s",
                        }}
                    />
                    <Sparkles
                        className="absolute top-1/2 -left-6 w-3 h-3 animate-twinkle"
                        style={{
                            color: "var(--color-purple-400)",
                            animationDelay: "2s",
                        }}
                    />
                </div>

                <div className="max-w-lg space-y-6">
                    <h3
                        className="text-2xl font-bold leading-tight"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        {title}
                    </h3>
                    <p
                        className="text-lg leading-relaxed"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        {message}
                    </p>
                </div>

                {action && (
                    <div className="mt-10 transform hover:scale-105 transition-all duration-300 hover:rotate-1">
                        <div className="relative">
                            {action}
                            <div
                                className="absolute inset-0 rounded-lg blur-xl opacity-20 animate-pulse"
                                style={{
                                    background: `linear-gradient(45deg, ${config.accentColor}, var(--color-purple-400))`,
                                }}
                            />
                        </div>
                    </div>
                )}

                <div className="mt-12 grid grid-cols-5 gap-3 opacity-20">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div
                            key={i}
                            className="w-3 h-3 rounded-full animate-pulse"
                            style={{
                                background: `linear-gradient(45deg, var(--color-text-quaternary), var(--color-text-tertiary))`,
                                animationDelay: `${i * 0.2}s`,
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NoData;
