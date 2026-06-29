import React from "react";

interface SectionTitleProps {
    icon: React.ReactNode;
    label: string;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ icon, label }) => {
    return (
        <div className="flex items-center gap-2 mb-4 text-xs font-bold text-text-tertiary uppercase tracking-widest">
            {icon}
            {label}
            <div className="flex-1 h-px bg-border-light ml-1" />
        </div>
    );
};

export default SectionTitle;
