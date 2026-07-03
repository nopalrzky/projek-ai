import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModeButtonProps {
    active: boolean;
    onClick: () => void;
    icon: React.ElementType;
    title: string;
    description: string;
    color: "success" | "info" | "warning" | "error" | "primary";
    disabled?: boolean;
}

const colorMap = {
    success: {
        border: "var(--color-success-500)",
        bg: "var(--color-success-50)",
        icon: "var(--color-success-600)",
        text: "var(--color-success-700)",
    },
    info: {
        border: "var(--color-info-500)",
        bg: "var(--color-info-50)",
        icon: "var(--color-info-600)",
        text: "var(--color-info-700)",
    },
    warning: {
        border: "var(--color-warning-500)",
        bg: "var(--color-warning-50)",
        icon: "var(--color-warning-600)",
        text: "var(--color-warning-700)",
    },
    error: {
        border: "var(--color-error-500)",
        bg: "var(--color-error-50)",
        icon: "var(--color-error-600)",
        text: "var(--color-error-700)",
    },
    primary: {
        border: "var(--color-primary-500)",
        bg: "var(--color-primary-50)",
        icon: "var(--color-primary-600)",
        text: "var(--color-primary-700)",
    },
};

const ModeButton = ({
    active,
    onClick,
    icon: Icon,
    title,
    description,
    color,
    disabled,
}: ModeButtonProps) => {
    const c = colorMap[color];

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "flex-1 p-4 rounded-xl border-2 transition-all flex items-center gap-4 hover:shadow-md",
                disabled && "opacity-60 cursor-not-allowed",
            )}
            style={{
                borderColor: active ? c.border : "var(--color-border)",
                backgroundColor: active ? c.bg : "transparent",
            }}
        >
            <div
                className="p-3 rounded-lg shadow-sm"
                style={{
                    backgroundColor: active
                        ? "var(--color-surface)"
                        : "var(--color-background)",
                }}
            >
                <Icon
                    className="w-8 h-8"
                    style={{
                        color: active ? c.icon : "var(--color-text-tertiary)",
                    }}
                />
            </div>
            <div className="text-left">
                <div
                    className="font-bold"
                    style={{
                        color: active ? c.text : "var(--color-text-primary)",
                    }}
                >
                    {title}
                </div>
                <div
                    className="text-xs"
                    style={{ color: "var(--color-text-secondary)" }}
                >
                    {description}
                </div>
            </div>
            {active && (
                <Check
                    className="ml-auto w-5 h-5 flex-shrink-0"
                    style={{ color: c.icon }}
                />
            )}
        </button>
    );
};

export default ModeButton;
