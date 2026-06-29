import { Alert } from "@/Components/Alert";
import { Badge } from "@/Components/Badge";
import { NumberInput } from "@/Components/Input";
import { FreeShippingMode } from "@/types/courier_setting";
import { Ban, ShoppingCart, Truck } from "lucide-react";

interface FreeShippingModeSelectorProps {
    value: FreeShippingMode;
    onChange: (mode: FreeShippingMode) => void;
    minOrderValue?: number | null;
    onMinOrderChange?: (value: number | null) => void;
    errors?: Record<string, string | string[] | undefined>;
}

const options: {
    value: FreeShippingMode;
    label: string;
    description: string;
    icon: typeof Ban;
}[] = [
    {
        value: "none",
        label: "Tidak ada gratis ongkir",
        description: "Ongkir dihitung normal sesuai strategi harga dan modifier.",
        icon: Ban,
    },
    {
        value: "min_order",
        label: "Gratis ongkir minimum order",
        description: "Gratis ongkir hanya berlaku jika total order memenuhi minimum.",
        icon: ShoppingCart,
    },
    {
        value: "all",
        label: "Gratis ongkir semua order",
        description: "Customer tidak membayar ongkir untuk semua order kurir yang valid.",
        icon: Truck,
    },
];

const FreeShippingModeSelector = ({
    value,
    onChange,
    minOrderValue,
    onMinOrderChange,
    errors,
}: FreeShippingModeSelectorProps) => {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                {options.map((option) => {
                    const Icon = option.icon;
                    const isActive = option.value === value;

                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => onChange(option.value)}
                            className={[
                                "rounded-2xl border p-4 text-left transition-all",
                                "focus:outline-none focus:ring-2 focus:ring-primary-500/30",
                                isActive
                                    ? "border-primary-300 bg-primary-50/80 shadow-sm"
                                    : "border-border bg-surface hover:border-primary-200 hover:bg-surface-muted/40",
                            ].join(" ")}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div
                                    className={[
                                        "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
                                        isActive
                                            ? "bg-primary-100 text-primary-600"
                                            : "bg-surface-muted text-text-secondary",
                                    ].join(" ")}
                                >
                                    <Icon className="w-5 h-5" />
                                </div>
                                {isActive && (
                                    <Badge variant="info" size="sm">
                                        Aktif
                                    </Badge>
                                )}
                            </div>

                            <div className="mt-4 space-y-1">
                                <p className="text-sm font-semibold text-text-primary">
                                    {option.label}
                                </p>
                                <p className="text-xs leading-5 text-text-secondary">
                                    {option.description}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>

            {errors?.freeShippingMode && (
                <p className="text-sm text-error-600">{errors.freeShippingMode}</p>
            )}

            {value === "min_order" && (
                <NumberInput
                    label="Minimal Order"
                    prefix="Rp "
                    thousandSeparator=","
                    value={minOrderValue}
                    onValueChange={(nextValue) =>
                        onMinOrderChange?.(nextValue)
                    }
                    error={errors?.minOrderFreeShipping}
                />
            )}

            {value === "all" && (
                <Alert
                    variant="success"
                    title="Gratis Ongkir Semua Aktif"
                    description="Semua order kurir yang valid akan mendapatkan ongkir gratis. Pengaturan ini tidak mengaktifkan kurir jika fitur kurir outlet nonaktif."
                    showIcon
                />
            )}
        </div>
    );
};

export default FreeShippingModeSelector;
