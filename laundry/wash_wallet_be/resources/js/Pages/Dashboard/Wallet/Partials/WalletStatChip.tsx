import React from "react";
import { LucideIcon } from "lucide-react";

interface WalletStatChipProps {
    label: string;
    value: string;
    icon: LucideIcon;
    iconColor?: string;
    iconBackground?: string;
    iconBorderColor?: string;
}

export const WalletStatChip: React.FC<WalletStatChipProps> = ({
    label,
    value,
    icon: Icon,
    iconColor = "var(--color-primary-600)",
    iconBackground = "var(--color-primary-50)",
    iconBorderColor = "var(--color-primary-100)",
}) => {
    return (
        <div
            className="flex items-center gap-3 p-4 rounded-[var(--radius-xl)] border flex-1 transition-all duration-200"
            style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-border)",
                boxShadow: "var(--shadow-sm)",
            }}
        >
            <div
                className="p-2.5 rounded-[var(--radius-lg)] border flex items-center justify-center"
                style={{
                    backgroundColor: iconBackground,
                    borderColor: iconBorderColor,
                    color: iconColor,
                }}
            >
                <Icon className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
                <span
                    className="text-xs font-medium truncate"
                    style={{ color: "var(--color-text-tertiary)" }}
                >
                    {label}
                </span>
                <span
                    className="text-lg font-semibold truncate"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    {value}
                </span>
            </div>
        </div>
    );
};
