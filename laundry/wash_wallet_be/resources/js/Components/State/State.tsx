import React from "react";
import { StateProps } from "./types";
import Loading from "./Loading";
import Empty from "./Empty";
import { cn } from "@/lib/utils";
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from "lucide-react";

const State: React.FC<StateProps> = ({
    isLoading = false,
    isEmpty = false,
    hasError = false,
    isOffline = false,
    error,
    children,
    loadingComponent,
    emptyComponent,
    errorComponent,
    className,
    loadingType = "skeleton",
    emptyVariant = "search",
    size = "md",
}) => {
    if (isOffline) {
        return (
            <div className={cn("text-center py-16", className)}>
                <div className="flex flex-col items-center animate-fadeInUp">
                    <div className="relative mb-8">
                        <div
                            className="absolute inset-0 w-24 h-24 rounded-full animate-ping opacity-20"
                            style={{ backgroundColor: "var(--color-gray-200)" }}
                        />
                        <div
                            className="absolute inset-2 w-20 h-20 rounded-full animate-pulse opacity-30"
                            style={{ backgroundColor: "var(--color-gray-300)" }}
                        />

                        <div
                            className="relative w-24 h-24 rounded-full flex items-center justify-center shadow-lg border"
                            style={{
                                background:
                                    "linear-gradient(135deg, var(--color-gray-50), var(--color-gray-100))",
                                borderColor: "var(--color-gray-200)",
                            }}
                        >
                            <WifiOff
                                className="w-10 h-10"
                                style={{ color: "var(--color-gray-500)" }}
                            />
                        </div>
                    </div>

                    <div className="max-w-md space-y-4">
                        <h3
                            className="text-xl font-semibold"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Tidak ada koneksi internet
                        </h3>
                        <p style={{ color: "var(--color-text-secondary)" }}>
                            Pastikan Anda terhubung ke internet dan coba lagi.
                        </p>
                    </div>

                    <button
                        className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 border"
                        style={{
                            backgroundColor: "var(--color-gray-50)",
                            borderColor: "var(--color-gray-200)",
                            color: "var(--color-text-primary)",
                        }}
                        onClick={() => window.location.reload()}
                    >
                        <Wifi className="w-4 h-4" />
                        Coba Lagi
                    </button>
                </div>
            </div>
        );
    }

    if (hasError) {
        if (errorComponent) {
            return <div className={className}>{errorComponent}</div>;
        }

        return (
            <div className={cn("text-center py-16", className)}>
                <div className="flex flex-col items-center animate-fadeInUp">
                    <div className="relative mb-8">
                        <div
                            className="absolute inset-0 w-24 h-24 rounded-full animate-ping opacity-20"
                            style={{
                                backgroundColor: "var(--color-error-100)",
                            }}
                        />
                        <div
                            className="absolute inset-2 w-20 h-20 rounded-full animate-pulse opacity-30"
                            style={{
                                backgroundColor: "var(--color-error-200)",
                            }}
                        />

                        <div
                            className="relative w-24 h-24 rounded-full flex items-center justify-center shadow-lg border"
                            style={{
                                background:
                                    "linear-gradient(135deg, var(--color-error-50), var(--color-error-100))",
                                borderColor: "var(--color-error-200)",
                            }}
                        >
                            <AlertTriangle
                                className="w-10 h-10"
                                style={{ color: "var(--color-error-500)" }}
                            />
                        </div>

                        <div
                            className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-bounce"
                            style={{
                                backgroundColor: "var(--color-error-400)",
                            }}
                        />
                        <div
                            className="absolute -bottom-2 -left-2 w-2 h-2 rounded-full animate-bounce"
                            style={{
                                backgroundColor: "var(--color-error-500)",
                                animationDelay: "0.5s",
                            }}
                        />
                    </div>

                    <div className="max-w-md space-y-4">
                        <h3
                            className="text-xl font-semibold"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Terjadi Kesalahan
                        </h3>
                        <div style={{ color: "var(--color-text-secondary)" }}>
                            {typeof error === "string" ? (
                                <p>{error}</p>
                            ) : (
                                error || (
                                    <p>
                                        Silakan coba lagi atau hubungi
                                        administrator jika masalah berlanjut.
                                    </p>
                                )
                            )}
                        </div>
                    </div>

                    <button
                        className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 border hover:opacity-80"
                        style={{
                            backgroundColor: "var(--color-error-50)",
                            borderColor: "var(--color-error-200)",
                            color: "var(--color-error-700)",
                        }}
                        onClick={() => window.location.reload()}
                    >
                        <RefreshCw className="w-4 h-4" />
                        Coba Lagi
                    </button>
                </div>
            </div>
        );
    }

    if (isLoading) {
        if (loadingComponent) {
            return <div className={className}>{loadingComponent}</div>;
        }

        return (
            <div className={className}>
                <Loading type={loadingType} size={size} />
            </div>
        );
    }

    if (isEmpty) {
        if (emptyComponent) {
            return <div className={className}>{emptyComponent}</div>;
        }

        return (
            <div className={className}>
                <Empty variant={emptyVariant} />
            </div>
        );
    }

    return <div className={cn("animate-fadeIn", className)}>{children}</div>;
};

export default State;
