import React from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { FilterDateRangeProps } from "./types";

const FilterDateRange: React.FC<FilterDateRangeProps> = ({
    value = {},
    onChange,
    placeholder = "Select date range",
    disabled = false,
    format = "yyyy-MM-dd",
    className,
}) => {
    const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({
            ...value,
            from: e.target.value ? new Date(e.target.value) : undefined,
        });
    };

    const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({
            ...value,
            to: e.target.value ? new Date(e.target.value) : undefined,
        });
    };

    const formatDateValue = (date: Date | undefined): string => {
        if (!date) return "";
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div className="relative flex-1">
                <input
                    type="date"
                    value={formatDateValue(value.from)}
                    onChange={handleFromChange}
                    disabled={disabled}
                    placeholder="From"
                    className={cn(
                        "w-full px-3 py-2 pr-10 rounded-lg border transition-colors duration-200",
                        "text-sm",
                        disabled && "opacity-50 cursor-not-allowed",
                    )}
                    style={{
                        backgroundColor: "var(--color-surface)",
                        borderColor: "var(--color-border)",
                        color: "var(--color-text-primary)",
                    }}
                />
                <Calendar
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: "var(--color-text-tertiary)" }}
                />
            </div>

            <span style={{ color: "var(--color-text-tertiary)" }}>to</span>

            <div className="relative flex-1">
                <input
                    type="date"
                    value={formatDateValue(value.to)}
                    onChange={handleToChange}
                    disabled={disabled}
                    placeholder="To"
                    className={cn(
                        "w-full px-3 py-2 pr-10 rounded-lg border transition-colors duration-200",
                        "text-sm",
                        disabled && "opacity-50 cursor-not-allowed",
                    )}
                    style={{
                        backgroundColor: "var(--color-surface)",
                        borderColor: "var(--color-border)",
                        color: "var(--color-text-primary)",
                    }}
                />
                <Calendar
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: "var(--color-text-tertiary)" }}
                />
            </div>
        </div>
    );
};

export default FilterDateRange;
