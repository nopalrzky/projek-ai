import React from "react";
import { Check } from "lucide-react";
import { Card, CardContent } from "@/Components/Card/Card";
import type { FeatureHighlightsProps } from "./types";
import FeatureSectionHeader from "./FeatureSectionHeader";

const FeatureHighlights: React.FC<FeatureHighlightsProps> = ({
    data,
    hideGlow = false,
    headerLayout = "center",
}) => {
    const safeItems = data.items.slice(0, 6);
    const accentColor = data.accentColor ?? "var(--color-primary-600)";
    const accentBg = data.accentBg ?? "var(--color-primary-50)";
    const accentBorder = data.accentBorder ?? "var(--color-primary-200)";

    return (
        <section
            id="feature-highlights"
            className="relative overflow-hidden py-24 lg:py-32"
            style={{ backgroundColor: "transparent" }}
        >
            {!hideGlow && (
                <>
                    <div
                        className="pointer-events-none absolute right-0 top-0 h-[700px] w-[700px] translate-x-1/3 -translate-y-1/4 rounded-full blur-[150px] opacity-15"
                        style={{ backgroundColor: accentColor }}
                    />
                    <div
                        className="pointer-events-none absolute bottom-0 left-0 h-[500px] w-[500px] -translate-x-1/4 translate-y-1/4 rounded-full blur-[120px] opacity-10"
                        style={{ backgroundColor: "var(--color-secondary-400)" }}
                    />
                </>
            )}

            <div className="container-fluid relative z-10">
                <FeatureSectionHeader
                    badge={data.badge}
                    headline={data.headline}
                    subheadline={data.subheadline}
                    accentColor={accentColor}
                    accentBg={accentBg}
                    accentBorder={accentBorder}
                    layout={headerLayout}
                />

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {safeItems.map((item, index) => (
                        <Card
                            key={index}
                            hoverable
                            className="group relative overflow-hidden animate-fadeInUp"
                            style={{
                                animationDelay: `${index * 80}ms`,
                                borderColor: "var(--color-border)",
                            }}
                        >
                            <div
                                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                                style={{
                                    background: `linear-gradient(135deg, ${item.color}08 0%, transparent 60%)`,
                                }}
                            />

                            <div
                                className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full blur-2xl opacity-0 transition-all duration-500 group-hover:opacity-30"
                                style={{ backgroundColor: item.color }}
                            />

                            <CardContent className="relative z-10 p-6 text-inherit sm:p-8">
                                <div className="mb-6 flex items-start justify-between">
                                    <div
                                        className="flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3 group-hover:shadow-lg"
                                        style={{
                                            backgroundColor: item.color + "18",
                                            color: item.color,
                                            boxShadow: `0 0 0 1px ${item.color}25`,
                                        }}
                                    >
                                        <span className="transition-transform duration-300 group-hover:scale-110">
                                            {item.icon}
                                        </span>
                                    </div>

                                    <div
                                        className="flex h-7 w-7 items-center justify-center rounded-full opacity-0 scale-50 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100"
                                        style={{
                                            backgroundColor: item.color + "15",
                                            color: item.color,
                                        }}
                                    >
                                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                                    </div>
                                </div>

                                <h3
                                    className="mb-3 text-lg font-bold leading-snug tracking-tight sm:text-xl"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {item.title}
                                </h3>

                                <p
                                    className="text-sm leading-relaxed opacity-80 sm:text-base"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    {item.description}
                                </p>

                                <div
                                    className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0"
                                    style={{ color: item.color }}
                                >
                                    <span
                                        className="h-px w-5 rounded-full"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    Pelajari lebih
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeatureHighlights;
