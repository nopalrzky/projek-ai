"use client";

import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Button } from "@/Components/Button";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/Components/Card";
import { Alert } from "@/Components/Alert";
import { Badge } from "@/Components/Badge";
import PageHeader from "@/Components/Page/PageHeader";
import {
    Zap,
    Clock,
    ShieldAlert,
    CheckCircle2,
    Building2,
    Coins,
    Sparkles,
    ArrowRight,
    Star,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ActivateProps } from "./types";

const Activate = ({
    outlet,
    ownerCoinBalance,
    activationFeatureCatalog,
    exposureFeatureCatalog,
}: ActivateProps) => {
    const [coinSource, setCoinSource] = useState<"owner" | "outlet">("owner");
    const [withExposure, setWithExposure] = useState<boolean>(false);
    const [isActivating, setIsActivating] = useState(false);
    const [isTrialing, setIsTrialing] = useState(false);

    if (!activationFeatureCatalog) {
        return (
            <div className="container-fluid py-12">
                <Alert
                    variant="error"
                    title="Konfigurasi Bermasalah"
                    description="Fitur aktivasi tidak ditemukan di katalog. Silakan hubungi super admin untuk bantuan."
                />
            </div>
        );
    }

    const activationCost = activationFeatureCatalog.coin_price || 0;
    const exposureCost = withExposure
        ? exposureFeatureCatalog?.coin_price || 0
        : 0;
    const totalCost = activationCost + exposureCost;

    const currentCoinBalance =
        coinSource === "owner" ? ownerCoinBalance : outlet.coinBalance || 0;
    const canAfford = currentCoinBalance >= totalCost;

    const handleActivate = () => {
        if (!canAfford) return;

        setIsActivating(true);
        router.post(
            route("outlets.activate", outlet.id),
            {
                type: coinSource,
                withExposure: withExposure,
            },
            {
                onFinish: () => setIsActivating(false),
            },
        );
    };

    const handleStartTrial = () => {
        setIsTrialing(true);
        router.post(
            route("outlets.features.trial", [outlet.id, activationFeatureCatalog.id]),
            {},
            {
                onFinish: () => setIsTrialing(false),
            },
        );
    };

    const benefits = [
        "Kelola transaksi tanpa batas",
        "Akses laporan keuangan lengkap",
        "Manajemen inventaris & karyawan",
        "Dukungan teknis prioritas",
    ];

    return (
        <>
            <Head title={`Aktivasi Outlet: ${outlet.name}`} />

            <div className="min-h-screen p-6">
                <PageHeader
                    title={`Aktivasi ${outlet.name}`}
                    subtitle="Langkah terakhir untuk mulai mengelola bisnis laundry Anda secara profesional."
                    icon={Building2}
                    animate={true}
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-7 xl:col-span-8">
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.45, ease: "easeOut" }}
                        >
                            <Card
                                variant="elevated"
                                className="overflow-hidden relative"
                                style={{
                                    borderColor:
                                        "color-mix(in srgb, var(--color-primary-500) 10%, transparent)",
                                }}
                            >
                                <div
                                    className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-[0.06] dark:opacity-[0.12]"
                                    style={{
                                        background: "var(--color-primary-500)",
                                    }}
                                />

                                <CardHeader
                                    className="border-none pb-0"
                                    style={{
                                        background:
                                            "linear-gradient(135deg, color-mix(in srgb, var(--color-primary-500) 5%, transparent), transparent)",
                                    }}
                                >
                                    <div className="flex items-center gap-4 mb-4">
                                        <div
                                            className="w-12 h-12 rounded-2xl flex items-center justify-center"
                                            style={{
                                                background:
                                                    "var(--color-primary-500)",
                                                boxShadow:
                                                    "0 8px 24px color-mix(in srgb, var(--color-primary-500) 30%, transparent)",
                                            }}
                                        >
                                            <Zap className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-2xl font-bold tracking-tight">
                                                Konfigurasi Aktivasi
                                            </CardTitle>
                                            <CardDescription>
                                                Pilih metode pembayaran dan opsi
                                                tambahan
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-8 pt-6">
                                    <section className="space-y-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div
                                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                                style={{
                                                    background:
                                                        "color-mix(in srgb, var(--color-accent-500) 12%, transparent)",
                                                }}
                                            >
                                                <Coins
                                                    className="w-4 h-4"
                                                    style={{
                                                        color: "var(--color-accent-500)",
                                                    }}
                                                />
                                            </div>
                                            <h3 className="font-bold text-primary">
                                                Sumber Koin Pembayaran
                                            </h3>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {[
                                                {
                                                    id: "owner",
                                                    label: "Dompet Owner",
                                                    balance: ownerCoinBalance,
                                                },
                                                {
                                                    id: "outlet",
                                                    label: "Dompet Outlet",
                                                    balance:
                                                        outlet.coinBalance || 0,
                                                },
                                            ].map((source) => {
                                                const isSelected =
                                                    coinSource === source.id;
                                                return (
                                                    <button
                                                        key={source.id}
                                                        type="button"
                                                        onClick={() =>
                                                            setCoinSource(
                                                                source.id as any,
                                                            )
                                                        }
                                                        className={cn(
                                                            "relative group flex flex-col items-start p-5 rounded-2xl border-2 transition-all duration-300 text-left",
                                                        )}
                                                        style={
                                                            isSelected
                                                                ? {
                                                                      borderColor:
                                                                          "var(--color-primary-500)",
                                                                      background:
                                                                          "color-mix(in srgb, var(--color-primary-500) 5%, var(--color-surface))",
                                                                      boxShadow:
                                                                          "0 0 0 4px color-mix(in srgb, var(--color-primary-500) 10%, transparent)",
                                                                  }
                                                                : {
                                                                      borderColor:
                                                                          "var(--color-border)",
                                                                      background:
                                                                          "var(--color-surface)",
                                                                  }
                                                        }
                                                    >
                                                        <div className="flex items-center justify-between w-full mb-3">
                                                            <span
                                                                className="font-bold text-lg"
                                                                style={{
                                                                    color: isSelected
                                                                        ? "var(--color-primary-500)"
                                                                        : "var(--color-text-primary)",
                                                                }}
                                                            >
                                                                {source.label}
                                                            </span>
                                                            <div
                                                                className="w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors"
                                                                style={{
                                                                    background:
                                                                        isSelected
                                                                            ? "var(--color-primary-500)"
                                                                            : "transparent",
                                                                    borderColor:
                                                                        isSelected
                                                                            ? "var(--color-primary-500)"
                                                                            : "var(--color-border)",
                                                                }}
                                                            >
                                                                {isSelected && (
                                                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div
                                                            className="flex items-center gap-1.5 font-mono text-lg font-bold"
                                                            style={{
                                                                color: "var(--color-text-primary)",
                                                            }}
                                                        >
                                                            <Zap
                                                                className="w-4 h-4"
                                                                style={{
                                                                    color: "var(--color-accent-500)",
                                                                }}
                                                            />
                                                            {source.balance}
                                                        </div>
                                                        <span
                                                            className="text-xs mt-1"
                                                            style={{
                                                                color: "var(--color-text-tertiary)",
                                                            }}
                                                        >
                                                            Saldo Tersedia
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </section>

                                    {exposureFeatureCatalog && (
                                        <section className="space-y-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                                                    style={{
                                                        background:
                                                            "color-mix(in srgb, var(--color-info-500) 12%, transparent)",
                                                    }}
                                                >
                                                    <Sparkles
                                                        className="w-4 h-4"
                                                        style={{
                                                            color: "var(--color-info-500)",
                                                        }}
                                                    />
                                                </div>
                                                <h3 className="font-bold text-primary">
                                                    Layanan Tambahan
                                                </h3>
                                            </div>

                                            <label
                                                className={cn(
                                                    "group flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300",
                                                )}
                                                style={
                                                    withExposure
                                                        ? {
                                                              borderColor:
                                                                  "var(--color-info-500)",
                                                              background:
                                                                  "color-mix(in srgb, var(--color-info-500) 5%, var(--color-surface))",
                                                              boxShadow:
                                                                  "0 0 0 4px color-mix(in srgb, var(--color-info-500) 10%, transparent)",
                                                          }
                                                        : {
                                                              borderColor:
                                                                  "var(--color-border)",
                                                              background:
                                                                  "var(--color-surface)",
                                                          }
                                                }
                                            >
                                                <div className="flex items-center h-6 mt-1">
                                                    <input
                                                        type="checkbox"
                                                        checked={withExposure}
                                                        onChange={(e) =>
                                                            setWithExposure(
                                                                e.target
                                                                    .checked,
                                                            )
                                                        }
                                                        className="w-5 h-5 rounded-lg cursor-pointer"
                                                        style={{
                                                            accentColor:
                                                                "var(--color-info-500)",
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <span
                                                        className="block font-bold text-lg mb-1"
                                                        style={{
                                                            color: withExposure
                                                                ? "var(--color-info-500)"
                                                                : "var(--color-text-primary)",
                                                        }}
                                                    >
                                                        Ekspos Outlet ke
                                                        Pelanggan
                                                    </span>
                                                    <p
                                                        className="text-sm leading-relaxed"
                                                        style={{
                                                            color: "var(--color-text-secondary)",
                                                        }}
                                                    >
                                                        Tampilkan outlet Anda di
                                                        pencarian aplikasi Wash
                                                        Wallet Customer untuk
                                                        menjangkau lebih banyak
                                                        pelanggan.
                                                    </p>
                                                    <Badge
                                                        variant="info"
                                                        className="mt-3 font-bold"
                                                    >
                                                        +
                                                        {
                                                            exposureFeatureCatalog.coin_price
                                                        }{" "}
                                                        Coin
                                                    </Badge>
                                                </div>
                                            </label>
                                        </section>
                                    )}
                                </CardContent>

                                <CardFooter
                                    className="flex flex-col sm:flex-row gap-4 justify-between"
                                    style={{
                                        background:
                                            "var(--color-surface-muted)",
                                        borderTop:
                                            "1px solid var(--color-border)",
                                    }}
                                >
                                    <div className="flex flex-col">
                                        <span
                                            className="text-xs uppercase tracking-wider font-bold mb-1"
                                            style={{
                                                color: "var(--color-text-tertiary)",
                                            }}
                                        >
                                            Total yang Harus Dibayar
                                        </span>
                                        <div
                                            className="flex items-center gap-2 text-2xl font-black"
                                            style={{
                                                color: "var(--color-primary-500)",
                                            }}
                                        >
                                            <Zap
                                                className="w-6 h-6"
                                                style={{
                                                    color: "var(--color-accent-500)",
                                                    fill: "var(--color-accent-500)",
                                                }}
                                            />
                                            {totalCost} Coin
                                        </div>
                                    </div>
                                    <div className="flex gap-3 w-full sm:w-auto">
                                        <Button
                                            variant="primary"
                                            size="lg"
                                            className="flex-1 sm:flex-none px-8"
                                            style={{
                                                boxShadow:
                                                    "0 8px 24px color-mix(in srgb, var(--color-primary-500) 25%, transparent)",
                                            }}
                                            onClick={handleActivate}
                                            disabled={
                                                !canAfford ||
                                                isActivating ||
                                                isTrialing
                                            }
                                            leftIcon={
                                                isActivating ? undefined : (
                                                    <Zap className="w-5 h-5" />
                                                )
                                            }
                                            loading={isActivating}
                                        >
                                            {isActivating
                                                ? "Mengaktifkan..."
                                                : "Aktifkan Sekarang"}
                                        </Button>
                                    </div>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    </div>

                    <div className="lg:col-span-5 xl:col-span-4 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.45, delay: 0.1 }}
                        >
                            <Card
                                className="border-dashed border-2"
                                style={{ borderColor: "var(--color-border)" }}
                            >
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Clock
                                            className="w-5 h-5"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        />
                                        Opsi Alternatif
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p
                                        className="text-sm"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        Belum yakin? Anda dapat mencoba semua
                                        fitur premium secara gratis selama{" "}
                                        <strong
                                            style={{
                                                color: "var(--color-primary-500)",
                                            }}
                                        >
                                            14 hari
                                        </strong>{" "}
                                        tanpa biaya koin.
                                    </p>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-center group"
                                        onClick={handleStartTrial}
                                        disabled={isActivating || isTrialing}
                                        loading={isTrialing}
                                    >
                                        Mulai Trial Gratis
                                        <ArrowRight
                                            className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1"
                                            aria-hidden="true"
                                        />
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.45, delay: 0.2 }}
                        >
                            {!canAfford && (
                                <Alert
                                    variant="error"
                                    title="Saldo Tidak Cukup"
                                    icon={<ShieldAlert />}
                                    className="animate-pulse"
                                >
                                    Saldo koin di{" "}
                                    {coinSource === "owner"
                                        ? "Dompet Owner"
                                        : "Dompet Outlet"}{" "}
                                    tidak mencukupi. Silakan top up koin atau
                                    gunakan sumber koin lain.
                                </Alert>
                            )}
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.45, delay: 0.3 }}
                        >
                            <Card
                                variant="flat"
                                className="overflow-hidden relative"
                                style={{
                                    background:
                                        "color-mix(in srgb, var(--color-primary-500) 5%, var(--color-surface))",
                                    border: "1px solid color-mix(in srgb, var(--color-primary-500) 15%, transparent)",
                                }}
                            >
                                <div
                                    className="pointer-events-none absolute -bottom-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-[0.08] dark:opacity-[0.15]"
                                    style={{
                                        background: "var(--color-primary-500)",
                                    }}
                                />

                                <CardContent className="p-5 space-y-4 relative">
                                    <h4
                                        className="font-bold flex items-center gap-2"
                                        style={{
                                            color: "var(--color-primary-500)",
                                        }}
                                    >
                                        <Star
                                            className="w-4 h-4"
                                            style={{
                                                fill: "var(--color-primary-500)",
                                                color: "var(--color-primary-500)",
                                            }}
                                        />
                                        Kenapa Aktivasi?
                                    </h4>
                                    <ul className="space-y-3">
                                        {benefits.map((text, i) => (
                                            <motion.li
                                                key={i}
                                                initial={{ opacity: 0, x: -8 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{
                                                    delay: 0.35 + i * 0.07,
                                                    duration: 0.35,
                                                }}
                                                className="flex items-start gap-2 text-sm"
                                                style={{
                                                    color: "color-mix(in srgb, var(--color-primary-500) 70%, var(--color-text-primary))",
                                                }}
                                            >
                                                <CheckCircle2
                                                    className="w-4 h-4 mt-0.5 flex-shrink-0"
                                                    style={{
                                                        color: "var(--color-primary-500)",
                                                    }}
                                                />
                                                {text}
                                            </motion.li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>
        </>
    );
};

Activate.layout = (page: any) =>
    withAuthenticatedLayout({
        title: "Aktivasi Outlet",
        searchable: false,
        breadcrumbs: [
            { label: "Outlets", href: route("outlets.index") },
            { label: page.props.outlet.name },
            { label: "Aktivasi" },
        ],
    })(page);

export default Activate;
