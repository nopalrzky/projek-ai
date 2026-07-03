import React from "react";

interface SectionTitleProps {
    number: number;
    title: string;
    subtitle: string;
    color: string;
    bgColor: string;
}

const SectionTitle = ({
    number,
    title,
    subtitle,
    color,
    bgColor,
}: SectionTitleProps) => (
    <div className="flex items-center gap-3 mb-2">
        <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
            style={{ backgroundColor: bgColor, color: color }}
        >
            {number}
        </div>
        <div>
            <h2
                className="text-lg font-semibold"
                style={{ color: "var(--color-text-primary)" }}
            >
                {title}
            </h2>
            <p
                className="text-sm"
                style={{ color: "var(--color-text-secondary)" }}
            >
                {subtitle}
            </p>
        </div>
    </div>
);

export default SectionTitle;
