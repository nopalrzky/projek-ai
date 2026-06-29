import React from "react";
import { Label } from "@/Components/Label";
import { cn } from "@/lib/utils";

interface SectionLabelProps {
    label: string;
    className?: string;
}

const SectionLabel: React.FC<SectionLabelProps> = ({ label, className }) => (
    <div className={cn("flex items-center gap-3", className)}>
        <Label
            as="span"
            size="lg"
            className="!leading-none text-xl font-bold tracking-tight text-[var(--color-text-primary)]"
        >
            {label}
        </Label>
        <div className="h-px flex-1 bg-[linear-gradient(to_right,var(--color-border),transparent)]" />
    </div>
);

export default SectionLabel;
