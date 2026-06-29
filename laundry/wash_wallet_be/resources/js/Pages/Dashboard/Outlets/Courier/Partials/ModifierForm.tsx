import { Card } from "@/Components/Card";
import { Input, Select, NumberInput, ToggleSwitch } from "@/Components/Input";
import { Clock, Zap, Gift, Building2, Scaling } from "lucide-react";
import FreeShippingModeSelector from "./FreeShippingModeSelector";

const ModifierForm = ({ data, setData, errors }: any) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 space-y-6">
                <div className="flex items-center gap-2 mb-4">
                    <Scaling className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-medium text-text-primary">
                        Batas & Lonjakan Harga
                    </h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <NumberInput
                        label="Min. Ongkir"
                        prefix="Rp "
                        thousandSeparator=","
                        value={data.minFee}
                        onValueChange={(val) => setData("minFee", val)}
                        error={errors?.minFee}
                    />
                    <NumberInput
                        label="Max. Ongkir"
                        prefix="Rp "
                        thousandSeparator=","
                        value={data.maxFee}
                        onValueChange={(val) => setData("maxFee", val)}
                        optional
                        error={errors?.maxFee}
                    />
                </div>

                <NumberInput
                    label="Jarak Layanan Maksimal"
                    suffix=" KM"
                    thousandSeparator=","
                    precision={1}
                    value={data.maxDistanceKm}
                    onValueChange={(val) => setData("maxDistanceKm", val)}
                    optional
                    error={errors?.maxDistanceKm}
                />

                <NumberInput
                    label="Radius Gratis"
                    suffix=" KM"
                    thousandSeparator=","
                    precision={1}
                    value={data.freeRadiusKm}
                    onValueChange={(val) => setData("freeRadiusKm", val)}
                    optional
                    error={errors?.freeRadiusKm}
                />
                <p className="text-xs text-text-tertiary -mt-2">
                    Dalam radius ini ongkir = Rp 0. Berlaku untuk semua metode
                    harga berbasis jarak.
                </p>

                <div className="pt-4 border-t border-border space-y-4">
                    <ToggleSwitch
                        label="Surge Pricing (Sibuk)"
                        description="Kalikan harga dasar saat permintaan tinggi."
                        checked={data.surgeEnabled}
                        onChange={(val) => setData("surgeEnabled", val)}
                    />

                    {data.surgeEnabled && (
                        <NumberInput
                            label="Multiplier (Contoh: 1.2 untuk 20%)"
                            precision={1}
                            step={0.1}
                            value={data.surgeMultiplier}
                            onValueChange={(val) =>
                                setData("surgeMultiplier", val)
                            }
                            error={errors?.surgeMultiplier}
                        />
                    )}
                </div>
            </Card>

            {/* Surcharges (Night/Weekend) */}
            <Card className="p-6 space-y-6">
                <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-medium text-text-primary">
                        Biaya Tambahan Waktu
                    </h3>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <NumberInput
                            containerClassName="flex-1"
                            label="Biaya Malam (Surcharge)"
                            prefix="Rp "
                            thousandSeparator=","
                            value={data.nightSurcharge}
                            onValueChange={(val) =>
                                setData("nightSurcharge", val)
                            }
                            error={errors?.nightSurcharge}
                        />
                        <NumberInput
                            containerClassName="flex-1"
                            label="Biaya Akhir Pekan"
                            prefix="Rp "
                            thousandSeparator=","
                            value={data.weekendSurcharge}
                            onValueChange={(val) =>
                                setData("weekendSurcharge", val)
                            }
                            error={errors?.weekendSurcharge}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                        <Input
                            label="Jam Mulai Malam"
                            type="time"
                            value={data.nightStartTime?.substring(0, 5) || ""}
                            onChange={(e) => {
                                const val = e.target.value;
                                setData(
                                    "nightStartTime",
                                    val.length > 5 ? val.substring(0, 5) : val,
                                );
                            }}
                            error={errors?.nightStartTime}
                        />
                        <Input
                            label="Jam Selesai Malam"
                            type="time"
                            value={data.nightEndTime?.substring(0, 5) || ""}
                            onChange={(e) => {
                                const val = e.target.value;
                                setData(
                                    "nightEndTime",
                                    val.length > 5 ? val.substring(0, 5) : val,
                                );
                            }}
                            error={errors?.nightEndTime}
                        />
                    </div>
                </div>
            </Card>

            {/* Promotions & Subsidies */}
            <Card className="p-6 space-y-6">
                <div className="flex items-center gap-2 mb-4">
                    <Gift className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-medium text-text-primary">
                        Promo & Subsidi
                    </h3>
                </div>

                <div className="space-y-4">
                    <FreeShippingModeSelector
                        value={data.freeShippingMode}
                        onChange={(mode) => {
                            setData("freeShippingMode", mode);
                            setData(
                                "unconditionalFreeShippingEnabled",
                                mode === "all",
                            );
                            setData(
                                "freeShippingEnabled",
                                mode === "min_order",
                            );
                        }}
                        minOrderValue={data.minOrderFreeShipping}
                        onMinOrderChange={(value) =>
                            setData("minOrderFreeShipping", value)
                        }
                        errors={errors}
                    />
                </div>

                <div className="pt-6 border-t border-border space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Building2 className="w-4 h-4 text-primary" />
                        <h4 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
                            Subsidi Merchant
                        </h4>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Tipe Subsidi"
                            value={data.merchantSubsidyType || ""}
                            onChange={(e) =>
                                setData("merchantSubsidyType", e.target.value)
                            }
                            options={[
                                { label: "Fixed (Rp)", value: "fixed_amount" },
                                {
                                    label: "Persentase (%)",
                                    value: "percentage",
                                },
                            ]}
                            error={errors?.merchantSubsidyType}
                        />
                        <NumberInput
                            label="Nilai Subsidi"
                            prefix={
                                data.merchantSubsidyType === "percentage"
                                    ? ""
                                    : "Rp "
                            }
                            suffix={
                                data.merchantSubsidyType === "percentage"
                                    ? "%"
                                    : ""
                            }
                            thousandSeparator=","
                            value={data.merchantSubsidy}
                            onValueChange={(val) =>
                                setData("merchantSubsidy", val)
                            }
                            error={errors?.merchantSubsidy}
                        />
                    </div>
                    <p className="text-xs text-text-tertiary italic">
                        Subsidi adalah jumlah yang ditanggung outlet. Pelanggan
                        hanya membayar sisanya.
                    </p>
                </div>
            </Card>

            {/* Info Card */}
            <div className="bg-gradient-to-br from-primary/20 to-transparent p-1 rounded-2xl h-fit">
                <div className="bg-surface p-6 rounded-[calc(1rem-1px)] h-full space-y-4">
                    <Zap className="w-8 h-8 text-primary animate-pulse" />
                    <h3 className="text-lg font-medium text-text-primary">
                        Urutan Kalkulasi
                    </h3>
                    <ol className="text-sm text-text-secondary space-y-3 list-decimal list-inside">
                        <li>Cek Max Distance.</li>
                        <li>Cek Gratis Ongkir Semua.</li>
                        <li>Cek Gratis Ongkir Minimum Order.</li>
                        <li>Cek Membership Free Shipping.</li>
                        <li>Hitung Harga Dasar.</li>
                        <li>Terapkan Min/Max Fee.</li>
                        <li>Terapkan Surge Multiplier.</li>
                        <li>Tambahkan Surcharge Malam dan Akhir Pekan.</li>
                        <li>Potong Subsidi Merchant.</li>
                    </ol>
                </div>
            </div>
        </div>
    );
};

export default ModifierForm;
