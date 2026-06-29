import React from "react";
import { Truck } from "lucide-react";
import { ToggleSwitch } from "@/Components/Input";

interface CourierEligibilityFieldProps {
    value: boolean;
    onChange: (value: boolean) => void;
    disabled?: boolean;
    error?: string;
}

const CourierEligibilityField: React.FC<CourierEligibilityFieldProps> = ({
    value,
    onChange,
    disabled = false,
    error,
}) => {
    return (
        <div className="space-y-2">
            <label className="flex items-start gap-3">
                <div
                    className="flex items-center justify-center w-10 h-10 rounded-lg"
                    style={{ backgroundColor: "var(--color-surface)" }}
                >
                    <Truck className="w-5 h-5" style={{ color: "var(--color-text-primary)" }} />
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium" style={{ color: "var(--color-text-primary)" }}>
                                Bisa Dijemput / Diantar Kurir
                            </div>
                            <div className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                                Aktifkan jika layanan ini dapat diambil atau diantarkan oleh kurir outlet
                            </div>
                        </div>
                        <div>
                            <ToggleSwitch checked={value} onChange={onChange} disabled={disabled} />
                        </div>
                    </div>
                    {error && (
                        <div className="text-sm mt-2" style={{ color: "var(--color-danger)" }}>
                            {error}
                        </div>
                    )}
                </div>
            </label>
        </div>
    );
};

export default CourierEligibilityField;
