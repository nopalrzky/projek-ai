import React from "react";
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/Components/Card/Card";
import type { FeatureBenefitsProps } from "./types";
import FeatureSectionHeader from "./FeatureSectionHeader";

const FeatureBenefits: React.FC<FeatureBenefitsProps> = ({
    data,
    hideGlow = false,
    headerLayout = "center",
}) => {
    const safeItems = data.items.slice(0, 6);
    const accentColor = data.accentColor ?? "var(--color-primary-600)";
    const accentBg = data.accentBg ?? "var(--color-primary-50)";
    const accentBorder = data.accentBorder ?? "var(--color-primary-200)";

    return (
        <section className="relative overflow-hidden py-24 lg:py-32">
            <div className="container-fluid relative z-10">
                <FeatureSectionHeader
                    badge={data.badge}
                    headline={data.headline}
                    subheadline={data.subheadline}
                    accentColor={accentColor}
                    accentBg={accentBg}
                    accentBorder={accentBorder}
                    layout={headerLayout}
                    className="mb-20 lg:mb-24"
                />

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                    {safeItems.map((item, index) => (
                        <Card
                            key={index}
                            hoverable
                            className="group relative overflow-hidden border animate-fadeInUp"
                            style={{
                                animationDelay: `${index * 100}ms`,
                                borderColor: "var(--color-border)",
                            }}
                        >
                            <div
                                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                                style={{
                                    background: `linear-gradient(135deg, ${accentBg} 0%, transparent 60%)`,
                                }}
                            />

                            <div
                                className="pointer-events-none absolute -bottom-12 -right-12 h-32 w-32 rounded-full blur-2xl opacity-0 transition-all duration-500 group-hover:opacity-25"
                                style={{ backgroundColor: accentColor }}
                            />

                            <CardContent className="relative z-10 space-y-6 p-8 lg:p-10">
                                <div className="flex items-start justify-between gap-4">
                                    <div
                                        className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3"
                                        style={{
                                            backgroundColor: accentBg,
                                            color: accentColor,
                                            border: `1.5px solid ${accentBorder}`,
                                        }}
                                    >
                                        <span className="transition-transform duration-300 group-hover:scale-125">
                                            {item.icon}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3
                                        className="text-lg font-bold tracking-tight"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        {item.title}
                                    </h3>
                                    <p
                                        className="text-sm leading-relaxed"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        {item.description}
                                    </p>
                                </div>

                                <div className="space-y-2.5 border-t border-[var(--color-border)] pt-6">
                                    {item.benefits.map((benefit, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-start gap-2.5 animate-fadeInUp"
                                            style={{
                                                animationDelay: `${index * 100 + idx * 50}ms`,
                                            }}
                                        >
                                            <CheckCircle2
                                                className="h-4 w-4 flex-shrink-0 transition-all duration-300 group-hover:scale-110 mt-0.5"
                                                style={{ color: accentColor }}
                                            />
                                            <span
                                                className="text-sm leading-relaxed"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                {benefit}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeatureBenefits;
