import React from "react";

interface CourierStatChipProps {
    icon?: React.ReactNode;
    label: string;
    value: string | number;
}

const CourierStatChip: React.FC<CourierStatChipProps> = ({
    icon,
    label,
    value,
}) => {
    return (
        <div className="flex flex-col items-center p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 text-center transition-all duration-300 hover:bg-white/20 hover:border-white/25">
            <div className="flex items-center gap-1 text-white/60 mb-1">
                {icon}
                <span className="text-[9px] font-semibold uppercase tracking-wider hidden sm:inline">
                    {label}
                </span>
            </div>
            <span className="text-sm font-black text-white truncate max-w-full">{value}</span>
            <span className="text-[9px] text-white/50 sm:hidden">{label}</span>
        </div>
    );
};

export default CourierStatChip;
