import { Lock, Zap, AlertCircle } from "lucide-react";
import { Button } from "@/Components/Button";
import outletService from "@/Services/outlet.service";
import CourierSettingsOverviewSection from "./Partials/CourierSettingsOverviewSection";
import CourierToggleCard from "./Partials/CourierToggleCard";
import CourierServicesSection from "./Partials/CourierServicesSection";

const OutletCourierTab = ({ outlet }: { outlet: any }) => {
    const courierFeature = outlet.outletFeatures?.find(
        (f: any) => f.feature.key === "courier_schedule",
    );
    const isUnlocked = courierFeature?.status === "active";
    const isCourierEnabled = outlet.isCourierEnabled ?? true;

    if (!isUnlocked) {
        return (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-6 animate-fadeIn">
                <div className="w-20 h-20 rounded-full flex items-center justify-center bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                    <Lock className="w-10 h-10" />
                </div>
                <div className="max-w-md">
                    <h3 className="text-2xl font-bold mb-2 text-text-primary">
                        Fitur Terkunci
                    </h3>
                    <p className="text-sm mb-6 text-text-secondary">
                        Aktifkan Layanan Antar-Jemput untuk mengatur konfigurasi
                        biaya kurir Anda secara gratis.
                    </p>
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={() =>
                            outletService.activateCourierFeature(outlet.id)
                        }
                        leftIcon={<Zap className="w-5 h-5" />}
                    >
                        Aktifkan Gratis Sekarang
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 py-6 animate-fadeIn">
            <CourierToggleCard outlet={outlet} />
            {isCourierEnabled ? (
                <>
                    <CourierSettingsOverviewSection outlet={outlet} />
                    <CourierServicesSection outlet={outlet} />
                </>
            ) : (
                <div className="relative">
                    <div className="opacity-40 pointer-events-none select-none space-y-8">
                        <CourierSettingsOverviewSection outlet={outlet} />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center p-6 bg-background/10 backdrop-blur-[1px]">
                        <div className="bg-surface/95 dark:bg-surface-muted/95 border border-border shadow-xl rounded-2xl p-6 max-w-md text-center flex flex-col items-center gap-4 animate-scaleUp">
                            <div className="w-12 h-12 rounded-full bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-500 flex items-center justify-center">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-text-primary text-base">
                                    Layanan Kurir Dinonaktifkan
                                </h4>
                                <p className="text-sm text-text-secondary mt-1">
                                    Aktifkan kembali layanan kurir pada panel di
                                    atas untuk dapat mengelola konfigurasi biaya
                                    kurir.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OutletCourierTab;
