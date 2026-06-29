import React, { useState } from "react";
import { Head, useForm, router } from "@inertiajs/react";
import { Truck, Save, Coins, Settings, AlertCircle } from "lucide-react";
import { Button } from "@/Components/Button";
import { Card } from "@/Components/Card";
import { Alert } from "@/Components/Alert";
import { Tabs } from "@/Components/Tabs";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import StrategySelector from "./Partials/StrategySelector";
import TierEditor from "./Partials/TierEditor";
import ZoneEditor from "./Partials/ZoneEditor";
import ModifierForm from "./Partials/ModifierForm";
import PricingLockedState from "./Partials/PricingLockedState";
import { EditSettingsProps } from "./types";
import PageHeader from "@/Components/Page/PageHeader";
import {
    FreeShippingMode,
    PricingMethod,
    CourierSettingFormData,
} from "@/types/courier_setting";

const EditCourierSetting = ({ outlet }: EditSettingsProps) => {
    const courierSetting = outlet.courierSetting;
    const [activeTab, setActiveTab] = useState(0);

    const mapPricingMethod = (method?: string): PricingMethod => {
        if (!method) return "flat_rate";
        const mapping: Record<string, PricingMethod> = {
            flat: "flat_rate",
            base_per_km: "distance_based",
            zone_based: "zone_based",
            hybrid: "tiered",
            tiered: "tiered",
        };
        return mapping[method] || (method as PricingMethod) || "flat_rate";
    };

    const mapSubsidyType = (
        type?: string | null,
    ): "fixed_amount" | "percentage" => {
        if (!type || type === "fixed") return "fixed_amount";
        return (type as "fixed_amount" | "percentage") || "fixed_amount";
    };

    const resolveFreeShippingMode = (): FreeShippingMode => {
        if (courierSetting?.freeShippingMode) {
            return courierSetting.freeShippingMode;
        }

        if (courierSetting?.unconditionalFreeShippingEnabled) {
            return "all";
        }

        if (courierSetting?.freeShippingEnabled) {
            return "min_order";
        }

        return "none";
    };

    const { data, setData, put, processing, errors } =
        useForm<CourierSettingFormData>({
            courierSettingId: courierSetting?.id ?? 0,
            outletId: outlet.id,
            pricingMethod: mapPricingMethod(courierSetting?.pricingMethod),
            flatFee: courierSetting?.flatFee ?? 0,
            baseFee: courierSetting?.baseFee ?? 0,
            perKmFee: courierSetting?.perKmFee ?? 0,
            defaultPrice: courierSetting?.defaultPrice ?? 0,
            freeRadiusKm: courierSetting?.freeRadiusKm ?? null,
            minFee: courierSetting?.minFee ?? 0,
            maxFee: courierSetting?.maxFee ?? null,
            maxDistanceKm: courierSetting?.maxDistanceKm ?? null,
            surgeEnabled: courierSetting?.surgeEnabled || false,
            surgeMultiplier: courierSetting?.surgeMultiplier ?? 1,
            nightSurcharge: courierSetting?.nightSurcharge ?? 0,
            nightStartTime: courierSetting?.nightStartTime || "21:00",
            nightEndTime: courierSetting?.nightEndTime || "06:00",
            weekendSurcharge: courierSetting?.weekendSurcharge ?? 0,
            merchantSubsidy: courierSetting?.merchantSubsidy ?? 0,
            merchantSubsidyType: mapSubsidyType(
                courierSetting?.merchantSubsidyType,
            ),
            freeShippingMode: resolveFreeShippingMode(),
            freeShippingEnabled: courierSetting?.freeShippingEnabled || false,
            unconditionalFreeShippingEnabled:
                courierSetting?.unconditionalFreeShippingEnabled || false,
            minOrderFreeShipping: courierSetting?.minOrderFreeShipping ?? null,
            tiers: courierSetting?.pricingTiers || [],
            zones: courierSetting?.pricingZones || [],
        });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route("outlets.courier-settings.update", outlet.id), {
            preserveScroll: true,
            onSuccess: () => {
                router.visit(route("outlets.show", { id: outlet.id, tab: 3 }));
            },
        });
    };

    const handleBack = () => {
        router.visit(route("outlets.show", { id: outlet.id, tab: 3 }));
    };

    const tabsConfig = [
        {
            label: "Strategi Harga",
            icon: <Coins className="w-4 h-4" />,
        },
        {
            label: "Pengaturan Lainnya",
            icon: <Settings className="w-4 h-4" />,
        },
    ];

    return (
        <>
            <Head title={`Atur Kurir: ${outlet.name}`} />

            <div className="p-4 md:p-6 space-y-6 mx-auto">
                <PageHeader
                    title="Pengaturan Kurir"
                    subtitle={
                        <>
                            Konfigurasi cara sistem menghitung ongkos kirim dan
                            batasan kurir untuk{" "}
                            <span className="font-semibold text-text-primary">
                                {outlet.name}
                            </span>
                        </>
                    }
                    icon={Truck}
                />

                <Alert
                    variant="info"
                    title="Informasi Penting"
                    description="Perubahan pada pengaturan ini akan langsung berdampak pada kalkulasi ongkos kirim di aplikasi pelanggan. Pastikan data yang dimasukkan sudah sesuai dengan kebijakan operasional outlet Anda."
                    icon={<AlertCircle className="w-5 h-5" />}
                    showIcon={true}
                    className="bg-primary-500/10 border-primary-500/20 text-primary-800 dark:text-primary-800"
                />

                <Tabs
                    variant="pills"
                    size="lg"
                    tabs={tabsConfig}
                    selectedIndex={activeTab}
                    onChange={setActiveTab}
                    animated={true}
                    className="w-full"
                >
                    <div className="space-y-6 mt-6 animate-fadeIn">
                        <Card className="p-6 space-y-8">
                            {data.freeShippingMode === "all" ? (
                                <PricingLockedState
                                    onOpenOtherSettings={() => setActiveTab(1)}
                                />
                            ) : (
                                <div>
                                    <h3 className="text-lg font-bold text-text-primary mb-1">
                                        Pilih Strategi Harga
                                    </h3>
                                    <p className="text-sm text-text-secondary mb-6">
                                        Tentukan bagaimana ongkos kirim dihitung
                                        berdasarkan jarak atau zona.
                                    </p>
                                    <StrategySelector
                                        value={data.pricingMethod}
                                        onChange={(val: PricingMethod) =>
                                            setData("pricingMethod", val)
                                        }
                                        data={data}
                                        setData={setData}
                                        errors={errors}
                                    />
                                </div>
                            )}

                            {data.freeShippingMode !== "all" &&
                                data.pricingMethod === "tiered" && (
                                <div className="pt-8 border-t border-border-light animate-slideDown">
                                    <h3 className="text-lg font-bold text-text-primary mb-1">
                                        Pengaturan Tier Harga
                                    </h3>
                                    <p className="text-sm text-text-secondary mb-6">
                                        Atur rentang jarak dan biaya yang
                                        berlaku untuk setiap tier.
                                    </p>
                                    <TierEditor
                                        tiers={data.tiers}
                                        freeRadiusKm={data.freeRadiusKm}
                                        onChange={(val: any[]) =>
                                            setData("tiers", val)
                                        }
                                    />
                                </div>
                            )}

                            {data.freeShippingMode !== "all" &&
                                data.pricingMethod === "zone_based" && (
                                <div className="pt-8 border-t border-border-light animate-slideDown">
                                    <h3 className="text-lg font-bold text-text-primary mb-1">
                                        Pengaturan Zona
                                    </h3>
                                    <p className="text-sm text-text-secondary mb-6">
                                        Tentukan biaya pengiriman berdasarkan
                                        area/kelurahan tujuan.
                                    </p>
                                    <ZoneEditor
                                        outletId={outlet.id}
                                        zones={data.zones}
                                        onChange={(val: any[]) =>
                                            setData("zones", val)
                                        }
                                    />
                                </div>
                            )}
                        </Card>
                    </div>

                    <div className="mt-6 animate-fadeIn">
                        <ModifierForm
                            data={data}
                            setData={setData}
                            errors={errors}
                        />
                    </div>
                </Tabs>

                <div className="flex justify-end pt-4">
                    <Button
                        onClick={handleSubmit}
                        disabled={processing}
                        className="w-full md:w-auto min-w-[200px] gap-2"
                        size="lg"
                    >
                        <Save className="w-5 h-5" />
                        Simpan Perubahan
                    </Button>
                </div>
            </div>
        </>
    );
};

EditCourierSetting.layout = (page: any) =>
    withAuthenticatedLayout({
        title: "Pengaturan Kurir",
        searchable: false,
        breadcrumbs: [
            { label: "Outlet", href: route("outlets.index") },
            {
                label: `${page.props.outlet.name}`,
                href: route("outlets.show", page.props.outlet.id),
            },
            {
                label: "Pengaturan Kurir",
            },
        ],
    })(page);

export default EditCourierSetting;
