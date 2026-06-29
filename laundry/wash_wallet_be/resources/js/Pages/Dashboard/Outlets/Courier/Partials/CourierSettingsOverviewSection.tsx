import { useMemo, useState } from "react";
import {
    ArrowRight,
    Building2,
    ChevronDown,
    ChevronRight,
    Clock,
    Coins,
    Gift,
    MapPin,
    Moon,
    Navigation,
    Settings,
    Shield,
    TrendingUp,
    Truck,
    Zap,
} from "lucide-react";
import { router } from "@inertiajs/react";
import { motion } from "framer-motion";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import { Card } from "@/Components/Card";
import { formatCurrency } from "@/lib/utils";
import CourierStatChip from "./CourierStatChip";
import SectionTitle from "./SectionTitle";
import SettingItem from "./SettingItem";

const ZoneAccordionItem = ({
    district,
    villages,
}: {
    district: any;
    villages: any[];
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="border border-border rounded-xl overflow-hidden bg-surface">
            <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-surface-muted/50 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-gradient-to-b from-warning-500 to-warning-600 rounded-full" />
                    <div>
                        <p className="text-sm font-bold text-text-primary uppercase tracking-tight">
                            {district.locationName}
                        </p>
                        <p className="text-xs text-text-tertiary">
                            {villages.length} Kelurahan spesifik
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-primary-600 dark:text-primary-400">
                        {formatCurrency(district.fee)}
                    </span>
                    <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ChevronDown className="w-4 h-4 text-text-tertiary" />
                    </motion.div>
                </div>
            </div>

            <motion.div
                initial={false}
                animate={{
                    height: isExpanded ? "auto" : 0,
                    opacity: isExpanded ? 1 : 0,
                }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden bg-surface-muted/10"
            >
                <div className="p-3 space-y-2 border-t border-border">
                    {villages.length === 0 ? (
                        <p className="text-xs text-text-tertiary text-center py-2">
                            Tidak ada kelurahan spesifik. Semua mengikuti harga
                            kecamatan.
                        </p>
                    ) : (
                        villages.map((village: any, index: number) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-2 rounded-lg border border-border bg-surface"
                            >
                                <span className="text-xs font-medium text-text-secondary">
                                    {village.locationName}
                                </span>
                                <span className="text-xs font-bold text-text-primary">
                                    {formatCurrency(village.fee)}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </motion.div>
        </div>
    );
};

const CourierSettingsOverviewSection = ({ outlet }: { outlet: any }) => {
    const courierSetting = outlet.courierSetting || {};
    const freeShippingMode = courierSetting.freeShippingMode || "none";

    const groupedZones = useMemo(() => {
        const zones = courierSetting.pricingZones || [];
        const districts = zones.filter(
            (zone: any) => zone.locationType === "district",
        );
        const villages = zones.filter(
            (zone: any) => zone.locationType === "village",
        );

        return districts.map((district: any) => ({
            ...district,
            villages: villages.filter(
                (village: any) =>
                    village.parentDistrictId?.toString() ===
                    district.locationId.toString(),
            ),
        }));
    }, [courierSetting.pricingZones]);

    const handleEdit = () => {
        router.visit(route("outlets.courier-settings.edit", outlet.id));
    };

    const getPricingMethodLabel = (method: string) => {
        switch (method) {
            case "flat_rate":
                return "Flat Rate";
            case "distance_based":
                return "Berdasarkan Jarak";
            case "zone_based":
                return "Berdasarkan Zona";
            case "tiered":
                return "Radius Bertingkat";
            default:
                return method || "Belum diatur";
        }
    };

    const getPricingMethodIcon = (method: string) => {
        switch (method) {
            case "flat_rate":
                return <Coins className="w-5 h-5" />;
            case "distance_based":
                return <Navigation className="w-5 h-5" />;
            case "zone_based":
                return <MapPin className="w-5 h-5" />;
            case "tiered":
                return <TrendingUp className="w-5 h-5" />;
            default:
                return <Settings className="w-5 h-5" />;
        }
    };

    const getPricingSummary = () => {
        const method = courierSetting.pricingMethod;
        if (!method) return "Belum dikonfigurasi";

        if (method === "flat_rate") {
            return formatCurrency(courierSetting.flatFee || 0);
        }

        if (method === "distance_based") {
            return `${formatCurrency(courierSetting.baseFee || 0)} + ${formatCurrency(courierSetting.perKmFee || 0)}/KM`;
        }

        if (method === "tiered") {
            return `${courierSetting.pricingTiers?.length || 0} Tier Harga`;
        }

        return `${courierSetting.pricingZones?.length || 0} Zona Aktif`;
    };

    const getFreeShippingSummary = () => {
        switch (freeShippingMode) {
            case "all":
                return "Semua order kurir";
            case "min_order":
                return `Min. ${formatCurrency(
                    courierSetting.minOrderFreeShipping || 0,
                )}`;
            default:
                return "Nonaktif";
        }
    };

    const hasMethod = !!courierSetting.pricingMethod;
    const freeRadiusKm = courierSetting.freeRadiusKm;
    const usesDefaultPrice = ["zone_based", "tiered"].includes(
        courierSetting.pricingMethod,
    );
    const activeModifiers = [
        courierSetting.surgeEnabled,
        courierSetting.nightSurcharge > 0,
        courierSetting.weekendSurcharge > 0,
        courierSetting.merchantSubsidy > 0,
        freeShippingMode !== "none",
    ].filter(Boolean).length;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <Card className="border-border shadow-md overflow-hidden">
                <div className="relative overflow-hidden bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 dark:from-gray-800 dark:via-gray-900 dark:to-black p-6 pb-8">
                    <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/15 backdrop-blur-sm border border-white/20 text-white shadow-lg">
                                <Truck className="w-7 h-7" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                    <h2 className="text-xl font-bold text-white">
                                        Pengaturan Kurir
                                    </h2>
                                    {!(outlet.isCourierEnabled ?? true) ? (
                                        <Badge
                                            variant="danger"
                                            size="sm"
                                            isGlass
                                            className="text-[10px]"
                                        >
                                            Nonaktif
                                        </Badge>
                                    ) : hasMethod ? (
                                        <Badge
                                            variant="success"
                                            size="sm"
                                            isGlass
                                            className="text-[10px]"
                                        >
                                            Aktif
                                        </Badge>
                                    ) : (
                                        <Badge
                                            variant="secondary"
                                            size="sm"
                                            isGlass
                                            className="text-[10px]"
                                        >
                                            Draft
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-sm text-white/70">
                                    Kelola strategi harga, biaya tambahan, dan
                                    batas operasional
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="secondary"
                            onClick={handleEdit}
                            rightIcon={<ArrowRight className="w-4 h-4" />}
                            className="bg-white/15 backdrop-blur-sm border-white/30 text-white hover:bg-white/25 shrink-0"
                        >
                            Atur Konfigurasi
                        </Button>
                    </div>

                    <div className="relative z-10 mt-6 grid grid-cols-3 gap-3">
                        {freeShippingMode === "all" ? (
                            <>
                                <CourierStatChip
                                    label="Mode"
                                    value="Gratis Ongkir"
                                />
                                <CourierStatChip
                                    label="Biaya Customer"
                                    value="Rp 0"
                                />
                                <CourierStatChip
                                    label="Cakupan"
                                    value="Semua order valid"
                                />
                            </>
                        ) : (
                            <>
                                <CourierStatChip
                                    label="Metode"
                                    value={getPricingMethodLabel(
                                        courierSetting.pricingMethod,
                                    )}
                                />
                                <CourierStatChip
                                    label="Tarif Dasar"
                                    value={getPricingSummary()}
                                />
                                <CourierStatChip
                                    label="Modifier"
                                    value={`${activeModifiers} Aktif`}
                                />
                            </>
                        )}
                    </div>
                </div>

                {(freeRadiusKm || freeShippingMode !== "none") && (
                    <div className="mx-6 -mt-4 relative z-10">
                        <div className="rounded-2xl border border-success-500/20 dark:border-success-500/10 bg-success-50 dark:bg-success-500/10 p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="flex items-center gap-3 flex-1">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-success-50 dark:bg-success-500/10 text-success-600 dark:text-success-500 shrink-0">
                                    <Gift className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-bold text-success-600 dark:text-success-500 uppercase tracking-wider mb-0.5">
                                        Gratis Ongkir
                                    </p>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {freeRadiusKm && (
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-success-500" />
                                                <span className="text-sm font-semibold text-text-primary">
                                                    Radius{" "}
                                                    <span className="font-black text-base text-success-600 dark:text-success-500">
                                                        {freeRadiusKm} KM
                                                    </span>{" "}
                                                    pertama gratis
                                                </span>
                                            </div>
                                        )}
                                        {freeRadiusKm &&
                                            freeShippingMode !== "none" && (
                                                <span className="text-text-tertiary text-xs">
                                                    |
                                                </span>
                                            )}
                                        {freeShippingMode === "min_order" &&
                                            courierSetting.minOrderFreeShipping && (
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-success-500" />
                                                    <span className="text-sm font-semibold text-text-primary">
                                                        Min. order{" "}
                                                        <span className="font-black text-success-600 dark:text-success-500">
                                                            {formatCurrency(
                                                                courierSetting.minOrderFreeShipping,
                                                            )}
                                                        </span>
                                                    </span>
                                                </div>
                                            )}
                                        {freeShippingMode === "all" && (
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-success-500" />
                                                <span className="text-sm font-semibold text-text-primary">
                                                    Semua order kurir valid gratis
                                                    ongkir
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {freeShippingMode === "all" && (
                                <Badge
                                    variant="success"
                                    size="sm"
                                    className="shrink-0 text-xs px-3 py-1"
                                >
                                    Gratis Ongkir Semua
                                </Badge>
                            )}
                            {freeShippingMode === "min_order" && (
                                <Badge
                                    variant="warning"
                                    size="sm"
                                    className="shrink-0 text-xs px-3 py-1"
                                >
                                    Gratis {"\u2265"}{" "}
                                    {formatCurrency(
                                        courierSetting.minOrderFreeShipping || 0,
                                    )}
                                </Badge>
                            )}
                        </div>
                    </div>
                )}

                <div className="p-6 space-y-8">
                    <div>
                        <SectionTitle
                            icon={<Coins className="w-3.5 h-3.5" />}
                            label="Strategi Harga"
                        />

                        {freeShippingMode === "all" ? (
                            <div className="rounded-2xl border border-success-500/20 bg-gradient-to-br from-success-50 via-surface to-success-50/40 p-6">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success-500 text-white shadow-sm">
                                            <Gift className="h-5 w-5" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-success-700">
                                                Gratis Ongkir
                                            </p>
                                            <p className="text-lg font-bold text-text-primary">
                                                Ongkir seluruh order kurir valid ditanggung outlet
                                            </p>
                                            <p className="text-sm text-text-secondary">
                                                Strategi harga tetap disimpan, tetapi tidak aktif
                                                selama Gratis Ongkir Semua dipilih.
                                            </p>
                                        </div>
                                    </div>
                                    <Badge
                                        variant="success"
                                        size="sm"
                                        className="h-fit shrink-0 px-3 py-1"
                                    >
                                        Customer Bayar Rp 0
                                    </Badge>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="group p-5 rounded-2xl border border-border bg-gradient-to-br from-surface to-surface-muted/30 flex items-center gap-4 hover:border-primary-200 hover:shadow-sm transition-all">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 shrink-0">
                                            {getPricingMethodIcon(
                                                courierSetting.pricingMethod,
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] text-text-tertiary font-semibold uppercase tracking-wider mb-0.5">
                                                Metode Harga
                                            </p>
                                            <p className="font-bold text-base text-text-primary">
                                                {getPricingMethodLabel(
                                                    courierSetting.pricingMethod,
                                                )}
                                            </p>
                                        </div>
                                        <Badge
                                            variant={hasMethod ? "info" : "secondary"}
                                            isGlass
                                            className="shrink-0"
                                        >
                                            {hasMethod ? "Aktif" : "Draft"}
                                        </Badge>
                                    </div>

                                    <div className="group p-5 rounded-2xl border border-border bg-gradient-to-br from-surface to-surface-muted/30 flex items-center gap-4 hover:border-success-200 hover:shadow-sm transition-all">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-success-100 dark:bg-success-900/30 text-success-600 dark:text-success-400 shrink-0">
                                            <Coins className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] text-text-tertiary font-semibold uppercase tracking-wider mb-0.5">
                                                Ringkasan Biaya
                                            </p>
                                            <p className="font-bold text-base text-text-primary truncate">
                                                {getPricingSummary()}
                                            </p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-text-tertiary shrink-0 group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                </div>

                                {usesDefaultPrice && (
                                    <div className="mt-4 rounded-2xl border border-primary-200 bg-primary-50/60 p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary-700">
                                                    Default Price
                                                </p>
                                                <p className="mt-1 text-lg font-bold text-text-primary">
                                                    {formatCurrency(
                                                        courierSetting.defaultPrice || 0,
                                                    )}
                                                </p>
                                                <p className="mt-1 text-sm text-text-secondary">
                                                    {courierSetting.pricingMethod === "zone_based"
                                                        ? "Dipakai bila alamat tidak masuk zona yang diatur."
                                                        : "Dipakai bila jarak tidak masuk tier yang diatur."}
                                                </p>
                                            </div>
                                            <Badge variant="info" size="sm">
                                                Fallback
                                            </Badge>
                                        </div>
                                    </div>
                                )}

                                {courierSetting.pricingMethod === "tiered" &&
                                    courierSetting.pricingTiers?.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-4 p-5 rounded-2xl border border-border bg-surface-muted/20"
                                >
                                    <div className="flex items-center gap-2 mb-4 text-[10px] font-bold text-text-tertiary uppercase tracking-wider">
                                        <TrendingUp className="w-3.5 h-3.5 text-primary-500" />
                                        Detail Tier Jarak
                                    </div>
                                    <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                                        {courierSetting.pricingTiers.map(
                                            (tier: any, index: number) => (
                                                <div
                                                    key={index}
                                                    className="relative pl-8 flex items-center justify-between group"
                                                >
                                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-primary-500 bg-surface flex items-center justify-center">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                                                    </div>
                                                    <div className="flex-1 bg-surface border border-border rounded-xl p-3 flex items-center justify-between hover:border-primary-200 transition-colors">
                                                        <div>
                                                            <p className="text-xs font-bold text-text-primary">
                                                                Radius{" "}
                                                                {tier.minKm} -
                                                                {" "}
                                                                {tier.maxKm ??
                                                                    "inf"}{" "}
                                                                KM
                                                            </p>
                                                            <p className="text-[10px] text-text-tertiary">
                                                                {index === 0
                                                                    ? "Tier Dasar"
                                                                    : `Tier ${
                                                                          index + 1
                                                                      }`}
                                                            </p>
                                                        </div>
                                                        <span className="text-sm font-black text-primary-600 dark:text-primary-400">
                                                            {formatCurrency(
                                                                tier.fee,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </motion.div>
                                )}

                                {courierSetting.pricingMethod === "zone_based" &&
                                    courierSetting.pricingZones?.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-4 p-5 rounded-2xl border border-border bg-surface-muted/20"
                                >
                                    <div className="flex items-center gap-2 mb-4 text-[10px] font-bold text-text-tertiary uppercase tracking-wider">
                                        <MapPin className="w-3.5 h-3.5 text-warning-500" />
                                        Daftar Zona Aktif
                                        <Badge
                                            variant="secondary"
                                            size="sm"
                                            className="ml-auto text-[10px]"
                                        >
                                            {groupedZones.length} Kecamatan
                                        </Badge>
                                    </div>
                                    <div className="space-y-2">
                                        {groupedZones.map(
                                            (item: any, index: number) => (
                                                <ZoneAccordionItem
                                                    key={index}
                                                    district={item}
                                                    villages={item.villages}
                                                />
                                            ),
                                        )}
                                    </div>
                                </motion.div>
                                )}
                            </>
                        )}
                    </div>

                    <div>
                        <SectionTitle
                            icon={<Zap className="w-3.5 h-3.5" />}
                            label="Biaya & Batasan Tambahan"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <SettingItem
                                icon={<MapPin className="w-4 h-4" />}
                                iconColor="text-primary-500"
                                iconBg="bg-primary-50 dark:bg-primary-950"
                                label="Jarak Maksimal"
                                value={
                                    courierSetting.maxDistanceKm
                                        ? `${courierSetting.maxDistanceKm} KM`
                                        : "Tidak Dibatasi"
                                }
                                isActive={!!courierSetting.maxDistanceKm}
                            />

                            <SettingItem
                                icon={<Navigation className="w-4 h-4" />}
                                iconColor="text-primary-500"
                                iconBg="bg-primary-50 dark:bg-primary-950"
                                label="Radius Gratis"
                                value={
                                    freeRadiusKm
                                        ? `Dibawah ${freeRadiusKm} KM`
                                        : "Tidak Ada"
                                }
                                isActive={!!freeRadiusKm}
                                highlightActive
                                badge={
                                    freeRadiusKm
                                        ? `${freeRadiusKm} KM`
                                        : undefined
                                }
                            />

                            <SettingItem
                                icon={<TrendingUp className="w-4 h-4" />}
                                iconColor="text-warning-500"
                                iconBg="bg-warning-50 dark:bg-warning-500/10"
                                label="Surge Pricing"
                                value={
                                    courierSetting.surgeEnabled
                                        ? `Aktif (${courierSetting.surgeMultiplier}x)`
                                        : "Nonaktif"
                                }
                                isActive={courierSetting.surgeEnabled}
                            />

                            <SettingItem
                                icon={<Moon className="w-4 h-4" />}
                                iconColor="text-info-500"
                                iconBg="bg-info-50 dark:bg-info-500/10"
                                label="Biaya Malam"
                                value={
                                    courierSetting.nightSurcharge > 0
                                        ? `${formatCurrency(courierSetting.nightSurcharge)}`
                                        : "Nonaktif"
                                }
                                subValue={
                                    courierSetting.nightSurcharge > 0
                                        ? `${courierSetting.nightStartTime?.slice(0, 5)} - ${courierSetting.nightEndTime?.slice(0, 5)}`
                                        : undefined
                                }
                                isActive={courierSetting.nightSurcharge > 0}
                            />

                            <SettingItem
                                icon={<Clock className="w-4 h-4" />}
                                iconColor="text-accent-500"
                                iconBg="bg-accent-50 dark:bg-accent-500/10"
                                label="Biaya Akhir Pekan"
                                value={
                                    courierSetting.weekendSurcharge > 0
                                        ? formatCurrency(
                                              courierSetting.weekendSurcharge,
                                          )
                                        : "Nonaktif"
                                }
                                isActive={courierSetting.weekendSurcharge > 0}
                            />

                            <SettingItem
                                icon={<Gift className="w-4 h-4" />}
                                iconColor="text-success-500"
                                iconBg="bg-success-50 dark:bg-success-500/10"
                                label="Gratis Ongkir"
                                value={getFreeShippingSummary()}
                                isActive={freeShippingMode !== "none"}
                            />

                            <SettingItem
                                icon={<Building2 className="w-4 h-4" />}
                                iconColor="text-text-secondary"
                                iconBg="bg-surface-muted"
                                label="Subsidi Merchant"
                                value={
                                    courierSetting.merchantSubsidy > 0
                                        ? courierSetting.merchantSubsidyType ===
                                          "percentage"
                                            ? `${courierSetting.merchantSubsidy}%`
                                            : formatCurrency(
                                                  courierSetting.merchantSubsidy,
                                              )
                                        : "Nonaktif"
                                }
                                isActive={courierSetting.merchantSubsidy > 0}
                            />

                            <SettingItem
                                icon={<Shield className="w-4 h-4" />}
                                iconColor="text-text-secondary"
                                iconBg="bg-surface-muted"
                                label="Min. / Maks. Tarif"
                                value={
                                    courierSetting.minFee > 0 ||
                                    courierSetting.maxFee
                                        ? [
                                              courierSetting.minFee > 0
                                                  ? `Min ${formatCurrency(
                                                        courierSetting.minFee,
                                                    )}`
                                                  : null,
                                              courierSetting.maxFee
                                                  ? `Maks ${formatCurrency(
                                                        courierSetting.maxFee,
                                                    )}`
                                                  : null,
                                          ]
                                              .filter(Boolean)
                                              .join(" | ")
                                        : "Tidak Dibatasi"
                                }
                                isActive={
                                    !!(
                                        courierSetting.minFee > 0 ||
                                        courierSetting.maxFee
                                    )
                                }
                            />
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
};

export default CourierSettingsOverviewSection;
