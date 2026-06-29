import React, { useState, useMemo } from "react";
import { router } from "@inertiajs/react";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { ShoppingBag, Layers, Inbox } from "lucide-react";
import { motion } from "framer-motion";
import CourierCategoryAccordionItem from "./CourierCategoryAccordionItem";
import ToggleCourierServiceModal from "./ToggleCourierServiceModal";
import CourierStatChip from "./CourierStatChip";
import SectionTitle from "./SectionTitle";

const CourierServicesSection = ({ outlet }: { outlet: any }) => {
    const services = outlet.laundryServices || [];
    const total = services.length;
    const supportedCount = services.filter((s: any) => s.supportsCourier).length;

    const [isOpenModal, setIsOpenModal] = useState(false);
    const [selectedService, setSelectedService] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleToggleClick = (service: any) => {
        setSelectedService(service);
        setIsOpenModal(true);
    };

    const handleConfirmToggle = async (service: any) => {
        setIsLoading(true);
        try {
            await router.patch(route("outlets.laundry-services.courier-eligibility", [outlet.id, service.id]), {
                supportsCourier: !service.supportsCourier,
            });
            setIsOpenModal(false);
            router.reload();
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const groupedServices = useMemo(() => {
        const groups: Record<string, any[]> = {};
        services.forEach((s: any) => {
            const catName = s.category?.name || "Lainnya";
            if (!groups[catName]) groups[catName] = [];
            groups[catName].push(s);
        });
        return Object.entries(groups).map(([categoryName, items]) => ({
            categoryName,
            items,
        }));
    }, [services]);

    const getBannerBadge = () => {
        if (total === 0) return { variant: "secondary" as const, text: "Kosong" };
        if (supportedCount === total) return { variant: "success" as const, text: "Semua Aktif" };
        if (supportedCount === 0) return { variant: "danger" as const, text: "Nonaktif" };
        return { variant: "warning" as const, text: "Parsial" };
    };

    const badgeInfo = getBannerBadge();

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
        >
            <Card className="border-border shadow-md overflow-hidden">
                <div className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-slate-800 to-slate-900 dark:from-gray-800 dark:via-gray-900 dark:to-black p-6 pb-8">
                    <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/15 backdrop-blur-sm border border-white/20 text-white shadow-lg">
                                <ShoppingBag className="w-7 h-7" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                    <h2 className="text-xl font-bold text-white">
                                        Layanan untuk Kurir
                                    </h2>
                                    <Badge
                                        variant={badgeInfo.variant}
                                        size="sm"
                                        isGlass
                                        className="text-[10px]"
                                    >
                                        {badgeInfo.text}
                                    </Badge>
                                </div>
                                <p className="text-sm text-white/70">
                                    Atur layanan mana saja yang boleh dijemput atau diantar oleh kurir
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 mt-6 grid grid-cols-3 gap-3">
                        <CourierStatChip
                            label="Total Layanan"
                            value={total}
                        />
                        <CourierStatChip
                            label="Mendukung Kurir"
                            value={supportedCount}
                        />
                        <CourierStatChip
                            label="Persentase"
                            value={`${Math.round((supportedCount / (total || 1)) * 100)}%`}
                        />
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <SectionTitle
                        icon={<Layers className="w-3.5 h-3.5 text-indigo-500" />}
                        label="Daftar Kategori Layanan"
                    />

                    {services.length === 0 ? (
                        <div className="p-12 flex flex-col items-center justify-center text-center space-y-3">
                            <div className="w-16 h-16 rounded-full bg-surface-muted text-text-tertiary flex items-center justify-center border border-border">
                                <Inbox className="w-8 h-8" />
                            </div>
                            <div>
                                <h5 className="font-bold text-text-primary text-base">Tidak ada layanan</h5>
                                <p className="text-sm text-text-secondary mt-1">Outlet ini belum memiliki daftar layanan.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {groupedServices.map(({ categoryName, items }) => (
                                <CourierCategoryAccordionItem
                                    key={categoryName}
                                    categoryName={categoryName}
                                    services={items}
                                    onToggleService={handleToggleClick}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <ToggleCourierServiceModal
                    isOpen={isOpenModal}
                    service={selectedService}
                    onClose={() => setIsOpenModal(false)}
                    onConfirm={handleConfirmToggle}
                    isLoading={isLoading}
                />
            </Card>
        </motion.div>
    );
};

export default CourierServicesSection;
