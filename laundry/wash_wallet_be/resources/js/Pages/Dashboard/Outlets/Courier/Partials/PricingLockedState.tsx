import { Button } from "@/Components/Button";
import { Card } from "@/Components/Card";
import { Gift, Settings, Truck } from "lucide-react";

const PricingLockedState = ({
    onOpenOtherSettings,
}: {
    onOpenOtherSettings: () => void;
}) => {
    return (
        <Card className="p-8 border-border overflow-hidden">
            <div className="relative rounded-3xl border border-success-500/20 bg-gradient-to-br from-success-50 via-surface to-primary-50 p-8">
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-success-500/10 blur-2xl" />
                <div className="absolute -left-6 -bottom-6 h-24 w-24 rounded-full bg-primary-500/10 blur-2xl" />

                <div className="relative flex flex-col items-start gap-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success-500 text-white shadow-lg">
                            <Truck className="h-7 w-7" />
                        </div>
                        <div className="rounded-full border border-success-500/20 bg-success-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-success-700">
                            Gratis Ongkir Semua
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-text-primary">
                            Ongkir seluruhnya gratis
                        </h3>
                        <p className="max-w-2xl text-sm leading-6 text-text-secondary">
                            Strategi harga tidak digunakan karena Gratis Ongkir Semua
                            sedang aktif. Untuk mengatur tarif zona, radius, atau
                            default price, ubah pengaturan gratis ongkir pada tab
                            Pengaturan Lainnya.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Button
                            onClick={onOpenOtherSettings}
                            leftIcon={<Settings className="h-4 w-4" />}
                        >
                            Ubah Pengaturan Gratis Ongkir
                        </Button>
                        <div className="flex items-center gap-2 text-sm text-success-700">
                            <Gift className="h-4 w-4" />
                            Ongkir order kurir valid ditanggung outlet.
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default PricingLockedState;
