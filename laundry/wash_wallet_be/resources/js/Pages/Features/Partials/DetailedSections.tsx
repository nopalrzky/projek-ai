import React from "react";
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/Components/Card/Card";
import type { DetailedSectionsProps } from "./types";
import FeatureSectionHeader from "./FeatureSectionHeader";

const DetailedSections: React.FC<DetailedSectionsProps> = ({
    data,
    headerLayout = "center",
}) => {
    const safeItems = data.sections.slice(0, 3);
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

                <div className="grid gap-8 lg:gap-10">
                    {safeItems.map((section, index) => (
                        <Card
                            key={index}
                            hoverable
                            className="group relative overflow-hidden border animate-slideInRight"
                            style={{
                                animationDelay: `${index * 150}ms`,
                                borderColor: "var(--color-border)",
                            }}
                        >
                            <div
                                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                                style={{
                                    background: `linear-gradient(135deg, ${section.bgColor}10 0%, transparent 60%)`,
                                }}
                            />

                            <div
                                className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full blur-3xl opacity-0 transition-all duration-500 group-hover:opacity-20"
                                style={{ backgroundColor: section.bgColor }}
                            />

                            <CardContent className="relative z-10 grid gap-8 p-8 lg:grid-cols-2 lg:items-center lg:gap-12 lg:p-10">
                                <div className="flex flex-col gap-8">
                                    <div className="flex items-start gap-4">
                                        <div
                                            className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3 group-hover:shadow-lg"
                                            style={{
                                                backgroundColor:
                                                    section.bgColor + "18",
                                                color: section.bgColor,
                                                boxShadow: `0 0 0 1px ${section.bgColor}25`,
                                            }}
                                        >
                                            <span className="transition-transform duration-300 group-hover:scale-125">
                                                {section.icon}
                                            </span>
                                        </div>

                                        <div>
                                            <h3
                                                className="text-2xl font-bold leading-snug tracking-tight"
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                }}
                                            >
                                                {section.title}
                                            </h3>
                                        </div>
                                    </div>

                                    <p
                                        className="text-base leading-relaxed opacity-90"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        {section.description}
                                    </p>

                                    <div
                                        className="flex items-center gap-2 text-sm font-semibold opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0"
                                        style={{ color: section.bgColor }}
                                    >
                                        <span
                                            className="h-px w-5 rounded-full"
                                            style={{
                                                backgroundColor:
                                                    section.bgColor,
                                            }}
                                        />
                                        Pelajari lebih
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {section.features.map((feature, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-start gap-3 animate-fadeInUp"
                                            style={{
                                                animationDelay: `${index * 150 + idx * 80}ms`,
                                            }}
                                        >
                                            <CheckCircle2
                                                className="h-5 w-5 flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                                                style={{
                                                    color: section.bgColor,
                                                }}
                                            />
                                            <span
                                                className="text-sm leading-relaxed lg:text-base"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                {feature}
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

export default DetailedSections;
