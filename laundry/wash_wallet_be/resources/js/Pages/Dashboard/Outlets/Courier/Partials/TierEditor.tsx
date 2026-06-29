import { Card } from "@/Components/Card";
import { Button } from "@/Components/Button";
import { NumberInput } from "@/Components/Input";
import { Alert } from "@/Components/Alert";
import { Plus, Trash2 } from "lucide-react";

interface Tier {
    id: number | null;
    minKm: any;
    maxKm: any;
    fee: number;
    perKmFee: number;
    sortOrder: number;
}

const getTierFreeStatus = (tier: Tier, freeRadiusKm: number | null) => {
    if (freeRadiusKm === null || freeRadiusKm <= 0) {
        return "ok";
    }

    const minKm = parseFloat(tier.minKm || "0");
    const maxKm = tier.maxKm !== null && tier.maxKm !== undefined && tier.maxKm !== "" ? parseFloat(tier.maxKm) : null;

    if (maxKm !== null && maxKm <= freeRadiusKm) {
        return "fully_covered";
    }

    if (minKm < freeRadiusKm) {
        return "partially_covered";
    }

    return "ok";
};

interface TierFreeWarningProps {
    status: "fully_covered" | "partially_covered" | "ok";
    freeRadiusKm: number;
}

const TierFreeWarning = ({ status, freeRadiusKm }: TierFreeWarningProps) => {
    if (status === "fully_covered") {
        return (
            <Alert
                variant="warning"
                size="sm"
                title="Tier Sepenuhnya Gratis"
                description={`Tier ini tidak akan pernah menghasilkan biaya karena seluruh rentang jarak berada di dalam Radius Gratis (0 – ${freeRadiusKm} km).`}
                className="bg-orange-50/50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900/30 text-orange-800 dark:text-orange-300"
            />
        );
    }

    if (status === "partially_covered") {
        return (
            <div className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-medium w-fit">
                <span>🎁</span>
                <span>Gratis s.d. {freeRadiusKm} KM. Biaya berlaku mulai {freeRadiusKm} KM.</span>
            </div>
        );
    }

    return null;
};

const TierEditor = ({ tiers, freeRadiusKm, onChange }: any) => {
    const addTier = () => {
        const lastTier = tiers[tiers.length - 1];
        let newMin: number;

        if (!lastTier) {
            newMin = freeRadiusKm ?? 0;
        } else {
            newMin = parseFloat(lastTier.maxKm || lastTier.minKm);
        }

        onChange([
            ...tiers,
            {
                id: null,
                minKm: newMin,
                maxKm: null,
                fee: 0,
                perKmFee: 0,
                sortOrder: tiers.length,
            },
        ]);
    };

    const removeTier = (index: number) => {
        const newTiers = [...tiers];
        newTiers.splice(index, 1);
        onChange(newTiers);
    };

    const updateTier = (index: number, field: string, value: any) => {
        const newTiers = [...tiers];
        newTiers[index] = { ...newTiers[index], [field]: value };
        onChange(newTiers);
    };

    return (
        <Card className="p-6 space-y-6 bg-surface">
            <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                    <h3 className="text-lg font-bold text-text-primary">
                        Rentang Harga per Tier
                    </h3>
                    <p className="text-sm text-text-secondary">
                        Setiap tier berlaku untuk jarak tertentu. Pelanggan dikenakan biaya tier yang sesuai.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTier}
                    className="gap-2 border-primary-500 text-primary-500 hover:bg-primary-50"
                >
                    <Plus className="w-4 h-4" />
                    Tambah Tier
                </Button>
            </div>

            <div className="space-y-4">
                {freeRadiusKm > 0 && (
                    <div className="flex items-center gap-4 p-4 bg-primary-50/30 border border-primary-100 rounded-xl">
                        <div className="flex-shrink-0 bg-primary-100 text-primary-700 rounded-lg px-4 py-3 text-sm font-bold min-w-[120px] text-center border border-primary-200">
                            0 – {freeRadiusKm} km
                        </div>
                        <div className="flex-1">
                            <span className="text-sm font-bold text-primary-600 uppercase tracking-widest flex items-center gap-2">
                                🎁 Gratis Ongkir
                            </span>
                            <p className="text-xs text-text-tertiary mt-0.5">
                                Radius pengiriman gratis yang dikonfigurasi di pengaturan lainnya.
                            </p>
                        </div>
                    </div>
                )}

                {tiers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border rounded-2xl text-text-tertiary bg-surface-muted/30">
                        <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center mb-4 text-text-tertiary opacity-40">
                            🎯
                        </div>
                        <p className="text-sm font-medium text-text-secondary">Belum ada tier</p>
                        <p className="text-xs mt-1">Klik "Tambah Tier" untuk menentukan rentang harga pengiriman.</p>
                    </div>
                ) : (
                    tiers.map((tier: any, index: number) => {
                        const status = getTierFreeStatus(tier, freeRadiusKm);
                        return (
                            <div
                                key={index}
                                className="flex flex-col gap-4 p-4 bg-surface border border-border rounded-xl transition-all hover:shadow-sm"
                            >
                                <div className="flex items-center gap-4 w-full">
                                    <div className={`flex-shrink-0 rounded-lg px-4 py-3 text-sm font-bold min-w-[120px] text-center border transition-colors duration-200 ${status === "fully_covered"
                                        ? "bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 border-orange-100 dark:border-orange-850"
                                        : "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 border-primary-100 dark:border-primary-850"
                                        }`}>
                                        {tier.minKm} – {tier.maxKm ?? "∞"} km
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                                        <NumberInput
                                            label="Min KM"
                                            suffix=" KM"
                                            precision={1}
                                            value={tier.minKm}
                                            onValueChange={(val) =>
                                                updateTier(index, "minKm", val)
                                            }
                                        />
                                        <NumberInput
                                            label="Max KM (Kosong = ∞)"
                                            suffix=" KM"
                                            precision={1}
                                            value={tier.maxKm}
                                            onValueChange={(val) =>
                                                updateTier(index, "maxKm", val)
                                            }
                                        />
                                        <NumberInput
                                            label="Biaya"
                                            prefix="Rp "
                                            thousandSeparator=","
                                            value={tier.fee}
                                            onValueChange={(val) =>
                                                updateTier(index, "fee", val)
                                            }
                                        />
                                    </div>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                                        onClick={() => removeTier(index)}
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </Button>
                                </div>
                                <TierFreeWarning status={status} freeRadiusKm={freeRadiusKm} />
                            </div>
                        );
                    })
                )}
            </div>
        </Card>
    );
};

export default TierEditor;
