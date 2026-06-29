import React from "react";
import { Badge } from "@/Components/Badge";
import { ToggleSwitch } from "@/Components/Input";
import { ShoppingBag } from "lucide-react";

const CourierServiceRow = ({
    service,
    onToggle,
}: {
    service: any;
    onToggle: (s: any) => void;
}) => {
    return (
        <div
            onClick={() => onToggle(service)}
            className="group p-4 rounded-2xl border border-border bg-gradient-to-br from-surface to-surface-muted/30 flex items-center justify-between gap-4 hover:border-primary-200 dark:hover:border-primary-800/50 hover:shadow-sm transition-all duration-300 cursor-pointer"
        >
            <div className="flex items-center gap-3 min-w-0">
                <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                        service.supportsCourier
                            ? "bg-success-50 dark:bg-success-950/40 text-success-600 dark:text-success-400"
                            : "bg-surface-muted text-text-tertiary"
                    }`}
                >
                    <ShoppingBag className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                    <h5 className="font-bold text-sm text-text-primary group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300 truncate">
                        {service.name}
                    </h5>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        {service.category?.name && (
                            <span className="text-[10px] font-semibold text-text-tertiary">
                                {service.category.name}
                            </span>
                        )}
                        {!service.isActive && (
                            <>
                                <span className="text-text-tertiary text-[10px]">·</span>
                                <Badge variant="warning" size="sm" isGlass className="text-[9px] py-0 px-1.5">
                                    Nonaktif
                                </Badge>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
                <Badge
                    variant={service.supportsCourier ? "success" : "secondary"}
                    size="sm"
                    isGlass
                    className="text-[10px] hidden sm:inline-flex"
                >
                    {service.supportsCourier ? "Kurir Aktif" : "Tanpa Kurir"}
                </Badge>
                <div className="pointer-events-none">
                    <ToggleSwitch
                        checked={service.supportsCourier}
                        readOnly
                        colorScheme="green"
                        size="sm"
                    />
                </div>
            </div>
        </div>
    );
};

export default CourierServiceRow;
