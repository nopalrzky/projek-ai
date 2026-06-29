import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { FormSectionProps } from "./types";

const FormSection: React.FC<FormSectionProps> = ({
    title,
    description,
    children,
    className,
    collapsible = false,
    defaultCollapsed = false,
    icon,
    badge,
    ...props
}) => {
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

    return (
        <div
            className={cn(
                "border-b border-[var(--color-border)] last:border-b-0 py-6 first:pt-0 transition-all duration-300",
                className,
            )}
            {...props}
        >
            <div
                className={cn(
                    "flex items-start justify-between gap-4 mb-6",
                    collapsible && "cursor-pointer group select-none",
                )}
                onClick={() => collapsible && setIsCollapsed(!isCollapsed)}
            >
                <div className="flex items-start gap-3 flex-1">
                    {icon && (
                        <div className="flex-shrink-0 mt-0.5">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-[var(--color-primary-100)] to-[var(--color-primary-200)] dark:from-[var(--color-primary-900)]/30 dark:to-[var(--color-primary-800)]/30 text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)]">
                                {icon}
                            </div>
                        </div>
                    )}

                    <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-lg sm:text-xl font-bold text-[var(--color-text-primary)]">
                                {title}
                            </h2>
                            {badge && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--color-primary-100)] text-[var(--color-primary-700)] dark:bg-[var(--color-primary-900)]/40 dark:text-[var(--color-primary-300)]">
                                    {badge}
                                </span>
                            )}
                        </div>
                        {description && (
                            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed max-w-prose">
                                {description}
                            </p>
                        )}
                    </div>
                </div>

                {collapsible && (
                    <button
                        type="button"
                        className={cn(
                            "p-2 rounded-lg transition-all duration-200 flex-shrink-0",
                            "text-[var(--color-text-tertiary)] hover:bg-[var(--color-gray-100)] dark:hover:bg-[var(--color-gray-800)] hover:text-[var(--color-primary-500)]",
                        )}
                        aria-label={
                            isCollapsed ? "Expand section" : "Collapse section"
                        }
                        aria-expanded={!isCollapsed}
                    >
                        {isCollapsed ? (
                            <ChevronRight className="w-5 h-5" />
                        ) : (
                            <ChevronDown className="w-5 h-5" />
                        )}
                    </button>
                )}
            </div>

            <div
                className={cn(
                    "grid transition-all duration-300 ease-in-out",
                    collapsible && isCollapsed
                        ? "grid-rows-[0fr] opacity-0"
                        : "grid-rows-[1fr] opacity-100",
                )}
            >
                <div className="overflow-hidden">
                    <div className="space-y-6 pb-2">{children}</div>
                </div>
            </div>
        </div>
    );
};

export default FormSection;
