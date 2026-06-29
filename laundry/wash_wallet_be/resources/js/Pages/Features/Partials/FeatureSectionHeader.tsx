import React from "react";
import { Zap } from "lucide-react";

export type FeatureSectionHeaderLayout = "center" | "split";

export interface FeatureSectionHeaderProps {
    badge: string;
    headline: string;
    subheadline: string;
    accentColor: string;
    accentBg: string;
    accentBorder: string;
    layout?: FeatureSectionHeaderLayout;
    className?: string;
    contentClassName?: string;
}

const FeatureSectionHeader: React.FC<FeatureSectionHeaderProps> = ({
    badge,
    headline,
    subheadline,
    accentColor,
    accentBg,
    accentBorder,
    layout = "center",
    className = "mb-16 lg:mb-20",
    contentClassName,
}) => {
    const isSplit = layout === "split";

    return (
        <div
            className={[
                className,
                isSplit
                    ? "flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
                    : "mx-auto max-w-3xl text-center",
                "animate-fadeInUp",
            ]
                .filter(Boolean)
                .join(" ")}
        >
            <div
                className={[
                    isSplit ? "max-w-2xl" : undefined,
                    contentClassName,
                ]
                    .filter(Boolean)
                    .join(" ")}
            >
                <div
                    className={[
                        isSplit ? "mb-6" : "mb-5",
                        "flex items-center gap-3",
                        isSplit ? undefined : "justify-center",
                    ]
                        .filter(Boolean)
                        .join(" ")}
                >
                    {isSplit && (
                        <div
                            className="h-0.5 w-8 rounded-full"
                            style={{ backgroundColor: accentColor }}
                        />
                    )}
                    <div
                        className={[
                            "inline-flex items-center gap-2.5 rounded-full border px-4 backdrop-blur-sm",
                            isSplit ? "py-1.5" : "py-2",
                        ].join(" ")}
                        style={{
                            backgroundColor: accentBg,
                            borderColor: accentBorder,
                            color: accentColor,
                        }}
                    >
                        {isSplit ? (
                            <span className="relative flex h-2 w-2">
                                <span
                                    className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                                    style={{ backgroundColor: accentColor }}
                                />
                                <span
                                    className="relative inline-flex h-2 w-2 rounded-full"
                                    style={{ backgroundColor: accentColor }}
                                />
                            </span>
                        ) : (
                            <Zap className="h-3.5 w-3.5" />
                        )}
                        <span className="text-xs font-bold uppercase tracking-widest">
                            {badge}
                        </span>
                    </div>
                </div>

                <h2
                    className="text-3xl font-extrabold leading-tight tracking-tight text-balance sm:text-4xl lg:text-5xl"
                    style={{
                        color: "var(--color-text-primary)",
                        animationDelay: "100ms",
                    }}
                >
                    {headline}
                </h2>
            </div>

            <p
                className={[
                    "text-base leading-relaxed opacity-80 animate-fadeInUp",
                    isSplit
                        ? "max-w-sm lg:text-right"
                        : "mx-auto mt-4 max-w-2xl sm:text-lg",
                ].join(" ")}
                style={{
                    color: "var(--color-text-secondary)",
                    animationDelay: "200ms",
                }}
            >
                {subheadline}
            </p>
        </div>
    );
};

export default FeatureSectionHeader;
