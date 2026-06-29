import React from "react";
import { router } from "@inertiajs/react";
import { Zap, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/Components/Button";
import { OutletActivationOverlayProps } from "../types";
import { motion } from "framer-motion";

const activationTheme = {
    inactive: {
        icon: Zap,
        iconColor: "var(--color-info-600)",
        iconBg: "var(--color-info-50)",
        title: "Outlet Belum Aktif",
        description:
            "Aktifkan outlet Anda untuk mulai mengelola transaksi, karyawan, dan laporan keuangan secara penuh.",
    },
    trial: {
        icon: Clock,
        iconColor: "var(--color-warning-600)",
        iconBg: "var(--color-warning-50)",
        description:
            "Anda sedang dalam masa percobaan gratis. Aktifkan sekarang untuk terus menggunakan layanan tanpa batas.",
    },
    expired: {
        icon: AlertCircle,
        iconColor: "var(--color-error-600)",
        iconBg: "var(--color-error-50)",
        title: "Masa Trial Berakhir",
        description:
            "Masa percobaan gratis Anda telah berakhir. Harap aktifkan outlet untuk melanjutkan penggunaan aplikasi.",
    },
} as const;

const OutletActivationOverlay = ({
    outlet,
    activationFeature,
    activationStatus,
    ownerCoinBalance = 0,
    children,
}: OutletActivationOverlayProps) => {
    if (!activationFeature) return <>{children}</>;

    const status = activationStatus?.status || "inactive";

    if (status === "active") {
        return <>{children}</>;
    }

    const handleActivate = () => {
        if (
            confirm(
                `Aktifkan outlet ini seharga ${activationFeature.coin_price} coin?`,
            )
        ) {
            router.post(route("outlets.features.activate", outlet.id));
        }
    };

    const handleTrial = () => {
        router.post(
            route("outlets.features.trial", [outlet.id, activationFeature.id]),
        );
    };

    const config =
        status === "trial"
            ? {
                  ...activationTheme.trial,
                  title: `Masa Trial Aktif - Sisa ${
                      activationStatus?.trialRemainingDays === 0
                          ? '< 1'
                          : activationStatus?.trialRemainingDays
                  } Hari`,
              }
            : status === "expired"
              ? activationTheme.expired
              : activationTheme.inactive;
    const StatusIcon = config.icon;

    return (
        <div className="relative min-h-[400px]">
            <div className="opacity-20 blur-[2px] pointer-events-none select-none transition-all duration-300">
                {children}
            </div>

            <div className="absolute inset-0 flex items-start justify-center z-10 pt-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="backdrop-blur-md rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl text-center"
                    style={{
                        backgroundColor:
                            "color-mix(in srgb, var(--color-surface) 95%, transparent)",
                        border: "1px solid var(--color-border)",
                    }}
                >
                    <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                        style={{ backgroundColor: config.iconBg }}
                    >
                        <StatusIcon
                            className="w-8 h-8"
                            style={{ color: config.iconColor }}
                        />
                    </div>

                    <h3 className="text-xl font-bold mb-2 text-primary">
                        {config.title}
                    </h3>
                    <p className="text-sm text-secondary mb-2 leading-relaxed">
                        {config.description}
                    </p>
                    
                    {status === "trial" && activationStatus?.trialExpiresAt && (
                        <p className="text-xs mt-1 mb-6" style={{ color: "var(--color-text-tertiary)" }}>
                            Berakhir pada:{" "}
                            {new Date(activationStatus.trialExpiresAt).toLocaleDateString("id-ID", {
                                day: "numeric", month: "long", year: "numeric",
                            })}
                        </p>
                    )}
                    {(status !== "trial" || !activationStatus?.trialExpiresAt) && (
                        <div className="mb-6"></div>
                    )}

                    <div
                        className="rounded-xl p-4 mb-6 text-sm"
                        style={{
                            backgroundColor:
                                "color-mix(in srgb, var(--color-surface-muted) 88%, transparent)",
                        }}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-secondary">
                                Biaya Aktivasi
                            </span>
                            <span className="font-bold text-primary flex items-center gap-1">
                                <Zap
                                    className="w-3.5 h-3.5"
                                    style={{
                                        color: "var(--color-warning-500)",
                                    }}
                                />
                                {activationFeature.coin_price} Coin
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-secondary">
                                Saldo Coin Anda
                            </span>
                            <span className="font-semibold text-primary">
                                {ownerCoinBalance} Coin
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Button
                            variant="primary"
                            size="lg"
                            className="w-full justify-center"
                            onClick={handleActivate}
                        >
                            <Zap className="w-4 h-4 mr-2" />
                            Aktifkan Sekarang
                        </Button>

                        {status === "inactive" && activationStatus?.trialEligible !== false && (
                            <Button
                                variant="outline"
                                className="w-full justify-center"
                                style={{ backgroundColor: "transparent" }}
                                onClick={handleTrial}
                            >
                                Coba Gratis 14 Hari
                            </Button>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default OutletActivationOverlay;
