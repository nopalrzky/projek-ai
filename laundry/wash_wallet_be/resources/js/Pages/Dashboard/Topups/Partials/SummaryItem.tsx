import React from "react";

interface SummaryItemProps {
    label: string;
    value: string;
}

const SummaryItem = ({ label, value }: SummaryItemProps) => (
    <div className="flex justify-between items-center py-2">
        <span
            className="text-sm"
            style={{ color: "var(--color-text-secondary)" }}
        >
            {label}
        </span>
        <span
            className="text-sm font-semibold text-right"
            style={{ color: "var(--color-text-primary)" }}
        >
            {value}
        </span>
    </div>
);

export default SummaryItem;
