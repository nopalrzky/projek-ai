import React, { useState } from "react";
import { Card } from "@/Components/Card";
import { ToggleSwitch } from "@/Components/Input";
import { router } from "@inertiajs/react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function CourierToggleCard({ outlet }: { outlet: any }) {
    const isEnabled = outlet.isCourierEnabled ?? true;
    const [loading, setLoading] = useState(false);

    const handleToggle = (checked: boolean) => {
        setLoading(true);
        router.put(
            route("outlets.courier-settings.toggle", outlet.id),
            { is_courier_enabled: checked },
            {
                onFinish: () => {
                    setLoading(false);
                },
            }
        );
    };

    return (
        <Card className="border-border shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-2xl ${isEnabled ? "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-500" : "bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-500"}`}>
                        {isEnabled ? (
                            <CheckCircle2 className="w-6 h-6" />
                        ) : (
                            <AlertCircle className="w-6 h-6" />
                        )}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-text-primary">
                            Status Layanan Kurir
                        </h3>
                        <p className="text-sm text-text-secondary mt-0.5">
                            {isEnabled
                                ? "Layanan kurir aktif. Pelanggan dapat melakukan order kurir untuk outlet ini."
                                : "Layanan kurir dinonaktifkan. Pelanggan tidak dapat melakukan order kurir."}
                        </p>
                    </div>
                </div>
                <div className="shrink-0 flex items-center">
                    <ToggleSwitch
                        checked={isEnabled}
                        onChange={handleToggle}
                        disabled={loading}
                        loading={loading}
                        colorScheme={isEnabled ? "green" : "red"}
                        size="lg"
                    />
                </div>
            </div>
        </Card>
    );
}
