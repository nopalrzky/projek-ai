import React from "react";
import { CheckCircle2, CircleDashed } from "lucide-react";
import { Badge } from "@/Components/Badge";

interface SettingItemProps {
    icon: React.ReactNode;
    iconColor: string;
    iconBg: string;
    label: string;
    value: string;
    subValue?: string;
    isActive: boolean;
    highlightActive?: boolean;
    badge?: string;
}

const SettingItem: React.FC<SettingItemProps> = ({
    icon,
    iconColor,
    iconBg,
    label,
    value,
    subValue,
    isActive,
    highlightActive,
    badge,
}) => {
    return (
        <div
            className={`relative flex items-start gap-3 p-4 rounded-2xl border transition-all duration-300 ${
                isActive && highlightActive
                    ? "border-success-200 dark:border-success-800/50 bg-gradient-to-br from-success-50/50 to-emerald-50/30 dark:from-success-900/10 dark:to-emerald-900/10"
                    : "border-border bg-surface-muted/20 hover:bg-surface-muted/40"
            }`}
        >
            <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg} ${iconColor} shrink-0 transition-transform duration-300 group-hover:scale-110`}
            >
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-0.5">
                    {label}
                </p>
                <div className="flex items-center gap-2">
                    <p
                        className={`text-sm font-semibold truncate ${
                            isActive ? "text-text-primary" : "text-text-tertiary"
                        }`}
                    >
                        {value}
                    </p>
                </div>
                {subValue && (
                    <p className="text-[10px] text-text-tertiary mt-0.5">
                        {subValue}
                    </p>
                )}
            </div>
            <div className="shrink-0 flex flex-col items-end gap-1">
                {badge ? (
                    <Badge variant="success" size="sm" className="text-[10px] px-2">
                        {badge}
                    </Badge>
                ) : (
                    <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors duration-300 ${
                            isActive ? "text-success-500" : "text-text-tertiary/40"
                        }`}
                    >
                        {isActive ? (
                            <CheckCircle2 className="w-4 h-4 animate-fadeIn" />
                        ) : (
                            <CircleDashed className="w-4 h-4" />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SettingItem;
