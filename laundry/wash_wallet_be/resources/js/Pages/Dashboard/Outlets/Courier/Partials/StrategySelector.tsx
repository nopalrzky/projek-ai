import React from "react";
import { Card } from "@/Components/Card";
import { NumberInput } from "@/Components/Input";
import { Coins, Navigation, Layers, Map } from "lucide-react";

const strategies = [
    {
        id: "flat_rate",
        name: "Flat Rate",
        icon: <Coins />,
        desc: "Biaya tetap untuk semua jarak pengiriman.",
    },
    {
        id: "distance_based",
        name: "Berdasarkan Jarak",
        icon: <Navigation />,
        desc: "Biaya dasar + (Jarak * Biaya per KM).",
    },
    {
        id: "zone_based",
        name: "Berdasarkan Zona",
        icon: <Map />,
        desc: "Biaya berdasarkan area/kelurahan tujuan.",
    },
    {
        id: "tiered",
        name: "Radius Bertingkat",
        icon: <Layers />,
        desc: "Biaya ditentukan berdasarkan rentang radius jarak (tier).",
    },
];

const StrategySelector = ({ value, onChange, data, setData, errors }: any) => {
    return (
        <Card className="p-6 space-y-6">
            <div>
                <h3 className="text-lg font-medium text-text-primary mb-1">
                    Strategi Harga Utama
                </h3>
                <p className="text-sm text-text-secondary">
                    Pilih metode perhitungan dasar untuk ongkos kirim.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {strategies.map((strat) => (
                    <div
                        key={strat.id}
                        onClick={() => onChange(strat.id)}
                        className={`
                            p-4 rounded-xl border cursor-pointer transition-all flex flex-col gap-3
                            ${
                                value === strat.id
                                    ? "border-primary-500 bg-primary-500/5 ring-1 ring-primary-500/20"
                                    : "border-border bg-surface-muted hover:border-border-light hover:bg-border"
                            }
                        `}
                    >
                        <div
                            className={`
                            w-10 h-10 rounded-lg flex items-center justify-center
                            ${
                                value === strat.id
                                    ? "bg-primary-500 text-white"
                                    : "bg-surface text-text-tertiary border border-border"
                            }
                        `}
                        >
                            {React.cloneElement(
                                strat.icon as React.ReactElement,
                                { className: "w-5 h-5" },
                            )}
                        </div>
                        <div>
                            <p className="font-semibold text-text-primary text-sm">
                                {strat.name}
                            </p>
                            <p className="text-xs text-text-tertiary mt-1 line-clamp-2 leading-relaxed">
                                {strat.desc}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className={`pt-4 border-t border-border`}>
                {value === "flat_rate" && (
                    <NumberInput
                        label="Biaya Flat"
                        prefix="Rp "
                        thousandSeparator=","
                        value={data.flatFee}
                        onValueChange={(val) => setData("flatFee", val)}
                        placeholder="Contoh: 10,000"
                    />
                )}

                {value === "distance_based" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <NumberInput
                            label="Biaya Dasar"
                            prefix="Rp "
                            thousandSeparator=","
                            value={data.baseFee}
                            onValueChange={(val) => setData("baseFee", val)}
                        />
                        <NumberInput
                            label="Biaya Per KM"
                            prefix="Rp "
                            thousandSeparator=","
                            value={data.perKmFee}
                            onValueChange={(val) => setData("perKmFee", val)}
                        />
                    </div>
                )}

                {(value === "zone_based" || value === "tiered") && (
                    <div className="space-y-2">
                        <NumberInput
                            label="Default Price"
                            prefix="Rp "
                            thousandSeparator=","
                            value={data.defaultPrice}
                            onValueChange={(val) => setData("defaultPrice", val)}
                            error={errors?.defaultPrice}
                        />
                        <p className="text-xs text-text-tertiary">
                            Dipakai jika alamat atau jarak tidak cocok dengan
                            aturan spesifik yang Anda buat.
                        </p>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default StrategySelector;
