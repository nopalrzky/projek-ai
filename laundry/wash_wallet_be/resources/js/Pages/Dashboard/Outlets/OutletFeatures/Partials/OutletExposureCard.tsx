"use client";

import { useState } from "react";
import { router } from "@inertiajs/react";
import {
    AlertTriangle,
    CalendarDays,
    Coins,
    RefreshCw,
    Zap,
    CheckCircle2,
    Clock,
} from "lucide-react";
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
import ToggleSwitch from "@/Components/Input/ToggleSwitch";
import { Modal } from "@/Components/Modal";
import { cn, formatDate } from "@/lib/utils";

import { OutletExposureCardProps } from "../types";

const statusVariant: Record<string, any> = {
    inactive: "secondary",
    trial: "warning",
    active: "success",
    expired: "error",
};

const statusLabel: Record<string, string> = {
    inactive: "Belum Aktif",
    trial: "Masa Percobaan",
    active: "Aktif",
    expired: "Kadaluarsa",
};

const OutletExposureCard = ({
    outlet,
    outletFeature,
}: OutletExposureCardProps) => {
    const [isActivating, setIsActivating] = useState(false);
    const [isUpdatingRenewal, setIsUpdatingRenewal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [coinSource, setCoinSource] = useState<"owner" | "outlet">("owner");

    const handleActivateClick = () => {
        setShowConfirmModal(true);
    };

    const activateExposure = () => {
        setIsActivating(true);
        setShowConfirmModal(false);

        router.post(
            route("outlets.features.exposure", [
                outlet.id,
                outletFeature.feature.id,
            ]),
            {
                type: coinSource,
            },
            {
                preserveScroll: true,
                onFinish: () => setIsActivating(false),
            },
        );
    };

    const toggleAutoRenewal = (enabled: boolean) => {
        setIsUpdatingRenewal(true);

        router.patch(
            route("outlets.features.auto-renewal", [outlet.id]),
            {
                enabled: enabled,
            },
            {
                preserveScroll: true,
                onFinish: () => setIsUpdatingRenewal(false),
            },
        );
    };

    const ownerBalance = (outlet as any).owner?.coinBalance || 0;
    const canActivateOwner = ownerBalance >= outletFeature.feature.coinPrice;
    const canActivateOutlet =
        outlet.coinBalance >= outletFeature.feature.coinPrice;
    const canActivate = canActivateOwner || canActivateOutlet;

    const isActive = outletFeature.status === "active";
    const hasRecord = Boolean(outletFeature.unlockedAt || outletFeature.expiresAt);
    const renewalEnabled = Boolean(outletFeature.autoRenewal);

    return (
        <>
            <Card
                variant="elevated"
                hoverable
                className="overflow-hidden border-border/80"
            >
                <CardHeader className="relative">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 via-info-500 to-secondary-500" />

                    <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-300">
                                    <Zap className="h-5 w-5" />
                                </span>
                                {outletFeature.feature.name}
                            </CardTitle>
                            <CardDescription className="max-w-2xl text-sm leading-6 text-text-secondary">
                                {outletFeature.feature.description}
                            </CardDescription>
                        </div>

                        <Badge
                            variant={statusVariant[outletFeature.status]}
                            size="sm"
                            className="uppercase tracking-wide"
                        >
                            {statusLabel[outletFeature.status]}
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="space-y-5">
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-md border border-border bg-gray-50/80 p-4 dark:bg-gray-900/40">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                                <Coins className="h-4 w-4" />
                                Harga
                            </div>
                            <div className="mt-2 text-lg font-semibold text-text-primary">
                                {outletFeature.feature.coinPrice.toLocaleString(
                                    "id-ID",
                                )}{" "}
                                Coin
                            </div>
                        </div>

                        <div className="rounded-md border border-border bg-gray-50/80 p-4 dark:bg-gray-900/40">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                                <CalendarDays className="h-4 w-4" />
                                Periode
                            </div>
                            <div className="mt-2 text-lg font-semibold text-text-primary">
                                {(outletFeature.feature.durationDays ?? 0) > 0
                                    ? `${outletFeature.feature.durationDays} hari`
                                    : "Sekali aktif"}
                            </div>
                        </div>

                        <div className="rounded-md border border-border bg-gray-50/80 p-4 dark:bg-gray-900/40">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                                <Clock className="h-4 w-4" />
                                Status
                            </div>
                            <div className="mt-2 text-lg font-semibold text-text-primary">
                                {statusLabel[outletFeature.status]}
                            </div>
                        </div>
                    </div>

                    {outletFeature.status === "inactive" && !canActivate && (
                        <Alert
                            variant="error"
                            title="Saldo koin tidak mencukupi"
                            description={`Saldo Anda (Owner: ${ownerBalance.toLocaleString("id-ID")}, Outlet: ${outlet.coinBalance.toLocaleString("id-ID")}) kurang dari harga fitur ini.`}
                        />
                    )}

                    {hasRecord && (
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-md border border-border p-4">
                                <div className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                                    Berlaku sampai
                                </div>
                                <div className="mt-2 text-base font-semibold text-text-primary">
                                    {outletFeature.expiresAt ? formatDate(outletFeature.expiresAt) : '-'}
                                </div>
                            </div>

                            <div className="rounded-md border border-border p-4">
                                <div className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                                    Auto-renewal
                                </div>
                                <div className="mt-2 flex items-center gap-2 text-base font-semibold text-text-primary">
                                    {renewalEnabled ? (
                                        <Badge variant="success" size="sm">
                                            Aktif
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" size="sm">
                                            Nonaktif
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {isActive && outletFeature.expiresAt && (
                        <Alert
                            variant={renewalEnabled ? "success" : "info"}
                            title={
                                renewalEnabled
                                    ? "Perpanjangan otomatis aktif"
                                    : "Perpanjangan manual"
                            }
                            description={
                                renewalEnabled
                                    ? `Fitur akan diperpanjang otomatis setiap bulan menggunakan saldo coin Anda. Jatuh tempo berikutnya: ${formatDate(outletFeature.expiresAt)}`
                                    : `Fitur aktif sampai ${formatDate(outletFeature.expiresAt)}. Pastikan saldo mencukupi untuk perpanjangan manual.`
                            }
                        />
                    )}
                </CardContent>

                <CardFooter
                    className={cn(
                        "justify-between gap-4 flex-col lg:flex-row bg-surface-muted",
                    )}
                >
                    <div className="w-full lg:w-auto">
                        {hasRecord && (
                            <ToggleSwitch
                                label="Perpanjangan Otomatis"
                                description="Potong koin otomatis setiap bulan"
                                checked={renewalEnabled}
                                disabled={
                                    !isActive &&
                                    outletFeature.status !== "expired"
                                }
                                onChange={toggleAutoRenewal}
                                size="md"
                            />
                        )}
                    </div>

                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                        {(outletFeature.status === "inactive" ||
                            outletFeature.status === "expired" ||
                            outletFeature.status === "trial") && (
                            <Button
                                variant={canActivate ? "primary" : "outline"}
                                loading={isActivating}
                                disabled={!canActivate}
                                leftIcon={<Zap className="h-4 w-4" />}
                                onClick={handleActivateClick}
                                className="sm:min-w-[200px]"
                            >
                                {outletFeature.status === "expired"
                                    ? "Perpanjang Ekspos"
                                    : "Aktifkan Ekspos"}
                            </Button>
                        )}

                        {outletFeature.status === "active" && (
                            <Button
                                variant="outline"
                                leftIcon={<RefreshCw className="h-4 w-4" />}
                                onClick={handleActivateClick}
                                loading={isActivating}
                                className="sm:min-w-[200px]"
                            >
                                Perpanjang Manual
                            </Button>
                        )}
                    </div>
                </CardFooter>
            </Card>

            <Modal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                title="Konfirmasi Aktivasi Ekspos"
                size="md"
            >
                <div className="p-6 space-y-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                        <div className="h-16 w-16 rounded-full bg-primary-50 flex items-center justify-center text-primary-600">
                            <Zap className="h-8 w-8" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-text-primary">
                                Aktifkan Fitur Ekspos
                            </h3>
                            <p className="text-sm text-text-secondary max-w-sm">
                                Outlet Anda akan ditampilkan pada aplikasi
                                customer untuk menjangkau lebih banyak
                                pelanggan.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-sm font-medium text-[var(--color-text-primary)] text-center">
                            Pilih sumber pembayaran:
                        </p>

                        <div className="grid gap-3">
                            <button
                                type="button"
                                onClick={() => setCoinSource("owner")}
                                disabled={!canActivateOwner}
                                className={cn(
                                    "flex items-center justify-between p-4 rounded-lg border-2 transition-all text-left",
                                    coinSource === "owner"
                                        ? "border-primary-500 bg-primary-50 dark:bg-primary-950"
                                        : "border-border hover:border-gray-300",
                                    !canActivateOwner &&
                                        "opacity-50 cursor-not-allowed",
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={cn(
                                            "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                                            coinSource === "owner"
                                                ? "border-primary-500"
                                                : "border-gray-300",
                                        )}
                                    >
                                        {coinSource === "owner" && (
                                            <div className="h-2.5 w-2.5 rounded-full bg-primary-500" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-text-primary">
                                            Saldo Owner
                                        </p>
                                        <p className="text-xs text-text-secondary">
                                            {ownerBalance.toLocaleString(
                                                "id-ID",
                                            )}{" "}
                                            Coin
                                        </p>
                                    </div>
                                </div>
                                {canActivateOwner ? (
                                    <Badge variant="success" size="sm">
                                        Cukup
                                    </Badge>
                                ) : (
                                    <Badge variant="error" size="sm">
                                        Kurang
                                    </Badge>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => setCoinSource("outlet")}
                                disabled={!canActivateOutlet}
                                className={cn(
                                    "flex items-center justify-between p-4 rounded-lg border-2 transition-all text-left",
                                    coinSource === "outlet"
                                        ? "border-primary-500 bg-primary-50 dark:bg-primary-950"
                                        : "border-border hover:border-gray-300",
                                    !canActivateOutlet &&
                                        "opacity-50 cursor-not-allowed",
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={cn(
                                            "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                                            coinSource === "outlet"
                                                ? "border-primary-500"
                                                : "border-gray-300",
                                        )}
                                    >
                                        {coinSource === "outlet" && (
                                            <div className="h-2.5 w-2.5 rounded-full bg-primary-500" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-text-primary">
                                            Saldo Outlet
                                        </p>
                                        <p className="text-xs text-text-secondary">
                                            {outlet.coinBalance.toLocaleString(
                                                "id-ID",
                                            )}{" "}
                                            Coin
                                        </p>
                                    </div>
                                </div>
                                {canActivateOutlet ? (
                                    <Badge variant="success" size="sm">
                                        Cukup
                                    </Badge>
                                ) : (
                                    <Badge variant="error" size="sm">
                                        Kurang
                                    </Badge>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="rounded-md bg-amber-50 dark:bg-amber-950/20 p-4 border border-amber-200 dark:border-amber-900/50">
                        <div className="flex gap-3">
                            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                            <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                                Anda akan dikenakan biaya sebesar{" "}
                                <strong>
                                    {outletFeature.feature.coinPrice.toLocaleString(
                                        "id-ID",
                                    )}{" "}
                                    Coin
                                </strong>
                                . Pastikan saldo mencukupi jika Anda
                                mengaktifkan perpanjangan otomatis.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowConfirmModal(false)}
                            className="flex-1"
                        >
                            Batal
                        </Button>
                        <Button
                            variant="primary"
                            onClick={activateExposure}
                            loading={isActivating}
                            disabled={
                                (coinSource === "owner" && !canActivateOwner) ||
                                (coinSource === "outlet" && !canActivateOutlet)
                            }
                            className="flex-1"
                            leftIcon={<CheckCircle2 className="h-4 w-4" />}
                        >
                            Konfirmasi & Bayar
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default OutletExposureCard;
