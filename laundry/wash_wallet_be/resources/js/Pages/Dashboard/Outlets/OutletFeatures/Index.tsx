"use client";

import { router } from "@inertiajs/react";
import { Check, ExternalLink, Zap, Plus, Coins } from "lucide-react";
import { Button } from "@/Components/Button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { Alert } from "@/Components/Alert";
import { Empty } from "@/Components/State";
import { formatDate } from "@/lib/utils";
import OutletExposureCard from "./Partials/OutletExposureCard";
import { OutletFeatureIndexProps } from "./types";

const statusBadgeVariant: Record<string, any> = {
    active: "success",
    trial: "warning",
    inactive: "secondary",
    expired: "error",
};

const OutletFeaturesIndex = ({ outlet }: OutletFeatureIndexProps) => {
    const handleTrial = (featureId: number) => {
        router.post(route("outlets.features.trial", [outlet.id, featureId]));
    };

    const handleUnlock = (featureId: number) => {
        router.post(route("outlets.features.unlock", [outlet.id, featureId]));
    };

    const handleActivateFree = (featureKey: string) => {
        if (featureKey === "courier_schedule") {
            router.post(route("outlets.features.activate-courier", outlet.id));
        }
    };

    const handleCreate = () => {
        router.visit(route("outlets.features.create", outlet.id));
    };

    return (
        <div className="py-6 space-y-8 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface p-6 rounded-xl border border-border shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-300">
                        <Zap className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
                            Fitur & Aktivasi
                        </h1>
                        <p className="text-text-secondary">
                            Kelola fitur tambahan untuk meningkatkan operasional
                            outlet
                        </p>
                    </div>
                </div>
                <Button
                    variant="primary"
                    onClick={handleCreate}
                    leftIcon={<Plus className="w-4 h-4" />}
                    className="w-full sm:w-auto"
                >
                    Tambah Fitur
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {outlet.outletFeatures && outlet.outletFeatures.length > 0 ? (
                    outlet.outletFeatures.map((outletFeature) =>
                        outletFeature.feature.key === "outlet_exposure" ? (
                            <div
                                key={outletFeature.feature.id}
                                className="md:col-span-2 lg:col-span-3"
                            >
                                <OutletExposureCard
                                    outlet={outlet}
                                    outletFeature={outletFeature}
                                />
                            </div>
                        ) : (
                            <Card
                                key={outletFeature.feature.id}
                                variant="elevated"
                                hoverable
                                className="flex flex-col h-full border-border/60"
                            >
                                <CardHeader className="border-b border-border-light relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4">
                                        <Badge
                                            variant={
                                                statusBadgeVariant[
                                                outletFeature.status
                                                ]
                                            }
                                            size="sm"
                                            className="uppercase"
                                        >
                                            {outletFeature.status}
                                        </Badge>
                                    </div>
                                    <div className="space-y-1 pr-20">
                                        <CardTitle className="text-xl font-bold text-text-primary">
                                            {outletFeature.feature.name}
                                        </CardTitle>
                                        <CardDescription className="line-clamp-2 min-h-[3rem]">
                                            {outletFeature.feature.description}
                                        </CardDescription>
                                    </div>
                                </CardHeader>

                                <CardContent className="flex-grow py-6">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                            <span className="text-sm font-medium text-text-secondary">
                                                Harga Layanan
                                            </span>
                                            <span className="text-lg font-bold text-primary-600">
                                                {outletFeature.feature.isPaid ? (
                                                    <div className="flex items-center gap-1">
                                                        <Coins className="w-4 h-4" />
                                                        {
                                                            outletFeature.feature
                                                                .coinPrice
                                                        }
                                                    </div>
                                                ) : (
                                                    <Badge
                                                        variant="success"
                                                        isGlass
                                                    >
                                                        GRATIS
                                                    </Badge>
                                                )}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 rounded-lg border border-border">
                                                <p className="text-2xs font-bold text-text-tertiary uppercase tracking-wider">
                                                    Tipe
                                                </p>
                                                <p className="text-sm font-semibold text-text-primary mt-1">
                                                    {(outletFeature.feature
                                                        .durationDays ?? 0) > 0
                                                        ? `Periodik`
                                                        : "Permanen"}
                                                </p>
                                            </div>
                                            <div className="p-3 rounded-lg border border-border">
                                                <p className="text-2xs font-bold text-text-tertiary uppercase tracking-wider">
                                                    Durasi
                                                </p>
                                                <p className="text-sm font-semibold text-text-primary mt-1">
                                                    {(outletFeature.feature
                                                        .durationDays ?? 0) > 0
                                                        ? `${outletFeature.feature.durationDays} Hari`
                                                        : "-"}
                                                </p>
                                            </div>
                                        </div>

                                        {outletFeature.expiresAt && (
                                            <Alert
                                                variant="info"
                                                size="sm"
                                                className="py-2"
                                            >
                                                <div className="flex justify-between items-center w-full">
                                                    <span className="text-xs">
                                                        Berlaku s/d:
                                                    </span>
                                                    <span className="text-xs font-bold">
                                                        {formatDate(
                                                            outletFeature.expiresAt,
                                                        )}
                                                    </span>
                                                </div>
                                            </Alert>
                                        )}

                                        {outletFeature.trialExpiresAt &&
                                            outletFeature.status === "trial" && (
                                                <Alert
                                                    variant="warning"
                                                    size="sm"
                                                    className="py-2"
                                                >
                                                    <div className="flex justify-between items-center w-full">
                                                        <span className="text-xs">
                                                            Trial berakhir:
                                                        </span>
                                                        <span className="text-xs font-bold">
                                                            {formatDate(
                                                                outletFeature.trialExpiresAt,
                                                            )}
                                                        </span>
                                                    </div>
                                                </Alert>
                                            )}
                                    </div>
                                </CardContent>

                                <CardFooter className="pt-4 border-t border-border-light flex flex-wrap gap-2 bg-surface-muted/50">
                                    {outletFeature.status === "inactive" && (
                                        <>
                                            {!outletFeature.feature.isPaid ? (
                                                <Button
                                                    variant="primary"
                                                    className="w-full shadow-lg shadow-primary-500/20"
                                                    onClick={() =>
                                                        handleActivateFree(
                                                            outletFeature.feature
                                                                .key,
                                                        )
                                                    }
                                                    leftIcon={
                                                        <Zap className="w-4 h-4" />
                                                    }
                                                >
                                                    Aktifkan Sekarang (Gratis)
                                                </Button>
                                            ) : (
                                                <>
                                                    <Button
                                                        variant="primary"
                                                        className="flex-1"
                                                        onClick={() =>
                                                            handleUnlock(
                                                                outletFeature
                                                                    .feature.id,
                                                            )
                                                        }
                                                        leftIcon={
                                                            <Zap className="w-4 h-4" />
                                                        }
                                                    >
                                                        Aktifkan
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        className="flex-1"
                                                        onClick={() =>
                                                            handleTrial(
                                                                outletFeature
                                                                    .feature.id,
                                                            )
                                                        }
                                                    >
                                                        Coba Trial
                                                    </Button>
                                                </>
                                            )}
                                        </>
                                    )}

                                    {outletFeature.status === "trial" && (
                                        <Button
                                            variant="primary"
                                            className="w-full"
                                            onClick={() =>
                                                handleUnlock(
                                                    outletFeature.feature.id,
                                                )
                                            }
                                            leftIcon={<Zap className="w-4 h-4" />}
                                        >
                                            Aktivasi Penuh
                                        </Button>
                                    )}

                                    {outletFeature.status === "active" &&
                                        ((outletFeature.feature.durationDays ?? 0) >
                                            0 ? (
                                            <Button
                                                variant="outline"
                                                className="w-full border-primary-200 text-primary-600 hover:bg-primary-50 dark:border-primary-800 dark:text-primary-400 dark:hover:bg-primary-950"
                                                onClick={() =>
                                                    handleUnlock(
                                                        outletFeature.feature.id,
                                                    )
                                                }
                                                leftIcon={
                                                    <ExternalLink className="w-4 h-4" />
                                                }
                                            >
                                                Perpanjang Layanan
                                            </Button>
                                        ) : (
                                            <div className="w-full flex items-center justify-center py-2.5 px-4 rounded-lg bg-success-50 text-success-700 dark:bg-success-950/30 dark:text-success-400 text-sm font-bold gap-2">
                                                <Check className="w-4 h-4" />
                                                Aktif Selamanya
                                            </div>
                                        ))}

                                    {outletFeature.status === "expired" && (
                                        <Button
                                            variant="primary"
                                            className="w-full bg-error-600 hover:bg-error-700 shadow-lg shadow-error-500/20"
                                            onClick={() =>
                                                handleUnlock(
                                                    outletFeature.feature.id,
                                                )
                                            }
                                            leftIcon={<Zap className="w-4 h-4" />}
                                        >
                                            Re-aktivasi Sekarang
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        )
                    )) : (
                    <div className="md:col-span-2 lg:col-span-3">
                        <Empty
                            title="Belum ada fitur aktif"
                            message="Outlet ini belum memiliki fitur tambahan yang aktif. Silakan tambah fitur untuk meningkatkan operasional outlet Anda."
                            action={
                                <Button
                                    variant="primary"
                                    onClick={handleCreate}
                                    leftIcon={<Plus className="w-4 h-4" />}
                                >
                                    Tambah Fitur Sekarang
                                </Button>
                            }
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default OutletFeaturesIndex;
